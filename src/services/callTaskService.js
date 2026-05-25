import Gateway from "../gateway/gateway";

const getTasksByCall = (callId) =>
  Gateway.post("call_task/get_tasks_by_call", {
    call_id: callId,
  });

const callTaskService = {
  getTasksByCall,
};

export default callTaskService;
