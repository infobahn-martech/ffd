import Gateway from '../gateway/gateway';

const getExportApprovalDetails = (callId) =>
  Gateway.get(`/export_approval/get_details/${callId}`);

const saveExportApprovalDetails = (callId, payload) =>
  Gateway.post(`/export_approval/save/${callId}`, payload);

export default {
  getExportApprovalDetails,
  saveExportApprovalDetails,
};
