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

const getCardBlockersByBoard = (boardId) =>
  Gateway.get(
    `/kanban_card/get_card_blockers_by_board/${encodeURIComponent(String(boardId))}`
  );

/** @param {{ card_id: string|number, card_blocker_id: string|number }} payload */
const updateCardBlocker = (payload) =>
  Gateway.post('/kanban_card/update_card_blocker', payload);

const getCardStickersByBoard = (boardId) =>
  Gateway.get(
    `/kanban_card/get_card_stickers_by_board/${encodeURIComponent(String(boardId))}`
  );

/** @param {{ card_id: string|number, card_sticker_id: string|number }} payload */
const updateCardSticker = (payload) =>
  Gateway.post('/kanban_card/update_card_sticker', payload);

const getCardTagsByBoard = (boardId) =>
  Gateway.get(`/kanban_card/get_card_tags_by_board/${encodeURIComponent(String(boardId))}`);

/** @param {{ card_id: string|number, card_tag_id: string|number }} payload */
const updateCardTag = (payload) =>
  Gateway.post('/kanban_card/update_card_tag', payload);

export default {
  getFullBoard,
  updateCardColor,
  getCardTypesByBoard,
  updateCardType,
  getCardBlockersByBoard,
  updateCardBlocker,
  getCardStickersByBoard,
  updateCardSticker,
  getCardTagsByBoard,
  updateCardTag,
};
