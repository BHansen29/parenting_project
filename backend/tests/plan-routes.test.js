const test = require('node:test'); // the test runner
const assert = require('node:assert/strict');
const path = require('node:path'); // necessary to build file paths
const express = require('express'); // this creates a small test server (a "fake" application instance)

// these constants define the files being mocked like Plan, Case, Question
const planRoutePath = path.join(__dirname, '..', 'src', 'routes', 'plan.js');
const planModelPath = path.join(__dirname, '..', 'src', 'models', 'Plan.js');
const caseModelPath = path.join(__dirname, '..', 'src', 'models', 'Case.js');
const questionModelPath = path.join(__dirname, '..', 'src', 'models', 'Question.js');
const nextQuestionRulePath = path.join(__dirname, '..', 'src', 'models', 'NextQuestionRule.js');
const questionNavigationPath = path.join(__dirname, '..', 'src', 'lib', 'question-navigation.js');
const verifyTokenPath = path.join(__dirname, '..', 'src', 'middleware', 'verifyToken.js');

// Loads the real plan router while mocking auth and Mongoose models for testing.
function loadPlanRouter({
  authUid = 'user-1',
  Plan = {},
  Case = {},
  Question = {},
  NextQuestionRule = {},
} = {}) {
  const originals = new Map();

  function mockModule(modulePath, exports) {
    const resolved = require.resolve(modulePath);
    originals.set(resolved, require.cache[resolved]);
    require.cache[resolved] = {
      id: resolved,
      filename: resolved,
      loaded: true,
      exports,
    };
  }

  // Replace the router's model and auth dependencies with test doubles.
  mockModule(planModelPath, Plan);
  mockModule(caseModelPath, Case);
  mockModule(questionModelPath, Question);
  mockModule(nextQuestionRulePath, NextQuestionRule);
  mockModule(verifyTokenPath, (req, res, next) => {
    req.user = { uid: authUid };
    next();
  });

  delete require.cache[require.resolve(questionNavigationPath)];
  const resolvedRoute = require.resolve(planRoutePath);
  delete require.cache[resolvedRoute];
  const router = require(planRoutePath);

  return {
    router,
    restore() {
      delete require.cache[resolvedRoute]; // deletes the fake data
      delete require.cache[require.resolve(questionNavigationPath)];
      for (const [resolved, original] of originals.entries()) {
        if (original) {
          require.cache[resolved] = original;
        } else {
          delete require.cache[resolved];
        }
      }
    },
  };
}

// this function calls loadPlanRouter to create the Express app
async function createTestServer(options) {
  const { router, restore } = loadPlanRouter(options);
  const app = express();
  app.use(express.json());
  app.use('/api/plan', router);

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      restore();
    },
  };
}

