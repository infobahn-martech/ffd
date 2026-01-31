import { create } from 'zustand';
import CommonService from '../services/commonService';

const useCommonReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    callTypes: null,
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
}));

export default useCommonReducer;
