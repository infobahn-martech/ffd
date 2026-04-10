import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import callFileService from '../services/callFileService';

const useCallFileReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  operators: null,

  getAllOperators: async () => {
    try {
      set({ isLoading: true });
      const { data } = await callFileService.getAllOperators();
      const raw = data?.data ?? data ?? [];
      const list = Array.isArray(raw) ? raw : [];
      set({
        operators: list,
        isLoading: false,
      });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({
        errorMessage: error?.response?.data?.message || error.message,
        isLoading: false,
      });
      showError(error?.response?.data?.message || error.message || 'Failed to fetch operators');
    }
  },
}));

export default useCallFileReducer;
