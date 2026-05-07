import Gateway from "../gateway/gateway";

const saveCrew = (payload) => Gateway.post("crew/save_crew", payload);
const getAllCrews = (params) => Gateway.get("/crew/get_all_crew", { params });

export default {
  saveCrew,
  getAllCrews,
};
