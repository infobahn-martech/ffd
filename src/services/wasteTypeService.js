import Gateway from "../gateway/gateway";

const addWasteType = (payload) => Gateway.post("/material/add_wastetype", payload);

const updateWasteType = (payload) => Gateway.post("/material/update_wastetype", payload);

const getWasteTypes = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get("/material/get_all_waste_type", { params: apiParams });
};

export default { addWasteType, updateWasteType, getWasteTypes };

