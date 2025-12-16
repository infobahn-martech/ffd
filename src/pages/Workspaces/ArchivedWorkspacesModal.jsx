import { useState } from 'react';
import CustomModal from '../../components/CustomModal';
import '../../design/scss/Workspaces.scss';

const ArchivedWorkspacesModal = ({ show, onClose }) => {
  const [filterValue, setFilterValue] = useState('');

  // Mock archived data - replace with actual API data
  const archivedItems = [
    {
      id: 1,
      workspace: 'Team Workspace',
      board: 'Board name Team Workspace',
      archivedBy: 'I Infobahn',
      archivedAt: '2025-12-16',
      archivedByAvatar: 'I',
    },
    {
      id: 2,
      workspace: 'Team Boards',
      board: 'sdfsd',
      archivedBy: 'I Infobahn',
      archivedAt: '2025-12-16',
      archivedByAvatar: 'I',
    },
    {
      id: 3,
      workspace: 'Team Boards',
      board: 'Team B',
      archivedBy: 'I Infobahn',
      archivedAt: '2025-12-15',
      archivedByAvatar: 'I',
    },
    {
      id: 4,
      workspace: 'Team Boards',
      board: 'Team A',
      archivedBy: 'I Infobahn',
      archivedAt: '2025-12-15',
      archivedByAvatar: 'I',
    },
    {
      id: 5,
      workspace: 'Management Boards',
      board: 'Strategic Objectives',
      archivedBy: 'I Infobahn',
      archivedAt: '2025-12-15',
      archivedByAvatar: 'I',
    },
  ];

  const filteredItems = archivedItems.filter(
    (item) =>
      item.workspace.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.board.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <CustomModal
      show={show}
      closeModal={onClose}
      className="archived-workspaces-modal"
      dialgName="archived-workspaces-modal-dialog"
      createModal={false}
      body={
        <div className="archived-workspaces-modal-content">
          {/* Header */}
          <div className="archived-workspaces-modal-header">
            <h2 className="archived-workspaces-modal-title">Archived workspaces and boards</h2>
            <button
              type="button"
              className="archived-workspaces-modal-close"
              onClick={onClose}
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
          <div className="archived-workspaces-filter-section">
            <div className="archived-workspaces-filter-wrapper">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="archived-workspaces-filter-icon"
              >
                <path
                  d="M8 2C10.2091 2 12 3.79086 12 6C12 7.23836 11.4368 8.37664 10.5 9.20703M8 2C5.79086 2 4 3.79086 4 6C4 7.23836 4.56318 8.37664 5.5 9.20703M8 2V1M10.5 9.20703L11.5 10.207M10.5 9.20703C10.7761 9.43164 11 9.73164 11 10.207V15.5C11 15.7761 10.7761 16 10.5 16H5.5C5.22386 16 5 15.7761 5 15.5V10.207C5 9.73164 5.22386 9.43164 5.5 9.20703M5.5 9.20703L4.5 10.207"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                className="archived-workspaces-filter-input"
                placeholder="Filter"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
              {filterValue && (
                <button
                  type="button"
                  className="archived-workspaces-filter-clear"
                  onClick={() => setFilterValue('')}
                  aria-label="Clear filter"
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
            </div>
          </div>

          {/* Table Section */}
          <div className="archived-workspaces-table-wrapper">
            <table className="archived-workspaces-table">
              <thead>
                <tr>
                  <th className="archived-workspaces-th-workspace">Workspace</th>
                  <th className="archived-workspaces-th-board">Board</th>
                  <th className="archived-workspaces-th-archived-by">Archived by</th>
                  <th className="archived-workspaces-th-archived-at">Archived at</th>
                  <th className="archived-workspaces-th-actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="archived-workspaces-empty">
                      No archived items found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="archived-workspaces-row">
                      <td className="archived-workspaces-td-workspace">{item.workspace}</td>
                      <td className="archived-workspaces-td-board">
                        <a href="#" className="archived-workspaces-board-link">
                          {item.board}
                        </a>
                      </td>
                      <td className="archived-workspaces-td-archived-by">
                        <div className="archived-workspaces-user-info">
                          <div className="archived-workspaces-avatar">{item.archivedByAvatar}</div>
                          <span>{item.archivedBy}</span>
                        </div>
                      </td>
                      <td className="archived-workspaces-td-archived-at">{item.archivedAt}</td>
                      <td className="archived-workspaces-td-actions">
                        <button
                          type="button"
                          className="archived-workspaces-action-btn"
                          aria-label="More options"
                          title="More options"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="4" r="1.5" fill="currentColor" />
                            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                            <circle cx="8" cy="12" r="1.5" fill="currentColor" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      }
    />
  );
};

export default ArchivedWorkspacesModal;

