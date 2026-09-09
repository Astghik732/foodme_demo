import { BaseApi } from './base-api.js';

const loginRequest = async (username, password) => {
    return await BaseApi.post('/admin/auth/login', { username, password });
};

export { loginRequest };
