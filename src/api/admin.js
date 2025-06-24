import { instance } from './axios';
import { makeRequest } from "../helpers/makeRequest.js";

// Экипировка
export const getAdminEquipments = async () => {
  return await instance.get('/api/equipment/with-availability');
};

// Исправленная функция создания оборудования - используем instance вместо fetch
export const createEquipment = async (data) => {
  console.log("🚀 Отправляем данные на создание:", data);
  const result = await instance.post('/api/equipment', data);
  console.log("🧪 Ответ от сервера (POST /equipment):", result);
  return result;
};

export const updateEquipment = async (id, data) => {
  return await instance.patch(`/api/equipment/${id}`, data);
};

export const deleteEquipment = async (id) => {
  return await instance.delete(`/api/equipment/${id}`);
};

// Пользователи
export const getAllUsers = async () => {
  const data = await makeRequest('get', '/api/admin/users');
  if (!Array.isArray(data)) {
    console.warn('Ответ сервера не является массивом пользователей:', data);
    return [];
  }
  return data;
};

export const addUser = async (userData) => {
  
  return await instance.post(`/api/admin/users/`, userData);
  
};

export const updateUser = async (id, data) => {
  return await instance.patch(`/api/admin/users/${id}`, data);
};

export const deleteUser = async (id) => {
  return await instance.delete(`/api/admin/users/${id}`);
};

// Заявки
export const getAllRequests = async () => {
  const data = await makeRequest('get', '/api/admin/requests');
  if (!Array.isArray(data)) {
    console.warn('Ожидался массив заявок, получено:', data);
    return [];
  }
  return data;
};

export const createRequest = async (data) => {
  console.log('API: createRequest', data);
  const res = await makeRequest('post', '/api/admin/requests', data);
  console.log('API: createRequest response:', res);
  return res;
};

export const getRequestItems = async (id) => {
  return await instance.get(`/api/admin/requests/${id}/items`);
};

export const addRequestItem = async (id, data) => {
  return await instance.post(`/api/admin/requests/${id}/items`, data);
};

export const updateRequest = async (id, data) => {
  console.log(`API: updateRequest id=${id}`, data);
  const res = await makeRequest('patch', `/api/admin/requests/${id}`, data);
  console.log('API: updateRequest response:', res);
  return res;
};

export const deleteRequest = async (id) => {
  console.log(`API: deleteRequest id=${id}`);
  const res = await makeRequest('delete', `/api/admin/requests/${id}`);
  console.log('API: deleteRequest response:', res);
  return res;
};



