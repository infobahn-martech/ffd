import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import vehicleService from '../services/vehicleService';

const useVehicleReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  vehicles: [],
  isBeingUpdated: false,
  totalCount: 0,
  addVehicle: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vehicleService.addVehicle(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong with adding a vehicle',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getVehicles: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await vehicleService.fetchVehicles({ params });
      set({
        vehicles: data?.data ?? [],
        totalCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false, vehicles: [], totalCount: 0 });
    }
  },
  updateVehicle: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await vehicleService.updateVehicle(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong updating the vehicle',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteVehicle: async (payload) => {
    const { vehicle_id, cb } = payload || {};
    try {
      set({ isBeingUpdated: true });
      const { data } = await vehicleService.deleteVehicle(vehicle_id);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Vehicle type deleted successfully');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the vehicle type',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useVehicleReducer;
