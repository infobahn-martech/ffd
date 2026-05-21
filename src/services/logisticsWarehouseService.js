import Gateway from '../gateway/gateway';

const addLocation = (data) => Gateway.post('/material/add_location', data);
const getLocations = (params) => Gateway.get('/material/get_all_location', { params });
const updateLocation = (data) => Gateway.post('/material/update_location', data);
const deleteLocation = (id) => Gateway.post('/material/delete_location', { location_id: id });

const getWarehouseLocations = () => Gateway.get('/material/get_warehouse_locations');

export default { addLocation, getLocations, updateLocation, deleteLocation, getWarehouseLocations };
