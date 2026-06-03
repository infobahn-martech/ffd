import Gateway from "../../gateway/gateway";

const assignTask = (payload) => Gateway.post("task_card/assign_task", payload);

const startTask = (cardId) =>
  Gateway.get(`task_card/start_task/${encodeURIComponent(String(cardId))}`);

const taskCardService = {
  assignTask,
  startTask,
};

export default taskCardService;
