import { useParams } from 'react-router-dom';
import './KanbanDashboardView.scss';

/**
 * Per-dashboard canvas (initially empty). Sidebar lists dashboards from API;
 * each selection opens this view for that dashboard_id.
 */
function KanbanDashboardView() {
  const { dashboardId } = useParams();

  return (
    <div className="kanban-dashboard-view">
      <div className="kanban-dashboard-view-toolbar">
        <span>Add Workspace</span>
        <span className="kanban-dashboard-view-sep">/</span>
        <span>Add Widget</span>
      </div>
      <div className="kanban-dashboard-view-canvas" aria-label={`Dashboard ${dashboardId} content`} />
    </div>
  );
}

export default KanbanDashboardView;
