import { createContext, useContext, useState } from 'react';
import { maintenanceLogs as initialLogs } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [logs, setLogs] = useState(initialLogs);
  const [toast, setToast] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Critical alert: P04 pressure drop detected', time: '10 min ago', read: false },
    { id: 2, text: 'P11 flow fluctuation — High risk alert', time: '24 min ago', read: false },
    { id: 3, text: 'Maintenance log updated for P07', time: '1 hr ago', read: true },
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addLog = (entry) => {
    const newLog = {
      id: `M${String(logs.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      ...entry,
      status: 'In Progress',
    };
    setLogs(prev => [newLog, ...prev]);
    showToast('Maintenance record saved successfully.');
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  return (
    <AppContext.Provider value={{ logs, addLog, toast, showToast, notifications, markAllRead }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
