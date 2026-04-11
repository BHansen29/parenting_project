import { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [onNext, setOnNextFn] = useState(null);
  const [onBack, setOnBackFn] = useState(null);
  const [onLeave, setOnLeaveFn] = useState(null);

  const setOnNext = useCallback((fn) => {
    setOnNextFn(fn ? () => fn : null);
  }, []);
  const setOnBack = useCallback((fn) => {
    setOnBackFn(fn ? () => fn : null);
  }, []);
  const setOnLeave = useCallback((fn) => {
    setOnLeaveFn(fn ? () => fn : null);
  }, []);

  return (
    <NavigationContext.Provider value={{ onNext, onBack, onLeave, setOnNext, setOnBack, setOnLeave }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}
