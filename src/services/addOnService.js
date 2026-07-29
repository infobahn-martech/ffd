import Gateway from '../gateway/gateway';

const getAllAddOnServices = () => Gateway.get('/addon_service/get_all_addon_services');
const createAddOnServiceRequest = (formData) =>
  Gateway.post('/addon_service/create_addon_service_request', formData);
const getAddOnServiceRequests = (callId) =>
  Gateway.get(`/addon_service/get_addon_service_requests/${encodeURIComponent(String(callId))}`);

export default {
  getAllAddOnServices,
  createAddOnServiceRequest,
  getAddOnServiceRequests,
};
