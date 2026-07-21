import { create } from "zustand";
import useAlertReducer from "./AlertReducer";
import taxiBoatAssignmentService from "../services/taxiBoatAssignmentService";

const useTaxiBoatAssignmentReducer = create((set) => ({
  fleets: [],
  isLoadingFleets: false,
  captains: [],
  isLoadingCaptains: false,
  isAssigning: false,
  assignedResult: null,

  getFleetsByOperator: async (operator_id) => {
    if (!operator_id) {
      set({ fleets: [] });
      return;
    }
    try {
      set({ isLoadingFleets: true });
      const { data } = await taxiBoatAssignmentService.getFleetsByOperator(operator_id);
      set({ fleets: data?.data ?? [], isLoadingFleets: false });
    } catch (err) {
      set({ fleets: [], isLoadingFleets: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
    }
  },

  getCaptainsByTaxiBoat: async (taxi_boat_id) => {
    if (!taxi_boat_id) {
      set({ captains: [] });
      return;
    }
    try {
      set({ isLoadingCaptains: true });
      const { data } = await taxiBoatAssignmentService.getCaptainsByTaxiBoat(taxi_boat_id);
      set({ captains: data?.data ?? [], isLoadingCaptains: false });
    } catch (err) {
      set({ captains: [], isLoadingCaptains: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
    }
  },

  assignCaptain: async ({ booking_id, taxi_boat_id, taxiboat_captain_id, cb }) => {
    try {
      set({ isAssigning: true });
      const { data } = await taxiBoatAssignmentService.assignCaptain({
        booking_id,
        taxi_boat_id,
        taxiboat_captain_id,
      });
      set({ assignedResult: data, isAssigning: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? "Captain assigned successfully");
      cb?.(data);
    } catch (err) {
      set({ isAssigning: false });
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message);
    }
  },

  resetCaptains: () => set({ captains: [] }),
  resetAssignment: () => set({ assignedResult: null }),
}));

export default useTaxiBoatAssignmentReducer;
