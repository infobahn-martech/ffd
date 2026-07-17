import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import launchHireService from "../services/launchHireService";

const useLaunchHireServiceReducer = create((set) => ({
  isLoading: false,
  errorMessage: "",
  successMessage: "",
  serviceData: [],
  serviceDetail: null,
  isBeingUpdated: false,
  isDetailLoading: false,
  isDeleteLoading: false,
  totalServiceCount: 0,
  launchHireRequests: [],
  isLoadingRequests: false,

  addLaunchHireService: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await launchHireService.addLaunchHireService(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Service added successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong with adding service",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  getLaunchHireServiceData: async (params) => {
    try {
      set({ isLoading: true });
      const { data } = await launchHireService.getAllLaunchHireServices(params);
      set({
        serviceData: data?.data ?? [],
        totalServiceCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message,
        isLoading: false,
        serviceData: [],
        totalServiceCount: 0,
      });
    }
  },

  getLaunchHireServiceById: async (service_id) => {
    try {
      set({ isDetailLoading: true });
      const { data } = await launchHireService.getLaunchHireServiceById(service_id);
      const detail = data?.data ?? data ?? null;
      set({
        serviceDetail: detail,
        isDetailLoading: false,
      });
      return detail;
    } catch (err) {
      set({ serviceDetail: null, isDetailLoading: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
      return null;
    }
  },

  updateLaunchHireService: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await launchHireService.updateLaunchHireService(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Service updated successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong updating service",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  deleteLaunchHireService: async ({ service_id, cb }) => {
    try {
      set({ isDeleteLoading: true });
      const { data } = await launchHireService.deleteLaunchHireService(service_id);
      set({ successMessage: data?.message, isDeleteLoading: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Launch hire service deleted successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong deleting the service",
        isDeleteLoading: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  clearServiceDetail: () => set({ serviceDetail: null }),

  getLaunchHireRequests: async (callId) => {
    if (!callId) {
      set({ launchHireRequests: [] });
      return;
    }
    set({ isLoadingRequests: true });
    try {
      const response = await launchHireService.getLaunchHireRequests(callId);
      const payload = response?.data?.data ?? response?.data ?? [];
      const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      set({ launchHireRequests: list, isLoadingRequests: false });
    } catch {
      set({ launchHireRequests: [], isLoadingRequests: false });
    }
  },
}));

export default useLaunchHireServiceReducer;
