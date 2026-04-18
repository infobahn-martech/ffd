import "../../design/scss/common.scss";
import KanbanBoardPage from "./pages/KanbanBoardPage";

/**
 * Kanban board entry: workflows are built with `mapBoardWorkflowFromApi` in `src/helpers/data.js`.
 * Live data loads via `kanban_board/get_full_board/{board_id}` in `useKanbanBoardState`, mapped by
 * `src/helpers/kanbanBoardApiMapper.js`. Empty state when the API returns no workflows or fails to load.
 */
export default KanbanBoardPage;
