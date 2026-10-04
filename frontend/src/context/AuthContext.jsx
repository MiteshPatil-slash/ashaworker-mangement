import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

function mapBackendRole(role) {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'SUPERVISOR') return 'SUPERVISOR';
  if (role === 'ASHA') return 'ASHA_WORKER';
  return 'ASHA_WORKER';
}

export const USERS_BY_ROLE = {
  ASHA_WORKER: {
    name: 'ASHA Worker View',
    roleLabel: 'ASHA Worker',
    roleSubtitle: 'Community Health Worker',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
  },
  SUPERVISOR: {
    name: 'Supervisor View',
    roleLabel: 'Supervisor',
    roleSubtitle: 'Monitor & Support ASHA Workers',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
  },
  ADMIN: {
    name: 'Admin View',
    roleLabel: 'Admin',
    roleSubtitle: 'System Management & Policy Oversight',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('asha_token'));

  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('asha_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    const saved = sessionStorage.getItem('asha_user');
    return saved ? mapBackendRole(JSON.parse(saved).role) : 'ASHA_WORKER';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('asha_token');
  });

  const login = async (username, password) => {
    const res = await api.login(username, password);
    sessionStorage.setItem('asha_token', res.token);
    sessionStorage.setItem('asha_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setCurrentRole(mapBackendRole(res.user.role));
    setIsAuthenticated(true);
    return res.user;
  };

  const logout = () => {
    sessionStorage.removeItem('asha_token');
    sessionStorage.removeItem('asha_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchRole = (role) => {
    setCurrentRole(role);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const merged = { ...prev, ...updates };
      sessionStorage.setItem('asha_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        currentRole,
        isAuthenticated,
        login,
        logout,
        switchRole,
        updateUser,
        isAsha: currentRole === 'ASHA_WORKER',
        isSupervisor: currentRole === 'SUPERVISOR',
        isAdmin: currentRole === 'ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}