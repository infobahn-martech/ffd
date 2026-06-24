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

const getVesselByEntity = (entityId, params) =>
  Gateway.get(`/vessel/vessel_by_entity/${entityId}`, params ? { params } : undefined);

/** POST /vessel/vessel_by_entity/{entity_id} filtered by vessel_type_id | tug_type_id | barge_type_id (sent in body) */
const getVesselsByEntity = (entityId, params) =>
  Gateway.post(`/vessel/vessel_by_entity/${entityId}`, params || {});

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
  getVesselsByEntity,
  getVesselDetailByVesselId,
  updateVessel,
  deleteVessel,
  archiveVessel,
};
