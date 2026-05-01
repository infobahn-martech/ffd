import Gateway from '../gateway/gateway';

const addCoordinates = (data) => Gateway.post('/coordinate/save_coordinates', data);
const fetchCoordinates = ({ params }) => Gateway.get('/coordinate/all_coordinates', { params });
const updateCoordinates = (data) => Gateway.post('/coordinate/update_coordinates', data);
const deleteCoordinates = (id) => Gateway.delete(`/coordinate/all_coordinates/${id}`);
const getAllCoordinateTypes = () => Gateway.get('/coordinate/get_all_coordinate_types');
const getCoordinatesByType = (data) => Gateway.post('/coordinate/get_coordinates_by_type', data);

export default {
  addCoordinates,
  fetchCoordinates,
  updateCoordinates,
  deleteCoordinates,
  getAllCoordinateTypes,
  getCoordinatesByType,
};
