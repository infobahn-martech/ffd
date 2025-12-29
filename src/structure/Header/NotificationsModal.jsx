import { useState, useMemo } from 'react';
import CustomModal from '../../components/CustomModal';
import CustomTable from '../../components/customTable';
import { Tooltip } from 'react-tooltip';
import { FiTrash2, FiCalendar, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../../design/scss/common.scss';
import './NotificationsModal.scss';

// Dummy data for notifications
const initialNotifications = [
  {
    _id: '1',
    cardId: 96,
    workspace: 'Test two',
    board: 'Board Name 1',
    title: 'fghhfgh',
    notification: 'Transitions',
    details: "From 'Requested' to 'In Progress'",
    author: 'Infobahn',
    date: '2025-12-29 08:03:55',
    event: 'Task moved to In Progress',
    owner: 'None',
  },
  {
    _id: '2',
    cardId: 92,
    workspace: 'Test two',
    board: 'Board Name 1',
    title: 'dfth',
    notification: 'Transitions',
    details: "From 'In Progress' to 'Requested'",
    author: 'Infobahn',
    date: '2025-12-29 08:02:30',
    event: 'Card moved',
    owner: 'Infobahn',
  },
  {
    _id: '3',
    cardId: 91,
    workspace: 'Test two',
    board: 'Board Name 1',
    title: 'TEST',
    notification: 'Transitions',
    details: "From 'In Progress' to 'Done'",
    author: 'Infobahn',
    date: '2025-12-29 08:01:15',
    event: 'Card moved',
    owner: 'None',
  },
];

function NotificationsModal({ show, onClose }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filters, setFilters] = useState({
    dateFrom: '2025-12-28',
    dateTo: '',
    author: 'All',
    boardName: 'All',
    notificationType: 'All',
    onlyMySubscriptions: false,
  });

  const [params, setParams] = useState({
    page: 1,
    total: notifications.length,
    limit: 100,
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearBoardFilter = () => {
    setFilters((prev) => ({
      ...prev,
      boardName: 'All',
    }));
  };

  const handleSearch = () => {
    // Implement search logic here
    console.log('Searching with filters:', filters);
  };

  const handleExport = () => {
    // Implement export logic here
    console.log('Exporting to Excel');
  };

  const getUserInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'I';
  };

  // Helper component for truncated text with tooltip
  const TruncatedCell = ({ text, maxLength = 30, tooltipId }) => {
    if (!text) return <span>-</span>;
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? text.substring(0, maxLength) + '...' : text;

    return (
      <>
        <span
          data-tooltip-id={isTruncated ? tooltipId : undefined}
          data-tooltip-content={isTruncated ? text : undefined}
          className="truncated-cell-text"
        >
          {displayText}
        </span>
        {isTruncated && <Tooltip id={tooltipId} place="top" />}
      </>
    );
  };

  // Calculate paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    return notifications.slice(startIndex, endIndex);
  }, [notifications, params.page, params.limit]);

  const totalPages = Math.ceil(notifications.length / params.limit);

  const cols = [
    {
      name: 'CARD ID',
      selector: 'cardId',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      sort: true,
      thclass: 'tb-head',
      width: '100',
    },
    {
      name: 'WORKSPACE',
      selector: 'workspace',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content clickable',
      thclass: 'tb-head',
      width: '150',
      cell: (props) => {
        const tooltipId = `workspace-${props.row._id}`;
        return (
          <>
            <span
              className="truncated-cell-text clickable-link"
              data-tooltip-id={tooltipId}
              data-tooltip-content={props.row.workspace}
              onClick={() => console.log('Navigate to workspace:', props.row.workspace)}
            >
              {props.row.workspace}
            </span>
            <Tooltip id={tooltipId} place="top" />
          </>
        );
      },
    },
    {
      name: 'BOARD',
      selector: 'board',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content clickable',
      thclass: 'tb-head',
      width: '150',
      cell: (props) => {
        const tooltipId = `board-${props.row._id}`;
        return (
          <>
            <span
              className="truncated-cell-text clickable-link"
              data-tooltip-id={tooltipId}
              data-tooltip-content={props.row.board}
              onClick={() => console.log('Navigate to board:', props.row.board)}
            >
              {props.row.board}
            </span>
            <Tooltip id={tooltipId} place="top" />
          </>
        );
      },
    },
    {
      name: 'TITLE',
      selector: 'title',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
      cell: (props) => (
        <TruncatedCell text={props.row.title} maxLength={20} tooltipId={`title-${props.row._id}`} />
      ),
    },
    {
      name: 'NOTIFICATION',
      selector: 'notification',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
      cell: (props) => (
        <TruncatedCell text={props.row.notification} maxLength={20} tooltipId={`notification-${props.row._id}`} />
      ),
    },
    {
      name: 'DETAILS',
      selector: 'details',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '250',
      cell: (props) => (
        <TruncatedCell text={props.row.details} maxLength={35} tooltipId={`details-${props.row._id}`} />
      ),
    },
    {
      name: 'AUTHOR',
      selector: 'author',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
      cell: (props) => {
        const tooltipId = `author-${props.row._id}`;
        return (
          <>
            <div className="author-cell" data-tooltip-id={tooltipId} data-tooltip-content={props.row.author}>
              <span className="author-icon">
                {getUserInitial(props.row.author)}
              </span>
              <span className="truncated-cell-text">{props.row.author}</span>
            </div>
            <Tooltip id={tooltipId} place="top" />
          </>
        );
      },
    },
    {
      name: 'DATE',
      selector: 'date',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '180',
      cell: (props) => (
        <span>{props.row.date || '-'}</span>
      ),
    },
    {
      name: 'EVENT',
      selector: 'event',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
      cell: (props) => (
        <TruncatedCell text={props.row.event} maxLength={25} tooltipId={`event-${props.row._id}`} />
      ),
    },
    {
      name: 'OWNER',
      selector: 'owner',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '120',
      cell: (props) => (
        <TruncatedCell text={props.row.owner} maxLength={15} tooltipId={`owner-${props.row._id}`} />
      ),
    },
  ];

  const renderBody = () => (
    <div className="notifications-modal-body">
      {/* Filter Section */}
      <div className="notifications-filters">
        <div className="filter-row">
          <div className="filter-group date-input-group">
            <label>Date from</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                className="form-control date-input"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
              <FiCalendar className="calendar-icon" />
            </div>
          </div>
          <div className="filter-group date-input-group">
            <label>Date to</label>
            <div className="date-input-wrapper">
              <input
                type="date"
                className="form-control date-input"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                placeholder="dd/mm/yyyy"
              />
              <FiCalendar className="calendar-icon" />
            </div>
          </div>
          <div className="filter-group">
            <label>Author</label>
            <select
              className="form-control"
              value={filters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
            >
              <option value="All">All</option>
              <option value="Infobahn">Infobahn</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Board name</label>
            <div style={{ position: 'relative' }}>
              <select
                className="form-control"
                value={filters.boardName}
                onChange={(e) => handleFilterChange('boardName', e.target.value)}
              >
                <option value="All">All</option>
                <option value="Board Name 1">Board Name 1</option>
              </select>
              {filters.boardName !== 'All' && (
                <button
                  type="button"
                  className="clear-filter-btn"
                  onClick={handleClearBoardFilter}
                  aria-label="Clear board filter"
                >
                  <FiTrash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="filter-group">
            <label>Notification type</label>
            <select
              className="form-control"
              value={filters.notificationType}
              onChange={(e) => handleFilterChange('notificationType', e.target.value)}
            >
              <option value="All">All</option>
              <option value="Transitions">Transitions</option>
            </select>
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-checkbox">
            <input
              type="checkbox"
              id="onlyMySubscriptions"
              checked={filters.onlyMySubscriptions}
              onChange={(e) => handleFilterChange('onlyMySubscriptions', e.target.checked)}
            />
            <label htmlFor="onlyMySubscriptions">Only my subscriptions</label>
          </div>
          <button className="btn btn-primary search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="notifications-table-wrapper">
        <CustomTable
          tableClasses="notifications-table"
          count={notifications.length}
          columns={cols}
          data={paginatedData ?? []}
          pagination={{ currentPage: 1, limit: paginatedData.length }}
          onSorting={(sortBy) => {
            setParams({
              ...params,
              sortBy,
              sortOrder: params?.sortOrder === -1 ? 1 : -1,
              page: 1,
            });
          }}
        />
      </div>

      {/* Footer with Pagination and Export */}
      <div className="notifications-footer">
        <div className="footer-left">
          <span className="results-info">
            Showing {((params.page - 1) * params.limit) + 1} to {Math.min(params.page * params.limit, notifications.length)} of {notifications.length} entries
          </span>
          <select
            className="form-control results-per-page"
            value={params.limit}
            onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value), page: 1 })}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="footer-center">
          {/* Custom Pagination */}
          <div className="custom-pagination">
            <button
              className="pagination-btn"
              onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
              disabled={params.page === 1}
              aria-label="Previous page"
            >
              <FiChevronLeft />
            </button>
            <span className="pagination-page-number">{params.page}</span>
            <button
              className="pagination-btn"
              onClick={() => setParams({ ...params, page: Math.min(totalPages, params.page + 1) })}
              disabled={params.page >= totalPages}
              aria-label="Next page"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
        <div className="footer-right">
          <select className="form-control export-format" defaultValue=".xlsx">
            <option value=".xlsx">.xlsx</option>
            <option value=".csv">.csv</option>
          </select>
          <button className="btn btn-primary export-btn" onClick={handleExport}>
            Download in Excel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <CustomModal
      className="modal fade show notifications-modal"
      dialgName="modal-dialog modal-dialog-centered modal-xl"
      createModal
      show={show}
      closeModal={onClose}
      header={
        <div className="modal-header">
          <h5 className="modal-title">All Activities</h5>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>
      }
      body={renderBody()}
    />
  );
}

export default NotificationsModal;

