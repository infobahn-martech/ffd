import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiHome, FiMoreVertical, FiPlus, FiSearch } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import useWorkSpaceReducer from '../../../store/WorkSpaceReducer';

const transformWorkspaces = (data) => {
  if (!Array.isArray(data)) return [];
  return data.map((ws) => ({
    id: ws.workspace_id,
    name: ws.workspace_name,
    status: ws.workspace_status,
    boards: Array.isArray(ws.boards)
      ? ws.boards.map((b) => ({
          id: b.board_id,
          name: b.board_name,
          status: b.board_status,
          count: b.count ?? 0,
        }))
      : [],
  }));
};

function WorkspacesSideNavPanel({ isDarkMode, onNewDashboard }) {
  const { workspaces: apiWorkspaces, listAllWorkspaces } = useWorkSpaceReducer();
  const [filterText, setFilterText] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    listAllWorkspaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  const workspacesData = useMemo(() => transformWorkspaces(apiWorkspaces), [apiWorkspaces]);

  const filtered = useMemo(
    () => workspacesData.filter((w) => w.name.toLowerCase().includes(filterText.toLowerCase())),
    [workspacesData, filterText]
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
    window.dispatchEvent(new CustomEvent('workspaces:sidebar-filter', { detail: { value } }));
  };

  const focusWorkspace = (workspaceId) => {
    window.dispatchEvent(new CustomEvent('workspaces:focus-workspace', { detail: { workspaceId } }));
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
    <aside className={asideClass} aria-label="Workspaces navigation">
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
            <div className="kanban-sidebar-workspaces-nav-item kanban-sidebar-workspaces-nav-item--active">
              <FiHome size={18} aria-hidden />
              <span>All workspaces</span>
            </div>
          </nav>

          <div className="kanban-sidebar-workspaces-filter">
            <FiSearch className="kanban-sidebar-workspaces-filter-icon" aria-hidden />
            <input
              type="search"
              className="kanban-sidebar-workspaces-filter-input"
              placeholder="Filter"
              value={filterText}
              onChange={(e) => pushFilter(e.target.value)}
              aria-label="Filter workspaces"
              autoComplete="off"
            />
          </div>

          <hr className="kanban-sidebar-workspaces-divider" aria-hidden />

          <ul className="kanban-sidebar-workspaces-list">
            {filtered.map((ws) => (
              <li key={ws.id} className="kanban-sidebar-workspaces-row">
                <button
                  type="button"
                  className="kanban-sidebar-workspaces-row-main"
                  onClick={() => focusWorkspace(ws.id)}
                >
                  <span className="kanban-sidebar-workspaces-dot" aria-hidden />
                  <span className="kanban-sidebar-workspaces-name">{ws.name}</span>
                </button>
                <button
                  type="button"
                  className="kanban-sidebar-workspaces-row-menu"
                  aria-label={`Actions for ${ws.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    focusWorkspace(ws.id);
                  }}
                >
                  <FiMoreVertical size={16} />
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="kanban-sidebar-workspaces-new-db" onClick={onNewDashboard}>
            <span>+ New dashboard</span>
          </button>
        </div>
      ) : (
        <div className="kanban-sidebar-workspaces-collapsed-stack">
          <div
            className="kanban-sidebar-icon kanban-sidebar-icon--collapsed active"
            data-tooltip-id="ws-sidebar-tt"
            data-tooltip-content="All workspaces"
            aria-current="page"
          >
            <FiHome size={22} />
          </div>
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
