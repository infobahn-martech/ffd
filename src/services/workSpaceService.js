import Gateway from '../gateway/gateway';

const createWorkspace = (data) =>
  Gateway.post('/kanban_workspace/create_workspace', {
    workspace_name: data.workspace_name,
    board_name: data.board_name,
  });

const listAllWorkspaces = () =>
  Gateway.get('/kanban_workspace/list_all_workspace');

const renameWorkspace = (workspaceId, data) =>
  Gateway.post(`/kanban_workspace/rename_workspace/${workspaceId}`, {
    workspace_id: data.workspace_id,
    workspace_name: data.workspace_name,
  });

export default {
  createWorkspace,
  listAllWorkspaces,
  renameWorkspace,
};
