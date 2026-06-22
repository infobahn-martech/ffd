import Gateway from "../gateway/gateway";

const addCaptain = (data) => Gateway.post("/launch_hire/add_captain", data);

const getAllCaptains = (params) =>
  Gateway.get("/launch_hire/get_all_captain", { params });

const getCaptainById = (captain_id) =>
  Gateway.post(`/launch_hire/get_captain_by_id/${captain_id}`, { captain_id });

const updateCaptain = (data) =>
  Gateway.post("/launch_hire/update_captain", data);

const deleteCaptain = (captain_id) =>
  Gateway.delete(`/launch_hire/delete_captain/${captain_id}`);

export default {
  addCaptain,
  getAllCaptains,
  getCaptainById,
  updateCaptain,
  deleteCaptain,
};
