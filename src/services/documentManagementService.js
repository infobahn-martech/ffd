import Gateway from "../gateway/gateway";

const saveDocument = (payload) => Gateway.post("/documents/save_document", payload);

const updateDocument = (payload) => Gateway.post("/documents/update_document", payload);

const getAllDocuments = () => Gateway.get("/documents/all_documents");

export default { saveDocument, updateDocument, getAllDocuments };

