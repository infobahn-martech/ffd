import Gateway from "../gateway/gateway";

const addFleet = (data) => Gateway.post("/launch_hire/add_fleet", data);

const getAllFleet = (params) =>
  Gateway.get("/launch_hire/get_all_fleet", { params });

const getFleetById = (fleet_id) =>
  Gateway.post(`/launch_hire/get_fleet_by_id/${fleet_id}`, { fleet_id });

const updateFleet = (data) => Gateway.post("/launch_hire/update_fleet", data);

const deleteFleet = (fleet_id) =>
  Gateway.delete(`/launch_hire/delete_fleet/${fleet_id}`);

export default {
  addFleet,
  getAllFleet,
  getFleetById,
  updateFleet,
  deleteFleet,
};
