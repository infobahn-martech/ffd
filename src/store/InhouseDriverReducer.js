import { create } from 'zustand';
import driverPortalService from '../services/driverPortalService';

const useInhouseDriverReducer = create((set) => ({
  isTripStatsLoading: false,
  tripStatsError: '',
  tripStatsData: null,

  isRequestsLoading: false,
  requestsError: '',
  requestsData: [],

  // GET_DRIVER_TRIP_STATS_REQUEST / SUCCESS / FAILURE
  getDriverTripStats: async () => {
    try {
      set({ isTripStatsLoading: true, tripStatsError: '' });
      const { data } = await driverPortalService.getDriverTripStats();
      set({
        tripStatsData: data?.data ?? null,
        isTripStatsLoading: false,
      });
    } catch (error) {
      set({
        tripStatsError: error?.response?.data?.message ?? error.message,
        isTripStatsLoading: false,
        tripStatsData: null,
      });
    }
  },

  // GET_LATEST_REQUESTS_BY_DRIVER_REQUEST / SUCCESS / FAILURE
  getLatestRequestsByDriver: async () => {
    try {
      set({ isRequestsLoading: true, requestsError: '' });
      const { data } = await driverPortalService.getLatestRequestsByDriver();
      set({
        requestsData: data?.data ?? [],
        isRequestsLoading: false,
      });
    } catch (error) {
      set({
        requestsError: error?.response?.data?.message ?? error.message,
        isRequestsLoading: false,
        requestsData: [],
      });
    }
  },
}));

export default useInhouseDriverReducer;
