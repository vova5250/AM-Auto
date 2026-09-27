import axios from 'axios';

// Базовый URL API для всех запросов
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Создаём axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
