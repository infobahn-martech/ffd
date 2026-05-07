import Gateway from "../gateway/gateway";

const saveCrew = (payload) => Gateway.post("crew/save_crew", payload);
const getAllCrews = (params) => Gateway.get("/crew/get_all_crew", { params });
const getCrewTemplate = (payload) => Gateway.post("crew/get_crew_template", payload);

export default {
  saveCrew,
  getAllCrews,
  getCrewTemplate,
};
