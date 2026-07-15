import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import materialManagementService from '../services/materialManagementService';

const useMaterialSummaryReducer = create((set) => ({
    isLoadingSummary: false,
    inbounds: [],
    landingNotes: [],
    dispatchNotes: [],
    summaryPagination: null,

    getMaterialSummaryByCall: async ({ call_id, ...params }) => {
        try {
            set({ isLoadingSummary: true });
            const { data } = await materialManagementService.getMaterialSummaryByCall(call_id, params);
            set({
                inbounds: data?.data?.inbounds ?? [],
                landingNotes: data?.data?.landing_notes ?? [],
                dispatchNotes: data?.data?.dispatch_notes ?? [],
                summaryPagination: data?.pagination ?? null,
                isLoadingSummary: false,
            });
        } catch (err) {
            const { error } = useAlertReducer.getState();
            set({
                isLoadingSummary: false,
                inbounds: [],
                landingNotes: [],
                dispatchNotes: [],
                summaryPagination: null,
            });
            error(err?.response?.data?.message ?? err.message);
        }
    },
}));

export default useMaterialSummaryReducer;
