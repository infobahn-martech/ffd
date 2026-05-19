import Gateway from '../gateway/gateway';

const getAllCountries = () => Gateway.get('/transport/all_country');
const getAllDrivers = (params) => Gateway.get('/transport/all_drivers', { params });
const addDriver = (data) => Gateway.post('/transport/add_driver', data);
const updateDriver = (data) => Gateway.post('/transport/update_driver', data);
const deleteDriver = (driver_id) => Gateway.delete(`/transport/delete_driver/${driver_id}`);

export default {
    getAllCountries,
    getAllDrivers,
    addDriver,
    updateDriver,
    deleteDriver,
};
