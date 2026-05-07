import Gateway from "../gateway/gateway";

const saveCrew = (payload) => Gateway.post("crew/save_crew", payload);
const getAllCrews = (params) => Gateway.get("/crew/get_all_crew", { params });
const getCrewTemplate = (payload) => Gateway.post("crew/get_crew_template", payload);
const importCrew = (formData) =>
  Gateway.post("crew/import_crew", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default {
  saveCrew,
  getAllCrews,
  getCrewTemplate,
  importCrew,
};
