import { create } from "zustand";

// Local-only fallback for api/da/status_timeline's reached_date: api/da/update_status
// doesn't yet persist this on the backend (confirmed via testing — the field is sent but
// comes back null on refetch), so this remembers the client's own completion timestamp
// per call + status until the backend does. Cleared on full page reload by design; once
// the backend starts returning reached_date, that value takes priority over this fallback.
export const useDaLocalReachedDates = create((set, get) => ({
  reachedDates: {},
  setReachedDate: (callId, statusName, reachedDate) =>
    set((state) => ({
      reachedDates: { ...state.reachedDates, [`${callId}:${statusName}`]: reachedDate },
    })),
  getReachedDate: (callId, statusName) => get().reachedDates[`${callId}:${statusName}`] ?? null,
}));
