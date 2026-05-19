import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import groupEmailBEService from '../services/groupEmailBEService';

const useGroupEmailBEReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    groupEmailBEs: [],
    groupEmailBEDetail: null,
    isLoadingDetail: false,
    isBeingUpdated: false,
    isDeleteLoading: false,
    totalCount: 0,
    addGroupEmailBE: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await groupEmailBEService.addGroupEmailBE(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a vehicle',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getGroupEmailBEs: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await groupEmailBEService.fetchGroupEmailBEs({ params });
            set({
                groupEmailBEs: data?.data ?? [],
                totalCount: data?.pagination?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false, groupEmailBEs: [], totalCount: 0 });
        }
    },
    getGroupEmailBEByEntity: async (billingentity_id) => {
        try {
            set({ isLoadingDetail: true, groupEmailBEDetail: null });
            const { data } = await groupEmailBEService.fetchGroupEmailBEByEntity(billingentity_id);
            const detail = data?.data ?? data;
            set({ groupEmailBEDetail: detail, isLoadingDetail: false });
            return detail;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ groupEmailBEDetail: null, isLoadingDetail: false });
            error(err?.response?.data?.message ?? err.message);
            return null;
        }
    },
    clearGroupEmailBEDetail: () => set({ groupEmailBEDetail: null }),
    updateGroupEmailBE: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await groupEmailBEService.updateGroupEmailBE(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the group email BE',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteGroupEmailBE: async (payload) => {
        const { groupEmailBE_id, cb } = payload || {};
        try {
            set({ isDeleteLoading: true });
            const { data } = await groupEmailBEService.deleteGroupEmailBE(groupEmailBE_id);
            set({ successMessage: data?.message, isDeleteLoading: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Group email BE deleted successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the group email BE',
                isDeleteLoading: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useGroupEmailBEReducer;
