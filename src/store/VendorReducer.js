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

  isHotelDashboardLoading: false,
  hotelDashboardError: '',
  hotelDashboardData: null,

  isHotelOrdersLoading: false,
  hotelOrdersError: '',
  hotelOrdersData: [],

  // GET_HOTEL_DASHBOARD_REQUEST / SUCCESS / FAILURE
  getHotelDashboard: async () => {
    try {
      set({ isHotelDashboardLoading: true, hotelDashboardError: '' });
      const { data } = await vendorService.getHotelDashboard();
      set({
        hotelDashboardData: data?.data ?? data ?? null,
        isHotelDashboardLoading: false,
      });
    } catch (error) {
      set({
        hotelDashboardError: error?.response?.data?.message ?? error.message,
        isHotelDashboardLoading: false,
        hotelDashboardData: null,
      });
    }
  },

  // GET_HOTEL_ORDERS_REQUEST / SUCCESS / FAILURE
  getHotelOrders: async () => {
    try {
      set({ isHotelOrdersLoading: true, hotelOrdersError: '' });
      const { data } = await vendorService.getHotelOrders();
      set({
        hotelOrdersData: data?.data ?? [],
        isHotelOrdersLoading: false,
      });
    } catch (error) {
      set({
        hotelOrdersError: error?.response?.data?.message ?? error.message,
        isHotelOrdersLoading: false,
        hotelOrdersData: [],
      });
    }
  },
}));

export default useVendorReducer;
