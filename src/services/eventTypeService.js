import Gateway from "../gateway/gateway";

const getEventTypesByStage = (stageId) => Gateway.get(`/eventtypes/${stageId}`);

export default {
  getEventTypesByStage,
};
