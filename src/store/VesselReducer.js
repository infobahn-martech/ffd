import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import vesselService from '../services/vesselService';

const useVesselReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  vessels: null,
  isBeingUpdated: false,
  totalVesselCount: null,
  addVessel: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vesselService.addVessel(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong with adding a vessel',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  fetchVessels: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await vesselService.fetchVessels({ params });
      set({
        vessels: data?.data,
        totalVesselCount: data?.pagination?.total,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false });
    }
  },
  updateVessel: async ({ id, formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vesselService.updateVessel(id, formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong editing the vessel',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteVessel: async ({ id, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vesselService.deleteVessel(id);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
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
