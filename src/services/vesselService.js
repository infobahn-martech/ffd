import Gateway from '../gateway/gateway';

const addVessel = (data) => Gateway.post('/vessel/add', data);
const fetchVessels = ({ params }) => Gateway.get('/vessel', { params });
const getVessel = (id) => Gateway.get(`/vessel/${id}`);
const updateVessel = (id, data) => Gateway.patch(`/vessel/${id}`, data);
const deleteVessel = (id) => Gateway.delete(`/vessel/${id}`);

export default {
  addVessel,
  fetchVessels,
  getVessel,
  updateVessel,
  deleteVessel,
};
