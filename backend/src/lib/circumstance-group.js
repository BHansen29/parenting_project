const marriedCircumstances = new Set([
  'married',
  'married_seeking_custody',
  'married_seeking_parenting_time',
]);

const notMarriedCircumstances = new Set([
  'never_married_seeking_custody',
  'never_married_seeking_parenting_time',
]);

function getCircumstanceGroup(currentCircumstance) {
  if (marriedCircumstances.has(currentCircumstance)) return 'married';
  if (notMarriedCircumstances.has(currentCircumstance)) return 'not_married';
  return null;
}

module.exports = { getCircumstanceGroup };
