import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import crewImmigrationService from '../services/crewImmigrationService';

const useCrewImmigrationReducer = create((set) => ({
    /** Crew rows from POST crew/get_immigration_crew_list; null = not loaded yet */
    callCrewList: null,
    callCrewListPagination: null,
    isCallCrewListLoading: false,
    isBeingUpdated: false,
    errorMessage: '',

    fetchCallCrewList: async ({ payload, cb } = {}) => {
        try {
            set({ isCallCrewListLoading: true });
            const { data } = await crewImmigrationService.getImmigrationCrewList(payload || {});
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

    // Import and replace both hit the same crew/import_crew_immigration
    // endpoint — there's no separate replace endpoint for this API, so a
    // "replace" is just re-importing under the same movement_type tag.
    importCrewImmigrationFile: async ({ formData, cb } = {}) => {
        try {
            set({ isBeingUpdated: true, errorMessage: '' });
            const { data } = await crewImmigrationService.importCrewImmigration(formData);
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

export default useCrewImmigrationReducer;
