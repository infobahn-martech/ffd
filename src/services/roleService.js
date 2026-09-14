import Gateway from '../gateway/gateway';
import { isMockDataEnabled, mockRoleService } from '../mocks/ffd';

const getRoles = ({ params }) => Gateway.get('/roles', { params });
const createRole = (data) => Gateway.post('/roles/create', data);
const updateRole = (roleId, data) => Gateway.post(`/roles/update/${roleId}`, data);
const deleteRole = (roleId) => Gateway.delete(`/roles/${roleId}`);

const realRoleService = {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
};

// TEMPORARY: dev-only mock switch — see src/mocks/ffd/index.js. Remove this
// conditional (keep `export default realRoleService`) once the backend exists.
export default isMockDataEnabled
    ? { ...realRoleService, ...mockRoleService }
    : realRoleService;
