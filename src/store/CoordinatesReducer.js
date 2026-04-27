import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import coordinatesService from '../services/coordinatesService';

const useCoordinatesReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    coordinates: [],
    coordinateTypes: [],
    isBeingUpdated: false,
    totalCount: 0,
    addCoordinates: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await coordinatesService.addCoordinates(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a coordinates',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getCoordinates: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await coordinatesService.fetchCoordinates({ params });
            set({
                coordinates: data?.data ?? [],
                totalCount: data?.pagination?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false, coordinates: [], totalCount: 0 });
        }
    },
    getCoordinateTypes: async () => {
        try {
            const { data } = await coordinatesService.getAllCoordinateTypes();
            set({
                coordinateTypes: data?.data ?? data ?? [],
            });
        } catch (error) {
            set({ errorMessage: error.message, coordinateTypes: [] });
        }
    },
    updateCoordinates: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await coordinatesService.updateCoordinates(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the coordinates',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteCoordinates: async (payload) => {
        const { coordinates_id, cb } = payload || {};
        try {
            set({ isBeingUpdated: true });
            const { data } = await coordinatesService.deleteCoordinates(coordinates_id);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Coordinates deleted successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the coordinates',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useCoordinatesReducer;
