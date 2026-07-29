import Gateway from '../gateway/gateway';

const getSummaryTab = (callId) => Gateway.get(`/da/summary_tab/${callId}`);

export default {
  getSummaryTab,
};
