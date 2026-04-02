import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import vesselService from '../services/vesselService';

const useVesselReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  vessels: [],
  isBeingUpdated: false,
  totalCount: 0,
  addVessel: async ({ formData, cb, successMessage }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vesselService.addVessel(formData);
      set({ successMessage: data?.message ?? '', isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      const payload = data?.data ?? data;
      const msg =
        typeof successMessage === 'function'
          ? successMessage(payload, data) ?? data?.message
          : successMessage ?? data?.message;
      success(
        msg || data?.message || 'Vessel created successfully'
      );
      cb && cb(data);
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong with adding a vessel',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getVessels: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await vesselService.fetchVessels({ params });
      set({
        vessels: data?.data ?? [],
        totalCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false, vessels: [], totalCount: 0 });
    }
  },
  updateVessel: async ({ id, formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      let payload;
      if (formData instanceof FormData) {
        payload = formData;
        if (id != null) payload.append('vessel_id', id);
      } else {
        payload = id != null ? { ...formData, vessel_id: id } : formData;
      }
      const { data } = await vesselService.updateVessel(payload);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong updating the vessel',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteVessel: async ({ id, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vesselService.deleteVessel(id);
      set({ successMessage: data?.message ?? '', isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message || 'Vessel deleted successfully');
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the vessel',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useVesselReducer;
