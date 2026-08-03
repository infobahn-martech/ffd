import { create } from 'zustand';
import activityLogService from '../services/activityLogService';

const useActivityLogReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  activityLogData: [],
  totalActivityLogCount: 0,
  getActivityLogData: async (apiParams) => {
    const params = apiParams?.params ?? apiParams;
    try {
      set({ isLoading: true });
      const { data } = await activityLogService.getActivityLogData({ params });
      set({
        activityLogData: data?.data ?? [],
        totalActivityLogCount: data?.pagination?.total ?? data?.total ?? 0,
        isLoading: false,
      });
    } catch (error) {
      set({
        errorMessage: error.message,
        isLoading: false,
        activityLogData: [],
        totalActivityLogCount: 0,
      });
    }
  },
}));

export default useActivityLogReducer;
