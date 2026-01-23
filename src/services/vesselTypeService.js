import Gateway from '../gateway/gateway';

const getVesselTypes = ({ params }) => {
  const apiParams = {};
  if (params?.searchTerm) apiParams.search = params.searchTerm;
  if (params?.sortBy) apiParams.sort_by = params.sortBy;
  if (params?.page) apiParams.page = params.page;
  if (params?.limit) apiParams.limit = params.limit;
  return Gateway.get('/vesseltype', { params: apiParams });
};

const addVesselType = (payload) =>
  Gateway.post('/vesseltype/add', { vessel_type: payload.vessel_type });

const updateVesselType = (payload) =>
  Gateway.post('/vesseltype/update', {
    vessel_type_id: payload.vessel_type_id,
    vessel_type: payload.vessel_type,
  });

export default { getVesselTypes, addVesselType, updateVesselType };
