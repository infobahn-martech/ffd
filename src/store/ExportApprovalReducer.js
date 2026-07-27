import { create } from 'zustand';
import exportApprovalService from '../services/exportApprovalService';
import transportContentService from '../services/transportContentService';
import useAlertReducer from './AlertReducer';

const extractListEnvelope = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const useExportApprovalReducer = create((set) => ({
  isLoadingDetails: false,
  isSavingDetails: false,
  details: null,
  branches: [],
  loadingBranches: false,
  getExportApprovalDetails: async (callId) => {
    if (!callId) return;
    try {
      set({ isLoadingDetails: true });
      const { data } = await exportApprovalService.getExportApprovalDetails(callId);
      set({ details: data?.data ?? null, isLoadingDetails: false });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ details: null, isLoadingDetails: false });
      showError(error?.response?.data?.message ?? error.message);
    }
  },
  fetchBranches: async () => {
    set({ loadingBranches: true });
    try {
      const response = await transportContentService.getAllInvoiceBranches();
      set({ branches: extractListEnvelope(response), loadingBranches: false });
    } catch {
      set({ branches: [], loadingBranches: false });
    }
  },
  saveExportApprovalDetails: async (callId, payload, { silent } = {}) => {
    try {
      set({ isSavingDetails: true });
      const { data } = await exportApprovalService.saveExportApprovalDetails(callId, payload);
      set({ isSavingDetails: false });
      if (data?.status === 'error') {
        const { error: showError } = useAlertReducer.getState();
        showError(data?.message || 'Failed to save.');
        throw new Error(data?.message || 'Failed to save.');
      }
      if (!silent) {
        const { success } = useAlertReducer.getState();
        success(data?.message || 'Export approval details saved.');
      }
      return data;
    } catch (error) {
      set({ isSavingDetails: false });
      if (error?.response || error?.request) {
        const { error: showError } = useAlertReducer.getState();
        showError(error?.response?.data?.message ?? error.message);
      }
      throw error;
    }
  },
}));

export default useExportApprovalReducer;
