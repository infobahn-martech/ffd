import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import stageTimeMappingService from "../services/stageTimeMappingService";

const useStageTimeMappingReducer = create((set) => ({
  isLoadingGet: false,
  isBeingUpdated: false,
  errorMessage: "",
  successMessage: "",
  wasteTypes: [],
  totalCount: 0,

  addWasteType: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await stageTimeMappingService.addStageTimeMapping(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong with adding a waste type",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  updateWasteType: async ({ formData, cb }) => {
    try {
      set({ isBeingUpdated: true });
      const { data } = await wasteTypeService.updateWasteType(formData);
      set({ successMessage: data?.message, isBeingUpdated: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: "Something went wrong updating the waste type",
        isBeingUpdated: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },

  getWasteTypes: async (params) => {
    try {
      set({ isLoadingGet: true });
      const { data } = await wasteTypeService.getWasteTypes({ params });

      const rawList = data?.data ?? data?.waste_types ?? data?.waste_type ?? [];
      const list = Array.isArray(rawList)
        ? rawList.map((row) => ({
          ...row,
          _id: row.waste_type_id ?? row._id,
          waste_type_id: row.waste_type_id ?? row._id,
          waste_type: row.waste_type ?? row.name ?? "",
          name: row.waste_type ?? row.name ?? "",
          createdAt: row.createdAt ?? row.created_at ?? row.created_on ?? row.createdOn ?? null,
        }))
        : [];

      set({
        wasteTypes: list,
        totalCount:
          data?.pagination?.total ?? data?.total ?? data?.meta?.total ?? data?.count ?? 0,
        isLoadingGet: false,
      });
    } catch (err) {
      set({
        errorMessage: err?.message ?? "Failed to fetch waste types",
        isLoadingGet: false,
        wasteTypes: [],
        totalCount: 0,
      });
    }
  },
}));

export default useWasteTypeReducer;

