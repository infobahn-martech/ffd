import { create } from 'zustand';
import CommonService from '../services/commonService';

const useCommonReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    callTypes: null,
    nationalities: [],
    nationalitiesLoading: false,
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
}));

export default useCommonReducer;
