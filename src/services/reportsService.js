import Gateway from "../gateway/gateway";

/**
 * @param {string|number} callId
 */
const getReports = (callId) => Gateway.post("reports/get_reports", { call_id: callId });

export default {
  getReports,
};
