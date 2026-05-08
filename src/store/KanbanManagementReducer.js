import { create } from 'zustand';
import useAlertReducer from './AlertReducer';
import workSpaceService from '../services/workSpaceService';
import kanbanManagementService from '../services/kanbanManagementService';

/** Map `/kanban_workspace/list_all_workspace` rows → NewTagModal `workspaceBoardOptions` */
export function transformWorkspacesForTagBoardPicker(apiWorkspaces) {
  if (!Array.isArray(apiWorkspaces)) return [];
  return apiWorkspaces.map((ws) => ({
    workspace_id: ws.workspace_id ?? ws.id,
    workspace_name: String(ws.workspace_name ?? ws.name ?? 'Workspace'),
    boards: Array.isArray(ws.boards)
      ? ws.boards.map((b) => ({
          board_id: b.board_id ?? b.id,
          board_name: String(b.board_name ?? b.name ?? ''),
        }))
      : [],
  }));
}

export function normalizeKanbanTagRowFromApi(t) {
  const boards = Array.isArray(t?.boards) ? t.boards : [];
  return {
    id: String(t?.tag_id ?? ''),
    label: String(t?.label ?? ''),
    color_code: t?.color_code || '#ffffff',
    availabilityLevel:
      t?.availability_level != null && t.availability_level !== ''
        ? String(t.availability_level)
        : '',
    boardsJoined: boards
      .map((b) => String(b?.board_name ?? '').trim())
      .filter(Boolean)
      .join(', '),
    boardsRaw: boards.map((b) => ({
      board_id: b?.board_id,
      board_name: String(b?.board_name ?? ''),
    })),
    status: t?.status,
  };
}

const useKanbanManagementReducer = create((set, get) => ({
  tags: [],
  tagsLoading: false,
  tagsError: '',
  tagsPagination: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  workspaceBoardOptions: [],
  workspaceBoardsLoading: false,

  /**
   * Load tags for Tags modal.
   * @param {{ search?: string, page?: number, per_page?: number, silentToastOnError?: boolean }} opts
   */
  fetchKanbanTags: async (opts = {}) => {
    const {
      search = '',
      page = 1,
      per_page = 10,
      silentToastOnError = false,
    } = opts;
    try {
      set({ tagsLoading: true, tagsError: '' });
      const { data } = await kanbanManagementService.getAllKanbanTags({
        search,
        page,
        per_page,
      });
      const raw =
        data?.status === 'success' && Array.isArray(data.tags) ? data.tags : [];
      const responseMeta = data?.meta ?? data?.pagination ?? {};
      const resolvedPerPage = Number(responseMeta?.per_page) || Number(per_page) || 10;
      const resolvedCurrentPage = Number(responseMeta?.current_page) || Number(page) || 1;
      const resolvedTotal =
        Number(responseMeta?.total) ||
        (raw.length < resolvedPerPage
          ? ((Math.max(resolvedCurrentPage, 1) - 1) * resolvedPerPage) + raw.length
          : (Math.max(resolvedCurrentPage, 1) * resolvedPerPage) + 1);
      const resolvedLastPage =
        Number(responseMeta?.last_page) ||
        (raw.length < resolvedPerPage ? resolvedCurrentPage : resolvedCurrentPage + 1);
      set({
        tags: raw.map(normalizeKanbanTagRowFromApi),
        tagsLoading: false,
        tagsError: '',
        tagsPagination: {
          current_page: resolvedCurrentPage,
          last_page: Math.max(resolvedLastPage, resolvedCurrentPage),
          total: resolvedTotal,
          per_page: resolvedPerPage,
        },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Unable to load tags. Please try again.';
      set({ tags: [], tagsLoading: false, tagsError: msg });
      if (!silentToastOnError) {
        useAlertReducer.getState().error(msg);
      }
    }
  },

  fetchWorkspaceBoardPickerOptions: async () => {
    try {
      set({ workspaceBoardsLoading: true });
      const { data } = await workSpaceService.listAllWorkspaces();
      const list = data?.status === 'success' ? data.data ?? [] : [];
      set({
        workspaceBoardOptions: transformWorkspacesForTagBoardPicker(list),
        workspaceBoardsLoading: false,
      });
    } catch {
      set({ workspaceBoardOptions: [], workspaceBoardsLoading: false });
      useAlertReducer.getState().error('Unable to load workspaces and boards.');
    }
  },

  createKanbanTag: async (payload, fetchOpts = {}) => {
    try {
      const { data } = await kanbanManagementService.saveKanbanTag(payload);
      useAlertReducer.getState().success(data?.message ?? 'Tag saved');
      await get().fetchKanbanTags({ ...fetchOpts, silentToastOnError: true });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to save tag';
      useAlertReducer.getState().error(msg);
      throw err;
    }
  },

  updateKanbanTagRecord: async (tagId, payload, fetchOpts = {}) => {
    try {
      const { data } = await kanbanManagementService.updateKanbanTag(tagId, payload);
      useAlertReducer.getState().success(data?.message ?? 'Tag updated');
      await get().fetchKanbanTags({ ...fetchOpts, silentToastOnError: true });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to update tag';
      useAlertReducer.getState().error(msg);
      throw err;
    }
  },

  disableKanbanTagRecord: async (tagId, fetchOpts = {}) => {
    try {
      const { data } = await kanbanManagementService.disableKanbanTag(tagId);
      useAlertReducer.getState().success(data?.message ?? 'Tag disabled');
      await get().fetchKanbanTags({ ...fetchOpts, silentToastOnError: true });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to disable tag';
      useAlertReducer.getState().error(msg);
      throw err;
    }
  },

  deleteKanbanTagRecord: async (tagId, fetchOpts = {}) => {
    try {
      const { data } = await kanbanManagementService.deleteKanbanTag(tagId);
      useAlertReducer.getState().success(data?.message ?? 'Tag deleted');
      await get().fetchKanbanTags({ ...fetchOpts, silentToastOnError: true });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to delete tag';
      useAlertReducer.getState().error(msg);
      throw err;
    }
  },

  /** Reset tag picker workspace cache when leaving modal (optional UX cleanup) */
  clearKanbanManagementUiSlice: () =>
    set({
      tagsError: '',
      workspaceBoardOptions: [],
      workspaceBoardsLoading: false,
    }),
}));

export default useKanbanManagementReducer;
