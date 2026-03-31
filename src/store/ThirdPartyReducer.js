import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import thirdPartyService from '../services/thirdPartyService';

const useThirdPartyServiceReducer = create((set) => ({
    isLoadingGet: false,
    isLoadingDelete: false,
    isBeingUpdated: false,
    errorMessage: '',
    successMessage: '',
    thirdPartyServices: [],
    totalCount: 0,
    addThirdPartyService: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await thirdPartyService.addThirdPartyService(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a third party service',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getThirdPartyServices: async (params) => {
        try {
            set({ isLoadingGet: true });
            const { data } = await thirdPartyService.getThirdPartyServices({ params });
            set({
                thirdPartyServices: data?.data ?? [],
                totalCount: data?.pagination?.total ?? 0,
                isLoadingGet: false,
            });
        } catch (err) {
            set({ errorMessage: err.message, isLoadingGet: false, thirdPartyServices: [], totalCount: 0 });
        }
    },
    updateThirdPartyService: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await thirdPartyService.updateThirdPartyService(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the third party service',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteData: async (third_party_service_id) => {
        try {
            set({ isLoadingDelete: true });
            const { data } = await thirdPartyService.deleteThirdPartyService(third_party_service_id);
            set({ successMessage: data?.message, isLoadingDelete: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Third party service deleted successfully');
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the third party service',
                isLoadingDelete: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useThirdPartyServiceReducer;
