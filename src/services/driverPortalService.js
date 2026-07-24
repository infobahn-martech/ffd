import Gateway from '../gateway/gateway';

const getDriverId = () =>
  localStorage.getItem('driver_id') ||
  localStorage.getItem('userid') ||
  localStorage.getItem('user_id');

const getDriverTripStats = () =>
  Gateway.get(`transport/get_driver_trip_stats/${getDriverId()}`);

const getRequestsByDriver = () =>
  Gateway.get(`transport/get_requests_by_driver/${getDriverId()}`);

const updateTripStatus = (payload) =>
  Gateway.post('transport/update_trip_status', payload);

export default {
  getDriverTripStats,
  getRequestsByDriver,
  updateTripStatus,
};
