import "../../design/scss/common.scss";
import KanbanBoardPage from "./pages/KanbanBoardPage";

/**
 * Kanban board entry: normalized workflow state (columns + swimlanes + cards)
 * is built in `src/helpers/data.js` and may later be hydrated from the API via
 * `normalizeWorkflowFromApi`.
 */
export default KanbanBoardPage;
