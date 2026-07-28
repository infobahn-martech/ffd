import Gateway from '../gateway/gateway';

// NOT YET CONFIRMED with the backend — placeholder route named after the
// feature/branch (add/export-enable-operation-api). Swap for the real
// update/save endpoint once confirmed; see project_enable_operation_tab
// memory for status.
const saveEnableOperation = (callId, payload) =>
  Gateway.post(`/call_file/enable_operation/${callId}`, payload);

export default { saveEnableOperation };
