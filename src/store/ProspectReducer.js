import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import prospectservice from '../services/prospectservice';
import { downloadFile } from '../utils/utils';

const useProspectReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  prospects: null,
  isBeingUpdated: false,
  totalProspectCount: null,
  isExportLoading: false,
  createProspect: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await prospectservice.prospectValidate(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong fetching user',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getProspects: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await prospectservice.getProspectValidate({ params });
      set({
        prospects: data.data,
        totalProspectCount: data.totalCount,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false });
    }
  },
  editProspect: async ({ id, formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await prospectservice.editProspect(id, formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong editing the prospect',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteProspect: async ({ id, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await prospectservice.deleteProspect(id);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the prospect',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  exportProspectData: async ({ params }) => {
    try {
      set({ isExportLoading: true });
      const { data } = await prospectservice.getProspectValidate({ params });
      set({
        isExportLoading: false,
      });
      downloadFile({ link: data?.url, fileName: 'Prospects List' });
    } catch (error) {
      set({ errorMessage: error.message, isExportLoading: false });
    }
  },
}));

export default useProspectReducer;
