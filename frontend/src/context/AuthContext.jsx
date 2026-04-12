import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, SESSION_KEY, getErrorMessage } from "../lib/api.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [storedSession, setStoredSession] = useLocalStorage(SESSION_KEY, {
    user: null,
    token: null,
  });
  const [user, setUser] = useState(storedSession.user);
  const [token, setToken] = useState(storedSession.token);
  const [initializing, setInitializing] = useState(Boolean(storedSession.token));

  const updateSession = ({ nextUser, nextToken }) => {
    setUser(nextUser);
    setToken(nextToken);
    setStoredSession({
      user: nextUser,
      token: nextToken,
    });
  };

  const logout = () => {
    updateSession({
      nextUser: null,
      nextToken: null,
    });
  };

  useEffect(() => {
    const restoreSession = async () => {
      // Demo mode - skip backend call if no token
      if (!storedSession.token) {
        setInitializing(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        updateSession({
          nextUser: response.data.data.user,
          nextToken: storedSession.token,
        });
      } catch (error) {
        // Demo fallback - use local demo user for testing

        updateSession({
          nextUser: {
            _id: 'demo',
            name: 'Demo User',
            email: 'user@railwayhub.com',
            role: 'user'
          },
          nextToken: 'demo-token'
        });
      } finally {
        setInitializing(false);
      }
    };

    restoreSession();
  }, []); 

  const login = async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    const session = response.data.data;

    updateSession({
      nextUser: session.user,
      nextToken: session.token,
    });

    return session;
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    const session = response.data.data;

    updateSession({
      nextUser: session.user,
      nextToken: session.token,
    });

    return session;
  };

  const refreshUser = async () => {
    if (!token) {
      throw new Error("No active session.");
    }

    try {
      const response = await api.get("/auth/me");
      updateSession({
        nextUser: response.data.data.user,
        nextToken: token,
      });
      return response.data.data.user;
    } catch (error) {
      logout();
      throw new Error(getErrorMessage(error));
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "admin",
      initializing,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
