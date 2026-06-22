import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import Workerservice from '../services/workerService';
import { downloadFile } from '../shared/utils/utils';

const useWorkerReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  Workers: null,
  workerCount: null,
  addEditLoader: false,
  WorkersExcelUrl: null,
  isLoadingExcel: false,
  createWorker: async ({ formData, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await Workerservice.postWorker(formData);
      set({
        successMessage: data.message,
        addEditLoader: false,
        workerCount: data.totalCount,
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
  getWorkers: async ({ params }) => {
    try {
      set({ isLoading: true });
      const { data } = await Workerservice.getWorker(params);
      set({
        Workers: data.data,
        isLoading: false,
        workerCount: data?.totalCount,
      });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false });
    }
  },
  editWorker: async ({ id, formData, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await Workerservice.editWorker(id, formData);
      set({ successMessage: data.message, addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong editing the Worker',
        addEditLoader: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  deleteWorker: async ({ id, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await Workerservice.deleteWorker(id);
      set({ successMessage: data.message, addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong deleting the Worker',
        addEditLoader: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  getWorkersXlx: async ({ params }) => {
    try {
      set({ isLoadingExcel: true });
      const { data } = await Workerservice.getWorker(params);
      set({
        WorkersExcelUrl: data?.url,
        isLoadingExcel: false,
      });
      downloadFile({ link: data?.url, fileName: 'workers' });
    } catch (error) {
      set({ errorMessage: error.message, isLoadingExcel: false });
    }
  },
}));

export default useWorkerReducer;
