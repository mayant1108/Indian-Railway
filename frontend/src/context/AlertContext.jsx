import { createContext, useContext, useMemo, useState } from "react";

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = (id) => {
    setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== id));
  };

  const addAlert = ({ type = "info", message, title, duration = 3500 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    const nextAlert = { id, type, message, title };

    setAlerts((currentAlerts) => [...currentAlerts, nextAlert]);

    if (duration > 0) {
      window.setTimeout(() => removeAlert(id), duration);
    }
  };

  const value = useMemo(
    () => ({
      alerts,
      addAlert,
      removeAlert,
    }),
    [alerts]
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlerts = () => {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlerts must be used inside AlertProvider");
  }

  return context;
};
