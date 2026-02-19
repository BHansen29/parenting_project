import { createContext, useReducer, useEffect } from "react";

export const FormContext = createContext(null);

const initialState = {
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
};

function formReducer(state, action) {
  switch (action.type) {
    case "UPDATE_SECTION":
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