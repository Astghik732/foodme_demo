import api from './base-api.js';

const getChefs = async (page = 0, size = 25, q) => {
    return await api.get('/chef', { page, size, q });
};

const getChefById = async (id) => {
    return await api.get(`/chef/${id}`);
};

const updateChef = async (id, chef) => {
    return await api.put(`/chef/${id}`, chef);
};

export { getChefs, getChefById, updateChef };
