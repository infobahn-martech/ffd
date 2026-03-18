import { useState, useEffect } from 'react';
import CustomModal from '../../components/CustomModal';
import useWorkSpaceReducer from '../../store/WorkSpaceReducer';
import '../../design/scss/Workspaces.scss';

// Map API response (snake_case) to UI shape
// workspace_id: from API or fallback to archive_log_id if backend uses it for unarchive lookup
const mapArchiveLogItem = (row) => ({
  id: row.archive_log_id,
  board_id: row.board_id ?? row.boardId ?? row.archive_log_id,
  workspace_id: row.workspace_id ?? row.workspaceId ?? row.archive_log_id,
  workspace: row.workspace_name ?? '',
  board: row.board_name ?? '',
  archivedBy: row.archive_by ?? '',
  archivedByAvatar: (row.archive_by ?? '').charAt(0).toUpperCase() || '?',
  archivedAt: row.archived_at ?? '',
});

const ArchivedWorkspacesModal = ({ show, onClose }) => {
  const [filterValue, setFilterValue] = useState('');
  const {
    archiveLog,
    archiveLogLoading,
    fetchWorkspaceArchiveLog,
    unarchiveWorkspace,
    addEditLoader,
  } = useWorkSpaceReducer();

  const archivedItems = (archiveLog || []).map(mapArchiveLogItem);
  const filteredItems = archivedItems.filter(
    (item) =>
      item.workspace.toLowerCase().includes(filterValue.toLowerCase()) ||
      item.board.toLowerCase().includes(filterValue.toLowerCase())
  );
  console.log("archiveLog", archiveLog);
  useEffect(() => {
    if (show) fetchWorkspaceArchiveLog();
  }, [show, fetchWorkspaceArchiveLog]);

  const handleUnarchive = (id) => {
    if (id == null || id === '') return;
    unarchiveWorkspace({
      board_id: id,
      cb: () => { onClose(); fetchWorkspaceArchiveLog() },
    });
  };

  // const handleDelete = (id) => {
  //   // TODO: Implement delete functionality when API is available
  //   console.log('Delete item:', id);
  // };

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
                  <th className="archived-workspaces-th-actions">Action</th>
                </tr>
              </thead>
              <tbody>
                {archiveLogLoading ? (
                  <tr>
                    <td colSpan="5" className="archived-workspaces-empty">
                      Loading...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
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
                        <span className="archived-workspaces-board-link">
                          {item.board}
                        </span>
                      </td>
                      <td className="archived-workspaces-td-archived-by">
                        <div className="archived-workspaces-user-info">
                          <div className="archived-workspaces-avatar">{item.archivedByAvatar}</div>
                          <span>{item.archivedBy}</span>
                        </div>
                      </td>
                      <td className="archived-workspaces-td-archived-at">{item.archivedAt}</td>
                      <td className="archived-workspaces-td-actions">
                        <div className="archived-workspaces-actions-group">
                          <button
                            type="button"
                            className="archived-workspaces-action-btn"
                            aria-label="Unarchive"
                            title="Unarchive"
                            disabled={addEditLoader}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleUnarchive(item.board_id);
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path
                                d="M8 2V8M8 8L5 5M8 8L11 5M2 10V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V10"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          {/* <button
                            type="button"
                            className="archived-workspaces-action-btn archived-workspaces-action-btn-delete"
                            aria-label="Delete"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
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
                            </svg>
                          </button> */}
                        </div>
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

