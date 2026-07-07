import Gateway from "../gateway/gateway";

/**
 * @param {string|number} callId
 */
const getSoItemsByCall = (callId) =>
  Gateway.get(`sales_order/get_so_items_by_call/${encodeURIComponent(String(callId))}`);

/**
 * @param {Array<number>} soItemIds
 */
const generateWorkOrder = (soItemIds) =>
  Gateway.post("sales_order/generate_work_order", { so_item_ids: soItemIds });

/**
 * @param {Array<number>} soItemIds
 */
const generatePO = (soItemIds) =>
  Gateway.post("sales_order/generate_po", { so_item_ids: soItemIds });

export default {
  getSoItemsByCall,
  generateWorkOrder,
  generatePO,
};
