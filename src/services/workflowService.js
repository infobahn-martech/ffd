import Gateway from '../gateway/gateway';

const getWorkflowByBoard = (boardId) =>
    Gateway.get(`/kanban_workflow/get_workflow_by_board/${boardId}`);

const renameWorkflow = (workflowId, data) =>
    Gateway.post(`/kanban_workflow/rename_workflow/${workflowId}`, data);

const deleteWorkflow = (workflowId) =>
    Gateway.post(`/kanban_workflow/delete_workflow/${workflowId}`, { workflow_id: workflowId });

const disableWorkflow = (workflowId) =>
    Gateway.post(`/kanban_workflow/disable_workflow/${workflowId}`, { workflow_id: workflowId });

export default {
    getWorkflowByBoard,
    renameWorkflow,
    deleteWorkflow,
    disableWorkflow,
};
