const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const express = require('express');

const backendRoot = path.join(__dirname, '..');
const mongoosePath = require.resolve('mongoose');
const userModelPath = path.join(backendRoot, 'src', 'models', 'User.js');
const questionModelPath = path.join(backendRoot, 'src', 'models', 'Question.js');
const ruleModelPath = path.join(backendRoot, 'src', 'models', 'NextQuestionRule.js');
const firebaseAdminPath = path.join(backendRoot, 'src', 'config', 'firebaseAdmin.js');
const verifyTokenPath = path.join(backendRoot, 'src', 'middleware', 'verifyToken.js');
const requireAdminPath = path.join(backendRoot, 'src', 'middleware', 'requireAdmin.js');
const adminRoutePath = path.join(backendRoot, 'src', 'routes', 'admin.js');

function mockModule(modulePath, exports, originals) {
  const resolved = require.resolve(modulePath);
  originals.set(resolved, require.cache[resolved]);
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    exports
  };
}

function restoreModules(originals) {
  for (const [resolved, original] of originals) {
    if (original) {
      require.cache[resolved] = original;
    } else {
      delete require.cache[resolved];
    }
  }
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
}

test('admin authorization requires a verified Firebase identity and MongoDB admin role', async () => {
  const originals = new Map();
  let lookup;
  mockModule(userModelPath, {
    findOne(query) {
      lookup = query;
      return { select: async () => ({ _id: 'user-id' }) };
    }
  }, originals);
  delete require.cache[require.resolve(requireAdminPath)];
  const requireAdmin = require(requireAdminPath);

  try {
    let advanced = false;
    await requireAdmin({
      user: { uid: 'firebase-uid', email: 'ADMIN@example.com', email_verified: true, role: 'user' }
    }, createResponse(), () => { advanced = true; });

    assert.equal(advanced, true);
    assert.deepEqual(lookup, {
      firebaseUid: 'firebase-uid',
      email: 'admin@example.com',
      emailVerified: true,
      role: 'admin'
    });
  } finally {
    delete require.cache[require.resolve(requireAdminPath)];
    restoreModules(originals);
  }
});

test('admin authorization ignores a client-supplied admin role without a matching MongoDB user', async () => {
  const originals = new Map();
  mockModule(userModelPath, {
    findOne() {
      return { select: async () => null };
    }
  }, originals);
  delete require.cache[require.resolve(requireAdminPath)];
  const requireAdmin = require(requireAdminPath);
  const response = createResponse();

  try {
    await requireAdmin({
      user: { uid: 'ordinary-user', email: 'user@example.com', email_verified: true, role: 'admin' }
    }, response, () => assert.fail('A non-admin must not continue'));

    assert.equal(response.statusCode, 403);
  } finally {
    delete require.cache[require.resolve(requireAdminPath)];
    restoreModules(originals);
  }
});

test('administrator Firebase token verification checks revocation', async () => {
  const originals = new Map();
  let checkedRevocation;
  mockModule(firebaseAdminPath, {
    getFirebaseAuth: () => ({
      verifyIdToken: async (token, checkRevoked) => {
        assert.equal(token, 'valid-token');
        checkedRevocation = checkRevoked;
        return { uid: 'admin-uid' };
      }
    })
  }, originals);
  delete require.cache[require.resolve(verifyTokenPath)];
  const verifyToken = require(verifyTokenPath);
  const response = createResponse();

  try {
    let advanced = false;
    await verifyToken.withRevocationCheck()({
      headers: { authorization: 'Bearer valid-token' }
    }, response, () => { advanced = true; });

    assert.equal(advanced, true);
    assert.equal(checkedRevocation, true);
  } finally {
    delete require.cache[require.resolve(verifyTokenPath)];
    restoreModules(originals);
  }
});

test('admin question endpoints reject protected and unknown fields', async (t) => {
  const originals = new Map();
  const pass = (req, res, next) => {
    req.user = { uid: 'admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;
  mockModule(questionModelPath, {}, originals);
  mockModule(ruleModelPath, {}, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}/api/admin`;
  const questionResponse = await fetch(`${baseUrl}/questions/example`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qKey: 'attacker-chosen-key', role: 'admin' })
  });
  const rulesResponse = await fetch(`${baseUrl}/question-rules/example`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      isDefault: false,
      nextQuestions: [{ operator: 'eq', value: 'yes', goTo: 'other' }],
      revisionHistory: []
    })
  });
  const unsupportedQuestionType = await fetch(`${baseUrl}/questions/example`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'checkbox' })
  });
  const invalidQuestionKey = await fetch(`${baseUrl}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qKey: '$where' })
  });

  assert.equal(questionResponse.status, 400);
  assert.equal(rulesResponse.status, 400);
  assert.equal(unsupportedQuestionType.status, 400);
  assert.equal(invalidQuestionKey.status, 400);
});

