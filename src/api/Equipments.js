import { makeRequest } from "../helpers/makeRequest.js";

export const getAllEquipments = async () => {
    const data = await makeRequest('get', '/api/equipment');
    if (!Array.isArray(data)) {
        console.warn("Ответ сервера не является массивом:", data);
        return [];
    }
    return data;
};
