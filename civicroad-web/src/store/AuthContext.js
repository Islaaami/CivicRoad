import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "civicroad-user";
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (_error) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  function login(nextUser) {
    setUser(nextUser);
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export { AuthProvider, useAuth };
