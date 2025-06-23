import { instance } from './axios';

// Экипировка
export const getAdminEquipments = async () => {
  return await instance.get('/api/equipment/with-availability');
};

export const updateEquipment = async (id, data) => {
  return await instance.patch(`/api/equipment/${id}`, data);
};

export const deleteEquipment = async (id) => {
  return await instance.delete(`/api/equipment/${id}`);
};

// Пользователи
export const getAllUsers = async () => {
  return await instance.get('/api/admin/users');
};

export const updateUser = async (id, data) => {
  return await instance.patch(`/api/admin/users/${id}`, data);
};

export const deleteUser = async (id) => {
  return await instance.delete(`/api/admin/users/${id}`);
};

// Заявки
export const getAllRequests = async () => {
  return await instance.get('/api/admin/requests');
};

export const getRequestItems = async (id) => {
  return await instance.get(`/api/admin/requests/${id}/items`);
};

export const addRequestItem = async (id, data) => {
  return await instance.post(`/api/admin/requests/${id}/items`, data);
};

export const updateRequest = async (id, data) => {
  return await instance.patch(`/api/admin/requests/${id}`, data);
};

export const deleteRequest = async (id) => {
  return await instance.delete(`/api/admin/requests/${id}`);
};