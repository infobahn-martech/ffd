import Gateway from '../gateway/gateway';

const fetchPermission = ({ params }) => Gateway.get('/permissions/get_all_roles', { params });
const getPermissions = () => Gateway.get('/permissions');
const getRolePermission = (roleId) => Gateway.get(`/permissions/get_role_permission/${roleId}`);
const assignRolePermission = (data) =>
  Gateway.post('/permissions/assign_role_permission', data);
const updateRolePermission = (data) =>
  Gateway.post('/permissions/update_role_permission', data);
const deletePermission = (id) => Gateway.delete(`/permissions/delete_permission/${id}`);

export default {
  fetchPermission,
  getPermissions,
  getRolePermission,
  assignRolePermission,
  updateRolePermission,
  deletePermission,
};
