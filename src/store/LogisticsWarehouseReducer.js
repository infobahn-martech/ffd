import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import logisticsWarehouseService from '../services/logisticsWarehouseService';

const useLogisticsWarehouseReducer = create((set) => ({
    isLoadingGet: false,
    isLoadingDelete: false,
    isBeingUpdated: false,
    errorMessage: '',
    successMessage: '',
    logisticsWarehouses: [],
    totalCount: 0,
    addLogisticsWarehouse: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await logisticsWarehouseService.addLocation(formData);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Location added successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong adding the location',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getLogisticsWarehouses: async (params) => {
        try {
            set({ isLoadingGet: true });
            const { data } = await logisticsWarehouseService.getLocations(params);
            set({
                logisticsWarehouses: data?.data ?? [],
                totalCount: data?.pagination?.total ?? 0,
                isLoadingGet: false,
            });
        } catch (err) {
            set({ errorMessage: err.message, isLoadingGet: false, logisticsWarehouses: [], totalCount: 0 });
        }
    },
    updateLogisticsWarehouse: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await logisticsWarehouseService.updateLocation(formData);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Location updated successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the location',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteData: async (location_id) => {
        try {
            set({ isLoadingDelete: true });
            const { data } = await logisticsWarehouseService.deleteLocation(location_id);
            set({ successMessage: data?.message, isLoadingDelete: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Location deleted successfully');
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the location',
                isLoadingDelete: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useLogisticsWarehouseReducer;
