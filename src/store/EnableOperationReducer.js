import { create } from 'zustand';
import callFileService from '../services/callFileService';
import enableOperationService from '../services/enableOperationService';
import useAlertReducer from './AlertReducer';

const useEnableOperationReducer = create((set) => ({
  isLoadingDetails: false,
  isSaving: false,
  details: null,

  getEnableOperationDetails: async (callId) => {
    if (!callId) return;
    try {
      set({ isLoadingDetails: true });
      const { data } = await callFileService.getCallDetail(callId);
      set({ details: data?.data ?? null, isLoadingDetails: false });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ details: null, isLoadingDetails: false });
      showError(error?.response?.data?.message ?? error.message);
    }
  },

  saveEnableOperation: async (callId, payload) => {
    try {
      set({ isSaving: true });
      const { data } = await enableOperationService.saveEnableOperation(callId, payload);
      set({ isSaving: false });
      const { success } = useAlertReducer.getState();
      success(data?.message || 'Operation enabled.');
      return data;
    } catch (error) {
      set({ isSaving: false });
      const { error: showError } = useAlertReducer.getState();
      showError(error?.response?.data?.message ?? error.message ?? 'Failed to enable operation.');
      throw error;
    }
  },
}));

export default useEnableOperationReducer;
