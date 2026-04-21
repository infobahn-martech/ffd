import Gateway from "../gateway/gateway";

/**
 * @param {string|number} callId
 */
const getSoItemsByCall = (callId) =>
  Gateway.get(`sales_order/get_so_items_by_call/${encodeURIComponent(String(callId))}`);

export default {
  getSoItemsByCall,
};
