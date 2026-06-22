import Gateway from '../gateway/gateway';

const getTugTypes = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get('/tugtype/all_tug_type', { params: apiParams });
};

const getTugTypeById = (tug_type_id) =>
  Gateway.get(`/tugtype/get_tugtype_by_id/${tug_type_id}`);

const addTugType = (payload) =>
  Gateway.post('/tugtype/add_tug_type', { tug_type: payload.tug_type });

const updateTugType = (payload) =>
  Gateway.post('/tugtype/update_tug_type', {
    tug_type_id: payload.tug_type_id,
    tug_type: payload.tug_type,
  });

const deleteTugType = (tug_type_id) =>
  Gateway.delete(`/tugtype/delete_tug_type/${tug_type_id}`);

export default {
  getTugTypes,
  getTugTypeById,
  addTugType,
  updateTugType,
  deleteTugType,
};
