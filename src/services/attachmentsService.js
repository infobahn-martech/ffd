import Gateway from "../gateway/gateway";

/**
 * @param {string|number} callId
 */
const getAllAttachments = (callId) =>
  Gateway.post("attachments/get_all_attachments", { call_id: callId });

export default {
  getAllAttachments,
};
