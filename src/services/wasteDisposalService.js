import Gateway from "../gateway/gateway";

const createWasteDisposalRequest = (formData) =>
  Gateway.post("/waste_disposal/create_waste_disposal_request", formData);

const getWasteDisposalRequests = (callId) =>
  Gateway.get(`/waste_disposal/get_waste_disposal_requests/${encodeURIComponent(String(callId))}`);

const getWasteDisposalRequestDetail = (wasteDisposalRequestId) =>
  Gateway.get(
    `/waste_disposal/get_waste_disposal_request_detail/${encodeURIComponent(String(wasteDisposalRequestId))}`
  );

export default {
  createWasteDisposalRequest,
  getWasteDisposalRequests,
  getWasteDisposalRequestDetail,
};
