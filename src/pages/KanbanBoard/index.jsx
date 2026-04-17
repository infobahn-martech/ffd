import "../../design/scss/common.scss";
import KanbanBoardPage from "./pages/KanbanBoardPage";

/**
 * Kanban board entry: workflows are normalized in `src/helpers/data.js` (`normalizeWorkflowFromApi`).
 * Live data loads via `kanban_board/get_full_board/{board_id}` in `useKanbanBoardState`, mapped by
 * `src/helpers/kanbanBoardApiMapper.js`, with `initialData` as fallback when the API fails or is empty.
 */
export default KanbanBoardPage;
