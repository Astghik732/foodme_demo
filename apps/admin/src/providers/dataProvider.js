import api from '../api/base-api.js';

// Adapts our backend's `{ list, count }` list-response shape and plain
// resource objects to react-admin's `{ data, total }` / `{ data }` contract.
// The API already includes `id` on every record, so no mapping is needed there.

// react-admin resource names are plural; backend admin paths are singular.
const RESOURCE_TO_PATH = {
    orders: 'order',
    chefs: 'chef',
    dishes: 'dish',
};

const resourcePath = (resource) => `/${RESOURCE_TO_PATH[resource] ?? resource}`;

const dataProvider = {
    getList: async (resource, params) => {
        const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
        const { field, order } = params.sort ?? {};
        const filter = params.filter ?? {};

        const query = {
            page: page - 1,
            size: perPage,
            ...filter,
        };

        const response = await api.get(resourcePath(resource), query);
        let data = response.list ?? [];

        if (field) {
            data = [...data].sort((a, b) => {
                const dir = order === 'DESC' ? -1 : 1;
                if (a[field] < b[field]) return -1 * dir;
                if (a[field] > b[field]) return 1 * dir;
                return 0;
            });
        }

        return {
            data,
            total: response.count ?? data.length,
        };
    },

    getOne: async (resource, params) => {
        const data = await api.get(`${resourcePath(resource)}/${params.id}`);
        return { data };
    },

    getMany: async (resource, params) => {
        const results = await Promise.all(
            params.ids.map((id) => api.get(`${resourcePath(resource)}/${id}`))
        );
        return { data: results };
    },

    getManyReference: async (resource, params) => {
        const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
        const query = {
            page: page - 1,
            size: perPage,
            [params.target]: params.id,
            ...params.filter,
        };
        const response = await api.get(resourcePath(resource), query);
        const data = response.list ?? [];
        return { data, total: response.count ?? data.length };
    },

    update: async (resource, params) => {
        const data = await api.put(`${resourcePath(resource)}/${params.id}`, params.data);
        return { data };
    },

    updateMany: async () => {
        throw new Error('updateMany is not supported by this API');
    },

    create: async () => {
        throw new Error('create is not supported by this API');
    },

    delete: async () => {
        throw new Error('delete is not supported by this API');
    },

    deleteMany: async () => {
        throw new Error('deleteMany is not supported by this API');
    },
};

export default dataProvider;
