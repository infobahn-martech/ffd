import { create } from 'zustand';
import vendorService from '../services/vendorService';

const useVendorReducer = create((set) => ({
  isDashboardLoading: false,
  dashboardError: '',
  dashboardData: null,

  isOrdersLoading: false,
  ordersError: '',
  ordersData: [],

  // GET_VENDOR_DASHBOARD_REQUEST / SUCCESS / FAILURE
  getVendorDashboard: async () => {
    try {
      set({ isDashboardLoading: true, dashboardError: '' });
      const { data } = await vendorService.getVendorDashboard();
      set({
        dashboardData: data?.data ?? data ?? null,
        isDashboardLoading: false,
      });
    } catch (error) {
      set({
        dashboardError: error?.response?.data?.message ?? error.message,
        isDashboardLoading: false,
        dashboardData: null,
      });
    }
  },

  // GET_VENDOR_ORDERS_REQUEST / SUCCESS / FAILURE
  getVendorOrders: async () => {
    try {
      set({ isOrdersLoading: true, ordersError: '' });
      const { data } = await vendorService.getVendorOrders();
      set({
        ordersData: data?.data ?? [],
        isOrdersLoading: false,
      });
    } catch (error) {
      set({
        ordersError: error?.response?.data?.message ?? error.message,
        isOrdersLoading: false,
        ordersData: [],
      });
    }
  },
}));

export default useVendorReducer;
