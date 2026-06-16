import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import operatorService from "../services/operatorService";

const useOperatorReducer = create((set) => ({
  isLoading: false,
  errorMessage: "",
  successMessage: "",
  operatorData: [],
  operatorDetail: null,
  isBeingUpdated: false,
  isDetailLoading: false,
  totalOperatorCount: 0,

  addOperator: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await operatorService.addOperator(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Operator added successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong with adding an operator",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  getOperatorData: async (params) => {
    try {
      set({ isLoading: true });
      const { data } = await operatorService.getAllOperators(params);
      set({
        operatorData: data?.data ?? [],
        totalOperatorCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message,
        isLoading: false,
        operatorData: [],
        totalOperatorCount: 0,
      });
    }
  },

  getOperatorById: async (operator_id) => {
    try {
      set({ isDetailLoading: true });
      const { data } = await operatorService.getOperatorById(operator_id);
      set({
        operatorDetail: data?.data ?? data ?? null,
        isDetailLoading: false,
      });
      return data?.data ?? data ?? null;
    } catch (err) {
      set({ operatorDetail: null, isDetailLoading: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
      return null;
    }
  },

  updateOperator: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await operatorService.updateOperator(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Operator updated successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong updating the operator",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  deleteOperator: async ({ operator_id, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await operatorService.deleteOperator(operator_id);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Taxi boat operator deleted successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong deleting the operator",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  clearOperatorDetail: () => set({ operatorDetail: null }),
}));

export default useOperatorReducer;