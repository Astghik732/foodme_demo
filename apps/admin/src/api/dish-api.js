import api from './base-api.js';

const getDishes = async (page = 0, size = 25, chefId, q) => {
    return await api.get('/dish', { page, size, chefId, q });
};

const getDishById = async (id) => {
    return await api.get(`/dish/${id}`);
};

const updateDish = async (id, dish) => {
    return await api.put(`/dish/${id}`, dish);
};

export { getDishes, getDishById, updateDish };
