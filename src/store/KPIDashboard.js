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
  errorMessage: '',
  dashboardData: initialDashboardData,

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

  resetDashboard: () => {
    set({ dashboardData: initialDashboardData, errorMessage: '', isLoading: false });
  },
}));

export default useKPIDashboardReducer;
