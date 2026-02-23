import { createContext, useContext, useState, useCallback } from 'react';

const LayoutViewContext = createContext(null);

export function LayoutViewProvider({ children }) {
  const [layoutView, setLayoutView] = useState('classic');

  const setLayoutViewValue = useCallback((value) => {
    setLayoutView(value);
  }, []);

  return (
    <LayoutViewContext.Provider value={{ layoutView, setLayoutView: setLayoutViewValue }}>
      {children}
    </LayoutViewContext.Provider>
  );
}

export function useLayoutView() {
  const ctx = useContext(LayoutViewContext);
  return ctx || { layoutView: 'classic', setLayoutView: () => {} };
}
