import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Signup
  const signup = async (name, email, password) => {
    const { data } = await API.post("/auth/register", {
      name, email, password,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  // Login
  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", {
      email, password,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  };

  // Admin Login
  const adminLogin = async (email, password, secretKey) => {
    const { data } = await API.post("/auth/admin-login", {
      email, password, secretKey,
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("isAdminSession", "true");
    setUser(data);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAdminSession");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      signup, login, adminLogin, logout,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};