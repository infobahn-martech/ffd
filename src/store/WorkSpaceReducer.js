import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import workSpaceService from '../services/workSpaceService';
import kanbanDashboardService from '../services/kanbanDashboardService';

const useWorkSpaceReducer = create((set, get) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  workspaces: [],
  dashboards: [],
  dashboardsLoading: false,
  addEditLoader: false,
  archiveLog: [],
  archiveLogLoading: false,
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
  listAllDashboards: async () => {
    try {
      set({ dashboardsLoading: true });
      const { data } = await kanbanDashboardService.listAllDashboards();
      const raw = data?.status === 'success' ? data.data ?? [] : [];
      const dashboards = Array.isArray(raw) ? raw : [];
      set({ dashboards, dashboardsLoading: false });
    } catch (error) {
      set({ errorMessage: error.message, dashboardsLoading: false, dashboards: [] });
    }
  },
  createDashboard: async ({ dashboard_name, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await kanbanDashboardService.createDashboard({ dashboard_name });
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Dashboard created successfully');

      let newId;
      const payload = data?.data;
      if (payload && typeof payload === 'object') {
        if (!Array.isArray(payload)) {
          newId = payload.dashboard_id ?? payload.id;
        } else if (payload[0] && typeof payload[0] === 'object') {
          newId = payload[0].dashboard_id ?? payload[0].id;
        }
      }
      if (newId != null && newId !== '') {
        cb && cb(String(newId));
      } else {
        cb && cb(undefined);
      }
      get().listAllDashboards();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to create dashboard');
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
  archiveWorkspace: async ({ workspace_id, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await workSpaceService.archiveWorkspace(workspace_id);
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Workspace archived successfully');
      cb && cb();
      get().listAllWorkspaces();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to archive workspace');
    }
  },
  fetchWorkspaceArchiveLog: async () => {
    try {
      set({ archiveLogLoading: true });
      const { data } = await workSpaceService.getWorkspaceArchiveLog();
      const list = data?.status === 'success' ? data.data ?? [] : [];
      set({ archiveLog: Array.isArray(list) ? list : [], archiveLogLoading: false });
    } catch (err) {
      const { error } = useAlertReducer.getState();
      error(err?.response?.data?.message ?? err.message ?? 'Failed to load archive log');
      set({ archiveLog: [], archiveLogLoading: false });
    }
  },
  unarchiveWorkspace: async ({ board_id, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await workSpaceService.unarchiveWorkspace(board_id);
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Workspace restored successfully');
      cb && cb();
      get().fetchWorkspaceArchiveLog();
      get().listAllWorkspaces();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to restore workspace');
    }
  },
  createBoard: async ({ workspace_id, board_name, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await workSpaceService.createBoard({
        workspace_id,
        board_name,
      });
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Board created successfully');
      cb && cb();
      get().listAllWorkspaces();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to create board');
    }
  },
  renameBoard: async ({ board_id, board_name, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await workSpaceService.renameBoard(board_id, {
        board_id,
        board_name,
      });
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Board renamed successfully');
      cb && cb();
      get().listAllWorkspaces();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to rename board');
    }
  },
  archiveBoard: async ({ board_id, cb }) => {
    try {
      set({ addEditLoader: true });
      const { data } = await workSpaceService.archiveBoard(board_id);
      set({ addEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data?.message ?? 'Board archived successfully');
      cb && cb();
      get().listAllWorkspaces();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ addEditLoader: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to archive board');
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
