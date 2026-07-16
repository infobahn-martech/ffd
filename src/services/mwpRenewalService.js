import Gateway from "../gateway/gateway";

const createMwpRenewalRequest = (formData) =>
  Gateway.post("/mwp_renewal/create_mwp_renewal_request", formData);

const getMwpRenewalRequests = (callId) =>
  Gateway.get(`/mwp_renewal/get_mwp_renewal_requests/${encodeURIComponent(String(callId))}`);

const getMwpRenewalRequestDetail = (mwpRenewalRequestId) =>
  Gateway.get(
    `/mwp_renewal/get_mwp_renewal_request_detail/${encodeURIComponent(String(mwpRenewalRequestId))}`
  );

export default {
  createMwpRenewalRequest,
  getMwpRenewalRequests,
  getMwpRenewalRequestDetail,
};
