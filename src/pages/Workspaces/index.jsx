import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { FiLayers } from 'react-icons/fi';
import '../../design/scss/Workspaces.scss';
import GroupIcon from '../../assets/images/Group.svg';
import AnalyticsIcon from '../../assets/images/analytics 1.svg';
import ClockIcon from '../../assets/images/ClockIcon.svg';
import filterIcon from '../../assets/images/filter.svg';
import NewWorkspaceModal from './NewWorkspaceModal';
import AddBoardModal from './AddBoardModal';
import ArchivedWorkspacesModal from './ArchivedWorkspacesModal';
import RenameBoardModal from './RenameBoardModal';
import RenameWorkspaceModal from './RenameWorkspaceModal';

// Workspace Icon Component - Bar Chart Icon (like in first image)
const WorkspaceBarChartIcon = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="17" width="4" height="4" rx="1" fill="currentColor" />
    <rect x="8" y="12" width="4" height="9" rx="1" fill="currentColor" />
    <rect x="13" y="8" width="4" height="13" rx="1" fill="currentColor" />
    <rect x="18" y="4" width="4" height="17" rx="1" fill="currentColor" />
  </svg>
);

function Workspaces() {
  const navigate = useNavigate();

  // Mock data - replace with actual API data
  const [workspacesData, setWorkspacesData] = useState([
    {
      id: 1,
      name: 'Sedres Chandling WorkSpace',
      boards: [
        { id: 1, name: 'CHANDLING OPERATIONS', count: 6 },
        { id: 2, name: 'FROZEN', count: 1285 },
        { id: 3, name: 'LOGISTICS', count: 11 },
        { id: 4, name: 'DRY AND CABIN ITEMS', count: 359 },
        { id: 5, name: 'DN', count: 324 },
        { id: 6, name: 'CHILLER', count: 1213 },
      ],
    },
    {
      id: 2,
      name: 'New Offshore Marine Logistics',
      boards: [{ id: 1, name: 'Centralized DA DESK', count: 6 },
      { id: 2, name: 'Jubail Operations', count: 1285 },
      { id: 3, name: 'Rastanura/ Dammam Operations', count: 11 },],
    },
    {
      id: 3,
      name: 'Limousine',
      boards: [
        { id: 2, name: 'Coordinator Transport', count: 1285 },
      ],
    },
  ]);

  // Find the first workspace with boards to set as initially expanded
  const firstWorkspaceWithBoards = workspacesData.find((workspace) => workspace.boards.length > 0);
  const initialSelectedWorkspace = firstWorkspaceWithBoards ? firstWorkspaceWithBoards.id : null;

  const [filterValue, setFilterValue] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState(initialSelectedWorkspace);
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [selectedWorkspaceForBoard, setSelectedWorkspaceForBoard] = useState(null);
  const [showArchivedWorkspacesModal, setShowArchivedWorkspacesModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [openWorkspaceMenuId, setOpenWorkspaceMenuId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showRenameWorkspaceModal, setShowRenameWorkspaceModal] = useState(false);
  const [selectedBoardForRename, setSelectedBoardForRename] = useState(null);
  const [selectedWorkspaceForRename, setSelectedWorkspaceForRename] = useState(null);
  const menuRef = useRef(null);
  const workspaceMenuRef = useRef(null);

  const filteredWorkspaces = workspacesData.filter((workspace) =>
    workspace.name.toLowerCase().includes(filterValue.toLowerCase())
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      if (workspaceMenuRef.current && !workspaceMenuRef.current.contains(event.target)) {
        setOpenWorkspaceMenuId(null);
      }
    };

    if (openMenuId || openWorkspaceMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId, openWorkspaceMenuId]);

  const handleWorkspaceClick = (workspace) => {
    if (workspace.boards.length > 0) {
      setSelectedWorkspace(selectedWorkspace === workspace.id ? null : workspace.id);
    }
  };

  const handleAddWorkspace = () => {
    setShowNewWorkspaceModal(true);
  };

  const handleSaveWorkspace = (workspaceData) => {
    // TODO: Implement save workspace functionality
    console.log('Save workspace:', workspaceData);
    // Here you would typically make an API call to save the workspace
  };

  const handleDeleteWorkspace = () => {
    setShowArchivedWorkspacesModal(true);
  };

  const handleAddBoard = (workspaceId) => {
    setSelectedWorkspaceForBoard(workspaceId);
    setShowAddBoardModal(true);
  };

  const handleSaveBoard = (boardData) => {
    // TODO: Implement save board functionality
    console.log('Save board:', boardData);
    // Here you would typically make an API call to save the board
  };

  const handleWorkspaceMenu = (workspaceId, e) => {
    e.stopPropagation();
    setOpenWorkspaceMenuId(openWorkspaceMenuId === workspaceId ? null : workspaceId);
  };

  const handleRenameWorkspace = (workspaceId) => {
    const workspace = workspacesData.find((w) => w.id === workspaceId);
    if (workspace) {
      setSelectedWorkspaceForRename(workspace);
      setShowRenameWorkspaceModal(true);
      setOpenWorkspaceMenuId(null);
    }
  };

  const handleSaveRenameWorkspace = (workspaceId, newName) => {
    setWorkspacesData((prev) =>
      prev.map((workspace) => (workspace.id === workspaceId ? { ...workspace, name: newName } : workspace))
    );
    setShowRenameWorkspaceModal(false);
    setSelectedWorkspaceForRename(null);
    // TODO: Make API call to update workspace name
    console.log('Renamed workspace:', workspaceId, 'to:', newName);
  };

  const handleAddToDashboard = (workspaceId) => {
    setOpenWorkspaceMenuId(null);
    // TODO: Implement add to dashboard functionality
    console.log('Add to dashboard:', workspaceId);
  };

  const handleArchiveWorkspace = (workspaceId) => {
    setOpenWorkspaceMenuId(null);
    // TODO: Implement archive workspace functionality
    console.log('Archive workspace:', workspaceId);
  };

  const handleBoardMenu = (boardId, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === boardId ? null : boardId);
  };

  const handleRenameBoard = (boardId) => {
    // Find the board to rename
    let foundBoard = null;
    for (const workspace of workspacesData) {
      const board = workspace.boards.find((b) => b.id === boardId);
      if (board) {
        foundBoard = { ...board, workspaceId: workspace.id };
        break;
      }
    }

    if (foundBoard) {
      setSelectedBoardForRename(foundBoard);
      setShowRenameModal(true);
      setOpenMenuId(null);
    }
  };

  const handleSaveRename = (boardId, newName) => {
    setWorkspacesData((prev) =>
      prev.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId ? { ...board, name: newName } : board
        ),
      }))
    );
    setShowRenameModal(false);
    setSelectedBoardForRename(null);
    // TODO: Make API call to update board name
    console.log('Renamed board:', boardId, 'to:', newName);
  };

  const handleEditWorkflows = (boardId) => {
    setOpenMenuId(null);
    navigate(`/edit-workflow?boardId=${boardId}`);
  };

  const handleArchiveBoard = (boardId) => {
    setOpenMenuId(null);
    // TODO: Implement archive functionality
    console.log('Archive board:', boardId);
    // You can add confirmation modal here if needed
  };

  return (
    <div className="workspaces-container">
      {/* Header Section */}
      <div className="workspaces-header">
        <div className="workspaces-header-left">
          <h1 className="workspaces-title">My workspaces</h1>
          <div className="workspaces-header-actions">
            <button
              type="button"
              className="workspaces-btn workspaces-btn-add"
              onClick={handleAddWorkspace}
              aria-label="Add workspace"
              title="Add new workspace"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className="workspaces-btn workspaces-btn-delete"
              onClick={handleDeleteWorkspace}
              aria-label="Delete workspace"
              title="Delete workspace"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 4H14M6 4V3C6 2.44772 6.44772 2 7 2H9C9.55228 2 10 2.44772 10 3V4M13 4V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V4H13Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="workspaces-header-right">
          <div className="workspaces-filter">
            <img src={filterIcon} alt="Filter" className="workspaces-filter-icon" />
            <input
              type="text"
              placeholder="Filter workspaces..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="workspaces-filter-input"
            />
            {filterValue && (
              <button
                type="button"
                className="workspaces-filter-clear-btn"
                onClick={() => setFilterValue('')}
                aria-label="Clear filter"
                title="Clear filter"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
            <button type="button" className="workspaces-filter-list-btn" aria-label="List view" title="List view">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 4H14M2 8H14M2 12H14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Workspaces List */}
      <div className="workspaces-list">
        {filteredWorkspaces.length === 0 ? (
          <div className="workspaces-empty-state">
            <div className="workspaces-empty-icon">
              <img src={GroupIcon} alt="No workspaces" />
            </div>
            <h3 className="workspaces-empty-title">No workspaces found</h3>
            <p className="workspaces-empty-message">
              {filterValue
                ? 'Try adjusting your filter to see more results.'
                : 'Get started by creating your first workspace.'}
            </p>
            {!filterValue && (
              <button
                type="button"
                className="workspaces-empty-btn"
                onClick={handleAddWorkspace}
              >
                Create Workspace
              </button>
            )}
          </div>
        ) : (
          filteredWorkspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`workspace-card ${selectedWorkspace === workspace.id ? 'expanded' : ''} ${workspace.boards.length === 0 ? 'no-boards' : ''} ${openWorkspaceMenuId === workspace.id ? 'menu-open' : ''}`}
              onClick={() => handleWorkspaceClick(workspace)}
            >
              <div className="workspace-card-header">
                <div className="workspace-card-title">
                  <div className="workspace-icon-wrapper">
                    <WorkspaceBarChartIcon className="workspace-icon" />
                  </div>
                  <h2 className="workspace-name">{workspace.name}</h2>
                  {workspace.boards.length > 0 && (
                    <span className="workspace-board-count-badge">
                      {workspace.boards.length} {workspace.boards.length === 1 ? 'board' : 'boards'}
                    </span>
                  )}
                </div>
                {workspace.boards.length > 0 && (
                  <div className="workspace-card-actions">
                    <button
                      type="button"
                      className="workspace-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBoard(workspace.id);
                      }}
                      aria-label="Add board"
                      title="Add board"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M8 3V13M3 8H13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <div className="workspace-menu-wrapper" ref={openWorkspaceMenuId === workspace.id ? workspaceMenuRef : null}>
                      <button
                        type="button"
                        className="workspace-action-btn"
                        onClick={(e) => handleWorkspaceMenu(workspace.id, e)}
                        aria-label="More options"
                        title="More options"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="8" cy="4" r="1.5" fill="currentColor" />
                          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                          <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                        </svg>
                      </button>
                      {openWorkspaceMenuId === workspace.id && (
                        <div className="workspace-context-menu">
                          <button
                            type="button"
                            className="workspace-context-menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameWorkspace(workspace.id);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M11.3333 2.00001C11.5084 1.82497 11.7163 1.68606 11.9455 1.59127C12.1748 1.49648 12.4209 1.44775 12.6667 1.44775C12.9124 1.44775 13.1585 1.49648 13.3878 1.59127C13.617 1.68606 13.8249 1.82497 14 2.00001C14.175 2.17505 14.3139 2.38297 14.4087 2.61224C14.5035 2.8415 14.5522 3.08755 14.5522 3.33334C14.5522 3.57913 14.5035 3.82518 14.4087 4.05445C14.3139 4.28371 14.175 4.49164 14 4.66667L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Rename</span>
                          </button>
                          <button
                            type="button"
                            className="workspace-context-menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToDashboard(workspace.id);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M2 2H6V6H2V2Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 2H14V6H10V2Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M2 10H6V14H2V10Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M10 10H14V14H10V10Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Add to Dashboard</span>
                          </button>
                          <button
                            type="button"
                            className="workspace-context-menu-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveWorkspace(workspace.id);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M2 4H14M6 4V3C6 2.44772 6.44772 2 7 2H9C9.55228 2 10 2.44772 10 3V4M13 4V13C13 13.5523 12.5523 14 12 14H4C3.44772 14 3 13.5523 3 13V4H13Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M8 8V12M8 8L6 10M8 8L10 10"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>Archive</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Boards Grid - shown when expanded */}
              {selectedWorkspace === workspace.id && workspace.boards.length > 0 && (
                <div className="workspace-boards">
                  {workspace.boards.map((board) => (
                    <div key={board.id} className={`board-card ${openMenuId === board.id ? 'menu-open' : ''}`}>
                      <div className="board-card-header">
                        <div className="board-menu-wrapper" ref={openMenuId === board.id ? menuRef : null}>
                          <button
                            type="button"
                            className="board-menu-btn"
                            onClick={(e) => handleBoardMenu(board.id, e)}
                            aria-label="Board options"
                            title="Board options"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="8" cy="4" r="1.5" fill="currentColor" />
                              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                              <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                            </svg>
                          </button>
                          {openMenuId === board.id && (
                            <div className="board-context-menu">
                              <button
                                type="button"
                                className="board-context-menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameBoard(board.id);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    d="M11.3333 2.00001C11.5084 1.82497 11.7163 1.68606 11.9455 1.59127C12.1748 1.49648 12.4209 1.44775 12.6667 1.44775C12.9124 1.44775 13.1585 1.49648 13.3878 1.59127C13.617 1.68606 13.8249 1.82497 14 2.00001C14.175 2.17505 14.3139 2.38297 14.4087 2.61224C14.5035 2.8415 14.5522 3.08755 14.5522 3.33334C14.5522 3.57913 14.5035 3.82518 14.4087 4.05445C14.3139 4.28371 14.175 4.49164 14 4.66667L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span>Rename</span>
                              </button>
                              <button
                                type="button"
                                className="board-context-menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditWorkflows(board.id);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    d="M2 2H6V6H2V2Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M10 2H14V6H10V2Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M2 10H6V14H2V10Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M10 10H14V14H10V10Z"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span>Edit Workflows</span>
                              </button>
                              <button
                                type="button"
                                className="board-context-menu-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveBoard(board.id);
                                }}
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    d="M2.66667 4H13.3333M6.66667 7.33334V11.3333M9.33333 7.33334V11.3333M3.33334 4L4 13.3333C4 13.687 4.14048 14.0261 4.39052 14.2762C4.64057 14.5262 4.97971 14.6667 5.33334 14.6667H10.6667C11.0203 14.6667 11.3594 14.5262 11.6095 14.2762C11.8595 14.0261 12 13.687 12 13.3333L12.6667 4M6.66667 4V2.66667C6.66667 2.48986 6.73691 2.32029 6.86193 2.19526C6.98696 2.07024 7.15653 2 7.33334 2H8.66667C8.84348 2 9.01305 2.07024 9.13807 2.19526C9.2631 2.32029 9.33334 2.48986 9.33334 2.66667V4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span>Archive</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="board-card-content">
                        <h3
                          className="board-name"
                          data-tooltip-id={`board-name-${board.id}`}
                          data-tooltip-content={board.name}
                        >
                          {board.name}
                        </h3>
                        <Tooltip id={`board-name-${board.id}`} place="top" />

                        <div className="board-counts-row">
                          <div
                            className="board-count"
                            data-tooltip-id={`board-count-${board.id}`}
                            data-tooltip-content={`Card Count: ${board.count.toLocaleString()} cards`}
                          >
                            <img src={ClockIcon} alt="Clock" className="board-clock-icon" />
                            <span className="board-count-number">{board.count.toLocaleString()}</span>
                          </div>
                          <Tooltip id={`board-count-${board.id}`} place="top" />

                          {/* Board ID Icon with Count */}
                          <div
                            className="board-id-count"
                            data-tooltip-id={`board-id-${board.id}`}
                            data-tooltip-content={`Board ID: ${board.id}`}
                          >
                            <FiLayers className="board-id-icon" />
                            <span className="board-id-number">{board.id}</span>
                          </div>
                          <Tooltip id={`board-id-${board.id}`} place="top" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Workspace Modal */}
      <NewWorkspaceModal
        show={showNewWorkspaceModal}
        onClose={() => setShowNewWorkspaceModal(false)}
        onSave={handleSaveWorkspace}
      />

      {/* Add Board Modal */}
      <AddBoardModal
        show={showAddBoardModal}
        onClose={() => setShowAddBoardModal(false)}
        onSave={handleSaveBoard}
        workspaceId={selectedWorkspaceForBoard}
      />

      {/* Archived Workspaces Modal */}
      <ArchivedWorkspacesModal
        show={showArchivedWorkspacesModal}
        onClose={() => setShowArchivedWorkspacesModal(false)}
      />

      {/* Rename Board Modal */}
      {selectedBoardForRename && (
        <RenameBoardModal
          show={showRenameModal}
          onClose={() => {
            setShowRenameModal(false);
            setSelectedBoardForRename(null);
          }}
          onSave={(newName) => handleSaveRename(selectedBoardForRename.id, newName)}
          currentName={selectedBoardForRename.name}
        />
      )}

      {/* Rename Workspace Modal */}
      {selectedWorkspaceForRename && (
        <RenameWorkspaceModal
          show={showRenameWorkspaceModal}
          onClose={() => {
            setShowRenameWorkspaceModal(false);
            setSelectedWorkspaceForRename(null);
          }}
          onSave={(newName) => handleSaveRenameWorkspace(selectedWorkspaceForRename.id, newName)}
          currentName={selectedWorkspaceForRename.name}
        />
      )}
    </div>
  );
}

export default Workspaces;

