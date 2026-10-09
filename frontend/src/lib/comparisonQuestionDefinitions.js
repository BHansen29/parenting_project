const informationSharingOptions = [
  { value: 'parent1', label: 'Just me' },
  { value: 'parent2', label: 'Just my co-parent' },
  { value: 'both', label: 'Both me and my co-parent' },
  { value: 'needInfo', label: 'I need more information' },
  { value: 'defer', label: "Default to my co-parent's choice" },
];

const parentingTimeOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'sometimes', label: 'Sometimes (please describe)' },
  { value: 'needMoreInfo', label: 'I need more information' },
  { value: 'defaultToCoParentChoice', label: "Default to my co-parent's choice" },
];

const policyAgreementOptions = [
  { value: true, label: 'I agree to the standard policy' },
  { value: false, label: 'I do not agree to the standard policy' },
];

export const CUSTOM_COMPARISON_QUESTIONS = {
  'parentingTimeAndCommunication.agreeToTransportationPolicy': {
    qText: 'Standard Transportation Policy',
    options: policyAgreementOptions,
  },
  'parentingTimeAndCommunication.transportationArrangementDescription': {
    qText: 'Please describe your preferred transportation arrangement:',
  },
  'parentingTimeAndCommunication.agreeToActivityPolicy': {
    qText: 'Standard Activity Policy',
    options: policyAgreementOptions,
  },
  'parentingTimeAndCommunication.activityPolicyDescription': {
    qText: 'Please describe your preferred activity policy:',
  },
  'parentingTimeAndCommunication.communicationWithCoParentOnPhone': {
    qText: 'If your child is with you, are they allowed to talk to your co-parent on the phone?',
    options: parentingTimeOptions,
  },
  'parentingTimeAndCommunication.communicationWithCoParentOnPhoneDescription': {
    qText: 'Please describe the circumstances under which your child can talk to your co-parent on the phone:',
  },
  'parentingTimeAndCommunication.notifyCoParentOfChildRelatedEvents': {
    qText: 'Should your co-parent be told if your children get sick or injured?',
    options: parentingTimeOptions,
  },
  'parentingTimeAndCommunication.notifyCoParentOfChildRelatedEventsDescription': {
    qText: 'Please describe the circumstances under which you would notify your co-parent if your child gets sick or injured:',
  },
  'informationSharing.medicalRecords': {
    qText: "Who should get copies of any doctor's visits that your children may have? This parent can also contact the doctor and ask questions.",
    options: informationSharingOptions,
  },
  'informationSharing.schoolContact': {
    qText: "Who can call your child's school? This parent may also get copies of your child's academic records, like report cards, attendance, and teacher's comments.",
    options: informationSharingOptions,
  },
  'informationSharing.schoolReports': {
    qText: "Who can get copies of your child's school reports, calendars of school events, notices of parent-teacher conferences, and school programs?",
    options: informationSharingOptions,
  },
  'informationSharing.schoolActivities': {
    qText: 'Who can attend and participate in parent-teacher conferences, school trips, school programs, and other school activities that parents get invited to?',
    options: informationSharingOptions,
  },
  'informationSharing.extracurricularActivities': {
    qText: 'Who can attend and participate with the child(ren) in athletic programs and other extracurricular activities?',
    options: informationSharingOptions,
  },
};
