import { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import '../../../design/scss/dashboards-modal.scss';

const DashboardsModal = ({ show, onClose }) => {
  const [searchValue, setSearchValue] = useState('');
  const [dashboards] = useState([
    { id: 1, name: 'Operations Dashboard', dashboardId: 5, users: 12, teams: 3, workspaces: 2, widgets: 15 },
    { id: 2, name: 'Analytics Dashboard', dashboardId: 3, users: 8, teams: 2, workspaces: 1, widgets: 10 },
    { id: 3, name: 'Performance Dashboard', dashboardId: 7, users: 20, teams: 5, workspaces: 3, widgets: 22 },
    { id: 4, name: 'Team Dashboard', dashboardId: 2, users: 5, teams: 1, workspaces: 1, widgets: 8 },
  ]);

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="dashboards-modal"
      centered
      size="xl"
    >
      <Modal.Header className="dashboards-modal-header">
        <Modal.Title className="dashboards-modal-title">Dashboards</Modal.Title>
        <button
          type="button"
          className="dashboards-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="dashboards-modal-body">
        {/* Search Section */}
        <div className="dashboards-search-section">
          <div className="dashboards-search-wrapper">
            <FiSearch className="dashboards-search-icon" />
            <input
              type="text"
              className="dashboards-search-input"
              placeholder="Search dashboards..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="dashboards-table-wrapper">
          <table className="dashboards-table">
            <thead>
              <tr>
                <th className="dashboards-th-name">Name</th>
                <th className="dashboards-th-dashboard-id">Dashboard ID</th>
                <th className="dashboards-th-users">Users</th>
                <th className="dashboards-th-teams">Teams</th>
                <th className="dashboards-th-workspaces">Workspaces</th>
                <th className="dashboards-th-widgets">Widgets</th>
              </tr>
            </thead>
            <tbody>
              {filteredDashboards.length > 0 ? (
                filteredDashboards.map(dashboard => (
                  <tr key={dashboard.id} className="dashboards-table-row">
                    <td className="dashboards-td-name">{dashboard.name}</td>
                    <td className="dashboards-td-dashboard-id">{dashboard.dashboardId}</td>
                    <td className="dashboards-td-users">{dashboard.users}</td>
                    <td className="dashboards-td-teams">{dashboard.teams}</td>
                    <td className="dashboards-td-workspaces">{dashboard.workspaces}</td>
                    <td className="dashboards-td-widgets">{dashboard.widgets}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="dashboards-empty-state">
                    No dashboards found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default DashboardsModal;

