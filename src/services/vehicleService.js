import Gateway from '../gateway/gateway';

const addVehicle = (data) => Gateway.post('/transport/add_vehicle_type', data);
const fetchVehicles = ({ params }) => Gateway.get('/transport/all_vehicle_types', { params });
const updateVehicle = (data) => Gateway.post(`/transport/update_vehicle_type`, data);
const deleteVehicle = (id) => Gateway.delete(`/transport/all_vehicle_types/${id}`);

export default { addVehicle, fetchVehicles, updateVehicle, deleteVehicle };
