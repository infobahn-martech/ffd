import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import transportCompanyService from '../services/transportCompanyService';

const useTransportCompanyReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  transportCompanyData: [],
  isBeingUpdated: false,
  totalTransportCompanyCount: 0,
  addTransportCompany: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await transportCompanyService.addTransportCompanyData(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong with adding a transport company',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getTransportCompanyData: async (apiParams) => {
    const params = apiParams?.params ?? apiParams;
    try {
      set({ isLoading: true });
      const { data } = await transportCompanyService.getTransportCompanyData({ params });
      set({
        transportCompanyData: data?.data ?? [],
        totalTransportCompanyCount: data?.pagination?.total ?? data?.total ?? 0,
        isLoading: false,
      });
    } catch (error) {
      set({
        errorMessage: error.message,
        isLoading: false,
        transportCompanyData: [],
        totalTransportCompanyCount: 0,
      });
    }
  },
  getTransportCompanyById: async (transport_company_id) => {
    const { data } = await transportCompanyService.getTransportCompanyById(transport_company_id);
    const raw = data?.data ?? data;
    if (Array.isArray(raw)) return raw[0] ?? null;
    return raw ?? null;
  },
  updateTransportCompany: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await transportCompanyService.updateTransportCompanyData(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong updating the transport company ',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteTransportCompany: async (payload) => {
    const { transport_company_id, cb } = payload || {};
    try {
      set({ isBeingUpdated: true });
      const { data } = await transportCompanyService.deleteTransportCompanyData(transport_company_id);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Transport company deleted successfully');
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the transport company',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useTransportCompanyReducer;
