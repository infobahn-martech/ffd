import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import hospitalService from '../services/hospitalService';

const useHospitalReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    hospitalData: [],
    medicalServiceData: [],
    hospitalServicesData: [],
    isBeingUpdated: false,
    totalHospitalCount: 0,
    totalMedicalServiceCount: 0,
    totalHospitalServicesCount: 0,
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
            const rawList = data?.data ?? data?.hospitals ?? [];
            const list = Array.isArray(rawList)
                ? rawList.map((row) => ({
                      ...row,
                      _id: row.hospital_id ?? row._id,
                  }))
                : [];
            set({
                hospitalData: list,
                totalHospitalCount:
                    data?.pagination?.total ?? data?.total ?? data?.meta?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false, hospitalData: [], totalHospitalCount: 0 });
        }
    },
    getHospitalDetail: async (hospitalId) => {
        try {
            const { data } = await hospitalService.getHospitalById(hospitalId);
            return data?.data ?? data ?? null;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
            return null;
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
    addMedicalService: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await hospitalService.addMedicalService(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a medical service',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getMedicalServiceData: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await hospitalService.getMedicalServiceData({ params });
            const rawList = data?.data ?? data?.medical_services ?? [];
            const list = Array.isArray(rawList)
                ? rawList.map((row) => ({
                      ...row,
                      _id: row.service_id ?? row._id,
                  }))
                : [];
            set({
                medicalServiceData: list,
                totalMedicalServiceCount:
                    data?.pagination?.total ?? data?.total ?? data?.meta?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({
                errorMessage: error.message,
                isLoading: false,
                medicalServiceData: [],
                totalMedicalServiceCount: 0,
            });
        }
    },
    getMedicalServiceDetail: async (serviceId) => {
        try {
            const { data } = await hospitalService.getMedicalServiceById(serviceId);
            return data?.data ?? data ?? null;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
            return null;
        }
    },
    updateMedicalService: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await hospitalService.updateMedicalService(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the medical service',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteMedicalService: async (payload) => {
        const { service_id, cb } = payload || {};
        try {
            set({ isBeingUpdated: true });
            const { data } = await hospitalService.deleteMedicalService(service_id);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Medical service deleted successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the medical service',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getHospitalServicesData: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await hospitalService.getAllHospitalServices({ params });
            const rawList = data?.data ?? data?.hospital_services ?? [];
            const list = Array.isArray(rawList)
                ? rawList.map((row) => ({
                      ...row,
                      _id: row.hospital_service_id ?? row.hospital_id ?? row._id,
                  }))
                : [];
            set({
                hospitalServicesData: list,
                totalHospitalServicesCount:
                    data?.pagination?.total ?? data?.total ?? data?.meta?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({
                errorMessage: error.message,
                isLoading: false,
                hospitalServicesData: [],
                totalHospitalServicesCount: 0,
            });
        }
    },
    addUpdateHospitalService: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await hospitalService.addUpdateHospitalService(formData);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Saved successfully');
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong saving hospital services',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getServicesByHospital: async (hospitalId) => {
        try {
            const { data } = await hospitalService.getServiceByHospital(hospitalId);
            return data?.data ?? data ?? null;
        } catch (err) {
            const { error } = useAlertReducer.getState();
            error(err?.response?.data?.message ?? err.message);
            return null;
        }
    },
}));

export default useHospitalReducer;
