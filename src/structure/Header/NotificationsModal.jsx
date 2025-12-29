import { useState } from 'react';
import CustomModal from '../../components/CustomModal';
import CustomTable from '../../components/customTable';
import { FiTrash2 } from 'react-icons/fi';
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
      cell: (props) => (
        <span
          style={{ color: '#00368c', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => console.log('Navigate to workspace:', props.row.workspace)}
        >
          {props.row.workspace}
        </span>
      ),
    },
    {
      name: 'BOARD',
      selector: 'board',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content clickable',
      thclass: 'tb-head',
      width: '150',
      cell: (props) => (
        <span
          style={{ color: '#00368c', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => console.log('Navigate to board:', props.row.board)}
        >
          {props.row.board}
        </span>
      ),
    },
    {
      name: 'TITLE',
      selector: 'title',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
    },
    {
      name: 'NOTIFICATION',
      selector: 'notification',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
    },
    {
      name: 'DETAILS',
      selector: 'details',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '250',
    },
    {
      name: 'AUTHOR',
      selector: 'author',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '150',
      cell: (props) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#00368c',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '600',
            }}
          >
            {getUserInitial(props.row.author)}
          </span>
          <span>{props.row.author}</span>
        </div>
      ),
    },
    {
      name: 'DATE',
      selector: 'date',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '180',
    },
    {
      name: 'EVENT',
      selector: 'event',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '200',
    },
    {
      name: 'OWNER',
      selector: 'owner',
      tableClasses: 'table-striped',
      sort: true,
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '120',
    },
    {
      name: 'ACTION',
      selector: 'action',
      tableClasses: 'table-striped',
      contentClass: 'table-content',
      thclass: 'tb-head',
      width: '100',
      notView: true,
    },
  ];

  const renderBody = () => (
    <div className="notifications-modal-body">
      {/* Filter Section */}
      <div className="notifications-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Date from</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Date to</label>
            <input
              type="date"
              className="form-control"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
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
          pagination={{ currentPage: params?.page, limit: params?.limit }}
          tableClasses="notifications-table"
          count={notifications.length}
          columns={cols}
          data={notifications ?? []}
          onPageChange={(currentPage) => setParams({ ...params, page: currentPage })}
          setLimit={(newlimit) => setParams({ ...params, limit: newlimit })}
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

      {/* Footer with Export */}
      <div className="notifications-footer">
        <div className="footer-left">
          <span>
            {notifications.length} Results found. Results per page
          </span>
          <select
            className="form-control results-per-page"
            value={params.limit}
            onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) })}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
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
        </div>
      }
      body={renderBody()}
    />
  );
}

export default NotificationsModal;

