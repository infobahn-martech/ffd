import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import taskChecklistService from "../services/taskChecklistService";

const normalizeList = (data) =>
  Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : Array.isArray(data?.tasks)
        ? data.tasks
        : [];

const useTaskChecklistReducer = create((set) => ({
  isLoadingGet: false,
  isLoadingOptions: false,
  isBeingUpdated: false,
  errorMessage: "",
  successMessage: "",
  taskChecklists: [],
  totalCount: 0,
  roleOptions: [],
  taskOptions: [],

  getTaskChecklists: async (params) => {
    try {
      set({ isLoadingGet: true });
      const { data } = await taskChecklistService.getRolesWithTasks(params);
      const rows = normalizeList(data);
      set({
        taskChecklists: rows,
        totalCount:
          data?.total ??
          data?.meta?.total ??
          data?.count ??
          rows.length,
        isLoadingGet: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message ?? "Failed to fetch task checklist mappings",
        isLoadingGet: false,
        taskChecklists: [],
        totalCount: 0,
      });
    }
  },

  getTaskChecklistOptions: async () => {
    try {
      set({ isLoadingOptions: true });
      const [rolesRes, tasksRes] = await Promise.all([
        taskChecklistService.getCustomRoles(),
        taskChecklistService.getAllTasks(),
      ]);

      const rolesRaw = normalizeList(rolesRes?.data);
      const tasksRaw = normalizeList(tasksRes?.data);

      set({
        roleOptions: rolesRaw.map((item) => ({
          value: Number(item?.role_id),
          label: item?.role,
        })),
        taskOptions: tasksRaw.map((item) => ({
          value: Number(item?.task_id ?? item?._id),
          label: item?.task_name ?? item?.name,
        })),
        isLoadingOptions: false,
      });
    } catch (err) {
      set({
        isLoadingOptions: false,
        errorMessage: err?.message ?? "Failed to fetch task checklist options",
      });
    }
  },

  saveTaskChecklist: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await taskChecklistService.assignRole({
        role_id: formData?.role_id,
        task_ids: formData?.task_ids,
      });
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Task checklist saved successfully");
      cb?.();
    } catch (err) {
      set({ isBeingUpdated: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err?.message);
    }
  },
}));

export default useTaskChecklistReducer;
