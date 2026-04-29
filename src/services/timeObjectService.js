import Gateway from "../gateway/gateway";

const saveTimeObject = (payload) =>
  Gateway.post("/time_object/save_time_object", payload);

const updateTimeObject = (payload) =>
  Gateway.post("/time_object/update_time_object", payload);

const getAllTimeObjects = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get("/time_object/get_all_time_objects", { params: apiParams });
};

export default { saveTimeObject, updateTimeObject, getAllTimeObjects };
