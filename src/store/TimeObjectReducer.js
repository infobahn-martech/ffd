import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import timeObjectService from "../services/timeObjectService";

const useTimeObjectReducer = create((set) => ({
  isLoadingGet: false,
  isBeingUpdated: false,
  errorMessage: "",
  successMessage: "",
  timeObjects: [],
  totalCount: 0,

  addTimeObject: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await timeObjectService.saveTimeObject(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong adding the time object",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  updateTimeObject: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await timeObjectService.updateTimeObject(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong updating the time object",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  deleteTimeObject: async ({ timeObjectId, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await timeObjectService.deleteTimeObject(timeObjectId);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong deleting the time object",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  getTimeObjects: async (params) => {
    try {
      set({ isLoadingGet: true });
      const { data } = await timeObjectService.getAllTimeObjects({ params });

      const rawList =
        data?.data ??
        data?.time_objects ??
        data?.time_object ??
        data?.results ??
        [];

      const list = Array.isArray(rawList)
        ? rawList.map((row) => ({
            ...row,
            _id: row.time_object_id ?? row._id,
            time_object_id: row.time_object_id ?? row._id,
            time_object: row.time_object ?? row.name ?? "",
            createdAt:
              row.createdAt ??
              row.created_at ??
              row.created_on ??
              row.createdOn ??
              null,
          }))
        : [];

      set({
        timeObjects: list,
        totalCount:
          data?.pagination?.total ??
          data?.total ??
          data?.meta?.total ??
          data?.count ??
          0,
        isLoadingGet: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message ?? "Failed to fetch time objects",
        isLoadingGet: false,
        timeObjects: [],
        totalCount: 0,
      });
    }
  },
}));

export default useTimeObjectReducer;