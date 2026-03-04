import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import CrewTemplateService from '../services/crewTemplateService';

const useCrewTemplateReducer = create((set) => ({
  isLoading: false,
  addEditLoader: false,
  errorMessage: '',
  crewTemplates: [],
  templateCount: 0,

  getTemplates: async ({ params } = {}) => {
    try {
      set({ isLoading: true });
      const { data } = await CrewTemplateService.getAllTemplates(params || {});
      const list = data?.data ?? data ?? [];
      const items = Array.isArray(list) ? list : [];
      set({
        crewTemplates: items,
        templateCount: data?.totalCount ?? items.length,
        isLoading: false,
      });
    } catch (error) {
      set({
        errorMessage: error?.response?.data?.message ?? error?.message ?? 'Failed to fetch templates',
        crewTemplates: [],
        templateCount: 0,
        isLoading: false,
      });
    }
  },

  addTemplate: async ({ formData, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await CrewTemplateService.addTemplate(formData);
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Template added successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to add template');
    }
  },

  updateTemplate: async ({ templateId, formData, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await CrewTemplateService.updateTemplate(templateId, formData);
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Template updated successfully');
      set({ addEditLoader: false });
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err?.message ?? 'Failed to update template');
    }
  },
}));

export default useCrewTemplateReducer;
