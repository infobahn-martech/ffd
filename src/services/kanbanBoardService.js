import Gateway from '../gateway/gateway';

/**
 * Full board payload for the Kanban UI: one entry per workflow.
 * Response shape: { data: WorkflowFromApi[] } (axios wraps in .data)
 */
const getFullBoard = (boardId) =>
  Gateway.get(`/kanban_board/get_full_board/${boardId}`);

export default {
  getFullBoard,
};
