import { instance } from './axios';

export const getRecentRequests = async (params = {}) => {
  return await instance.get('/api/requests/recent', { params });
};

export const createRequest = async (data) => {
  return await instance.post('/api/requests', data);
};

export const updateRequest = async (id, data) => {
  return await instance.patch(`/api/requests/${id}`, data);
};

export const deleteRequest = async (id) => {
  return await instance.delete(`/api/requests/${id}`);
};