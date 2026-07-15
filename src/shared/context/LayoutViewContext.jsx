import { createContext, useContext, useState, useCallback } from 'react';

const LayoutViewContext = createContext(null);

export function LayoutViewProvider({ children }) {
  const [layoutView, setLayoutView] = useState('normal');
  const [pageBackground, setPageBackground] = useState(null);

  const setLayoutViewValue = useCallback((value) => {
    setLayoutView(value);
  }, []);

  return (
    <LayoutViewContext.Provider
      value={{ layoutView, setLayoutView: setLayoutViewValue, pageBackground, setPageBackground }}
    >
      {children}
    </LayoutViewContext.Provider>
  );
}

export function useLayoutView() {
  const ctx = useContext(LayoutViewContext);
  return (
    ctx || {
      layoutView: 'normal',
      setLayoutView: () => {},
      pageBackground: null,
      setPageBackground: () => {},
    }
  );
}
