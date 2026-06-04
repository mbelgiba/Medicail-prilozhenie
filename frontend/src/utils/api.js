// Этот файл служит мостом между React-фронтендом и Go/Gin API.
// Здесь собраны все функции для общения с сервером

const defaultApiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : `${window.location.protocol}//${window.location.hostname}:5000/api`;
const rawApiUrl = process.env.REACT_APP_API_URL || defaultApiUrl;
const API_BASE_URL = rawApiUrl.replace(/\/$/, '').endsWith('/api')
  ? rawApiUrl.replace(/\/$/, '')
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

// Базовая функция запроса с обработкой ошибок
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token'); // Предполагаем, что токен хранится здесь
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка сервера');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

// Экспортируем готовые крутые методы
export const api = {
  // Авторизация
  login: (credentials) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => fetchWithAuth('/profile/me'),
  getCatalog: () => fetchWithAuth('/catalog'),

  // Семья
  getChildren: () => fetchWithAuth('/family/children'),
  addChild: (data) => fetchWithAuth('/family/children', { method: 'POST', body: JSON.stringify(data) }),

  // Записи к врачу
  getDoctors: () => fetchWithAuth('/doctors'),
  getAppointments: () => fetchWithAuth('/appointments'),
  getAppointmentAvailability: (doctorId, date) => fetchWithAuth(`/appointments/availability?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`),
  addAppointment: (data) => fetchWithAuth('/appointments', { method: 'POST', body: JSON.stringify(data) }),
  cancelAppointment: (id) => fetchWithAuth(`/appointments/${id}`, { method: 'DELETE' }),
  getDoctorAppointments: () => fetchWithAuth('/doctor/appointments'),

  // Поиск и уведомления
  search: (query) => fetchWithAuth(`/search?q=${encodeURIComponent(query)}`),
  getNotifications: () => fetchWithAuth('/notifications'),
  
  // Медицинские данные
  getMedicalRecords: () => fetchWithAuth('/medical'),
  addMedicalRecord: (data) => fetchWithAuth('/medical', { method: 'POST', body: JSON.stringify(data) }),
  
  // Игры
  getGames: () => fetchWithAuth('/games'),
  getGameProgress: () => fetchWithAuth('/games/progress'),
  saveGameProgress: (data) => fetchWithAuth('/games/progress', { method: 'POST', body: JSON.stringify(data) }),

};

export default api;
