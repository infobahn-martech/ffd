import Gateway from '../gateway/gateway';

const createDashboard = (data) =>
  Gateway.post('/kanban_dashboard/create_dashboard', {
    dashboard_name: data.dashboard_name,
  });

const listAllDashboards = () => Gateway.get('/kanban_dashboard/list_all_dashboard');

export default {
  createDashboard,
  listAllDashboards,
};
