import Gateway from '../gateway/gateway';

const getDriverId = () =>
  localStorage.getItem('driver_id') ||
  localStorage.getItem('userid') ||
  localStorage.getItem('user_id');

const getDriverTripStats = () =>
  Gateway.get(`transport/get_driver_trip_stats/${getDriverId()}`);

const getLatestRequestsByDriver = () =>
  Gateway.get(`transport/get_latest_requests_by_driver/${getDriverId()}`);

export default {
  getDriverTripStats,
  getLatestRequestsByDriver,
};
