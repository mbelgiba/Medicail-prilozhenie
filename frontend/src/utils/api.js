// Этот файл служит мостом между нашим React-фронтендом и твоим Node.js/Express бэкендом
// Здесь собраны все функции для общения с сервером

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  
  // Медицинские данные
  getMedicalRecords: () => fetchWithAuth('/medical'),
  addMedicalRecord: (data) => fetchWithAuth('/medical', { method: 'POST', body: JSON.stringify(data) }),
  
  // Игры
  getGames: () => fetchWithAuth('/games'),
  saveGameProgress: (data) => fetchWithAuth('/games/progress', { method: 'POST', body: JSON.stringify(data) }),

  // ИИ Ассистент
  analyzeHealth: (patientId) => fetchWithAuth('/ai/analyze', { method: 'POST', body: JSON.stringify({ patientId }) }),
};

export default api;