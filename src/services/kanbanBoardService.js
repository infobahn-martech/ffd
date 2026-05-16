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

export default {
  getFullBoard,
  updateCardColor,
};
