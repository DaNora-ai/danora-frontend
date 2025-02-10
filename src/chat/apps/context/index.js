import React, { createContext, useReducer, useContext, useEffect } from "react";
import reducer from "./reducer";
import action from "./action";
import { initApps } from "./initState";

export const AppsContext = createContext(null);

export function AppsProvide({ children, initialUserPersonas }) {
  console.log('AppsProvide - initialUserPersonas:', initialUserPersonas);
  
  const [state, dispatch] = useReducer(reducer, {
    ...initApps,
    userPersonas: initialUserPersonas || []
  });

  console.log('AppsProvide - Current state:', state);

  useEffect(() => {
    if (initialUserPersonas) {
      console.log('AppsProvide - Updating userPersonas in effect:', initialUserPersonas);
      dispatch({ type: 'SET_USER_PERSONAS', payload: initialUserPersonas });
    }
  }, [initialUserPersonas]);

  const actions = action(state, dispatch);
  return (
    <AppsContext.Provider value={{ ...state, ...actions, dispatch }}>
      {children}
    </AppsContext.Provider>
  );
}

export const useApps = () => {
  const context = useContext(AppsContext);
  console.log('useApps - Current context:', context);
  return context;
};
