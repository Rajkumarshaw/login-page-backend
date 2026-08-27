import api from './api';

export const submitRecord = async (name, dateOfBirth) => {
  const response = await api.post('/records', { name, dateOfBirth });
  return response.data;
};

export const getRecords = async (search = '', sort = '') => {
  const response = await api.get('/admin/records', {
    params: { search, sort },
  });
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getRecord = async (id) => {
  const response = await api.get(`/admin/records/${id}`);
  return response.data;
};

export const updateRecord = async (id, name, dateOfBirth) => {
  const response = await api.put(`/admin/records/${id}`, { name, dateOfBirth });
  return response.data;
};

export const deleteRecord = async (id) => {
  const response = await api.delete(`/admin/records/${id}`);
  return response.data;
};
