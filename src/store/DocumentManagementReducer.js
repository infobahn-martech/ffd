import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import documentManagementService from "../services/documentManagementService";

const useDocumentManagementReducer = create((set) => ({
  isLoadingGet: false,
  isBeingUpdated: false,
  documentManagement: [],
  totalCount: 0,
  errorMessage: "",

  getDocumentManagement: async () => {
    try {
      set({ isLoadingGet: true });
      const { data } = await documentManagementService.getAllDocuments();
      const list = Array.isArray(data?.data) ? data.data : [];
      set({
        documentManagement: list,
        totalCount: list.length,
        isLoadingGet: false,
      });
    } catch (err) {
      set({
        isLoadingGet: false,
        errorMessage: err?.message ?? "Failed to fetch documents",
        documentManagement: [],
        totalCount: 0,
      });
    }
  },

  addDocumentManagement: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await documentManagementService.saveDocument(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Document saved successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  updateDocumentManagement: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await documentManagementService.updateDocument(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Document updated successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useDocumentManagementReducer;
