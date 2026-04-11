const EMPTY_TIME_AND_COMMUNICATION = {
  agreeToTransportationPolicy: false,
  transportationArrangementDescription: '',
  agreeToActivityPolicy: false,
  activityPolicyDescription: '',
  parentingSchedule: {},
  communicationWithCoParentOnPhone: '',
  communicationWithCoParentOnPhoneDescription: '',
  notifyCoParentOfChildRelatedEvents: '',
  notifyCoParentOfChildRelatedEventsDescription: '',
  errors: {},
};

function buildParentalRightsState(plan) {
  const responses = Array.isArray(plan?.answers)
    ? plan.answers.map((qAnswer) => ({
        qKey: qAnswer.qKey,
        answer: qAnswer.answer,
      }))
    : [];

  return {
    planID: plan?._id ?? '',
    responses,
    errors: {},
  };
}

function buildParentsState(plan) {
  return {
    phone: plan?.phoneNumber ?? '',
    address: plan?.address ?? '',
    errors: {},
  };
}

function buildTimeAndCommunicationState(plan) {
  return {
    ...EMPTY_TIME_AND_COMMUNICATION,
    ...(plan?.timeAndCommunication ?? {}),
    errors: {},
  };
}

export function hydratePlanIntoForm(dispatch, plan) {
  dispatch({ type: 'RESET' });
  dispatch({ type: 'UPDATE_SECTION', section: 'plan', payload: plan ?? {} });
  dispatch({
    type: 'UPDATE_SECTION',
    section: 'parents',
    payload: buildParentsState(plan),
  });
  dispatch({
    type: 'UPDATE_SECTION',
    section: 'parental_rights',
    payload: buildParentalRightsState(plan),
  });
  dispatch({
    type: 'UPDATE_SECTION',
    section: 'timeAndCommunication',
    payload: buildTimeAndCommunicationState(plan),
  });
  dispatch({
    type: 'UPDATE_SECTION',
    section: 'currAnswer',
    payload: '',
  });
}

export function resetPlanForm(dispatch) {
  dispatch({ type: 'RESET' });
}