test('admin question edits save a revision with the authenticated administrator UID', async (t) => {
  const originals = new Map();
  const question = {
    type: 'multiple choice',
    qTitle: 'Original title',
    qIntro: '',
    qDisclaimer: '',
    qIcon: 'scale-icon',
    qText: 'Question text',
    qKey: 'example',
    section: 'getting-started',
    options: [{ value: 'yes', label: 'Yes', description: '' }],
    revisionHistory: [],
    set(fields) {
      Object.assign(this, fields);
    },
    async save() {}
  };
  const pass = (req, res, next) => {
    req.user = { uid: 'verified-admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;
  mockModule(questionModelPath, {
    findOne: () => ({ select: async () => question })
  }, originals);
  mockModule(ruleModelPath, {}, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/questions/example`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ qTitle: 'Updated title' })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.question.qTitle, 'Updated title');
  assert.equal(question.revisionHistory.length, 1);
  assert.equal(question.revisionHistory[0].actorUid, 'verified-admin-uid');
  assert.equal(question.revisionHistory[0].before.qTitle, 'Original title');
  assert.equal(question.revisionHistory[0].after.qTitle, 'Updated title');
});

test('restoring a question revision applies the saved snapshot and records the rollback', async (t) => {
  const originals = new Map();
  const revisionDate = new Date('2026-01-01T12:00:00.000Z');
  const question = {
    type: 'multiple choice',
    qTitle: 'Current title',
    qIntro: '',
    qDisclaimer: '',
    qIcon: 'scale-icon',
    qText: 'Current prompt',
    qKey: 'example',
    section: 'getting-started',
    options: [{ value: 'yes', label: 'Yes', description: '' }],
    isArchived: false,
    revisionHistory: [{
      actorUid: 'previous-admin',
      changedAt: revisionDate,
      before: {
        qKey: 'example',
        type: 'multiple choice',
        qTitle: 'Older title',
        qIntro: '',
        qDisclaimer: '',
        qIcon: 'scale-icon',
        qText: 'Older prompt',
        section: 'getting-started',
        options: [{ value: 'no', label: 'No', description: '' }],
        isArchived: false
      },
      after: {
        qKey: 'example',
        type: 'multiple choice',
        qTitle: 'Current title',
        qIntro: '',
        qDisclaimer: '',
        qIcon: 'scale-icon',
        qText: 'Current prompt',
        section: 'getting-started',
        options: [{ value: 'yes', label: 'Yes', description: '' }],
        isArchived: false
      }
    }],
    set(fields) {
      Object.assign(this, fields);
    },
    async save() {}
  };
  const pass = (req, res, next) => {
    req.user = { uid: 'restoring-admin' };
    next();
  };
  pass.withRevocationCheck = () => pass;
  mockModule(questionModelPath, {
    findOne: () => ({ select: async () => question })
  }, originals);
  mockModule(ruleModelPath, {}, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/questions/example/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changedAt: revisionDate.toISOString(),
      actorUid: 'previous-admin'
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.question.qTitle, 'Older title');
  assert.equal(payload.question.qText, 'Older prompt');
  assert.equal(question.revisionHistory.length, 2);
  assert.equal(question.revisionHistory[1].actorUid, 'restoring-admin');
  assert.equal(question.revisionHistory[1].before.qTitle, 'Current title');
  assert.equal(question.revisionHistory[1].after.qTitle, 'Older title');
});

test('admin question list follows the questionnaire flow and then includes unreachable questions', async (t) => {
  const originals = new Map();
  const questions = [
    { qKey: 'allocation_parental_rights', qTitle: 'Start', section: 'parental-rights', createdAt: '2026-01-01' },
    { qKey: 'branch-a', qTitle: 'Branch A', section: 'parental-rights', createdAt: '2026-01-02' },
    { qKey: 'branch-b', qTitle: 'Branch B', section: 'parental-rights', createdAt: '2026-01-03' },
    { qKey: 'next', qTitle: 'Next', section: 'parental-rights', createdAt: '2026-01-04' },
    { qKey: 'orphan', qTitle: 'Not linked', section: 'review', createdAt: '2026-01-05' },
    { qKey: 'archived', qTitle: 'Archived', section: 'parental-rights', isArchived: true, createdAt: '2026-01-06' }
  ];
  const rules = [
    {
      qKey: 'allocation_parental_rights',
      isDefault: false,
      nextQuestions: [
        { operator: 'eq', value: 'a', goTo: 'branch-a' },
        { operator: 'eq', value: 'b', goTo: 'branch-b' }
      ]
    },
    { qKey: 'branch-a', isDefault: true, goToDefault: 'next', nextQuestions: [] },
    { qKey: 'branch-b', isDefault: true, goToDefault: 'next', nextQuestions: [] }
  ];
  const query = (value) => ({
    select() { return this; },
    lean: async () => value
  });
  const pass = (req, res, next) => {
    req.user = { uid: 'admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;
  mockModule(questionModelPath, { find: () => query(questions) }, originals);
  mockModule(ruleModelPath, { find: () => query(rules) }, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/questions?page=1&limit=10`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload.questions.map((question) => question.qKey), [
    'allocation_parental_rights',
    'branch-a',
    'next',
    'branch-b',
    'orphan',
    'archived'
  ]);
});

test('inserting after a question keeps its existing next question immediately afterward', async (t) => {
  const originals = new Map();
  const questions = [
    { qKey: 'school_address_parent', isArchived: false },
    { qKey: 'activity_notice', isArchived: false }
  ];
  const previousRule = {
    qKey: 'school_address_parent',
    isDefault: true,
    goToDefault: 'activity_notice',
    nextQuestions: [],
    revisionHistory: [],
    async save() {}
  };
  const rules = [previousRule];
  class MockQuestion {
    constructor(fields) {
      Object.assign(this, fields, { options: fields.options || [], revisionHistory: [] });
    }

    async save() {
      questions.push(this);
    }
  }
  class MockRule {
    constructor(fields) {
      Object.assign(this, fields, { revisionHistory: [] });
    }

    async save() {
      rules.push(this);
    }
  }
  const session = {
    async withTransaction(callback) {
      await callback();
    },
    async endSession() {}
  };
  const query = (value) => ({
    select() { return this; },
    session: async () => value
  });
  const pass = (req, res, next) => {
    req.user = { uid: 'admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;

  mockModule(mongoosePath, { startSession: async () => session }, originals);
  MockQuestion.findOne = () => query(questions.find((question) => question.qKey === 'school_address_parent'));
  MockQuestion.exists = () => query(true);
  MockQuestion.find = () => ({ select() { return this; }, lean: async () => questions });
  MockRule.findOne = () => ({
    select() { return this; },
    session: async () => previousRule
  });
  MockRule.find = () => ({ select() { return this; }, lean: async () => rules });
  mockModule(questionModelPath, MockQuestion, originals);
  mockModule(ruleModelPath, MockRule, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/admin/questions/school_address_parent/after`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qKey: 'new_question',
        type: 'multiple choice',
        qTitle: 'New question',
        qIntro: '',
        qDisclaimer: '',
        qIcon: 'scale-icon',
        qText: 'New prompt',
        section: 'parental-rights',
        options: []
      })
    }
  );
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.insertedAfter, 'school_address_parent');
  assert.equal(previousRule.goToDefault, 'new_question');
  assert.equal(rules.find((rule) => rule.qKey === 'new_question').goToDefault, 'activity_notice');
});

test('insertion rejects branching questions with different destinations', async (t) => {
  const originals = new Map();
  const questions = [{ qKey: 'branching_question', isArchived: false }];
  const previousRule = {
    qKey: 'branching_question',
    isDefault: false,
    goToDefault: '',
    nextQuestions: [
      { operator: 'eq', value: 'one', goTo: 'first_path' },
      { operator: 'eq', value: 'two', goTo: 'second_path' }
    ],
    revisionHistory: [],
    async save() {}
  };
  let createdQuestion = false;
  class MockQuestion {
    constructor(fields) {
      Object.assign(this, fields, { options: fields.options || [], revisionHistory: [] });
    }

    async save() {
      createdQuestion = true;
      questions.push(this);
    }
  }
  class MockRule {
    constructor(fields) {
      Object.assign(this, fields, { revisionHistory: [] });
    }

    async save() {}
  }
  const session = {
    async withTransaction(callback) {
      await callback();
    },
    async endSession() {}
  };
  const query = (value) => ({
    select() { return this; },
    session: async () => value
  });
  const pass = (req, res, next) => {
    req.user = { uid: 'admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;

  mockModule(mongoosePath, { startSession: async () => session }, originals);
  MockQuestion.findOne = () => query(questions[0]);
  MockQuestion.exists = () => query(true);
  MockRule.findOne = () => ({
    select() { return this; },
    session: async () => previousRule
  });
  mockModule(questionModelPath, MockQuestion, originals);
  mockModule(ruleModelPath, MockRule, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/admin/questions/branching_question/after`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        qKey: 'new_question',
        type: 'multiple choice',
        qTitle: 'New question',
        qIntro: '',
        qDisclaimer: '',
        qIcon: 'scale-icon',
        qText: 'New prompt',
        section: 'parental-rights',
        options: []
      })
    }
  );
  const payload = await response.json();

  assert.equal(response.status, 409);
  assert.match(payload.error, /different branch destinations/);
  assert.equal(createdQuestion, false);
});

test('archiving a question rewires inbound rules to its safe default successor', async (t) => {
  const originals = new Map();
  const archivedQuestion = {
    qKey: 'to_archive',
    type: 'multiple choice',
    qTitle: 'To archive',
    qIntro: '',
    qDisclaimer: '',
    qIcon: 'scale-icon',
    qText: 'Question',
    section: 'parental-rights',
    options: [],
    isArchived: false,
    revisionHistory: [],
    async save() {}
  };
  const targetRule = {
    qKey: 'to_archive',
    isDefault: true,
    goToDefault: 'successor',
    nextQuestions: [],
    revisionHistory: []
  };
  const inboundRule = {
    qKey: 'source',
    isDefault: true,
    goToDefault: 'to_archive',
    nextQuestions: [],
    revisionHistory: [],
    async save() {}
  };
  const query = (value) => ({
    select() { return this; },
    then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); }
  });
  const pass = (req, res, next) => {
    req.user = { uid: 'admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;
  mockModule(questionModelPath, {
    findOne: () => ({ select: async () => archivedQuestion }),
    exists: async () => true
  }, originals);
  mockModule(ruleModelPath, {
    findOne: () => query(targetRule),
    find: () => query([inboundRule])
  }, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/questions/to_archive/archive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isArchived: true })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.question.isArchived, true);
  assert.equal(payload.rewiredRules, 1);
  assert.equal(inboundRule.goToDefault, 'successor');
  assert.equal(inboundRule.revisionHistory[0].actorUid, 'admin-uid');
});

