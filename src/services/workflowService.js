import Gateway from '../gateway/gateway';

const getWorkflowByBoard = (boardId) =>
    Gateway.get(`/kanban_workflow/get_workflow_by_board/${boardId}`);

const renameWorkflow = (workflowId, data) =>
    Gateway.post(`/kanban_workflow/rename_workflow/${workflowId}`, data);

const deleteWorkflow = (workflowId) =>
    Gateway.post(`/kanban_workflow/delete_workflow/${workflowId}`, { workflow_id: workflowId });

const disableWorkflow = (workflowId) =>
    Gateway.post(`/kanban_workflow/disable_workflow/${workflowId}`, { workflow_id: workflowId });

const createWorkflow = (data) =>
    Gateway.post('/kanban_workflow/create_workflow', data);

const createSwimlane = (data) =>
    Gateway.post('/kanban_workflow/create_swimlane', data);

const getSwimlaneByWorkflow = (workflowId) =>
    Gateway.get(`/kanban_workflow/get_swimlane_by_workflow/${workflowId}`);

const renameSwimlane = (data) =>
    Gateway.post('/kanban_workflow/rename_swimlane', data);

const deleteSwimlane = ({ swimlane_id }) =>
    Gateway.post(`/kanban_workflow/delete_swimlane/${swimlane_id}`, { swimlane_id });

export default {
    getWorkflowByBoard,
    renameWorkflow,
    deleteWorkflow,
    disableWorkflow,
    createWorkflow,
    createSwimlane,
    getSwimlaneByWorkflow,
    renameSwimlane,
    deleteSwimlane,
};
