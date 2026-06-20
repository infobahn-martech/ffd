import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import cgPassTemplateService from '../services/cgPassTemplateService';

const useCGPassTemplateReducer = create((set) => ({
  isLoading: false,
  isBeingUpdated: false,
  templates: [],
  totalCount: 0,

  getTemplates: async ({ params } = {}) => {
    try {
      set({ isLoading: true });
      const { data } = await cgPassTemplateService.getAll({ template_type: 'CG Pass', ...(params ?? {}) });
      set({
        templates: data?.data ?? [],
        totalCount: data?.pagination?.total ?? data?.pagination?.count ?? data?.total ?? data?.totalCount ?? data?.count ?? data?.data?.length ?? 0,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, templates: [], totalCount: 0 });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message);
    }
  },

  createTemplate: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await cgPassTemplateService.create(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Template created successfully');
      cb?.();
    } catch (err) {
      set({ isBeingUpdated: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message);
    }
  },

  updateTemplate: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await cgPassTemplateService.update(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Template updated successfully');
      cb?.();
    } catch (err) {
      set({ isBeingUpdated: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message);
    }
  },

  deleteTemplate: async ({ templateId, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await cgPassTemplateService.remove(templateId);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Template deleted successfully');
      cb?.();
    } catch (err) {
      set({ isBeingUpdated: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message);
    }
  },
}));

export default useCGPassTemplateReducer;
