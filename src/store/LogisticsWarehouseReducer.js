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
            const { data } = await logisticsWarehouseService.addLogisticsWarehouse(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a logistics warehouse',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getLogisticsWarehouses: async (params) => {
        try {
            set({ isLoadingGet: true });
            const { data } = await logisticsWarehouseService.getLogisticsWarehouses({ params });
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
            const { data } = await logisticsWarehouseService.updateLogisticsWarehouse(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the logistics warehouse',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteData: async (logistics_warehouse_id) => {
        try {
            set({ isLoadingDelete: true });
            const { data } = await logisticsWarehouseService.deleteLogisticsWarehouse(logistics_warehouse_id);
            set({ successMessage: data?.message, isLoadingDelete: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Logistics warehouse deleted successfully');
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the logistics warehouse',
                isLoadingDelete: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useLogisticsWarehouseReducer;
