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
 * @param {object} payload
 * @param {Array<number>} payload.so_item_ids
 * @param {string} [payload.vendor_ref_no]
 * @param {string} [payload.contact_person]
 * @param {string} [payload.branch]
 * @param {string} [payload.currency]
 * @param {string} [payload.delivery_date]
 * @param {string} [payload.document_date]
 * @param {number} [payload.discount_percentage]
 * @param {number} [payload.rounding]
 * @param {string} [payload.remarks]
 */
const generatePO = (payload) => Gateway.post("sales_order/generate_po", payload);

export default {
  getSoItemsByCall,
  generateWorkOrder,
  generatePO,
};
