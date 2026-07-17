import Gateway from '../gateway/gateway';

const getExportApprovalDetails = (callId) =>
  Gateway.get(`/export_approval/get_details/${callId}`);

export default {
  getExportApprovalDetails,
};
