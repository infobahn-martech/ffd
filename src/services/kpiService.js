import Gateway from '../gateway/gateway';

const getUserKpiDashboard = (userId) =>
  Gateway.get(`/kpi/user_kpi_dashboard/${userId}`);

export default { getUserKpiDashboard };
