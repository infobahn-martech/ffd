import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiHome, FiMoreVertical, FiPlus, FiSearch } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import useWorkSpaceReducer from '../../../store/WorkSpaceReducer';

function WorkspacesSideNavPanel({ isDarkMode, onNewDashboard }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { dashboards: apiDashboards, listAllDashboards, dashboardsLoading } = useWorkSpaceReducer();
  const [filterText, setFilterText] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const selectedDashboardId = useMemo(() => {
    const m = pathname.match(/\/workspaces\/dashboard\/([^/]+)/);
    return m ? m[1] : null;
  }, [pathname]);

  const isAllWorkspacesActive = pathname === '/workspaces';

  useEffect(() => {
    listAllDashboards();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const dashboardsData = useMemo(() => {
    if (!Array.isArray(apiDashboards)) return [];
    return apiDashboards.map((d) => ({
      id: d.dashboard_id,
      name: d.dashboard_name,
    }));
  }, [apiDashboards]);

  const filtered = useMemo(
    () => dashboardsData.filter((d) => d.name.toLowerCase().includes(filterText.toLowerCase())),
    [dashboardsData, filterText]
  );

  useEffect(() => {
    document.body.classList.add('kanban-workspaces-sidebar-open');
    document.body.classList.toggle('kanban-workspaces-sidebar-collapsed', collapsed);
    return () => {
      document.body.classList.remove('kanban-workspaces-sidebar-open', 'kanban-workspaces-sidebar-collapsed');
    };
  }, [collapsed]);

  const pushFilter = (value) => {
    setFilterText(value);
  };

  const goAllWorkspaces = () => {
    navigate('/workspaces');
  };

  const openDashboard = (dashboardId) => {
    navigate(`/workspaces/dashboard/${dashboardId}`);
  };

  const asideClass = [
    'kanban-sidebar',
    'kanban-sidebar--workspaces',
    collapsed ? 'kanban-sidebar--workspaces-collapsed' : '',
    isDarkMode ? 'kanban-sidebar-dark' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={asideClass} aria-label="Dashboards navigation">
      <button
        type="button"
        className="kanban-sidebar-workspaces-collapse"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
      </button>

      {!collapsed ? (
        <div className="kanban-sidebar-workspaces-inner">
          <nav className="kanban-sidebar-workspaces-nav" aria-label="Primary">
            <button
              type="button"
              className={`kanban-sidebar-workspaces-nav-item ${isAllWorkspacesActive ? 'kanban-sidebar-workspaces-nav-item--active' : ''}`}
              onClick={goAllWorkspaces}
            >
              <FiHome size={18} aria-hidden />
              <span>All workspaces</span>
            </button>
          </nav>

          <div className="kanban-sidebar-workspaces-filter">
            <FiSearch className="kanban-sidebar-workspaces-filter-icon" aria-hidden />
            <input
              type="search"
              className="kanban-sidebar-workspaces-filter-input"
              placeholder="Filter"
              value={filterText}
              onChange={(e) => pushFilter(e.target.value)}
              aria-label="Filter dashboards"
              autoComplete="off"
            />
          </div>

          <hr className="kanban-sidebar-workspaces-divider" aria-hidden />

          <ul className="kanban-sidebar-workspaces-list">
            {dashboardsLoading ? (
              <li className="kanban-sidebar-workspaces-loading">Loading…</li>
            ) : (
              filtered.map((d) => {
                const isActive = selectedDashboardId != null && String(selectedDashboardId) === String(d.id);
                return (
                  <li
                    key={d.id}
                    className={`kanban-sidebar-workspaces-row ${isActive ? 'kanban-sidebar-workspaces-row--active' : ''}`}
                  >
                    <button
                      type="button"
                      className="kanban-sidebar-workspaces-row-main"
                      onClick={() => openDashboard(d.id)}
                    >
                      <span className="kanban-sidebar-workspaces-dot" aria-hidden />
                      <span className="kanban-sidebar-workspaces-name">{d.name}</span>
                    </button>
                    <button
                      type="button"
                      className="kanban-sidebar-workspaces-row-menu"
                      aria-label={`Actions for ${d.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openDashboard(d.id);
                      }}
                    >
                      <FiMoreVertical size={16} />
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <button type="button" className="kanban-sidebar-workspaces-new-db" onClick={onNewDashboard}>
            <span>+ New dashboard</span>
          </button>
        </div>
      ) : (
        <div className="kanban-sidebar-workspaces-collapsed-stack">
          <button
            type="button"
            className={`kanban-sidebar-icon kanban-sidebar-icon--collapsed ${isAllWorkspacesActive ? 'active' : ''}`}
            data-tooltip-id="ws-sidebar-tt"
            data-tooltip-content="All workspaces"
            aria-label="All workspaces"
            aria-current={isAllWorkspacesActive ? 'page' : undefined}
            onClick={goAllWorkspaces}
          >
            <FiHome size={22} />
          </button>
          <button
            type="button"
            className="kanban-sidebar-icon kanban-sidebar-icon--collapsed"
            data-tooltip-id="ws-sidebar-tt"
            data-tooltip-content="New dashboard"
            aria-label="New dashboard"
            onClick={onNewDashboard}
          >
            <FiPlus size={22} />
          </button>
          <Tooltip
            id="ws-sidebar-tt"
            place="right"
            style={{
              backgroundColor: '#333',
              color: '#fff',
              fontSize: '0.85rem',
              borderRadius: '6px',
              padding: '6px 10px',
              fontWeight: '500',
            }}
          />
        </div>
      )}
    </aside>
  );
}

export default WorkspacesSideNavPanel;
