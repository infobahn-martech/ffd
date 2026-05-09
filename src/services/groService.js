import Gateway from "../gateway/gateway";

export const getCallDetailById = (callId) =>
  Gateway.get(`call_file/get_call_detail_by_id/${encodeURIComponent(String(callId))}`);

export const getGroCustomDocs = (callId) =>
  Gateway.get(`task_card/get_gro_custom_docs/${encodeURIComponent(String(callId))}`);

export const verifyGroDocs = (payload) => Gateway.post("task_card/verify_docs", payload);

export const saveArrivalDocument = (formData) =>
  Gateway.post("arrival/save_arrival_document", formData);

const groService = {
  getCallDetailById,
  getGroCustomDocs,
  verifyGroDocs,
  saveArrivalDocument,
};

export default groService;
