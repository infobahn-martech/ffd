import Gateway from '../gateway/gateway';

const getTugTypes = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get('/tugtype', { params: apiParams });
};

const addTugType = (payload) =>
  Gateway.post('/tugtype/add', { tug_type: payload.tug_type });

const updateTugType = (payload) =>
  Gateway.post('/tugtype/update', {
    tug_type_id: payload.tug_type_id,
    tug_type: payload.tug_type,
  });

const deleteTugType = (tug_type_id) =>
  Gateway.delete(`/tugtype/delete/${tug_type_id}`);

export default { getTugTypes, addTugType, updateTugType, deleteTugType };
