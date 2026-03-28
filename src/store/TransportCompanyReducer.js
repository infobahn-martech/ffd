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
    getTransportCompanyData: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await transportCompanyService.getTransportCompanyData({ params });
            set({
                transportCompanyData: data?.data ?? [],
                totalTransportCompanyCount: data?.pagination?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false, transportCompanyData: [], totalTransportCompanyCount: 0 });
        }
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
        const { transportCompany_id, cb } = payload || {};
        try {
            set({ isBeingUpdated: true });
            const { data } = await transportCompanyService.deleteTransportCompanyData(transportCompany_id);
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
