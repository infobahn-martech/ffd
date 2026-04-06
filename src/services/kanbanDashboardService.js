import Gateway from '../gateway/gateway';

const createDashboard = (data) =>
  Gateway.post('/kanban_dashboard/create_dashboard', {
    dashboard_name: data.dashboard_name,
  });

const listAllDashboards = () => Gateway.get('/kanban_dashboard/list_all_dashboard');

const renameDashboard = (dashboardId, { dashboard_name }) =>
  Gateway.post(`/kanban_dashboard/rename_dashboard/${dashboardId}`, { dashboard_name });

/** JSON body for color, or FormData for wallpaper (background_type + background_image). */
const changeBackground = (dashboardId, data) =>
  Gateway.post(`/kanban_dashboard/change_background/${dashboardId}`, data);

const deleteDashboard = (dashboardId) =>
  Gateway.post(`/kanban_dashboard/delete_dashboard/${dashboardId}`);

export default {
  createDashboard,
  listAllDashboards,
  renameDashboard,
  changeBackground,
  deleteDashboard,
};
