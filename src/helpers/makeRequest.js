import { instance } from './../api/axios';

export const makeRequest = async (method, url, params) => {
  try {
    const response = await instance({
      method,
      url,
      data: params
    });

    console.log("📦 makeRequest response:", response);

    return response;
  } catch (e) {
    console.error("❌ Ошибка в makeRequest:", e);
    return Promise.reject(e);
  }
};


