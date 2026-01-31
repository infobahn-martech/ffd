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
  updateVessel: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vesselService.updateVessel(formData);
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
      const { data } = await vesselService.updateVessel(formData);
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
}));

export default useVesselReducer;
