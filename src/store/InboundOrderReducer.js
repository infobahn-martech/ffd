import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import inboundOrderService from '../services/inboundOrderService';

const useInboundOrderReducer = create((set) => ({
    isLoadingSave: false,
    isLoadingList: false,
    isLoadingView: false,
    inboundOrders: [],
    inboundTotal: 0,
    inboundDetail: null,

    saveInboundOrder: async ({ data, cb }) => {
        try {
            set({ isLoadingSave: true });
            const { data: resData } = await inboundOrderService.saveInboundOrder(data);
            set({ isLoadingSave: false });
            const { success } = useAlertReducer.getState();
            success(resData?.message ?? 'Inbound order saved successfully');
            cb?.();
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isLoadingSave: false });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    getAllInbound: async (params) => {
        try {
            set({ isLoadingList: true });
            const { data } = await inboundOrderService.getAllInbound(params);
            set({
                inboundOrders: data?.data ?? [],
                inboundTotal: data?.pagination?.total ?? 0,
                isLoadingList: false,
            });
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isLoadingList: false, inboundOrders: [], inboundTotal: 0 });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    getInboundById: async ({ inboundId }) => {
        try {
            set({ isLoadingView: true, inboundDetail: null });
            const { data } = await inboundOrderService.getInboundById(inboundId);
            set({ inboundDetail: data?.data ?? null, isLoadingView: false });
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({ isLoadingView: false, inboundDetail: null });
            error(err?.response?.data?.message ?? err.message);
        }
    },

    clearInboundDetail: () => set({ inboundDetail: null }),
}));

export default useInboundOrderReducer;
