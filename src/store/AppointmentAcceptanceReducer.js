import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import appointmentAcceptanceService from '../services/appointmentAcceptanceService';

const useAppointmentAcceptanceReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  appointmentAcceptanceData: [],
  isBeingUpdated: false,
  totalCount: 0,
  addAppointmentAcceptance: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await appointmentAcceptanceService.addAppointmentAcceptance(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong with adding a appointment acceptance',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getAppointmentAcceptanceData: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await appointmentAcceptanceService.getAppointmentAcceptanceData({ params });
      set({
        appointmentAcceptanceData: data?.data ?? [],
        totalCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false, appointmentAcceptanceData: [], totalCount: 0 });
    }
  },
  updateAppointmentAcceptance: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await appointmentAcceptanceService.updateAppointmentAcceptance(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong updating the appointment acceptance',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteAppointmentAcceptance: async (payload) => {
    const { appointment_acceptance_id, cb } = payload || {};
    try {
      set({ isBeingUpdated: true });
      const { data } = await appointmentAcceptanceService.deleteAppointmentAcceptance(appointment_acceptance_id);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Appointment acceptance deleted successfully');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the appointment acceptance',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useAppointmentAcceptanceReducer;