test('an unconnected question can be archived without a branching rule', async (t) => {
  const originals = new Map();
  const question = {
    qKey: 'unconnected_question',
    type: 'multiple choice',
    qTitle: 'Unconnected',
    qIntro: '',
    qDisclaimer: '',
    qIcon: 'scale-icon',
    qText: 'Question',
    section: 'parental-rights',
    options: [],
    isArchived: false,
    revisionHistory: [],
    async save() {}
  };
  const query = (value) => ({
    select() { return this; },
    then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); }
  });
  const pass = (req, res, next) => {
    req.user = { uid: 'admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;
  mockModule(questionModelPath, {
    findOne: () => ({ select: async () => question })
  }, originals);
  mockModule(ruleModelPath, {
    find: () => query([])
  }, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/questions/unconnected_question/archive`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isArchived: true })
  });
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.question.isArchived, true);
  assert.equal(payload.rewiredRules, 0);
});

test('admins can create a question with an immutable-style stable key and initial audit revision', async (t) => {
  const originals = new Map();
  class MockQuestion {
    constructor(fields) {
      Object.assign(this, fields);
      this.isArchived = false;
      this.revisionHistory = [];
    }

    async save() {}
  }
  const pass = (req, res, next) => {
    req.user = { uid: 'admin-uid' };
    next();
  };
  pass.withRevocationCheck = () => pass;
  mockModule(questionModelPath, MockQuestion, originals);
  mockModule(ruleModelPath, {}, originals);
  mockModule(verifyTokenPath, pass, originals);
  mockModule(requireAdminPath, (req, res, next) => next(), originals);
  delete require.cache[require.resolve(adminRoutePath)];
  const router = require(adminRoutePath);
  const app = express();
  app.use(express.json());
  app.use('/api/admin', router);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    delete require.cache[require.resolve(adminRoutePath)];
    restoreModules(originals);
  });

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      qKey: 'admin_added_question',
      qTitle: 'Added question',
      qIntro: '',
      qDisclaimer: '',
      qText: 'Question text',
      type: 'multiple choice',
      qIcon: 'scale-icon',
      section: 'parental-rights',
      options: []
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 201);
  assert.equal(payload.question.qKey, 'admin_added_question');
  assert.equal(payload.question.isArchived, false);
});
