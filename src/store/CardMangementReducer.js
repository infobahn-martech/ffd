import useKanbanManagementReducer from './KanbanManagementReducer';

/**
 * Card type + card sticker list/mutations live on `useKanbanManagementReducer`
 * (`cardTypes`, `cardStickers`, `fetchKanbanCardTypes`, `fetchKanbanCardStickers`, …).
 * This module pairs with `cardMangementService.js` for discoverability.
 */
export default useKanbanManagementReducer;
