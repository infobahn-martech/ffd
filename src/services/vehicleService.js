import Gateway from '../gateway/gateway';

const addVehicle = (data) => Gateway.post('/transport/add_vehicle_type', data);
const fetchVehicles = ({ params }) => Gateway.get('/transport/all_vehicle_types', { params });
const updateVehicle = (data) => Gateway.post(`/transport/update_vehicle_type`, data);
const deleteVehicle = (id) => Gateway.delete(`/transport/all_vehicle_types/${id}`);

const getAllTransportVehicles = () => Gateway.get('/transport/get_all_transport_vehicles');

const getDriversByVehicleType = (vehicle_type_id) =>
  Gateway.get(`/transport/all_drivers_by_vehicletype/${vehicle_type_id}`);

export default {
  addVehicle,
  fetchVehicles,
  updateVehicle,
  deleteVehicle,
  getAllTransportVehicles,
  getDriversByVehicleType,
};
