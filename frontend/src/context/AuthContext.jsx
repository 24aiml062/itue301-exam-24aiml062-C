import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [employee, setEmployee] = useState(() => {
    try {
      const saved = localStorage.getItem('employee');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('role') || null;
  });

  const login = (employeeData, authToken) => {
    setEmployee(employeeData);
    setToken(authToken);
    setRole(employeeData?.role || 'employee');

    localStorage.setItem('employee', JSON.stringify(employeeData));
    localStorage.setItem('token', authToken);
    localStorage.setItem('role', employeeData?.role || 'employee');
  };

  const logout = () => {
    setEmployee(null);
    setToken(null);
    setRole(null);

    localStorage.removeItem('employee');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  const updateBalance = (newBalance) => {
    if (employee) {
      const updated = { ...employee, leaveBalance: newBalance };
      setEmployee(updated);
      localStorage.setItem('employee', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        employee,
        token,
        role,
        isAuthenticated: !!token,
        login,
        logout,
        updateBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
