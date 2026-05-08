import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import crewService from '../services/crewService';
import callFileService from '../services/callFileService';

const useCrewReducer = create((set) => ({
    crews: null,
    /** Crew rows from POST crew/get_crew_list; null = not loaded yet */
    callCrewList: null,
    isCallCrewListLoading: false,
    isLoading: false,
    isBeingUpdated: false,
    errorMessage: '',
    totalCrewCount: null,

    fetchCallCrewList: async ({ payload, cb } = {}) => {
        try {
            set({ isCallCrewListLoading: true });
            const { data } = await crewService.getCrewList(payload || {});
            const root = data?.data ?? data;
            const crew = root?.crew ?? (Array.isArray(root) ? root : []);
            const list = Array.isArray(crew) ? crew : [];
            set({
                callCrewList: list,
                isCallCrewListLoading: false,
            });
            cb && cb(list);
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
                crews: data?.data ?? [],
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
}));

export default useCrewReducer;
