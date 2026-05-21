import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import documentChecklistService from "../services/documentChecklistService";

const normalizeList = (data) =>
  Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : Array.isArray(data?.documents)
        ? data.documents
        : [];

const useDocumentChecklistReducer = create((set) => ({
  isLoadingGet: false,
  isLoadingOptions: false,
  isBeingUpdated: false,
  errorMessage: "",
  successMessage: "",
  documentChecklists: [],
  totalCount: 0,
  roleOptions: [],
  documentOptions: [],

  getDocumentChecklists: async (params) => {
    try {
      set({ isLoadingGet: true });
      const { data } = await documentChecklistService.getMappedDocuments(params);
      const rows = normalizeList(data);
      set({
        documentChecklists: rows,
        totalCount:
          data?.total ??
          data?.meta?.total ??
          data?.count ??
          rows.length,
        isLoadingGet: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message ?? "Failed to fetch checklist mappings",
        isLoadingGet: false,
        documentChecklists: [],
        totalCount: 0,
      });
    }
  },

  getChecklistOptions: async () => {
    try {
      set({ isLoadingOptions: true });
      const [rolesRes, documentsRes] = await Promise.all([
        documentChecklistService.getCustomRoles(),
        documentChecklistService.getAllDocuments(),
      ]);

      const rolesRaw = normalizeList(rolesRes?.data);
      const documentsRaw = normalizeList(documentsRes?.data);

      set({
        roleOptions: rolesRaw.map((item) => ({
          value: Number(item?.role_id),
          label: item?.role,
        })),
        documentOptions: documentsRaw.map((item) => ({
          value: Number(item?.document_id),
          label: item?.document_name,
        })),
        isLoadingOptions: false,
      });
    } catch (err) {
      set({
        isLoadingOptions: false,
        errorMessage: err?.message ?? "Failed to fetch checklist options",
      });
    }
  },

  saveDocumentChecklist: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await documentChecklistService.saveDocumentChecklist(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Checklist saved successfully");
      cb?.();
    } catch (err) {
      set({ isBeingUpdated: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message);
    }
  },
}));

export default useDocumentChecklistReducer;
