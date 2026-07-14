import Gateway from "../gateway/gateway";

const saveCrew = (payload) => Gateway.post("crew/save_crew", payload);
const getCrewList = (payload) => Gateway.post("crew/get_crew_list", payload);
const getAllCrews = (params) => Gateway.get("/crew/get_all_crew", { params });
const getCrewByCall = (callId) => Gateway.get(`/crew/get_crew_by_call/${callId}`);
const getCrewTemplate = (payload) => Gateway.post("crew/get_crew_template", payload);
const importCrew = (formData) =>
  Gateway.post("crew/import_crew_ai", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const updateCrewDocuments = (formData) =>
  Gateway.post("crew/update_crew_documents", formData);
const updateCrew = (payload) => Gateway.post("crew/update_crew", payload);
const uploadPassportCopies = (formData) =>
  Gateway.post("crew/upload_passport_copies", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
const uploadIqamaCopies = (formData) =>
  Gateway.post("crew/upload_iqama_copies", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default {
  saveCrew,
  getCrewList,
  getAllCrews,
  getCrewByCall,
  getCrewTemplate,
  importCrew,
  updateCrewDocuments,
  updateCrew,
  uploadPassportCopies,
  uploadIqamaCopies,
};
