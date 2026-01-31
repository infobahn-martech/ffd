import Gateway from '../gateway/gateway';

const addVessel = (data) => Gateway.post('/vessel/add', data);
const fetchVessels = ({ params }) => Gateway.get('/vessel/allvessel', { params });
const getVessel = (id) => Gateway.get(`/vessel/allvessel/${id}`);
const updateVessel = (data) => Gateway.post(`/vessel/update`, data);
const deleteVessel = (id) => Gateway.delete(`/vessel/allvessel/${id}`);

export default {
  addVessel,
  fetchVessels,
  getVessel,
  updateVessel,
  deleteVessel,
};
