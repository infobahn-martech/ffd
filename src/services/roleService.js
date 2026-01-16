import Gateway from '../gateway/gateway';

const getRoles = () => Gateway.get('/roles');
const createRole = (data) => Gateway.post('/roles/create', data);
const updateRole = (roleId, data) => Gateway.post(`/roles/update/${roleId}`, data);
const deleteRole = (roleId) => Gateway.delete(`/roles/${roleId}`);

export default {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
};
