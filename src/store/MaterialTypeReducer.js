import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import materialTypeService from '../services/materialTypeService';

const useMaterialTypeReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    materialTypes: [],
    isBeingUpdated: false,
    totalCount: 0,
    addMaterialType: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await materialTypeService.addMaterialType(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a material type',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getMaterialTypes: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await materialTypeService.getMaterialTypes({ params });
            set({
                materialTypes: data?.data ?? [],
                totalCount: data?.pagination?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false, materialTypes: [], totalCount: 0 });
        }
    },
    updateMaterialType: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await materialTypeService.updateMaterialType(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the material type',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteMaterialType: async (payload) => {
        const { material_type_id, cb } = payload || {};
        try {
            set({ isBeingUpdated: true });
            const { data } = await materialTypeService.deleteMaterialType(material_type_id);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Material type deleted successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the material type',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useMaterialTypeReducer;
