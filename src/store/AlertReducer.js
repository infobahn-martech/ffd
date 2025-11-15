import { create } from 'zustand';

const useAlertReducer = create((set) => ({
  value: null,
  success: (message) => {
    set({ value: { type: 'success', message } });
  },
  error: (message) => {
    set({ value: { type: 'error', message } });
  },
  clear: () => {
    set({ value: null });
  },
}));

export default useAlertReducer;
