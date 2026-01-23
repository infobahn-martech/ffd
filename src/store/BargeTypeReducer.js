import { create } from 'zustand';
import bargeTypeService from '../services/bargeTypeService';
import useAlertReducer from './AlertReducer';

const useBargeTypeReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  bargeTypes: null,
  totalCount: null,
  addEditLoader: false,

  getBargeTypes: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await bargeTypeService.getBargeTypes({ params });
      const raw = data?.data || data || [];
      const list = raw.map((row) => ({
        ...row,
        name: row.barge_type ?? row.name,
        createdAt: row.created_at ?? row.createdAt,
        barge_type_id: row.barge_type_id ?? row._id,
      }));
      const total =
        data?.pagination?.total ??
        data?.totalCount ??
        data?.total ??
        raw?.length ??
        0;
      set({
        bargeTypes: list,
        totalCount: total,
        isLoading: false,
      });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ errorMessage: error?.message, isLoading: false });
      showError(error?.response?.data?.message ?? error?.message ?? 'Failed to fetch barge types');
    }
  },

  createBargeType: async ({ barge_type, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await bargeTypeService.addBargeType({ barge_type });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Barge type created successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },

  updateBargeType: async ({ barge_type_id, barge_type, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await bargeTypeService.updateBargeType({
        barge_type_id,
        barge_type,
      });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Barge type updated successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },
}));

export default useBargeTypeReducer;
