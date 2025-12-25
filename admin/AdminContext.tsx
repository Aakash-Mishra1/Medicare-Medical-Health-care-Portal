import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminContextType } from './types';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('adminToken');
    
    if (storedAdmin && storedToken) {
      setAdmin(JSON.parse(storedAdmin));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (adminData: AdminUser, authToken: string) => {
    setAdmin(adminData);
    setToken(authToken);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
    localStorage.setItem('adminToken', authToken);
  };

  const updateAdmin = (adminData: AdminUser) => {
    setAdmin(adminData);
    localStorage.setItem('adminUser', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  return (
    <AdminContext.Provider value={{ admin, token, loading, login, logout, updateAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminProvider');
  }
  return context;
};
