import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import appointmentAcceptanceService from '../services/appointmentAcceptanceService';

const useAppointmentAcceptanceReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  reportTemplates: [],
  reportTypes: [],
  isBeingUpdated: false,
  totalCount: 0,
  templateById: null,
  getReportTypes: async () => {
    try {
      const { data } = await appointmentAcceptanceService.getReportTypes();
      set({ reportTypes: data?.data ?? data ?? [] });
    } catch (err) {
      set({ reportTypes: [] });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
    }
  },
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
  createReportTemplate: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await appointmentAcceptanceService.createReportTemplate(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong while creating the report template',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getReportTemplates: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await appointmentAcceptanceService.getReportTemplates({ params });
      set({
        reportTemplates: data?.data ?? [],
        totalCount: data?.pagination?.total ?? 0,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false, reportTemplates: [], totalCount: 0 });
    }
  },
  updateReportTemplate: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const payload = {
        template_id: formData.template_id,
        report_type_id: formData.report_type_id,
        port_id: formData.port_id,
        call_type_id: formData.call_type_id,
        subject: formData.subject,
        body: formData.body,
      };
      const { data: res } = await appointmentAcceptanceService.updateReportTemplate(payload);
      set({ successMessage: res?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(res?.message ?? 'Template updated successfully');
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong while updating the report template',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteReportTemplate: async (payload) => {
    const template_id = payload?.template_id ?? payload?.appointment_acceptance_id ?? payload;
    const cb = payload?.cb;
    try {
      set({ isBeingUpdated: true });
      const { data } = await appointmentAcceptanceService.deleteReportTemplate(template_id);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Report template deleted successfully');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong while deleting the report template',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useAppointmentAcceptanceReducer;
