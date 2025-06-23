// // import axios from 'axios';
// import {makeRequest} from "../helpers/makeRequest.js";

// export const getAllEquipments = () => makeRequest('get', 'equipment');

// // function getEquipment(id) {
// //     const config = {
// //         headers: { 'Authorization': 'Bearer token' },
// //         params: { id: id },
// //         timeout: 5000
// //     };
// //
// //     axios.get('https://api.example.com/items', config);
// // }

import { makeRequest } from "../helpers/makeRequest.js";

export const getAllEquipments = async () => {
    const data = await makeRequest('get', '/api/equipment');
    if (!Array.isArray(data)) {
        console.warn("Ответ сервера не является массивом:", data);
        return [];
    }
    return data;
};
