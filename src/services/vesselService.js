import Gateway from '../gateway/gateway';

const addVessel = (data) => Gateway.post('/vessel/add', data);

const fetchVessels = ({ params }) => {
  const p = params || {};
  const apiParams = {
    page: p.page,
    limit: p.limit,
    ...(p.search ? { search: p.search } : {}),
    ...(p.sortBy ? { sort_by: p.sortBy } : {}),
  };
  return Gateway.get('/vessel/allvessel', { params: apiParams });
};

/** GET /vessel/vessel_by_vessel_id/{vessel_id} */
const getVesselByVesselId = (vesselId) =>
  Gateway.get(`/vessel/vessel_by_vessel_id/${vesselId}`);

const updateVessel = (data) => Gateway.post(`/vessel/update`, data);
const deleteVessel = (id) => Gateway.delete(`/vessel/allvessel/${id}`);

export default {
  addVessel,
  fetchVessels,
  getVesselByVesselId,
  updateVessel,
  deleteVessel,
};
