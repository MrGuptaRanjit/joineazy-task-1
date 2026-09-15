import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { token, user }
  },

  async register(studentData) {
    const response = await api.post('/auth/register', studentData);
    return response.data; // { token, user }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data; // user profile with group info
  },
};
