import { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const [onNext, setOnNextFn] = useState(null);
  const [onBack, setOnBackFn] = useState(null);

  const setOnNext = useCallback((fn) => setOnNextFn(() => fn), []);
  const setOnBack = useCallback((fn) => setOnBackFn(() => fn), []);

  return (
    <NavigationContext.Provider value={{ onNext, onBack, setOnNext, setOnBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}