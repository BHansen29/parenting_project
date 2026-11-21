const test = require('node:test');
const assert = require('node:assert/strict');
const { getCircumstanceGroup } = require('../src/lib/circumstance-group');

test('maps both married answer choices and the legacy value to the married question group', () => {
  for (const circumstance of [
    'married',
    'married_seeking_custody',
    'married_seeking_parenting_time',
  ]) {
    assert.equal(getCircumstanceGroup(circumstance), 'married');
  }
});

test('maps both never-married answer choices to the not-married question group', () => {
  for (const circumstance of [
    'never_married_seeking_custody',
    'never_married_seeking_parenting_time',
  ]) {
    assert.equal(getCircumstanceGroup(circumstance), 'not_married');
  }
});
