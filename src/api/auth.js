import { instance } from './axios';

export const loginWithVK = async (vkUserData) => {
  try {
    console.log('Отправка запроса на /api/auth/vk-login с данными:', vkUserData);
    const response = await instance.post('/api/auth/vk-login', vkUserData, { timeout: 10000 });
    console.log('Ответ от сервера:', response.data);

    let user = response.data.user;
    if (user && user.id_rol) {
      user.role = user.id_rol === 2 ? 'Заведующий снаряжением' : 'Арендатор';
      delete user.id_rol; 
    }
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return { user, token: response.data.token, tabs: response.data.tabs };
  } catch (error) {
    console.error('Ошибка авторизации:', error.message, error.response?.data);
    throw error;
  }
};