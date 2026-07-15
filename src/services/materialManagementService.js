import Gateway from '../gateway/gateway';

const getMaterialSummaryByCall = (callId, params) =>
  Gateway.get(`/material_management/get_material_summary_by_call/${callId}`, { params });

export default { getMaterialSummaryByCall };
