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