import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import portService from '../services/portService';

const usePortReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    ports: null,
    isBeingUpdated: false,
    totalPortCount: null,
    getPorts: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await portService.getPorts({ params });
            set({
                ports: data?.data || data,
                totalPortCount: data?.totalCount || data?.data?.length || 0,
                isLoading: false,
            });
        } catch (error) {
            const { error: showError } = useAlertReducer.getState();
            set({
                errorMessage: error?.response?.data?.message || error.message,
                isLoading: false
            });
            showError(error?.response?.data?.message || error.message || 'Failed to fetch ports');
        }
    },
}));

export default usePortReducer;
