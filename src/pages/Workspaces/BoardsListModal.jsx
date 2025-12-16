import React, { useState } from 'react';
import CustomModal from '../../components/CustomModal';
import '../../design/scss/Workspaces.scss';

const BoardsListModal = ({ show, onClose, onSelect }) => {
  const [filterType, setFilterType] = useState('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedBoards, setSelectedBoards] = useState([]);

  // Mock data - replace with actual API data
  const boardsData = [
    {
      workspace: 'My Workspaces',
      boards: [
        {
          id: 1,
          name: 'Board',
          workflow: 'Initiatives workflow',
        },
        {
          id: 2,
          name: 'Team Workspace',
          workflow: '',
        },
      ],
    },
    {
      workspace: 'Engineering',
      boards: [
        {
          id: 3,
          name: 'Development Board',
          workflow: 'Development workflow',
        },
        {
          id: 4,
          name: 'QA Board',
          workflow: 'Testing workflow',
        },
      ],
    },
  ];

  const handleToggleBoard = (boardId) => {
    setSelectedBoards((prev) => {
      if (prev.includes(boardId)) {
        return prev.filter((id) => id !== boardId);
      }
      return [...prev, boardId];
    });
  };

  const handleSelect = () => {
    if (onSelect) {
      const selected = boardsData
        .flatMap((ws) => ws.boards)
        .filter((board) => selectedBoards.includes(board.id));
      onSelect(selected);
    }
    handleClose();
  };

  const handleClose = () => {
    setSearchFilter('');
    setFilterType('All');
    setSelectedBoards([]);
    onClose();
  };

  const filteredBoards = boardsData.map((workspace) => ({
    ...workspace,
    boards: workspace.boards.filter(
      (board) =>
        board.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        board.workflow.toLowerCase().includes(searchFilter.toLowerCase())
    ),
  })).filter((workspace) => workspace.boards.length > 0);

  return (
    <CustomModal
      show={show}
      closeModal={handleClose}
      className="boards-list-modal"
      dialgName="boards-list-modal-dialog"
      createModal={false}
      body={
        <div className="boards-list-modal-content">
          {/* Header */}
          <div className="boards-list-modal-header">
            <h2 className="boards-list-modal-title">Boards List</h2>
            <button
              type="button"
              className="boards-list-modal-close"
              onClick={handleClose}
              aria-label="Close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Filter Section */}
          <div className="boards-list-filter-section">
            <div className="boards-list-filter-dropdown">
              <button
                type="button"
                className="boards-list-filter-btn"
                onClick={() => {
                  // TODO: Implement dropdown toggle
                  console.log('Filter dropdown');
                }}
              >
                {filterType}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="boards-list-filter-input-wrapper">
              <input
                type="text"
                className="boards-list-filter-input"
                placeholder="Filter"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Boards List */}
          <div className="boards-list-table-wrapper">
            <table className="boards-list-table">
              <thead>
                <tr>
                  <th className="boards-list-th-name">NAME</th>
                  <th className="boards-list-th-workflow">WORKFLOW</th>
                </tr>
              </thead>
              <tbody>
                {filteredBoards.map((workspace) => (
                  <React.Fragment key={workspace.workspace}>
                    <tr className="boards-list-workspace-row">
                      <td colSpan="2" className="boards-list-workspace-name">
                        {workspace.workspace}
                      </td>
                    </tr>
                    {workspace.boards.map((board) => (
                      <tr key={board.id} className="boards-list-board-row">
                        <td className="boards-list-board-name">
                          <label className="boards-list-checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedBoards.includes(board.id)}
                              onChange={() => handleToggleBoard(board.id)}
                              className="boards-list-checkbox"
                            />
                            <span className="boards-list-board-name-text">{board.name}</span>
                            <button
                              type="button"
                              className="boards-list-external-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement external link
                                console.log('External link:', board.id);
                              }}
                              aria-label="Open in new tab"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M6 3H3C2.44772 3 2 3.44772 2 4V13C2 13.5523 2.44772 14 3 14H12C12.5523 14 13 13.5523 13 13V10M10 2H14M14 2V6M14 2L6 10"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </label>
                        </td>
                        <td className="boards-list-workflow">
                          {board.workflow || '-'}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Button */}
          <div className="boards-list-actions">
            <button
              type="button"
              className="boards-list-select-btn"
              onClick={handleSelect}
              disabled={selectedBoards.length === 0}
            >
              Select
            </button>
          </div>
        </div>
      }
    />
  );
};

export default BoardsListModal;

