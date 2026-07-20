import { create } from 'zustand';
import exportApprovalService from '../services/exportApprovalService';
import useAlertReducer from './AlertReducer';

const useExportApprovalReducer = create((set) => ({
  isLoadingDetails: false,
  isSavingDetails: false,
  details: null,
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
  saveExportApprovalDetails: async (payload, { silent } = {}) => {
    try {
      set({ isSavingDetails: true });
      const { data } = await exportApprovalService.saveExportApprovalDetails(payload);
      set({ isSavingDetails: false });
      if (!silent) {
        const { success } = useAlertReducer.getState();
        success(data?.message || 'Export approval details saved.');
      }
      return data;
    } catch (error) {
      set({ isSavingDetails: false });
      const { error: showError } = useAlertReducer.getState();
      showError(error?.response?.data?.message ?? error.message);
      throw error;
    }
  },
}));

export default useExportApprovalReducer;
