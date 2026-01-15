import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';
import './AddDashboardModal.scss';

const AddDashboardModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      if (onSave) {
        onSave({ name: name.trim() });
      }
      setName('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="add-dashboard-modal"
      centered
      backdrop="static"
      size="md"
    >
      <Modal.Header className="add-dashboard-modal-header">
        <Modal.Title className="add-dashboard-modal-title">Add New Dashboard</Modal.Title>
        <button
          type="button"
          className="add-dashboard-modal-close"
          onClick={handleClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="add-dashboard-modal-body">
        <form onSubmit={handleSubmit} className="add-dashboard-form">
          <div className="add-dashboard-input-wrapper">
            <div className="form-floating desig-inp">
              <input
                type="text"
                id="dashboardName"
                className="form-control"
                placeholder="Enter dashboard name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <label htmlFor="dashboardName">
                Name <span className="text-danger">*</span>
              </label>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer className="add-dashboard-modal-footer">
        <div className="add-dashboard-modal-actions">
          <button
            type="button"
            onClick={handleClose}
            className="btn-common btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-common btn-save"
            disabled={!name.trim()}
          >
            Save
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

AddDashboardModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default AddDashboardModal;