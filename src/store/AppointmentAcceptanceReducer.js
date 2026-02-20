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
  templateById: null,
  getTemplateByTemplateId: async ({ template_id }) => {
    try {
      set({ isLoading: true });
      const { data } = await appointmentAcceptanceService.getTemplateByTemplateId(template_id);
      set({ templateById: data?.data, isLoading: false });
      return data?.data ?? data ?? null;
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isLoading: false, templateById: null });
      error(err?.response?.data?.message ?? err.message);
      return null;
    }
  },
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
      const payload = {
        template_id: formData.template_id,
        port_id: formData.port_id,
        call_type_id: formData.call_type_id,
        subject: formData.subject,
        body: formData.body,
      };
      const { data: res } = await appointmentAcceptanceService.updateAppointmentAcceptance(payload);
      set({ successMessage: res?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(res?.message ?? 'Template updated successfully');
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
    const template_id = payload?.template_id ?? payload?.appointment_acceptance_id ?? payload;
    const cb = payload?.cb;
    try {
      set({ isBeingUpdated: true });
      const { data } = await appointmentAcceptanceService.deleteAppointmentAcceptance(template_id);
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
