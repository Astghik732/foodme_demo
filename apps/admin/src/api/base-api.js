import axios from 'axios';

const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
// Render's blueprint `fromService` injects a bare host (no scheme); prepend https:// so it works.
const API_BASE_URL = /^https?:\/\//.test(RAW_API_BASE_URL) ? RAW_API_BASE_URL : `https://${RAW_API_BASE_URL}`;

const BaseApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

BaseApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

BaseApi.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const api = {
    get: async (url, params = {}, config = {}) => {
        return await BaseApi.get(`/admin${url}`, {
            params,
            ...config,
        });
    },

    post: async (url, data = {}, config = {}) => {
        return await BaseApi.post(`/admin${url}`, data, config);
    },

    put: async (url, data = {}, config = {}) => {
        return await BaseApi.put(`/admin${url}`, data, config);
    },

    patch: async (url, data = {}, config = {}) => {
        return await BaseApi.patch(`/admin${url}`, data, config);
    },

    delete: async (url, config = {}) => {
        return await BaseApi.delete(`/admin${url}`, config);
    },
};

export default api;
export { BaseApi, API_BASE_URL };
