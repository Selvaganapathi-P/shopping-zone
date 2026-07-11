import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AdminContext = createContext();
export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setAdminLoading(false);
      return;
    }
    const isAdminSession = localStorage.getItem("isAdminSession") === "true";
    setIsAdmin(user.isAdmin && isAdminSession);
    setAdminLoading(false);
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, adminLoading }}>
      {children}
    </AdminContext.Provider>
  );
};