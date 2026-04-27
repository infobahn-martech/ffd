import Gateway from '../gateway/gateway';

const addCoordinates = (data) => Gateway.post('/coordinate/save_coordinates', data);
const fetchCoordinates = ({ params }) => Gateway.get('/coordinate/all_coordinates', { params });
const updateCoordinates = (data) => Gateway.post('/coordinate/update_coordinates', data);
const deleteCoordinates = (id) => Gateway.delete(`/coordinate/all_coordinates/${id}`);
const getAllCoordinateTypes = () => Gateway.get('/coordinate/get_all_coordinate_types');

export default {
  addCoordinates,
  fetchCoordinates,
  updateCoordinates,
  deleteCoordinates,
  getAllCoordinateTypes,
};
