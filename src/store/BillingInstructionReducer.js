import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import billingInstructionService from '../services/billingInstructionService';

const useBillingInstructionReducer = create((set) => ({
  isLoading: false,
  billingInstructions: [],
  totalCount: 0,
  instructionDetail: null,
  isLoadingDetail: false,
  isBeingUpdated: false,
  isDeleteLoading: false,

  getAllBillingInstructions: async ({ params } = {}) => {
    try {
      set({ isLoading: true });
      const { data } = await billingInstructionService.fetchAllBillingInstructions({ params });
      const raw = data?.data ?? data ?? [];
      const list = (Array.isArray(raw) ? raw : []).map((row) => ({
        ...row,
        id: row.billing_instruction_id ?? row.id ?? row.entity_id,
      }));
      const total =
        data?.pagination?.total ?? data?.totalCount ?? data?.total ?? list.length ?? 0;
      set({
        billingInstructions: list,
        totalCount: total,
        isLoading: false,
      });
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ billingInstructions: [], totalCount: 0, isLoading: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to load billing instructions');
    }
  },

  getInstructionByEntity: async (entity_id) => {
    try {
      set({ isLoadingDetail: true, instructionDetail: null });
      const { data } = await billingInstructionService.fetchInstructionByEntity(entity_id);
      const detail = data?.data ?? data;
      set({ instructionDetail: detail, isLoadingDetail: false });
      return detail;
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ instructionDetail: null, isLoadingDetail: false });
      error(err?.response?.data?.message ?? err.message);
      return null;
    }
  },

  clearInstructionDetail: () => set({ instructionDetail: null }),

  addBillingInstruction: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await billingInstructionService.addBillingInstruction(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Billing instruction saved');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  updateBillingInstruction: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await billingInstructionService.updateBillingInstruction(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Billing instruction updated');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  deleteBillingInstruction: async ({ entity_id, cb }) => {
    try {
      set({ isDeleteLoading: true });
      const { data } = await billingInstructionService.deleteBillingInstruction({ entity_id });
      set({ isDeleteLoading: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Billing instruction deleted successfully');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isDeleteLoading: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useBillingInstructionReducer;
