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

const getVesselByEntity = (entityId) =>
  Gateway.get(`/vessel/vessel_by_entity/${entityId}`);

const getVesselDetailByVesselId = (vesselId) =>
  Gateway.get(`/vessel/vessel_detail_vessel_id/${vesselId}`);

const updateVessel = (data) => Gateway.post(`/vessel/update`, data);
const deleteVessel = (id) => Gateway.delete(`/vessel/allvessel/${id}`);
const archiveVessel = (vesselId) => Gateway.post(`/vessel/archive/${vesselId}`);

export default {
  addVessel,
  fetchVessels,
  getVesselByVesselId,
  getVesselByEntity,
  getVesselDetailByVesselId,
  updateVessel,
  deleteVessel,
  archiveVessel,
};
