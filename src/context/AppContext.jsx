import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  userProfile: {
    skills: [],
    location: '',
    experience: 0,
    education: '',
    resumeText: ''
  },
  recommendations: [],
  internships: [],
  filters: {
    skills: [],
    location: '',
    category: '',
    stipendRange: [0, 5000],
    duration: ''
  },
  loading: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER_PROFILE':
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    case 'SET_RECOMMENDATIONS':
      return { ...state, recommendations: action.payload };
    case 'SET_INTERNSHIPS':
      return { ...state, internships: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}