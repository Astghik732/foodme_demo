import api from './base-api.js';

const getOrders = async (page = 0, size = 25, status) => {
    return await api.get('/order', { page, size, status });
};

const getOrderById = async (id) => {
    return await api.get(`/order/${id}`);
};

const updateOrderStatus = async (id, status, rejectReason = null) => {
    return await api.patch(`/order/${id}/status`, { status, rejectReason });
};

export { getOrders, getOrderById, updateOrderStatus };
