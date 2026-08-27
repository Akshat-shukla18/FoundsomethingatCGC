import api from './api';

export const authService = {
  login: async (collegeEmail, password) => {
    const response = await api.post('/auth/login', { collegeEmail, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
