import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import WorkerTypeservice from '../services/workerTypeService';

const useWorkerTypeReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  WorkerTypes: null,
  workerTypeCount: null,
  addEditLoader: false,
  createWorkerType: async ({ formData, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await WorkerTypeservice.postWorkerType(formData);
      set({
        successMessage: data.message,
        addEditLoader: false,
      });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong fetching user',
        addEditLoader: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getWorkerType: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await WorkerTypeservice.getWorkerType(params);
      set({
        WorkerTypes: data.data,
        isLoading: false,
        workerTypeCount: data.totalCount,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false });
    }
  },
  editWorkerType: async ({ id, formData, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await WorkerTypeservice.editWorkerType(id, formData);
      set({ successMessage: data.message, addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong editing the WorkerType',
        addEditLoader: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteWorkerType: async ({ id, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await WorkerTypeservice.deleteWorkerType(id);
      set({ successMessage: data.message, addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the WorkerType',
        addEditLoader: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useWorkerTypeReducer;
