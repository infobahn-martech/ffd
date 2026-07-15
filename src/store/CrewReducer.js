import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import crewService from '../services/crewService';
import callFileService from '../services/callFileService';

const useCrewReducer = create((set) => ({
    crews: null,
    /** Crew rows from POST crew/get_crew_list; null = not loaded yet */
    callCrewList: null,
    callCrewListPagination: null,
    isCallCrewListLoading: false,
    isLoading: false,
    isBeingUpdated: false,
    errorMessage: '',
    totalCrewCount: null,
    /** Per-crew per-document upload spinner flags, e.g. { 12: { passport_copy: true } } */
    uploadingCrewDoc: {},

    fetchCallCrewList: async ({ payload, cb } = {}) => {
        try {
            set({ isCallCrewListLoading: true });
            const { data } = await crewService.getCrewList(payload || {});
            const root = data?.data ?? data;
            const crew = root?.crew ?? (Array.isArray(root) ? root : []);
            const list = Array.isArray(crew) ? crew : [];
            const pagination = {
                total: Number(root?.pagination?.total ?? root?.total ?? list.length ?? 0) || 0,
                page: Number(root?.pagination?.page ?? root?.page ?? payload?.page ?? 1) || 1,
                limit: Number(root?.pagination?.limit ?? root?.limit ?? payload?.limit ?? 10) || 10,
                total_pages: Number(root?.pagination?.total_pages ?? root?.total_pages ?? 1) || 1,
            };
            const uploadedCrewFile = root?.uploaded_crew_file ?? null;
            set({
                callCrewList: list,
                callCrewListPagination: pagination,
                isCallCrewListLoading: false,
            });
            cb && cb(list, pagination, uploadedCrewFile);
            return list;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                isCallCrewListLoading: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    fetchAllCrews: async ({ params, cb } = {}) => {
        try {
            set({ isLoading: true });
            const { data } = await crewService.getAllCrews(params || {});
            set({
                crews: data ?? null,
                totalCrewCount: data?.pagination?.total ?? (Array.isArray(data?.data) ? data.data.length : (Array.isArray(data?.crews) ? data.crews.length : 0)),
                isLoading: false,
            });
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: err?.response?.data?.message ?? err.message,
                isLoading: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    saveCrewData: async ({ payload, cb } = {}) => {
        try {
            set({ isBeingUpdated: true, errorMessage: '' });
            const sourceCallId = payload?.call_id || payload?.callId || 1;
            const { data: callDetailData } = await callFileService.getCallDetail(sourceCallId);
            const callDetailRow =
                callDetailData?.data?.[0] ||
                callDetailData?.data ||
                callDetailData?.detail ||
                callDetailData;

            const resolvedCallId = Number(callDetailRow?.call_id ?? sourceCallId);
            const resolvedVesselId = Number(callDetailRow?.vessel_id);

            if (!resolvedCallId || !resolvedVesselId) {
                throw new Error('Unable to resolve call_id or vessel_id from call detail response.');
            }

            const normalizedPayload = {
                ...(payload || {}),
                call_id: resolvedCallId,
                vessel_id: resolvedVesselId,
            };

            const { data } = await crewService.saveCrew(normalizedPayload);
            set({ isBeingUpdated: false });
            cb && cb(data);
            return data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({
                errorMessage: message,
                isBeingUpdated: false,
            });
            error(message);
            throw err;
        }
    },

    getCrewTemplate: async ({ payload, cb } = {}) => {
        try {
            const response = await crewService.getCrewTemplate(payload || {});
            cb && cb(response?.data);
            return response?.data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({ errorMessage: message });
            error(message);
            throw err;
        }
    },

    importCrewFile: async ({ formData, cb } = {}) => {
        try {
            set({ isBeingUpdated: true, errorMessage: '' });
            const { data } = await crewService.importCrew(formData);
            set({ isBeingUpdated: false });
            cb && cb(data);
            return data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({
                errorMessage: message,
                isBeingUpdated: false,
            });
            error(message);
            throw err;
        }
    },

    replaceCrewFile: async ({ formData, cb } = {}) => {
        try {
            set({ isBeingUpdated: true, errorMessage: '' });
            const { data } = await crewService.replaceCrewFile(formData);
            set({ isBeingUpdated: false });
            cb && cb(data);
            return data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({
                errorMessage: message,
                isBeingUpdated: false,
            });
            error(message);
            throw err;
        }
    },

    uploadPassportCopies: async ({ formData, cb } = {}) => {
        try {
            set({ isBeingUpdated: true, errorMessage: '' });
            const { data } = await crewService.uploadPassportCopies(formData);
            set({ isBeingUpdated: false });
            cb && cb(data);
            return data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({
                errorMessage: message,
                isBeingUpdated: false,
            });
            error(message);
            throw err;
        }
    },

    uploadIqamaCopies: async ({ formData, cb } = {}) => {
        try {
            set({ isBeingUpdated: true, errorMessage: '' });
            const { data } = await crewService.uploadIqamaCopies(formData);
            set({ isBeingUpdated: false });
            cb && cb(data);
            return data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({
                errorMessage: message,
                isBeingUpdated: false,
            });
            error(message);
            throw err;
        }
    },

    updateCrewInfo: async ({ payload, cb } = {}) => {
        try {
            set({ isBeingUpdated: true, errorMessage: '' });
            const { data } = await crewService.updateCrew(payload || {});
            set({ isBeingUpdated: false });
            cb && cb(data);
            return data;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({
                errorMessage: message,
                isBeingUpdated: false,
            });
            error(message);
            throw err;
        }
    },

    updateCrewDocuments: async ({ formData, crewId, fieldName, cb } = {}) => {
        const setUploading = (flag) => {
            if (crewId == null || !fieldName) return;
            set((state) => ({
                uploadingCrewDoc: {
                    ...state.uploadingCrewDoc,
                    [crewId]: {
                        ...(state.uploadingCrewDoc?.[crewId] || {}),
                        [fieldName]: flag,
                    },
                },
            }));
        };

        try {
            setUploading(true);
            const { data } = await crewService.updateCrewDocuments(formData);
            setUploading(false);
            cb && cb(data);
            return data;
        } catch (err) {
            setUploading(false);
            const { error } = useAlertReducer.getState();
            const message = err?.response?.data?.message ?? err.message;
            set({ errorMessage: message });
            error(message);
            throw err;
        }
    },
}));

export default useCrewReducer;
