import { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import '../../../design/scss/managers-modal.scss';

const ManagersModal = ({ show, onClose }) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [managers, setManagers] = useState([
    { id: 1, name: 'John Doe', username: 'johndoe', workspaceManager: true, workspace: 'Chandling WorkSpace' },
    { id: 2, name: 'Jane Smith', username: 'janesmith', workspaceManager: false, workspace: 'Chandling WorkSpace' },
    { id: 3, name: 'Bob Johnson', username: 'bobjohnson', workspaceManager: true, workspace: 'New Offshore Marine Logistics' },
    { id: 4, name: 'Alice Williams', username: 'alicewilliams', workspaceManager: false, workspace: 'Limousine' },
  ]);

  const workspaces = ['All Workspaces', 'Chandling WorkSpace', 'New Offshore Marine Logistics', 'Limousine'];

  const filteredManagers = managers.filter(manager => {
    const matchesSearch = 
      manager.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      manager.username.toLowerCase().includes(searchValue.toLowerCase());
    const matchesWorkspace = selectedWorkspace === '' || selectedWorkspace === 'All Workspaces' || manager.workspace === selectedWorkspace;
    return matchesSearch && matchesWorkspace;
  });

  const toggleWorkspaceManager = (id) => {
    setManagers(managers.map(manager => 
      manager.id === id 
        ? { ...manager, workspaceManager: !manager.workspaceManager }
        : manager
    ));
  };

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      className="managers-modal"
      centered
      size="lg"
    >
      <Modal.Header className="managers-modal-header">
        <Modal.Title className="managers-modal-title">Managers</Modal.Title>
        <button
          type="button"
          className="managers-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="managers-modal-body">
        {/* Search and Filter Section */}
        <div className="managers-filter-section">
          <div className="managers-search-wrapper">
            <FiSearch className="managers-search-icon" />
            <input
              type="text"
              className="managers-search-input"
              placeholder="Search by name or username..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          <div className="managers-workspace-filter">
            <select
              className="managers-workspace-select"
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
            >
              <option value="">Choose Workspace</option>
              {workspaces.map(workspace => (
                <option key={workspace} value={workspace}>{workspace}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Section */}
        <div className="managers-table-wrapper">
          <table className="managers-table">
            <thead>
              <tr>
                <th className="managers-th-name">Name</th>
                <th className="managers-th-username">UserName</th>
                <th className="managers-th-workspace-manager">Workspace Manager</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map(manager => (
                  <tr key={manager.id} className="managers-table-row">
                    <td className="managers-td-name">{manager.name}</td>
                    <td className="managers-td-username">{manager.username}</td>
                    <td className="managers-td-workspace-manager">
                      <label className="managers-toggle-switch">
                        <input
                          type="checkbox"
                          checked={manager.workspaceManager}
                          onChange={() => toggleWorkspaceManager(manager.id)}
                        />
                        <span className="managers-toggle-slider"></span>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="managers-empty-state">
                    No managers found
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

export default ManagersModal;

