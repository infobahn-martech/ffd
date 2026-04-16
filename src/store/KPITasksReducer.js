import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import kpiTasksService from '../services/kpiTasksService';

const useKPITasksReducer = create((set) => ({
    isLoadingGet: false,
    isBeingUpdated: false,
    kpiTasksList: [],
    totalKpiTasksCount: 0,
    errorMessage: '',

    fetchAllKPITasks: async () => {
        try {
            set({ isLoadingGet: true, errorMessage: '' });
            const { data } = await kpiTasksService.getAllKpiTasks();
            const raw = data?.data ?? data?.docs ?? data?.results ?? data;
            const list = Array.isArray(raw) ? raw : [];
            const total =
                data?.pagination?.total ??
                data?.total ??
                data?.count ??
                list.length;
            set({ kpiTasksList: list, totalKpiTasksCount: total, isLoadingGet: false });
        } catch (err) {
            set({
                errorMessage: err?.message ?? 'Failed to load KPI tasks',
                kpiTasksList: [],
                totalKpiTasksCount: 0,
                isLoadingGet: false,
            });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err?.message ?? 'Failed to load KPI tasks');
        }
    },

    updateKpiPointTime: async ({ payload, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await kpiTasksService.updateKpiPointTime(payload);
            set({ isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'KPI task updated');
            cb?.();
        } catch (err) {
            set({ isBeingUpdated: false });
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err?.message ?? 'Update failed');
        }
    },
}));

export default useKPITasksReducer;
