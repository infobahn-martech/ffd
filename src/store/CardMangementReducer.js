import useKanbanManagementReducer from './KanbanManagementReducer';

/**
 * Card type, card sticker, and card blocker list/mutations live on
 * `useKanbanManagementReducer` (`cardTypes`, `cardStickers`, `cardBlockers`,
 * `fetchKanbanCardTypes`, `fetchKanbanCardStickers`, `fetchKanbanCardBlockers`, …).
 * This module pairs with `cardMangementService.js` for discoverability.
 */
export default useKanbanManagementReducer;
