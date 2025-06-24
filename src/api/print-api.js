import { instance } from './axios';

export const generateActReception = async () => {
    return await instance.post('/api/print/act-reception');
};

export const generateActTransmission = async () => {
    return await instance.post('/api/print/act-transmission');
};