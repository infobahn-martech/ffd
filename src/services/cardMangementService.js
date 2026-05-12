import Gateway from '../gateway/gateway';

/** GET — returns axios response; unwrap `response.data` in callers */
export const getAllKanbanCardTypes = (params = {}) =>
  Gateway.get('/kanban_management/get_all_kanban_card_types', { params });

export const saveKanbanCardType = (payload) =>
  Gateway.post('/kanban_management/save_kanban_card_type', payload);

export const updateKanbanCardType = (cardTypeId, payload) =>
  Gateway.post(
    `/kanban_management/update_kanban_card_type/${encodeURIComponent(String(cardTypeId))}`,
    payload
  );

export const disableKanbanCardType = (cardTypeId) =>
  Gateway.post(
    `/kanban_management/disable_kanban_card_type/${encodeURIComponent(String(cardTypeId))}`
  );

/** Backend uses POST for delete (same pattern as tags) */
export const deleteKanbanCardType = (cardTypeId) =>
  Gateway.post(
    `/kanban_management/delete_kanban_card_type/${encodeURIComponent(String(cardTypeId))}`
  );

export default {
  getAllKanbanCardTypes,
  saveKanbanCardType,
  updateKanbanCardType,
  disableKanbanCardType,
  deleteKanbanCardType,
};
