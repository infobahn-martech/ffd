import { create } from "zustand";
import callTaskService from "../services/callTaskService";

const useCallTaskReducer = create((set, get) => ({
  isLoadingTasks: false,
  tasksErrorMessage: "",
  callTasks: [],
  tasksCallId: "",

  getTasksByCall: async ({ callId }) => {
    const trimmed =
      callId === undefined || callId === null ? "" : String(callId).trim();

    if (!trimmed) {
      set({
        callTasks: [],
        tasksErrorMessage: "",
        isLoadingTasks: false,
        tasksCallId: "",
      });
      return;
    }

    try {
      set({ isLoadingTasks: true, tasksErrorMessage: "", tasksCallId: trimmed });
      const { data } = await callTaskService.getTasksByCall(trimmed);
      const rows = Array.isArray(data?.data) ? data.data : [];

      if (get().tasksCallId === trimmed) {
        set({ callTasks: rows, isLoadingTasks: false });
      }
    } catch (err) {
      console.error("[CallTaskReducer] getTasksByCall failed", err);
      if (get().tasksCallId === trimmed) {
        set({
          callTasks: [],
          tasksErrorMessage:
            err?.response?.data?.message ?? "Unable to load operation tasks.",
          isLoadingTasks: false,
        });
      }
    }
  },

  clearCallTasks: () =>
    set({
      callTasks: [],
      tasksErrorMessage: "",
      isLoadingTasks: false,
      tasksCallId: "",
    }),
}));

export default useCallTaskReducer;
