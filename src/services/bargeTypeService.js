import Gateway from '../gateway/gateway';

const getBargeTypes = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get('/bargetype', { params: apiParams });
};

const addBargeType = (payload) =>
  Gateway.post('/bargetype/add', { barge_type: payload.barge_type });

const updateBargeType = (payload) =>
  Gateway.post('/bargetype/update', {
    barge_type_id: payload.barge_type_id,
    barge_type: payload.barge_type,
  });

export default { getBargeTypes, addBargeType, updateBargeType };
