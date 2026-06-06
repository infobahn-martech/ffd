import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import levelManagementService from '../services/levelManagementService';

const useLevelManagementReducer = create((set) => ({
  isLoading: false,
  isBeingUpdated: false,
  levels: [],
  getLevels: async () => {
    try {
      set({ isLoading: true });
      const { data } = await levelManagementService.getAllKpiLevels();
      set({
        levels: data?.data ?? data ?? [],
        isLoading: false,
      });
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ levels: [], isLoading: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to load KPI levels');
    }
  },
  addLevel: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await levelManagementService.addKpiLevel(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'KPI level added successfully');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to add KPI level');
    }
  },
  updateLevel: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await levelManagementService.updateKpiLevel(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'KPI level updated successfully');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to update KPI level');
    }
  },
}));

export default useLevelManagementReducer;
