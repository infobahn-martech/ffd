import Gateway from "../gateway/gateway";

export const getCallDetailById = (callId) =>
  Gateway.get(`call_file/get_call_detail_by_id/${encodeURIComponent(String(callId))}`);

export const getGroCustomDocs = (callId) =>
  Gateway.get(`task_card/get_gro_custom_docs/${encodeURIComponent(String(callId))}`);

export const getDocumentsByTask = (taskId) =>
  Gateway.get(`task_card/get_documents_by_task/${encodeURIComponent(String(taskId))}`);

export const verifyGroDocs = (payload) => Gateway.post("task_card/verify_docs", payload);

export const saveArrivalDocument = (formData) =>
  Gateway.post("arrival/save_arrival_document", formData);

export const getPassRequests = (callId) =>
  Gateway.get(`crew_pass/get_pass_requests/${encodeURIComponent(String(callId))}`);

export const uploadZawilPass = (formData) => Gateway.post("crew_pass/upload_zawil_pass", formData);

export const uploadCgPass = (formData) => Gateway.post("crew_pass/upload_cg_pass", formData);

const groService = {
  getCallDetailById,
  getGroCustomDocs,
  getDocumentsByTask,
  verifyGroDocs,
  saveArrivalDocument,
  getPassRequests,
  uploadZawilPass,
  uploadCgPass,
};

export default groService;
