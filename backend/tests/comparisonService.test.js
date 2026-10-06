const test = require('node:test');
const assert = require('node:assert/strict');

const { computeDiff } = require('../src/services/comparisonService');

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