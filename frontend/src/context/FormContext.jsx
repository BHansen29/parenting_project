import { createContext, useReducer, useEffect } from "react";

export const FormContext = createContext(null);

const initialState = {
  collaborationMode: '', //added this
  caseFilingStatus: '',
  flags: {},
  parents: {
    firstName: '',
    lastName: '',
    secondParentFirstName: '',
    secondParentLastName: '',
    phone: '',
    address: '',
    errors: {}
  },
  parentingTime: { errors: {} },
  holidays: { errors: {} },
  decisionMaking: { errors: {} },
  communication: { errors: {} },
  education: { errors: {} },
  transportation: { errors: {} },
  parental_rights: {
    planID: '',
    responses: [],
    errors: {}
  },
  timeAndCommunication: {
    agreeToTransportationPolicy: false,
    transportationArrangementDescription: '',
    agreeToActivityPolicy: false,
    activityPolicyDescription: '',
    parentingSchedule: {},
    communicationWithCoParentOnPhone: '',
    communicationWithCoParentOnPhoneDescription: '',
    notifyCoParentOfChildRelatedEvents: '',
    notifyCoParentOfChildRelatedEventsDescription: '',
    errors: {}
  },
  plan: {},
  question: {},
  currAnswer: ''
};

function mergeSavedState(savedState = {}) {
  return {
    ...initialState,
    ...savedState,
    flags: {
      ...initialState.flags,
      ...(savedState.flags ?? {})
    },
    parents: {
      ...initialState.parents,
      ...(savedState.parents ?? {})
    },
    parental_rights: {
      ...initialState.parental_rights,
      ...(savedState.parental_rights ?? {})
    },
    timeAndCommunication: {
      ...initialState.timeAndCommunication,
      ...(savedState.timeAndCommunication ?? {})
    },
    plan: {
      ...initialState.plan,
      ...(savedState.plan ?? {})
    },
    question: {
      ...initialState.question,
      ...(savedState.question ?? {})
    }
  };
}

function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_SECTION":
      // Handle primitive values (strings, numbers, etc.)
      if (typeof action.payload !== 'object' || action.payload === null) {
        return {
          ...state,
          [action.section]: action.payload
        };
      }
      // Handle object values (merge with existing state)
      return {
        ...state,
        [action.section]: {
          ...state[action.section],
          ...action.payload
        }
      };
    case "UPDATE_FLAG":
      return {
        ...state,
        flags: {
          ...state.flags,
          [action.section]: action.payload
        }
      };
    case "LOAD_SAVED":
      return mergeSavedState(action.payload);
    case "RESET":
      return mergeSavedState();
    default:
      return state;
  }
}

export function FormProvider({ children, initialState: seededState }) {
  const [state, dispatch] = useReducer(formReducer, initialState, () => {
    if (seededState) {
      return mergeSavedState(seededState);
    }

    const saved = localStorage.getItem("sharedCareForm");
    if (!saved) {
      return mergeSavedState();
    }

    try {
      return mergeSavedState(JSON.parse(saved));
    } catch (error) {
      console.error('Failed to parse saved form state:', error);
      return mergeSavedState();
    }
  });

  useEffect(() => {
    localStorage.setItem("sharedCareForm", JSON.stringify(state));
  }, [state]);

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
}
