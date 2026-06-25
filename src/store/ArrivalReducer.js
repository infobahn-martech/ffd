import { create } from 'zustand';
import arrivalService from '../services/arrivalService';

/**
 * Zustand store for the Arrival operation tab.
 *
 * Responsibilities:
 * - Cache the latest `arrival/get_arrival_detail` payload per call.
 * - Track loading flags for fetch / save / send-report so the UI can
 *   disable inputs without each component owning that bookkeeping.
 *
 * Toasts are intentionally raised in the calling component (Arrival.jsx
 * uses `notify` from `components/Toaster`) to keep the UX wording consistent
 * with the rest of the operation tabs.
 */
const useArrivalReducer = create((set) => ({
  arrivalDetail: null,
  arrivalDetailCallId: null,
  isArrivalDetailLoading: false,
  isSavingArrival: false,
  isSendingArrivalReport: false,
  isSavingCallTimeObject: false,
  isDeletingCallTimeObject: false,
  isLoadingCallTimeObjects: false,
  arrivalError: '',
  fetchArrivalDetail: async ({ callId, cb } = {}) => {
    const trimmedCallId = String(callId ?? '').trim();
    if (!trimmedCallId) return null;
    try {
      set({ isArrivalDetailLoading: true, arrivalError: '' });
      const { data } = await arrivalService.getArrivalDetail(trimmedCallId);
      const status = String(data?.status ?? '').toLowerCase();

      if (status === 'error') {
        set({
          arrivalDetail: null,
          arrivalDetailCallId: trimmedCallId,
          isArrivalDetailLoading: false,
          arrivalError: data?.message ?? 'Failed to load arrival detail',
        });
        cb && cb(null);
        return null;
      }

      const detail = data?.data ?? data ?? null;
      set({
        arrivalDetail: detail,
        arrivalDetailCallId: trimmedCallId,
        isArrivalDetailLoading: false,
      });
      cb && cb(detail);
      return detail;
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to load arrival detail.';
      set({
        arrivalDetail: null,
        arrivalDetailCallId: trimmedCallId,
        isArrivalDetailLoading: false,
        arrivalError: message,
      });
      console.error('[ArrivalReducer] fetchArrivalDetail failed', err);
      return null;
    }
  },

  saveArrivalDetail: async ({ formData, cb } = {}) => {
    try {
      set({ isSavingArrival: true, arrivalError: '' });
      const { data } = await arrivalService.saveArrivalDetail(formData);
      set({ isSavingArrival: false });
      cb && cb(data);
      return data;
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to save Arrival.';
      set({ isSavingArrival: false, arrivalError: message });
      throw err;
    }
  },

  // Additional ("call") time objects are persisted one row at a time via the
  // shared time_object endpoints so each stage (Pre Arrival / Arrival /
  // Departure) can add and remove rows independently of its bulk detail save.
  saveCallTimeObject: async ({ callId, stageId, timeObject, cb } = {}) => {
    try {
      set({ isSavingCallTimeObject: true });
      const { data } = await arrivalService.saveCallTimeObject({
        call_id: callId,
        stage_id: stageId,
        time_object: timeObject,
      });
      set({ isSavingCallTimeObject: false });
      cb && cb(data);
      return data;
    } catch (err) {
      set({ isSavingCallTimeObject: false });
      throw err;
    }
  },

  // Reload all call time objects after a single-row save so the additional
  // time-object list can be refreshed with backend-assigned ids/values.
  getTimeObjectsByCall: async ({ callId, stageId, cb } = {}) => {
    const trimmedCallId = String(callId ?? '').trim();
    if (!trimmedCallId) return null;
    try {
      set({ isLoadingCallTimeObjects: true });
      const { data } = await arrivalService.getTimeObjectsByCall({
        callId: trimmedCallId,
        stageId,
      });
      set({ isLoadingCallTimeObjects: false });
      cb && cb(data);
      return data;
    } catch (err) {
      set({ isLoadingCallTimeObjects: false });
      throw err;
    }
  },

  deleteCallTimeObject: async ({ timeObjectId, callId, stageId, cb } = {}) => {
    try {
      set({ isDeletingCallTimeObject: true });
      const { data } = await arrivalService.deleteCallTimeObject({
        timeObjectId,
        callId,
        stageId,
      });
      set({ isDeletingCallTimeObject: false });
      cb && cb(data);
      return data;
    } catch (err) {
      set({ isDeletingCallTimeObject: false });
      throw err;
    }
  },

  sendArrivalReport: async ({ payload, cb } = {}) => {
    try {
      set({ isSendingArrivalReport: true });
      const { data } = await arrivalService.sendReport(payload);
      set({ isSendingArrivalReport: false });
      cb && cb(data);
      return data;
    } catch (err) {
      set({ isSendingArrivalReport: false });
      throw err;
    }
  },

  resetArrivalState: () =>
    set({
      arrivalDetail: null,
      arrivalDetailCallId: null,
      isArrivalDetailLoading: false,
      arrivalError: '',
    }),
}));

export default useArrivalReducer;
