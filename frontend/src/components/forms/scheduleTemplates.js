const parentSlot = (parent) => ({
  parent,
  startTime: '',
  endTime: '',
  wholeDay: true,
});

const splitSlots = (firstParent, secondParent) => [
  { ...parentSlot(firstParent), wholeDay: false },
  { ...parentSlot(secondParent), wholeDay: false },
];

const buildSchedule = (weekPatterns) => weekPatterns.reduce((schedule, pattern, week) => {
  pattern.forEach((dayParents, dayOfWeek) => {
    schedule[week * 7 + dayOfWeek] = dayParents.length === 1
      ? [parentSlot(dayParents[0])]
      : splitSlots(dayParents[0], dayParents[1]);
  });
  return schedule;
}, {});

const repeated = (pattern) => [pattern, pattern, pattern, pattern];

// These templates are intentionally stored as parent assignments rather than exact
// times. They give the user a useful starting point without inventing exchange times
// that were not part of the source schedule examples.
export const SCHEDULE_TEMPLATES = [
  {
    id: 'template-a',
    name: 'Sample Schedule A',
    description: 'Two periods of 3–6 hours and one overnight spaced throughout the week.',
    requiresTimes: true,
    weekPatterns: repeated([['parent2', 'parent1'], ['parent1'], ['parent2', 'parent1'], ['parent1'], ['parent2', 'parent1'], ['parent1'], ['parent1', 'parent2']]),
  },
  {
    id: 'template-b',
    name: 'Sample Schedule B',
    description: 'One period of 3–6 hours and two non-consecutive overnights spaced throughout the week.',
    requiresTimes: true,
    weekPatterns: repeated([['parent1', 'parent2'], ['parent2', 'parent1'], ['parent1'], ['parent1', 'parent2'], ['parent2', 'parent1'], ['parent1', 'parent2'], ['parent1']]),
  },
  {
    id: 'template-c',
    name: 'Sample Schedule C',
    description: 'Two days with one parent, followed by three days with the other parent, including overnights for both.',
    weekPatterns: [
      ['parent2', 'parent2', 'parent1', 'parent1', 'parent1', 'parent2', 'parent2'].map((parent) => [parent]),
      ['parent1', 'parent1', 'parent1', 'parent2', 'parent2', 'parent1', 'parent1'].map((parent) => [parent]),
      ['parent1', 'parent2', 'parent2', 'parent1', 'parent1', 'parent1', 'parent2'].map((parent) => [parent]),
      ['parent2', 'parent1', 'parent1', 'parent1', 'parent2', 'parent2', 'parent1'].map((parent) => [parent]),
    ],
  },
  {
    id: 'template-d',
    name: 'Sample Schedule D',
    description: 'Equal parenting schedule where the child is not away from the other parent for more than two consecutive days.',
    weekPatterns: [
      ['parent2', 'parent2', 'parent1', 'parent1', 'parent2', 'parent2', 'parent1'].map((parent) => [parent]),
      ['parent1', 'parent2', 'parent2', 'parent1', 'parent1', 'parent2', 'parent2'].map((parent) => [parent]),
      ['parent1', 'parent1', 'parent2', 'parent2', 'parent1', 'parent1', 'parent2'].map((parent) => [parent]),
      ['parent2', 'parent2', 'parent1', 'parent1', 'parent2', 'parent2', 'parent1'].map((parent) => [parent]),
    ],
  },
].map((template) => ({
  ...template,
  pattern: template.weekPatterns[0],
  schedule: buildSchedule(template.weekPatterns),
}));

export const cloneSchedule = (schedule) => Object.fromEntries(
  Object.entries(schedule).map(([dayIndex, slots]) => [
    dayIndex,
    slots.map((slot) => ({ ...slot })),
  ]),
);

const timeToMinutes = (time) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || '')) return null;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getIncompleteScheduleSlots = (schedule = {}) => Object.entries(schedule).flatMap(([dayIndex, slots]) => (
  (Array.isArray(slots) ? slots : []).flatMap((slot, slotIndex) => {
    if (slot?.wholeDay) return [];
    const start = timeToMinutes(slot?.startTime);
    const end = timeToMinutes(slot?.endTime);
    return start === null || end === null || end <= start
      ? [{ dayIndex, slotIndex }]
      : [];
  })
));
