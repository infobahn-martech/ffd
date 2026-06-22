import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import captainService from "../services/captainService";

const useCaptainReducer = create((set) => ({
  isLoading: false,
  errorMessage: "",
  successMessage: "",
  captainData: [],
  captainDetail: null,
  isBeingUpdated: false,
  isDetailLoading: false,
  totalCaptainCount: 0,

  addCaptain: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await captainService.addCaptain(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Captain added successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong with adding captain",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  getCaptainData: async (params) => {
    try {
      set({ isLoading: true });
      const { data } = await captainService.getAllCaptains(params);
      set({
        captainData: data?.data ?? [],
        totalCaptainCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message,
        isLoading: false,
        captainData: [],
        totalCaptainCount: 0,
      });
    }
  },

  getCaptainById: async (captain_id) => {
    try {
      set({ isDetailLoading: true });
      const { data } = await captainService.getCaptainById(captain_id);
      const detail = data?.data ?? data ?? null;
      set({
        captainDetail: detail,
        isDetailLoading: false,
      });
      return detail;
    } catch (err) {
      set({ captainDetail: null, isDetailLoading: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
      return null;
    }
  },

  updateCaptain: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await captainService.updateCaptain(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Captain updated successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong updating captain",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  deleteCaptain: async ({ captain_id, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await captainService.deleteCaptain(captain_id);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Captain deleted successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  clearCaptainDetail: () => set({ captainDetail: null }),
}));

export default useCaptainReducer;
