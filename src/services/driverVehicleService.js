import Gateway from '../gateway/gateway';

const addDriverVehicleMappingData = (data) => Gateway.post('/transport/add_driver_to_vehicle', data);
const getDriverVehicleMappingData = ({ params }) => Gateway.get('/transport/get_all_driver_vehicles', { params });
const updateDriverVehicleMappingData = (data) => Gateway.post('/transport/update_driver_to_vehicle', data);
const deleteDriverVehicleMappingData = (id) => Gateway.delete(`/transport/delete_driver_vehicle/${id}`);

export default { addDriverVehicleMappingData, getDriverVehicleMappingData, updateDriverVehicleMappingData, deleteDriverVehicleMappingData };
