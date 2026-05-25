import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import landingNoteService from '../services/landingNoteService';

const useLandingNoteReducer = create((set) => ({
    isLoadingList: false,
    isLoadingView: false,
    isBeingAdded: false,
    isBeingUpdated: false,
    isLoadingDelete: false,
    landingNotes: [],
    landingNoteTotal: 0,
    landingNoteDetail: null,

    getAllLandingNotes: async (params) => {
        try {
            set({ isLoadingList: true });
            const { data } = await landingNoteService.getAllLandingNotes(params);
            const notes = data?.data ?? [];
            set({
                landingNotes: notes,
                landingNoteTotal: data?.pagination?.total ?? notes.length,
                isLoadingList: false,
            });
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isLoadingList: false, landingNotes: [], landingNoteTotal: 0 });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    getLandingNoteById: async ({ landingNoteId }) => {
        try {
            set({ isLoadingView: true, landingNoteDetail: null });
            const { data } = await landingNoteService.getLandingNoteById(landingNoteId);
            set({ landingNoteDetail: data?.data ?? null, isLoadingView: false });
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isLoadingView: false, landingNoteDetail: null });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    addLandingNote: async ({ data, cb }) => {
        try {
            set({ isBeingAdded: true });
            const { data: resData } = await landingNoteService.addLandingNote(data);
            set({ isBeingAdded: false });
            const { success } = useAlertReducer.getState();
            success(resData?.message ?? 'Landing note added successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isBeingAdded: false });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    updateLandingNote: async ({ landingNoteId, data, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data: resData } = await landingNoteService.updateLandingNote(landingNoteId, data);
            set({ isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(resData?.message ?? 'Landing note updated successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isBeingUpdated: false });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    deleteLandingNote: async ({ landingNoteId, cb }) => {
        try {
            set({ isLoadingDelete: true });
            const { data: resData } = await landingNoteService.deleteLandingNote(landingNoteId);
            set({ isLoadingDelete: false });
            const { success } = useAlertReducer.getState();
            success(resData?.message ?? 'Landing note deleted successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isLoadingDelete: false });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    clearLandingNoteDetail: () => set({ landingNoteDetail: null }),
}));

export default useLandingNoteReducer;
