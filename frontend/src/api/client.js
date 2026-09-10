import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для обработки ошибок
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  register: (data) => client.post('/api/auth/register', data),
  login: (data) => client.post('/api/auth/login', data),
  me: () => client.get('/api/auth/me'),
  
  // Generation
  generateCard: (data) => client.post('/api/generate/card', data),
  generateVideo: (data) => client.post('/api/generate/video', data),
  getGeneration: (id) => client.get(`/api/generation/${id}`),
  
  // User
  getProfile: () => client.get('/api/user/profile'),
  updateProfile: (data) => client.put('/api/user/profile', data),
  getStats: () => client.get('/api/user/stats'),
  getGenerations: () => client.get('/api/user/generations'),
  getCredits: () => client.get('/api/user/credits'),
  
  // AI
  generateDescription: (data) => client.post('/api/ai/generate-description', data),
  
  // Admin
  adminStats: () => client.get('/api/admin/stats'),
  adminUsers: (params) => client.get('/api/admin/users', { params }),
  adminAddCredits: (userId, amount) => client.post(`/api/admin/users/${userId}/credits`, { amount }),
  adminToggleUser: (userId) => client.put(`/api/admin/users/${userId}/toggle`),
};

export default client;