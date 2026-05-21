import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import taskManagementService from "../services/taskManagementService";

const useTaskManagementReducer = create((set) => ({
  isLoadingGet: false,
  isBeingUpdated: false,
  taskManagement: [],
  totalCount: 0,
  errorMessage: "",

  getTaskManagement: async (params) => {
    try {
      set({ isLoadingGet: true });
      const { data } = await taskManagementService.getAllTasks({ params });
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.tasks)
          ? data.tasks
          : [];
      set({
        taskManagement: list,
        totalCount:
          data?.total ??
          data?.pagination?.total ??
          data?.meta?.total ??
          list.length,
        isLoadingGet: false,
      });
    } catch (err) {
      set({
        isLoadingGet: false,
        errorMessage: err?.message ?? "Failed to fetch tasks",
        taskManagement: [],
        totalCount: 0,
      });
    }
  },

  addTaskManagement: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await taskManagementService.saveTask(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Task saved successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  updateTaskManagement: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await taskManagementService.updateTask(formData);
      set({ isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Task updated successfully");
      cb?.();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isBeingUpdated: false });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useTaskManagementReducer;
