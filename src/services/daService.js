import Gateway from '../gateway/gateway';

const getSummaryTab = (callId) => Gateway.get(`/da/summary_tab/${callId}`);
const getCardTab = (callId) => Gateway.get(`/da/card_tab/${callId}`);
const saveCardTab = (callId, formData) => Gateway.post(`/da/save_card_tab/${callId}`, formData);

export default {
  getSummaryTab,
  getCardTab,
  saveCardTab,
};
