import Gateway from "../gateway/gateway";

const getCustomRoles = () => Gateway.get("/documents/get_custom_roles");

const getAllTasks = () => Gateway.get("/task_list");

const getRolesWithTasks = (params) =>
  Gateway.get("/task_list/roles_with_tasks", { params });

const assignRole = (payload) => Gateway.post("/task_list/assign_role", payload);

const getTasksByRole = (roleId) =>
  Gateway.get(`/task_list/tasks_by_role/${encodeURIComponent(String(roleId))}`);

export default {
  getCustomRoles,
  getAllTasks,
  getRolesWithTasks,
  assignRole,
  getTasksByRole,
};
