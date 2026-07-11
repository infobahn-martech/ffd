import { create } from 'zustand';
import CommonService from '../services/commonService';
import userService from '../services/userService';
import useAlertReducer from './AlertReducer';

const useCommonReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    callTypes: null,
    ports: null,
    totalPortCount: null,
    nationalities: [],
    nationalitiesLoading: false,
    users: [],
    usersLoading: false,
    getCallTypes: async () => {
        try {
            set({ isLoading: true });
            const { data } = await CommonService.getCallTypes();
            set({
                callTypes: data.data,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false });
        }
    },
    fetchAllNationalities: async () => {
        try {
            set({ nationalitiesLoading: true });
            const { data } = await CommonService.getAllNationality();
            const raw = data?.data ?? data;
            const list = Array.isArray(raw) ? raw : [];
            set({
                nationalities: list,
                nationalitiesLoading: false,
            });
        } catch (error) {
            set({
                errorMessage: error.message,
                nationalitiesLoading: false,
                nationalities: [],
            });
        }
    },
    getPorts: async ({ params } = {}) => {
        try {
            set({ isLoading: true });
            const { data } = await CommonService.getPorts({ params });
            set({
                ports: data?.data || data,
                totalPortCount: data?.totalCount || data?.data?.length || 0,
                isLoading: false,
            });
        } catch (error) {
            const { error: showError } = useAlertReducer.getState();
            set({
                errorMessage: error?.response?.data?.message || error.message,
                isLoading: false,
            });
            showError(error?.response?.data?.message || error.message || 'Failed to fetch ports');
        }
    },
    getUsers: async ({ params } = {}) => {
        try {
            set({ usersLoading: true });
            const { data } = await userService.getNonVendorUsers({
                params: { limit: 200, page: 1, ...params },
            });
            const list = data?.data ?? [];
            set({
                users: Array.isArray(list) ? list : [],
                usersLoading: false,
            });
        } catch (error) {
            set({
                users: [],
                usersLoading: false,
                errorMessage: error?.response?.data?.message || error.message,
            });
        }
    },
}));

export default useCommonReducer;
