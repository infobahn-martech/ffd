import Gateway from '../gateway/gateway';

const addLocation = (data) => Gateway.post('/material/add_location', data);
const getLocations = (params) => Gateway.get('/material/get_all_location', { params });
const updateLocation = (data) => Gateway.post('/material/update_location', data);
// Add delete endpoint when API is available: material/delete_location
const deleteLocation = (id) => Gateway.delete(`/material/delete_location/${id}`);

export default { addLocation, getLocations, updateLocation, deleteLocation };
