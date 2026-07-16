import { create } from 'zustand';
import wasteDisposalService from '../services/wasteDisposalService';

const extractList = (response) => {
    const payload = response?.data?.data ?? response?.data ?? [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const useWasteDisposalReducer = create((set) => ({
    isLoadingList: false,
    isSaving: false,
    wasteDisposalRequests: [],

    getWasteDisposalRequests: async (callId) => {
        if (!callId) {
            set({ wasteDisposalRequests: [] });
            return;
        }
        set({ isLoadingList: true });
        try {
            const response = await wasteDisposalService.getWasteDisposalRequests(callId);
            set({ wasteDisposalRequests: extractList(response), isLoadingList: false });
        } catch {
            set({ wasteDisposalRequests: [], isLoadingList: false });
        }
    },

    createWasteDisposalRequest: async (formData) => {
        set({ isSaving: true });
        try {
            const response = await wasteDisposalService.createWasteDisposalRequest(formData);
            set({ isSaving: false });
            return response;
        } catch (err) {
            set({ isSaving: false });
            throw err;
        }
    },
}));

export default useWasteDisposalReducer;
