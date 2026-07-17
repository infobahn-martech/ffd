import Gateway from '../gateway/gateway';

const createAddOnServiceRequest = (formData) =>
  Gateway.post('/add_on_service/create_add_on_service_request', formData);
const getAddOnServiceRequests = (callId) =>
  Gateway.get(`/add_on_service/get_add_on_service_requests/${encodeURIComponent(String(callId))}`);

export default {
  createAddOnServiceRequest,
  getAddOnServiceRequests,
};
