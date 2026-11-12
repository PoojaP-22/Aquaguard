import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider value={{ toast, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
