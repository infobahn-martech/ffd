import { create } from 'zustand';
import thirdPartyService from '../services/thirdPartyService';

const extractList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const useThirdPartyServiceRequestReducer = create((set) => ({
    isLoadingList: false,
    isSaving: false,
    thirdPartyServiceRequests: [],

    getThirdPartyServiceRequests: async (callId) => {
        if (!callId) {
            set({ thirdPartyServiceRequests: [] });
            return;
        }
        set({ isLoadingList: true });
        try {
            const response = await thirdPartyService.getThirdPartyServiceRequests(callId);
            set({ thirdPartyServiceRequests: extractList(response), isLoadingList: false });
        } catch {
            set({ thirdPartyServiceRequests: [], isLoadingList: false });
        }
    },

    createThirdPartyServiceRequest: async (formData) => {
        set({ isSaving: true });
        try {
            const response = await thirdPartyService.createThirdPartyServiceRequest(formData);
            set({ isSaving: false });
            return response;
        } catch (err) {
            set({ isSaving: false });
            throw err;
        }
    },
}));

export default useThirdPartyServiceRequestReducer;
