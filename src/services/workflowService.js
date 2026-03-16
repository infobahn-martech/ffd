import Gateway from '../gateway/gateway';

const getWorkflowByBoard = (boardId) =>
    Gateway.get(`/kanban_workflow/get_workflow_by_board/${boardId}`);

const renameWorkflow = (workflowId, data) =>
    Gateway.post(`/kanban_workflow/rename_workflow/${workflowId}`, data);

export default {
    getWorkflowByBoard,
    renameWorkflow,
};
