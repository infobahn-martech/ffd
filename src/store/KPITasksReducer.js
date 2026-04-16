import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import hotelService from '../services/hotelService';

const useKPITasksReducer = create((set) => ({
    isLoading: false,
    errorMessage: '',
    successMessage: '',
    hotelData: [],
    isBeingUpdated: false,
    totalHotelCount: 0,
    addHotel: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await hotelService.addHotel(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong with adding a hotel',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    getHotelData: async ({ params }) => {
        try {
            set({ isLoading: true });
            const { data } = await hotelService.getHotelData({ params });
            set({
                hotelData: data?.data ?? [],
                totalHotelCount: data?.pagination?.total ?? 0,
                isLoading: false,
            });
        } catch (error) {
            set({ errorMessage: error.message, isLoading: false, hotelData: [], totalHotelCount: 0 });
        }
    },
    updateHotel: async ({ formData, cb }) => {
        try {
            set({ isBeingUpdated: true });
            const { data } = await hotelService.updateHotel(formData);
            set({ successMessage: data.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data && data.message);
            cb && cb();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong updating the hotel',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
    deleteHotel: async (payload) => {
        const { hotel_id, cb } = payload || {};
        try {
            set({ isBeingUpdated: true });
            const { data } = await hotelService.deleteHotel(hotel_id);
            set({ successMessage: data?.message, isBeingUpdated: false });
            const { success } = useAlertReducer.getState();
            success(data?.message ?? 'Hotel deleted successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                errorMessage: 'Something went wrong deleting the hotel',
                isBeingUpdated: false,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useKPITasksReducer;
