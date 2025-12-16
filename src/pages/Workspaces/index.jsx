import { useState } from 'react';
import '../../design/scss/Workspaces.scss';
import GroupIcon from '../../assets/images/Group.svg';
import AnalyticsIcon from '../../assets/images/analytics 1.svg';
import ClockIcon from '../../assets/images/ClockIcon.svg';
import filterIcon from '../../assets/images/filter.svg';
import NewWorkspaceModal from './NewWorkspaceModal';
import AddBoardModal from './AddBoardModal';
import ArchivedWorkspacesModal from './ArchivedWorkspacesModal';

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
  // Mock data - replace with actual API data
  const workspaces = [
    {
      id: 1,
      name: 'SEDRES - CHANDLING - WORK SPACE',
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
      boards: [],
    },
    {
      id: 3,
      name: 'Limousine',
      boards: [],
    },
  ];

  // Find the first workspace with boards to set as initially expanded
  const firstWorkspaceWithBoards = workspaces.find((workspace) => workspace.boards.length > 0);
  const initialSelectedWorkspace = firstWorkspaceWithBoards ? firstWorkspaceWithBoards.id : null;

  const [filterValue, setFilterValue] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState(initialSelectedWorkspace);
  const [showNewWorkspaceModal, setShowNewWorkspaceModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [selectedWorkspaceForBoard, setSelectedWorkspaceForBoard] = useState(null);
  const [showArchivedWorkspacesModal, setShowArchivedWorkspacesModal] = useState(false);

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(filterValue.toLowerCase())
  );

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
    // TODO: Implement workspace menu functionality
    console.log('Workspace menu:', workspaceId);
  };

  const handleBoardMenu = (boardId, e) => {
    e.stopPropagation();
    // TODO: Implement board menu functionality
    console.log('Board menu:', boardId);
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
              className={`workspace-card ${selectedWorkspace === workspace.id ? 'expanded' : ''} ${workspace.boards.length === 0 ? 'no-boards' : ''
                }`}
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
                  </div>
                )}
              </div>

              {/* Boards Grid - shown when expanded */}
              {selectedWorkspace === workspace.id && workspace.boards.length > 0 && (
                <div className="workspace-boards">
                  {workspace.boards.map((board) => (
                    <div key={board.id} className="board-card">
                      <div className="board-card-header">
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
                      </div>
                      <div className="board-card-content">
                        <h3 className="board-name">{board.name}</h3>
                        <div className="board-count">
                          <img src={ClockIcon} alt="Clock" className="board-clock-icon" />
                          <span className="board-count-number">{board.count.toLocaleString()}</span>
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
    </div>
  );
}

export default Workspaces;

