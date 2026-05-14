import { create } from 'zustand';
import vesselTypeService from '../services/vesselTypeService';
import useAlertReducer from './AlertReducer';

const useVesselTypeReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  vesselTypes: null,
  totalCount: null,
  addEditLoader: false,
  deleteLoader: false,

  getVesselTypes: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await vesselTypeService.getVesselTypes({ params });
      const raw = data?.data || data || [];
      const list = raw.map((row) => ({
        ...row,
        name: row.vessel_type ?? row.name,
        createdAt: row.created_at ?? row.createdAt,
        vessel_type_id: row.vessel_type_id ?? row._id,
      }));
      const total =
        data?.pagination?.total ??
        data?.totalCount ??
        data?.total ??
        raw?.length ??
        0;
      set({
        vesselTypes: list,
        totalCount: total,
        isLoading: false,
      });
    } catch (error) {
      const { error: showError } = useAlertReducer.getState();
      set({ errorMessage: error?.message, isLoading: false });
      showError(error?.response?.data?.message ?? error?.message ?? 'Failed to fetch vessel types');
    }
  },

  createVesselType: async ({ vessel_type, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await vesselTypeService.addVesselType({ vessel_type });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Vessel type created successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },

  updateVesselType: async ({ vessel_type_id, vessel_type, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await vesselTypeService.updateVesselType({
        vessel_type_id,
        vessel_type,
      });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Vessel type updated successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },

  deleteVesselType: async ({ vessel_type_id, cb }) => {
    try {
      set({ deleteLoader: true });
      const { data } = await vesselTypeService.deleteVesselType(vessel_type_id);
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Vessel type deleted successfully');
      set({ deleteLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ deleteLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Something went wrong');
    }
  },
}));

export default useVesselTypeReducer;
