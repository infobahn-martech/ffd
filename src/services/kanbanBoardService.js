import Gateway from '../gateway/gateway';

/**
 * Full board payload for the Kanban UI: one entry per workflow.
 * Response shape: { data: WorkflowFromApi[] } (axios wraps in .data)
 */
const getFullBoard = (boardId) =>
  Gateway.get(`/kanban_board/get_full_board/${boardId}`);

/** @param {{ card_id: string|number, card_color: string }} payload */
const updateCardColor = (payload) =>
  Gateway.post('/kanban_card/update_card_color', payload);

const getCardTypesByBoard = (boardId) =>
  Gateway.get(`/kanban_card/card_types_by_board/${encodeURIComponent(String(boardId))}`);

/** @param {{ card_id: string|number, card_type_id: string|number }} payload */
const updateCardType = (payload) =>
  Gateway.post('/kanban_card/update_card_type', payload);

export default {
  getFullBoard,
  updateCardColor,
  getCardTypesByBoard,
  updateCardType,
};
