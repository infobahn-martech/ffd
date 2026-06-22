import { create } from 'zustand';
import tugTypeService from '../services/tugTypeService';
import useAlertReducer from './AlertReducer';

const useTugTypeReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  tugTypes: null,
  totalCount: null,
  addEditLoader: false,
  deleteLoader: false,
  detailsLoader: false,

  getTugTypes: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await tugTypeService.getTugTypes({ params });
      const raw = data?.data || data || [];
      const list = raw.map((row) => ({
        ...row,
        name: row.tug_type ?? row.name,
        createdAt: row.created_date ?? row.created_at ?? row.createdAt,
        tug_type_id: row.tug_type_id ?? row._id,
      }));
      const total =
        data?.pagination?.total ??
        data?.totalCount ??
        data?.total ??
        raw?.length ??
        0;
      set({
        tugTypes: list,
        totalCount: total,
        isLoading: false,
      });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ errorMessage: error?.message, isLoading: false });
      showError(error?.response?.data?.message ?? error?.message ?? 'Failed to fetch tug types');
    }
  },

  getTugTypeById: async ({ tug_type_id, cb }) => {
    try {
      set({ detailsLoader: true });
      const { data } = await tugTypeService.getTugTypeById(tug_type_id);
      const details = data?.data ?? data ?? null;
      set({ detailsLoader: false });
      cb?.(details);
      return details;
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ detailsLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to fetch tug type');
      return null;
    }
  },

  createTugType: async ({ tug_type, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await tugTypeService.addTugType({ tug_type });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Tug type created successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },

  updateTugType: async ({ tug_type_id, tug_type, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await tugTypeService.updateTugType({
        tug_type_id,
        tug_type,
      });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Tug type updated successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },

  deleteTugType: async ({ tug_type_id, cb }) => {
    try {
      set({ deleteLoader: true });
      const { data } = await tugTypeService.deleteTugType(tug_type_id);
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Tug type deleted successfully');
      set({ deleteLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ deleteLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },
}));

export default useTugTypeReducer;
