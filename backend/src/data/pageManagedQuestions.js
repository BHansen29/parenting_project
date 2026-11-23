const questions = [
  {
    qKey: 'managed_transportation_agreement',
    section: 'parenting-time-communication',
    qTitle: 'Transportation Agreement',
    qText: 'I agree to the standard transportation policy',
    qIntro: 'Standard transportation arrangements',
    type: 'text input',
    qIcon: 'car-icon',
    pageManaged: true,
  },
  {
    qKey: 'managed_activity_agreement',
    section: 'parenting-time-communication',
    qTitle: 'Activities & Scheduling',
    qText: 'I agree to the standard activity policy',
    qIntro: "Supporting your children's activities",
    type: 'text input',
    qIcon: 'car-icon',
    pageManaged: true,
  },
  {
    qKey: 'managed_holiday_gathering_adults',
    section: 'parenting-time-communication',
    qTitle: 'Holiday Gatherings',
    qText: 'Are there any adults at holiday gatherings you do not want your child to be around?',
    type: 'multiple choice',
    qIcon: 'info-icon',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
    pageManaged: true,
  },
  {
    qKey: 'managed_parenting_phone_communication',
    section: 'parenting-time-communication',
    qTitle: 'Phone Communication',
    qText: 'If your child is with you, are they allowed to talk to your co-parent on the phone?',
    type: 'multiple choice',
    qIcon: 'info-icon',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'sometimes', label: 'Sometimes (please describe)' },
      { value: 'needMoreInfo', label: 'I need more information' },
      { value: 'defaultToCoParentChoice', label: "Default to my co-parent's choice" },
    ],
    pageManaged: true,
  },
  {
    qKey: 'managed_parenting_event_notifications',
    section: 'parenting-time-communication',
    qTitle: 'Child-Related Events',
    qText: 'Should your co-parent be told if your children get sick or injured?',
    type: 'multiple choice',
    qIcon: 'info-icon',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'sometimes', label: 'Sometimes (please describe)' },
      { value: 'needMoreInfo', label: 'I need more information' },
      { value: 'defaultToCoParentChoice', label: "Default to my co-parent's choice" },
    ],
    pageManaged: true,
  },
  ...[
    {
      qKey: 'managed_information_medical',
      section: 'informationsharing',
      qTitle: 'Medical Information Access',
      qIntro: 'Medical records and health-care decisions',
    },
    {
      qKey: 'managed_information_school_contact',
      section: 'informationsharing',
      qTitle: 'School Contact Rights & Access to Information',
      qIntro: 'School records, reports, and contact with school officials',
    },
    {
      qKey: 'managed_information_school_activities',
      section: 'informationsharing',
      qTitle: 'School Activity Participation',
      qIntro: 'School events and extracurricular activities',
    },
  ].map((question) => ({
    ...question,
    qText: 'Do you agree to these default rights? If not, provide what rights you would like or not like your co-parent to have.',
    type: 'text input',
    qIcon: 'info-icon',
    pageManaged: true,
  })),
  {
    qKey: 'managed_tax_parent_role',
    section: 'tax-exemptions',
    qTitle: 'Parental Role',
    qText: 'What is your parental role?',
    type: 'multiple choice',
    qIcon: 'scale-icon',
    options: [
      { value: 'residential', label: 'I am the residential parent' },
      { value: 'nonresidential', label: 'I am the non-residential parent' },
    ],
    pageManaged: true,
  },
  {
    qKey: 'managed_tax_claim_child',
    section: 'tax-exemptions',
    qTitle: 'Tax Claiming Arrangement',
    qText: 'Who will claim [child] on tax forms?',
    type: 'multiple choice',
    qIcon: 'scale-icon',
    options: [
      { value: 'parent1EveryYear', label: 'I will claim this child every year' },
      { value: 'parent2EveryYear', label: 'My co-parent will claim this child every year' },
      { value: 'someYears', label: 'The parents will split claiming this child per year' },
    ],
    pageManaged: true,
  },
];

async function ensurePageManagedQuestions(Question) {
  await Promise.all(questions.map((question) =>
    Question.updateOne(
      { qKey: question.qKey },
      { $setOnInsert: question },
      { upsert: true },
    )
  ));
}

module.exports = { questions, ensurePageManagedQuestions };
