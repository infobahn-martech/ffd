import Gateway from "../gateway/gateway";

const saveDocument = (payload) => Gateway.post("/documents/save_document", payload);

const updateDocument = (payload) => Gateway.post("/documents/update_document", payload);

const getAllDocuments = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.sortOrder) apiParams.sort_order = params.sortOrder;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get("/documents/all_documents", { params: apiParams });
};

export default { saveDocument, updateDocument, getAllDocuments };

