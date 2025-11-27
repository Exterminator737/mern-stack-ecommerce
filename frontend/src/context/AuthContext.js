import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const googleLogin = async (credential) => {
    try {
      const res = await axios.post("/api/auth/google", { token: credential });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Google login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    login,
    googleLogin,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
