import { create } from 'zustand';
import mwpRenewalService from '../services/mwpRenewalService';

const extractList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const useMWPRenewalReducer = create((set) => ({
    isLoadingList: false,
    isSaving: false,
    mwpRenewalRequests: [],

    getMwpRenewalRequests: async (callId) => {
        if (!callId) {
            set({ mwpRenewalRequests: [] });
            return;
        }
        set({ isLoadingList: true });
        try {
            const response = await mwpRenewalService.getMwpRenewalRequests(callId);
            set({ mwpRenewalRequests: extractList(response), isLoadingList: false });
        } catch {
            set({ mwpRenewalRequests: [], isLoadingList: false });
        }
    },

    createMwpRenewalRequest: async (formData) => {
        set({ isSaving: true });
        try {
            const response = await mwpRenewalService.createMwpRenewalRequest(formData);
            set({ isSaving: false });
            return response;
        } catch (err) {
            set({ isSaving: false });
            throw err;
        }
    },
}));

export default useMWPRenewalReducer;
