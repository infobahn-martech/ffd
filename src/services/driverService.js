import Gateway from '../gateway/gateway';

const getAllCountries = () => Gateway.get('/transport/all_country');
const getAllDrivers = (params) => Gateway.get('/transport/all_drivers', { params });
const addDriver = (data) => Gateway.post('/transport/add_driver', data);
const updateDriver = (driver_id, data) => Gateway.post(`/transport/update_driver/${driver_id}`, data);

export default {
    getAllCountries,
    getAllDrivers,
    addDriver,
    updateDriver,
};
