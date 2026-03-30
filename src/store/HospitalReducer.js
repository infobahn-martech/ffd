import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import hospitalService from '../services/hospitalService';

const useHospitalReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    hospitalData: [],
    isBeingUpdated: false,
    totalHospitalCount: 0,
    addHospital: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await hospitalService.addHospital(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a hospital',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getHospitalData: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await hospitalService.getHospitalData({ params });
            set({
                hospitalData: data?.data ?? [],
                totalHospitalCount: data?.pagination?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false, hospitalData: [], totalHospitalCount: 0 });
        }
    },
    updateHospital: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await hospitalService.updateHospital(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the hospital',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteHospital: async (payload) => {
        const { hospital_id, cb } = payload || {};
        try {
            set({ isBeingUpdated: true });
            const { data } = await hospitalService.deleteHospital(hospital_id);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Hospital deleted successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the hospital',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useHospitalReducer;
