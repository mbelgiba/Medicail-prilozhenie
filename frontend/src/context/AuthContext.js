import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Создаем контекст для авторизации
export const AuthContext = createContext();

const saveSession = (token, user, setCurrentUser) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  setCurrentUser(user);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем токен при первой загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      api.getMe()
        .then((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          setCurrentUser(user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
      return;
    }
    setLoading(false);
  }, []);

  // Функция входа в систему
  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      saveSession(response.token, response.user, setCurrentUser);
      return { success: true };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { success: false, message: error.message };
    }
  };

  // Функция регистрации
  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      saveSession(response.token, response.user, setCurrentUser);
      return { success: true };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { success: false, message: error.message };
    }
  };

  const [childMode, setChildMode] = useState(() => {
    return localStorage.getItem('childMode') === 'true';
  });

  const toggleChildMode = (value) => {
    setChildMode(value);
    localStorage.setItem('childMode', value);
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('childMode');
    setCurrentUser(null);
    setChildMode(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, childMode, toggleChildMode }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
