import Gateway from "../gateway/gateway";

const getCustomRoles = () => Gateway.get("/documents/get_custom_roles");

const getAllDocuments = () => Gateway.get("/documents/all_documents");

const getMappedDocuments = (params) =>
  Gateway.get("/documents/get_mapped_documents", { params });

const saveDocumentChecklist = (payload) =>
  Gateway.post("/documents/save_document_checklist", payload);

export default {
  getCustomRoles,
  getAllDocuments,
  getMappedDocuments,
  saveDocumentChecklist,
};
