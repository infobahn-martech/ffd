import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import crewService from '../services/crewService';

const useCrewReducer = create((set) => ({
    crews: null,
    isLoading: false,
    isBeingUpdated: false,
    errorMessage: '',
    totalCrewCount: null,

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
}));

export default useCrewReducer;
