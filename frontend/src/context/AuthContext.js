import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

// Создаем контекст для авторизации
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Проверяем токен при первой загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Функция входа в систему
  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setCurrentUser(response.user);
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
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setCurrentUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { success: false, message: error.message };
    }
  };

  // Функция выхода
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};