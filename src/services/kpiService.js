import Gateway from '../gateway/gateway';

const getUserKpiDashboard = (userId) =>
  Gateway.get(`/kpi/user_kpi_dashboard/${userId}`);

const getUserAssignedTasks = (userId) =>
  Gateway.get(`/kpi/user_assigned_tasks/${userId}`);

export default { getUserKpiDashboard, getUserAssignedTasks };
