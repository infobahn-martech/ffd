import Gateway from '../gateway/gateway';

const getUserKpiDashboard = (userId) =>
  Gateway.get(`/kpi/user_kpi_dashboard/${userId}`);

const getUserTaskHistory = (userId, params = {}) => {
  const apiParams = {};

  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  if (params?.search) apiParams.search = params.search;
  if (params?.status && params.status !== 'All') apiParams.status = params.status;

  return Gateway.get(`/kpi/user_task_history/${userId}`, { params: apiParams });
};

const getLeaderboard = (params = {}) => {
  const apiParams = {};

  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  if (params?.search) apiParams.search = params.search;
  if (params?.level_id && params.level_id !== 'All') apiParams.level_id = params.level_id;

  return Gateway.get('/kpi/leaderboard', { params: apiParams });
};

export default { getUserKpiDashboard, getUserTaskHistory, getLeaderboard };
