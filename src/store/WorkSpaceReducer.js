import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import workSpaceService from '../services/workSpaceService';

const useWorkSpaceReducer = create((set, get) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  workspaces: [],
  addEditLoader: false,
  createWorkspace: async ({ workspace_name, board_name, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await workSpaceService.createWorkspace({
        workspace_name,
        board_name,
      });
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Workspace created successfully');
      cb && cb();
      get().listAllWorkspaces();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to create workspace');
    }
  },
  listAllWorkspaces: async () => {
    try {
      set({ isLoading: true });
      const { data } = await workSpaceService.listAllWorkspaces();
      const workspaces = data?.status === 'success' ? data.data ?? [] : [];
      set({ workspaces, isLoading: false });
    } catch (error) {
      set({ errorMessage: error.message, isLoading: false, workspaces: [] });
    }
  },
  renameWorkspace: async ({ workspace_id, workspace_name, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await workSpaceService.renameWorkspace(workspace_id, {
        workspace_id,
        workspace_name,
      });
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Workspace renamed successfully');
      cb && cb();
      get().listAllWorkspaces();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to rename workspace');
    }
  },
  updateWorkspaceName: (workspaceId, newName) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        String(w.workspace_id) === String(workspaceId) ? { ...w, workspace_name: newName } : w
      ),
    })),
  updateBoardName: (workspaceId, boardId, newName) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        String(w.workspace_id) === String(workspaceId)
          ? {
              ...w,
              boards: (w.boards || []).map((b) =>
                String(b.board_id) === String(boardId) ? { ...b, board_name: newName } : b
              ),
            }
          : w
      ),
    })),
}));

export default useWorkSpaceReducer;
