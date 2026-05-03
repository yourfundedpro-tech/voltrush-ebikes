import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await apiRequest("/api/auth/session", { method: "GET" });
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, []);

  async function register(payload) {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data;
  }

  async function login(payload) {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data;
  }

  async function logout() {
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  async function forgotPassword(payload) {
    return apiRequest("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function resetPassword(payload) {
    const data = await apiRequest("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        register,
        login,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
