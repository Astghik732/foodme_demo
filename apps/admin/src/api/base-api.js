import axios from 'axios';

// Same-origin deploy: the backend serves this SPA and the API from one host, so the
// production default is an empty base (relative "/admin/..." calls). Local `npm run dev`
// talks to the backend on :8081. An explicit VITE_API_BASE_URL still wins.
const ENV_BASE = import.meta.env.VITE_API_BASE_URL;
const RAW_API_BASE_URL = ENV_BASE ?? (import.meta.env.DEV ? 'http://localhost:8081' : '');
// A bare host (no scheme) gets https:// prepended for back-compat; '' stays relative.
const API_BASE_URL =
    RAW_API_BASE_URL === '' || /^https?:\/\//.test(RAW_API_BASE_URL)
        ? RAW_API_BASE_URL
        : `https://${RAW_API_BASE_URL}`;

// Login route honours the Vite base path (e.g. "/backoffice/" in production).
const LOGIN_PATH = `${import.meta.env.BASE_URL}login`.replace(/\/{2,}/g, '/');

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
            if (window.location.pathname !== LOGIN_PATH) {
                window.location.href = LOGIN_PATH;
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
