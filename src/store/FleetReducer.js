import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import fleetService from "../services/fleetService";

const useFleetReducer = create((set) => ({
  isLoading: false,
  errorMessage: "",
  successMessage: "",
  fleetData: [],
  fleetDetail: null,
  isBeingUpdated: false,
  isDetailLoading: false,
  isDeleteLoading: false,
  totalFleetCount: 0,

  addFleet: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await fleetService.addFleet(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Fleet added successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong with adding fleet",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  getFleetData: async (params) => {
    try {
      set({ isLoading: true });
      const { data } = await fleetService.getAllFleet(params);
      set({
        fleetData: data?.data ?? [],
        totalFleetCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message,
        isLoading: false,
        fleetData: [],
        totalFleetCount: 0,
      });
    }
  },

  getFleetById: async (fleet_id) => {
    try {
      set({ isDetailLoading: true });
      const { data } = await fleetService.getFleetById(fleet_id);
      const detail = data?.data ?? data ?? null;
      set({
        fleetDetail: detail,
        isDetailLoading: false,
      });
      return detail;
    } catch (err) {
      set({ fleetDetail: null, isDetailLoading: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
      return null;
    }
  },

  updateFleet: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await fleetService.updateFleet(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Fleet updated successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong updating fleet",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  deleteFleet: async ({ fleet_id, cb }) => {
    try {
      set({ isDeleteLoading: true });
      const { data } = await fleetService.deleteFleet(fleet_id);
      set({ successMessage: data?.message, isDeleteLoading: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Taxi boat fleet deleted successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong deleting the fleet",
        isDeleteLoading: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  clearFleetDetail: () => set({ fleetDetail: null }),
}));

export default useFleetReducer;
