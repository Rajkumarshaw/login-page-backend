import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/admin/login', { email, password });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/admin/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/admin/me');
  return response.data;
};
