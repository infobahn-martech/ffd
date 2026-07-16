import Gateway from '../gateway/gateway';

const addThirdPartyService = (data) => Gateway.post('/service/add_third_party_service', data);
const getThirdPartyServices = ({ params }) => Gateway.get('/service/get_all_third_party_service', { params });
const updateThirdPartyService = (data) => Gateway.post(`/service/update_third_party_service`, data);
const deleteThirdPartyService = (third_party_service_id) => Gateway.delete(`/service/delete_third_party_service/${third_party_service_id}`);

const createThirdPartyServiceRequest = (formData) =>
  Gateway.post('/third_party_service/create_third_party_service_request', formData);
const getThirdPartyServiceRequests = (callId) =>
  Gateway.get(`/third_party_service/get_third_party_service_requests/${encodeURIComponent(String(callId))}`);
const getThirdPartyServiceRequestDetail = (requestId) =>
  Gateway.get(`/third_party_service/get_third_party_service_request_detail/${encodeURIComponent(String(requestId))}`);

export default {
  addThirdPartyService,
  getThirdPartyServices,
  updateThirdPartyService,
  deleteThirdPartyService,
  createThirdPartyServiceRequest,
  getThirdPartyServiceRequests,
  getThirdPartyServiceRequestDetail,
};
