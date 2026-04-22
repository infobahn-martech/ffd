import Gateway from "../gateway/gateway";

const getEventTypesByStage = (stageId) => Gateway.get(`/calleventtypes/${stageId}`);

export default {
  getEventTypesByStage,
};
