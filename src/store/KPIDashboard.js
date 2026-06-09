import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import kpiService from '../services/kpiService';

const initialDashboardData = {
  user: null,
  total_points: 0,
  points_last_24h: 0,
  completed_tasks: 0,
  pending_tasks: 0,
  current_level: null,
  badge_icon_url: null,
  last_level_up: null,
  next_level: null,
  points_to_next_level: null,
};

const useKPIDashboardReducer = create((set) => ({
  isLoading: false,
  isLoadingTasks: false,
  errorMessage: '',
  tasksErrorMessage: '',
  dashboardData: initialDashboardData,
  assignedTasks: [],

  fetchUserKpiDashboard: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoading: true, errorMessage: '' });
      const { data } = await kpiService.getUserKpiDashboard(userId);
      const dashboardData = data?.data ?? initialDashboardData;

      set({
        dashboardData: {
          ...initialDashboardData,
          ...dashboardData,
        },
        isLoading: false,
      });
    } catch (err) {
      set({
        dashboardData: initialDashboardData,
        errorMessage: err?.message ?? 'Failed to load KPI dashboard',
        isLoading: false,
      });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to load KPI dashboard');
    }
  },

  fetchUserAssignedTasks: async (userId) => {
    if (!userId) return;

    try {
      set({ isLoadingTasks: true, tasksErrorMessage: '' });
      const { data } = await kpiService.getUserAssignedTasks(userId);
      const assignedTasks = Array.isArray(data?.data) ? data.data : [];

      set({ assignedTasks, isLoadingTasks: false });
    } catch (err) {
      set({
        assignedTasks: [],
        tasksErrorMessage: err?.message ?? 'Failed to load assigned tasks',
        isLoadingTasks: false,
      });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to load assigned tasks');
    }
  },

  resetDashboard: () => {
    set({
      dashboardData: initialDashboardData,
      assignedTasks: [],
      errorMessage: '',
      tasksErrorMessage: '',
      isLoading: false,
      isLoadingTasks: false,
    });
  },
}));

export default useKPIDashboardReducer;
