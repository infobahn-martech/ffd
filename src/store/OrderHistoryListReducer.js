import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import orderHistoryService from "../services/orderHistoryService";

const useOrderHistoryListReducer = create((set) => ({
  inbounds: [],
  landingNotes: [],
  dispatchNotes: [],
  total: 0,
  isLoadingList: false,
  errorMessage: "",

  getAllOrdersSummary: async (params) => {
    try {
      set({ isLoadingList: true });
      const { data } = await orderHistoryService.getAllOrdersSummary(params);
      const payload = data?.data ?? {};

      set({
        inbounds: Array.isArray(payload.inbounds) ? payload.inbounds : [],
        landingNotes: Array.isArray(payload.landing_notes) ? payload.landing_notes : [],
        dispatchNotes: Array.isArray(payload.dispatch_notes) ? payload.dispatch_notes : [],
        total: data?.pagination?.inbounds?.total ?? 0,
        isLoadingList: false,
      });
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        isLoadingList: false,
        inbounds: [],
        landingNotes: [],
        dispatchNotes: [],
        total: 0,
        errorMessage: err?.response?.data?.message ?? err.message,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useOrderHistoryListReducer;
