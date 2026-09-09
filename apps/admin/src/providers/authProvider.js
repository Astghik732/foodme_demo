import { loginRequest } from '../api/auth-api.js';

const authProvider = {
    login: async ({ username, password }) => {
        const result = await loginRequest(username, password);
        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.username);
        localStorage.setItem('role', result.role);
        return Promise.resolve();
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        return Promise.resolve();
    },
    checkAuth: () => {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    },
    checkError: (error) => {
        const status = error?.status ?? error?.response?.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            return Promise.reject();
        }
        return Promise.resolve();
    },
    getIdentity: () => {
        const username = localStorage.getItem('username');
        return username
            ? Promise.resolve({ id: username, fullName: username })
            : Promise.reject();
    },
    getPermissions: () => {
        const role = localStorage.getItem('role');
        return Promise.resolve(role);
    },
};

export default authProvider;
