import { create } from 'zustand';
import exportApprovalService from '../services/exportApprovalService';
import useAlertReducer from './AlertReducer';

const useExportApprovalReducer = create((set) => ({
  isLoadingDetails: false,
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
}));

export default useExportApprovalReducer;
