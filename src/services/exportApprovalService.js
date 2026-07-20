import Gateway from '../gateway/gateway';

const getExportApprovalDetails = (callId) =>
  Gateway.get(`/export_approval/get_details/${callId}`);

const saveExportApprovalDetails = (payload) =>
  Gateway.post('/export_approval/save_details', payload);

export default {
  getExportApprovalDetails,
  saveExportApprovalDetails,
};
