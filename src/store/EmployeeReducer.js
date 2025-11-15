import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import employeeService from '../services/employeeService';

const useEmployeeReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  employees: null,
  isBeingUpdated: false,
  totalEmployeeCount: null,
  addEmployee: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await employeeService.addEmployee(formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong with adding an employee',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  fetchEmployee: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await employeeService.fetchEmployee({ params });
      set({
        employees: data.data.data,
        totalEmployeeCount: data.data.totalCount,
        isLoading: false,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false });
    }
  },
  updateEmployee: async ({ id, formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await employeeService.updateEmployee(id, formData);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong editing the employee',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteEmployee: async ({ id, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await employeeService.deleteEmployee(id);
      set({ successMessage: data.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the employee',
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useEmployeeReducer;
