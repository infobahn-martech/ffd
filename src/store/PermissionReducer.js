import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import permissionService from '../services/permissionService';

const usePermissionReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  designations: null,
  isBeingUpdated: false,
  totalDesignationCount: null,
  addPermission: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await permissionService.addPermission(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong with adding a permission',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  fetchPermission: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await permissionService.fetchPermission({ params });
      set({
        designations: data?.data,
        totalDesignationCount: data?.pagination?.total,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false });
    }
  },
  updatePermission: async ({ id, formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await permissionService.updatePermission(id, formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong editing the permission',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deletePermission: async ({ id, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await permissionService.deletePermission(id);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the permission',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default usePermissionReducer;
