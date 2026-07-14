import { create } from 'zustand';
import departureService from '../services/departureService';

/**
 * Zustand store for the Departure operation tab.
 *
 * Time-object CRUD (save/list/delete "additional" call time objects) is shared
 * across stages via useArrivalReducer, since those hit generic time_object
 * endpoints rather than departure-specific ones.
 */
const useDepartureReducer = create((set) => ({
  departureDetail: null,
  departureDetailCallId: null,
  isDepartureDetailLoading: false,
  isSavingDeparture: false,
  departureError: '',

  fetchDepartureDetail: async ({ callId, cb } = {}) => {
    const trimmedCallId = String(callId ?? '').trim();
    if (!trimmedCallId) return null;
    try {
      set({ isDepartureDetailLoading: true, departureError: '' });
      const { data } = await departureService.getDepartureDetail(trimmedCallId);
      const status = String(data?.status ?? '').toLowerCase();

      if (status === 'error') {
        set({
          departureDetail: null,
          departureDetailCallId: trimmedCallId,
          isDepartureDetailLoading: false,
          departureError: data?.message ?? 'Failed to load departure detail',
        });
        cb && cb(null);
        return null;
      }

      const detail = data?.data ?? data ?? null;
      set({
        departureDetail: detail,
        departureDetailCallId: trimmedCallId,
        isDepartureDetailLoading: false,
      });
      cb && cb(detail);
      return detail;
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to load departure detail.';
      set({
        departureDetail: null,
        departureDetailCallId: trimmedCallId,
        isDepartureDetailLoading: false,
        departureError: message,
      });
      return null;
    }
  },

  saveDepartureDetail: async ({ formData, cb } = {}) => {
    try {
      set({ isSavingDeparture: true, departureError: '' });
      const { data } = await departureService.saveDepartureDetail(formData);
      set({ isSavingDeparture: false });
      cb && cb(data);
      return data;
    } catch (err) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to save Departure.';
      set({ isSavingDeparture: false, departureError: message });
      throw err;
    }
  },

  resetDepartureState: () =>
    set({
      departureDetail: null,
      departureDetailCallId: null,
      isDepartureDetailLoading: false,
      departureError: '',
    }),
}));

export default useDepartureReducer;
