import Gateway from '../gateway/gateway';

/** GET — returns axios response; unwrap `response.data` in callers */
export const getAllKanbanTags = () => Gateway.get('/kanban_management/get_all_kanban_tags');

export const saveKanbanTag = (payload) =>
  Gateway.post('/kanban_management/save_kanban_tag', payload);

export const updateKanbanTag = (tagId, payload) =>
  Gateway.post(`/kanban_management/update_kanban_tag/${encodeURIComponent(String(tagId))}`, payload);

export const disableKanbanTag = (tagId) =>
  Gateway.post(`/kanban_management/disable_kanban_tag/${encodeURIComponent(String(tagId))}`);

/** Backend expects POST for delete */
export const deleteKanbanTag = (tagId) =>
  Gateway.post(`/kanban_management/delete_kanban_tag/${encodeURIComponent(String(tagId))}`);

export default {
  getAllKanbanTags,
  saveKanbanTag,
  updateKanbanTag,
  disableKanbanTag,
  deleteKanbanTag,
};
