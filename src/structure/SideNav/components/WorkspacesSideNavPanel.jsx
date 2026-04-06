import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiChevronRight,
  FiEdit2,
  FiHome,
  FiImage,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import { Tooltip } from 'react-tooltip';
import useWorkSpaceReducer from '../../../store/WorkSpaceReducer';
import './AddDashboardModal.scss';

const DASHBOARD_MENU_WIDTH = 200;

function WorkspacesSideNavPanel({ isDarkMode, onNewDashboard }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    dashboards: apiDashboards,
    listAllDashboards,
    dashboardsLoading,
    renameDashboard,
    changeDashboardBackground,
    deleteDashboard,
    addEditLoader,
  } = useWorkSpaceReducer();

  const [filterText, setFilterText] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [openActionsId, setOpenActionsId] = useState(null);
  const [backgroundSubOpen, setBackgroundSubOpen] = useState(false);
  const [renameModal, setRenameModal] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const wallpaperInputRef = useRef(null);
  const menuBtnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [menuPlacement, setMenuPlacement] = useState({ top: 0, left: 0 });

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

  const updateMenuPlacement = useCallback(() => {
    const el = menuBtnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPlacement({
      top: r.bottom + 4,
      left: Math.max(8, r.right - DASHBOARD_MENU_WIDTH),
    });
  }, []);

  useLayoutEffect(() => {
    if (openActionsId == null) return;
    updateMenuPlacement();
  }, [openActionsId, backgroundSubOpen, updateMenuPlacement]);

  useEffect(() => {
    if (openActionsId == null) return undefined;
    updateMenuPlacement();
    window.addEventListener('scroll', updateMenuPlacement, true);
    window.addEventListener('resize', updateMenuPlacement);
    return () => {
      window.removeEventListener('scroll', updateMenuPlacement, true);
      window.removeEventListener('resize', updateMenuPlacement);
    };
  }, [openActionsId, backgroundSubOpen, updateMenuPlacement]);

  useEffect(() => {
    if (openActionsId == null) return undefined;
    const onDoc = (e) => {
      const t = e.target;
      if (menuBtnRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpenActionsId(null);
      setBackgroundSubOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openActionsId]);

  useEffect(() => {
    if (!renameModal) setRenameDraft('');
    else setRenameDraft(renameModal.name ?? '');
  }, [renameModal]);

  const pushFilter = (value) => {
    setFilterText(value);
  };

  const goAllWorkspaces = () => {
    navigate('/workspaces');
  };

  const openDashboard = (dashboardId) => {
    navigate(`/workspaces/dashboard/${dashboardId}`);
  };

  const toggleActionsMenu = (e, dashboardId) => {
    e.stopPropagation();
    e.preventDefault();
    setOpenActionsId((prev) => {
      const next = prev === dashboardId ? null : dashboardId;
      if (next !== prev) setBackgroundSubOpen(false);
      return next;
    });
  };

  const closeMenus = () => {
    setOpenActionsId(null);
    setBackgroundSubOpen(false);
  };

  const handleRenameSave = (e) => {
    e.preventDefault();
    const name = renameDraft.trim();
    if (!renameModal || !name || name === renameModal.name) {
      setRenameModal(null);
      return;
    }
    renameDashboard({
      dashboard_id: renameModal.id,
      dashboard_name: name,
      cb: () => setRenameModal(null),
    });
  };

  const handleColorPick = (dashboardId, hex) => {
    if (!hex) return;
    let value = hex;
    if (!value.startsWith('#')) value = `#${value}`;
    changeDashboardBackground({
      dashboard_id: dashboardId,
      background_type: 'color',
      color: value,
      cb: closeMenus,
    });
  };

  const handleWallpaperFile = (e) => {
    const file = e.target.files?.[0];
    const id = openActionsId;
    e.target.value = '';
    if (!file || id == null) return;
    changeDashboardBackground({
      dashboard_id: id,
      background_type: 'wallpaper',
      background_image: file,
      cb: closeMenus,
    });
  };

  const menuTargetDashboard = useMemo(
    () =>
      dashboardsData.find((x) => String(x.id) === String(openActionsId)) ?? null,
    [dashboardsData, openActionsId]
  );

  const handleDelete = (d) => {
    if (
      !window.confirm(
        `Delete dashboard "${d.name}"? This cannot be undone.`
      )
    ) {
      return;
    }
    deleteDashboard({
      dashboard_id: d.id,
      cb: () => {
        closeMenus();
        if (selectedDashboardId != null && String(selectedDashboardId) === String(d.id)) {
          navigate('/workspaces');
        }
      },
    });
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
                const menuOpen = openActionsId != null && String(openActionsId) === String(d.id);
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
                    <div className="kanban-sidebar-workspaces-row-actions">
                      <button
                        ref={menuOpen ? menuBtnRef : undefined}
                        type="button"
                        className="kanban-sidebar-workspaces-row-menu"
                        aria-label={`Actions for ${d.name}`}
                        aria-expanded={menuOpen}
                        onClick={(e) => toggleActionsMenu(e, d.id)}
                      >
                        <FiMoreVertical size={16} />
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>

          <input
            ref={wallpaperInputRef}
            type="file"
            accept="image/*"
            className="kanban-dashboard-wallpaper-input"
            aria-hidden
            tabIndex={-1}
            onChange={handleWallpaperFile}
          />

          {openActionsId != null &&
            menuTargetDashboard &&
            createPortal(
              <div
                ref={dropdownRef}
                className={`kanban-dashboard-actions-menu kanban-dashboard-actions-menu--portal ${isDarkMode ? 'kanban-dashboard-actions-menu--dark' : ''}`}
                role="presentation"
                style={{
                  position: 'fixed',
                  top: menuPlacement.top,
                  left: menuPlacement.left,
                  width: DASHBOARD_MENU_WIDTH,
                  zIndex: 10050,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ul className="kanban-dashboard-actions-menu-list" role="menu">
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="kanban-dashboard-actions-menu-item"
                      onClick={() => {
                        setRenameModal({
                          id: menuTargetDashboard.id,
                          name: menuTargetDashboard.name,
                        });
                        closeMenus();
                      }}
                    >
                      <FiEdit2 size={14} aria-hidden />
                      <span>Rename</span>
                    </button>
                  </li>
                  <li role="none" className="kanban-dashboard-actions-menu-item--sub">
                    <button
                      type="button"
                      role="menuitem"
                      className="kanban-dashboard-actions-menu-item kanban-dashboard-actions-menu-item--with-chevron"
                      onClick={() => setBackgroundSubOpen((s) => !s)}
                    >
                      <FiImage size={14} aria-hidden />
                      <span>Background</span>
                      <FiChevronRight size={14} className="kanban-dashboard-actions-chevron" aria-hidden />
                    </button>
                    {backgroundSubOpen && (
                      <ul className="kanban-dashboard-actions-submenu" role="menu">
                        <li role="none">
                          <label className="kanban-dashboard-actions-menu-item kanban-dashboard-actions-menu-item--color">
                            <span>Color</span>
                            <input
                              type="color"
                              className="kanban-dashboard-actions-color-input"
                              aria-label="Dashboard background color"
                              defaultValue="#6366f1"
                              onChange={(ev) =>
                                handleColorPick(menuTargetDashboard.id, ev.target.value)
                              }
                            />
                          </label>
                        </li>
                        <li role="none">
                          <button
                            type="button"
                            role="menuitem"
                            className="kanban-dashboard-actions-menu-item"
                            onClick={() => wallpaperInputRef.current?.click()}
                          >
                            <span>Wallpaper</span>
                          </button>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="kanban-dashboard-actions-menu-item kanban-dashboard-actions-menu-item--danger"
                      onClick={() => handleDelete(menuTargetDashboard)}
                    >
                      <FiTrash2 size={14} aria-hidden />
                      <span>Delete</span>
                    </button>
                  </li>
                </ul>
              </div>,
              document.body
            )}

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

      <Modal
        show={!!renameModal}
        onHide={() => setRenameModal(null)}
        className="add-dashboard-modal"
        centered
        backdrop="static"
        backdropClassName="add-dashboard-modal-backdrop"
        dialogClassName="add-dashboard-modal-dialog"
        contentClassName="add-dashboard-modal-content"
      >
        <form onSubmit={handleRenameSave} className="add-dashboard-form">
          <div className="add-dashboard-modal-header">
            <h2 className="add-dashboard-modal-title" id="rename-dashboard-modal-title">
              Rename dashboard
            </h2>
            <button
              type="button"
              className="add-dashboard-modal-close"
              onClick={() => setRenameModal(null)}
              aria-label="Close"
            >
              <FiX size={22} strokeWidth={2} />
            </button>
          </div>

          <div className="add-dashboard-modal-body">
            <label htmlFor="renameDashboardName" className="add-dashboard-label">
              Name
            </label>
            <input
              type="text"
              id="renameDashboardName"
              className="add-dashboard-input"
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              disabled={addEditLoader}
              autoFocus
            />
          </div>

          <div className="add-dashboard-modal-footer">
            <button
              type="button"
              onClick={() => setRenameModal(null)}
              className="add-dashboard-btn add-dashboard-btn--text"
              disabled={addEditLoader}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-dashboard-btn add-dashboard-btn--text"
              disabled={addEditLoader || !renameDraft.trim()}
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </aside>
  );
}

export default WorkspacesSideNavPanel;