// thsi function makes a real HTTP request to our Express app using fetch
async function requestJson(baseUrl, routePath, { method = 'GET', body } = {}) {
  const response = await fetch(`${baseUrl}${routePath}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;
  return { response, json };
}

// Test 1: Create plan
test('POST /api/plan creates a plan for the authenticated user', async (t) => {
  // Capture what the route attempts to persist so the test can verify ownership
  // and linked case creation.
  let createPayload = null;
  let casePayload = null;
  let saved = false;

  const createdPlan = {
    _id: 'plan-1',
    userID: 'user-1',
    caseId: null,
    async save() {
      saved = true;
    },
  };
  // start the test server to make test requests to
  const server = await createTestServer({
    Plan: {
      async create(payload) {
        createPayload = payload;
        return createdPlan;
      },
    },
    Case: {
      async create(payload) {
        casePayload = payload;
        return { _id: 'case-1' };
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan', {
    method: 'POST',
    body: {},
  });


  // verify that all of the calls return the correct response
  assert.equal(response.status, 201);
  assert.deepEqual(createPayload, { userID: 'user-1' });
  assert.deepEqual(casePayload, {
    parent1Uid: 'user-1',
    parent1PlanId: 'plan-1',
    parent1Address: '',
    parent1City: '',
    parent1State: '',
    parent1ZipCode: '',
  });
  assert.equal(createdPlan.caseId, 'case-1');
  assert.equal(saved, true);
  assert.equal(json.userID, 'user-1');
  assert.equal(json.caseId, 'case-1');
});

// Test 2: List plans for correct user
test('GET /api/plan/:uid/all returns only the authenticated user plans', async (t) => {
  let findFilter = null;

  const server = await createTestServer({
    Plan: {
      async find(filter) {
        findFilter = filter;
        return [{ _id: 'plan-1', userID: 'user-1' }];
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/user-1/all');

  assert.equal(response.status, 200);
  assert.deepEqual(findFilter, { userID: 'user-1' });
  assert.deepEqual(json, [{ _id: 'plan-1', userID: 'user-1' }]);
});

// Test 3: Reject mismatched user id
test('GET /api/plan/:uid/all rejects a mismatched user id', async (t) => {
  let findCalled = false;

  const server = await createTestServer({
    Plan: {
      async find() {
        findCalled = true;
        return [];
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/other-user/all');

  assert.equal(response.status, 403);
  assert.deepEqual(json, { error: 'Forbidden' });
  assert.equal(findCalled, false);
});

// Delete owned plan
test('POST /api/plan/delete deletes an owned plan', async (t) => {
  let deleteFilter = null;

  const server = await createTestServer({
    Plan: {
      async findOneAndDelete(filter) {
        deleteFilter = filter;
        return { _id: 'plan-1', userID: 'user-1' };
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/delete', {
    method: 'POST',
    body: { pID: 'plan-1' },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(deleteFilter, { _id: 'plan-1', userID: 'user-1' });
  assert.deepEqual(json, { message: 'Plan deleted successfully' });
});

// Test 5: Reject delete of another user's plan
test('POST /api/plan/delete rejects deleting another user plan', async (t) => {
  const server = await createTestServer({
    Plan: {
      async findOneAndDelete() {
        return null;
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/delete', {
    method: 'POST',
    body: { pID: 'plan-2' },
  });

  assert.equal(response.status, 403);
  assert.deepEqual(json, { error: 'Forbidden' });
});

// Test 6: Save a new answer
test('POST /api/plan/:planId/answer saves a new answer', async (t) => {
  let saved = false;

  const plan = {
    _id: 'plan-1',
    userID: 'user-1',
    answers: [],
    async save() {
      saved = true;
    },
  };

  const server = await createTestServer({
    Plan: {
      async findById(planId) {
        assert.equal(planId, 'plan-1');
        return plan;
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/plan-1/answer', {
    method: 'POST',
    body: { qKey: 'rights-choice', answer: 'sole' },
  });

  assert.equal(response.status, 201);
  assert.equal(saved, true);
  assert.deepEqual(plan.answers, [{ qKey: 'rights-choice', answer: 'sole' }]);
  assert.deepEqual(json.answers, [{ qKey: 'rights-choice', answer: 'sole' }]);
});

test('POST /api/plan/:planId/answer preserves later answers when an earlier answer changes', async (t) => {
  const plan = {
    _id: 'plan-1',
    userID: 'user-1',
    answers: [
      { qKey: 'rights-choice', answer: 'sole' },
      { qKey: 'later-question', answer: 'yes' },
    ],
    async save() {},
  };

  const server = await createTestServer({
    Plan: {
      async findById() {
        return plan;
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/plan-1/answer', {
    method: 'POST',
    body: { qKey: 'rights-choice', answer: 'joint' },
  });

  assert.equal(response.status, 201);
  assert.deepEqual(plan.answers, [
    { qKey: 'rights-choice', answer: 'joint' },
    { qKey: 'later-question', answer: 'yes' },
  ]);
  assert.deepEqual(json.answers, plan.answers);
});

test('GET /api/plan/prevQuestion follows the active branch instead of answer save order', async (t) => {
  const plan = {
    userID: 'user-1',
    currentCircumstance: 'married',
    answers: [
      { qKey: 'allocation_parental_rights', answer: 'not-married' },
      { qKey: 'old_branch_question', answer: 'yes' },
    ],
  };
  const questions = {
    allocation_parental_rights: {
      qKey: 'allocation_parental_rights',
      section: 'parental-rights',
    },
    old_branch_question: {
      qKey: 'old_branch_question',
      section: 'parental-rights',
    },
    active_branch_question: {
      qKey: 'active_branch_question',
      section: 'parental-rights',
    },
  };
  const rules = {
    allocation_parental_rights: {
      isDefault: false,
      nextQuestions: [
        { operator: 'eq', value: 'not-married', goTo: 'active_branch_question' },
        { operator: 'eq', value: 'married', goTo: 'old_branch_question' },
      ],
    },
  };
  const server = await createTestServer({
    Plan: {
      async findById() {
        return plan;
      },
    },
    Question: {
      async findOne({ qKey }) {
        return questions[qKey] ?? null;
      },
    },
    NextQuestionRule: {
      async findOne({ qKey }) {
        return rules[qKey] ?? null;
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(
    server.baseUrl,
    '/api/plan/prevQuestion/active_branch_question/plan-1',
  );

  assert.equal(response.status, 200);
  assert.equal(json.qKey, 'allocation_parental_rights');
});

// Test 7: Update current question
test('POST /api/plan/updateCurrent/:planId/:currQId updates the current question', async (t) => {
  let saved = false;

  const plan = {
    _id: 'plan-1',
    userID: 'user-1',
    currentQuestion: null,
    async save() {
      saved = true;
    },
  };

  const server = await createTestServer({
    Plan: {
      async findById(planId) {
        assert.equal(planId, 'plan-1');
        return plan;
      },
    },
  });

  t.after(() => server.close());

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/updateCurrent/plan-1/question-9', {
    method: 'POST',
    body: {},
  });

  assert.equal(response.status, 200);
  assert.equal(saved, true);
  assert.equal(plan.currentQuestion, 'question-9');
  assert.deepEqual(json, { message: 'Plan updated successfully' });
});

// Test 8: Save parent contact information
test('POST /api/plan/:planId/information saves parent contact information', async (t) => {
  let saved = false;

  const plan = {
    _id: 'plan-1',
    userID: 'user-1',
    phoneNumber: '',
    streetAddress: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    async save() {
      saved = true;
    },
  };

  const server = await createTestServer({
    Plan: {
      async findById(planId) {
        assert.equal(planId, 'plan-1');
        return plan;
      },
    },
  });

  t.after(() => server.close());

  const payload = {
    parentFName: 'Sam',
    parentLName: 'Parent',
    phone: '614-555-0101',
    streetAddress: '123 Main St',
    addressLine2: 'Apartment 2',
    city: 'Columbus',
    state: 'OH',
    zipCode: '43215',
  };

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/plan-1/information', {
    method: 'POST',
    body: payload,
  });

  assert.equal(response.status, 201);
  assert.equal(saved, true);
  assert.equal(plan.phoneNumber, payload.phone);
  assert.equal(plan.parentFName, payload.parentFName);
  assert.equal(plan.parentLName, payload.parentLName);
  assert.equal(plan.streetAddress, payload.streetAddress);
  assert.equal(plan.addressLine2, payload.addressLine2);
  assert.equal(plan.city, payload.city);
  assert.equal(plan.state, payload.state);
  assert.equal(plan.zipCode, payload.zipCode);
  assert.equal(json.phoneNumber, payload.phone);
  assert.equal(json.streetAddress, payload.streetAddress);
});

test('POST /api/plan/:planId/information saves aggregate demographic responses', async (t) => {
  let saved = false;
  const plan = {
    _id: 'plan-1',
    userID: 'user-1',
    async save() {
      saved = true;
    },
  };

  const server = await createTestServer({
    Plan: {
      async findById(planId) {
        assert.equal(planId, 'plan-1');
        return plan;
      },
    },
  });

  t.after(() => server.close());

  const aggregateData = {
    gender: 'female/feminine',
    background: ['hispanic/latino', 'mena'],
    race: ['asian'],
    income: 'under_40k',
    household: '3',
    language: ['english', 'spanish'],
    education: 'bachelor',
  };

  const { response, json } = await requestJson(server.baseUrl, '/api/plan/plan-1/information', {
    method: 'POST',
    body: { aggregateData },
  });

  assert.equal(response.status, 201);
  assert.equal(saved, true);
  assert.deepEqual(plan.aggregateData, aggregateData);
  assert.deepEqual(json.aggregateData, aggregateData);
});

test('changing circumstance groups removes only answers that no longer apply', async (t) => {
  const plan = {
    userID: 'user-1',
    currentCircumstance: 'married',
    answers: [
      { qKey: 'married_question', answer: 'yes' },
      { qKey: 'not_married_question', answer: 'no' },
      { qKey: 'shared_question', answer: 'yes' },
    ],
    async save() {},
  };
  const server = await createTestServer({
    Plan: { findById: async () => plan },
    Question: {
      find: () => ({
        select: async () => [
          { qKey: 'married_question', appliesToGroup: 'married' },
          { qKey: 'not_married_question', appliesToGroup: 'not_married' },
        ],
      }),
    },
  });
  t.after(() => server.close());

  const result = await requestJson(server.baseUrl, '/api/plan/plan-1/information', {
    method: 'POST',
    body: { currentCircumstance: 'never_married_seeking_custody' },
  });

  assert.equal(result.response.status, 201);
  assert.equal(plan.currentCircumstance, 'never_married_seeking_custody');
  assert.deepEqual(
    plan.answers.map(({ qKey }) => qKey),
    ['not_married_question', 'shared_question'],
  );
});

test('changing between married circumstances preserves answers in the married group', async (t) => {
  const plan = {
    userID: 'user-1',
    currentCircumstance: 'married_seeking_custody',
    answers: [
      { qKey: 'married_question', answer: 'yes' },
      { qKey: 'not_married_question', answer: 'no' },
      { qKey: 'shared_question', answer: 'yes' },
    ],
    async save() {},
  };
  const server = await createTestServer({
    Plan: { findById: async () => plan },
    Question: {
      find: () => {
        assert.fail('Answers should not be cleaned up when the group remains married');
      },
    },
  });
  t.after(() => server.close());

  const result = await requestJson(server.baseUrl, '/api/plan/plan-1/information', {
    method: 'POST',
    body: { currentCircumstance: 'married_seeking_parenting_time' },
  });

  assert.equal(result.response.status, 201);
  assert.equal(plan.currentCircumstance, 'married_seeking_parenting_time');
  assert.deepEqual(
    plan.answers.map(({ qKey }) => qKey),
    ['married_question', 'not_married_question', 'shared_question'],
  );
});
