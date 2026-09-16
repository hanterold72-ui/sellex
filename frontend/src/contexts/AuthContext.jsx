import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Сразу ставим из кэша
      setUser(JSON.parse(savedUser));

      // Синхронизируем с сервером — план и кредиты актуализируются
      api
        .me()
        .then(({ data }) => {
          const merged = { ...JSON.parse(savedUser), ...data };
          setUser(merged);
          localStorage.setItem('user', JSON.stringify(merged));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.login({ email, password });
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    }
    return data;
  };

  const register = async (email, password, fullName) => {
    const { data } = await api.register({ email, password, full_name: fullName });
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateCredits = (credits) => {
    const updated = { ...user, credits };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.me();
      const merged = { ...user, ...data };
      setUser(merged);
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateCredits, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);