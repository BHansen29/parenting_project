const test = require('node:test');
const assert = require('node:assert/strict');

const { computeDiff, filterExcludedAnswers } = require('../src/services/comparisonService');

test('treats me and coParent as the same parent when answers are compared', () => {
  const [diff] = computeDiff(
    { school_address_parent: 'me' },
    { school_address_parent: 'coParent' }
  );

  assert.equal(diff.agreement, true);
});

test('treats both parents choosing only their co-parent as a disagreement', () => {
  const [diff] = computeDiff(
    { medicalRecords: 'coParent' },
    { medicalRecords: 'coParent' }
  );

  assert.equal(diff.agreement, false);
});

test('compares relative parent choices by absolute parent identity', () => {
  const [diff] = computeDiff(
    { medicalRecords: 'parent2' },
    { medicalRecords: 'parent1' }
  );

  assert.equal(diff.agreement, true);
});

test('normalizes human-readable relative parent choices', () => {
  const [diff] = computeDiff(
    { medicalRecords: 'Just my co-parent' },
    { medicalRecords: 'Just me' }
  );

  assert.equal(diff.agreement, true);
});

test('relative parent choices override configured raw-value conflicts', () => {
  const [diff] = computeDiff(
    { legal_decisions: 'parent1' },
    { legal_decisions: 'parent2' },
    { legal_decisions: ['parent1', 'parent2'] }
  );

  assert.equal(diff.agreement, true);
});

test('normalizes the displayed only-me and only-co-parent pair', () => {
  const [diff] = computeDiff(
    { legal_decisions: 'Parent 1' },
    { legal_decisions: 'only_my_coparent' },
    { legal_decisions: ['parent1', 'parent2'] }
  );

  assert.equal(diff.agreement, true);
});

test('normalizes coParentOnly and meOnly values from the comparison API', () => {
  const [diff] = computeDiff(
    { legal_decisions: 'coParentOnly' },
    { legal_decisions: 'meOnly' }
  );

  assert.equal(diff.agreement, true);
});

test('treats parent-relative Just me answers as a conflict', () => {
  const [diff] = computeDiff(
    { medicalRecords: 'parent1' },
    { medicalRecords: 'parent1' }
  );

  assert.equal(diff.agreement, false);
});

test('normalizes role-relative values inside answer arrays and objects', () => {
  const [diff] = computeDiff(
    { question: { choice: 'me', backups: ['coParent'] } },
    { question: { choice: 'coParent', backups: ['me'] } }
  );

  assert.equal(diff.agreement, true);
});

test('does not treat unrelated answer values as equivalent', () => {
  const [diff] = computeDiff(
    { question: 'defaultToCoParent' },
    { question: 'coParent' }
  );

  assert.equal(diff.agreement, false);
});

test('only treats configured answer values as conflicts', () => {
  const [nonConflict, conflict] = computeDiff(
    { first: 'no', second: 'yes' },
    { first: 'maybe', second: 'no' },
    { first: ['yes'], second: ['yes'] }
  );

  assert.equal(nonConflict.agreement, true);
  assert.equal(conflict.agreement, false);
});

test('detects configured values inside checkbox answers', () => {
  const [diff] = computeDiff(
    { question: ['one', 'two'] },
    { question: ['three'] },
    { question: ['two'] }
  );

  assert.equal(diff.agreement, false);
});

test('flags a configured value even when both parents select it', () => {
  const [diff] = computeDiff(
    { question: 'yes' },
    { question: 'yes' },
    { question: ['yes'] }
  );

  assert.equal(diff.agreement, false);
});

test('filters only questions excluded from comparison', () => {
  const filtered = filterExcludedAnswers(
    { living_arrangements: 'yes', legal_decisions: 'together' },
    new Set(['living_arrangements'])
  );

  assert.deepEqual(filtered, { legal_decisions: 'together' });
});