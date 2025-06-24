import { instance } from './axios';
import { makeRequest } from "../helpers/makeRequest.js";

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

// пример api/admin.js
export async function createEquipment(data) {
  const res = await fetch("/api/equipment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Ошибка создания оборудования");
  }

  // Важно: вернуть JSON с объектом нового оборудования, включая id_vid
  return res.json();
}

// create

// Пользователи
export const getAllUsers = async () => {
    const data = await makeRequest('get', '/api/admin/users');
    if (!Array.isArray(data)) {
        console.warn('Ответ сервера не является массивом пользователей:', data);
        return [];
    }
    return data;
};

export const updateUser = async (id, data) => {
  return await instance.patch(`/api/admin/users/${id}`, data);
};

export const deleteUser = async (id) => {
  return await instance.delete(`/api/admin/users/${id}`);
};

// Заявки
// export const getAllRequests = async () => {
//   return await instance.get('/api/admin/requests');
// };
export const getAllRequests = async () => {
  const data = await makeRequest('get', '/api/admin/requests');
  if (!Array.isArray(data)) {
    console.warn('Ожидался массив заявок, получено:', data);
    return [];
  }
  return data;
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

// Удаление заявки
export const deleteRequest = async (id) => {
  console.log(`API: deleteRequest id=${id}`);
  const res = await makeRequest('delete', `/api/admin/requests/${id}`);
  console.log('API: deleteRequest response:', res);
  return res;
};