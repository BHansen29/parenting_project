import { createContext, useReducer, useEffect } from "react";

export const FormContext = createContext(null);

const initialState = {
  safetyConcern: '',
  /* 
    Added Collaborative Mode values 
    '' -> not yet set (user hasn't reached the question)
    'locked-individual' — safety concern flagged; collaboration permanently disabled for this session
    'individual'        — no safety concern; user chose to work alone
    'collaborative'     — no safety concern; user chose to invite co-parent
  */
  collaborationMode: '',
  caseFilingStatus: '',
  flags: {},
  parents: {
    firstName: '',
    lastName: '',
    secondParentFirstName: '',
    secondParentLastName: '',
    errors: {}
  },
  children: [],
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
    communicationWithCoParentOnPhone: '',
    communicationWithCoParentOnPhoneDescription: '',
    notifyCoParentOfChildRelatedEvents: '',
    errors: {}
  },
  plan: {},
  question: {},
  currAnswer: ''
};

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
    case "UPDATE_CHILDREN":
      return {
        ...state,
        children: action.payload
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
      return action.payload;
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState, () => {
    const saved = localStorage.getItem("sharedCareForm");
    return saved ? JSON.parse(saved) : initialState;
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