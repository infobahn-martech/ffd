import { create } from 'zustand';
import addOnService from '../services/addOnService';

const extractList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const useAddOnServiceRequestReducer = create((set) => ({
    isLoadingList: false,
    isSaving: false,
    addOnServiceRequests: [],

    getAddOnServiceRequests: async (callId) => {
        if (!callId) {
            set({ addOnServiceRequests: [] });
            return;
        }
        set({ isLoadingList: true });
        try {
            const response = await addOnService.getAddOnServiceRequests(callId);
            set({ addOnServiceRequests: extractList(response), isLoadingList: false });
        } catch {
            set({ addOnServiceRequests: [], isLoadingList: false });
        }
    },

    createAddOnServiceRequest: async (formData) => {
        set({ isSaving: true });
        try {
            const response = await addOnService.createAddOnServiceRequest(formData);
            set({ isSaving: false });
            return response;
        } catch (err) {
            set({ isSaving: false });
            throw err;
        }
    },
}));

export default useAddOnServiceRequestReducer;
