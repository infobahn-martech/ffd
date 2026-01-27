import Gateway from '../gateway/gateway';

const addPermission = (data) => Gateway.post('/designation', data);
const fetchPermission = ({ params }) => Gateway.get('/permissions/get_all_permission', { params });
const getPermissions = () => Gateway.get('/permissions');
const assignRolePermission = (data) => Gateway.post('/permissions/assign_role_permission', data);
const updatePermission = (id, data) =>
  Gateway.patch(`/designation/${id}`, data);
const deletePermission = (id) => Gateway.delete(`/designation/${id}`);

export default {
  addPermission,
  fetchPermission,
  getPermissions,
  assignRolePermission,
  updatePermission,
  deletePermission,
};
