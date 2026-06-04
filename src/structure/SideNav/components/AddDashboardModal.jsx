import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../../design/scss/structure/side-nav/AddDashboardModal.scss';

const AddDashboardModal = ({ show, onClose, onSave }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!show) setName('');
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (onSave) {
      onSave({ name: name.trim() });
      return;
    }
    setName('');
    onClose();
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
      backdropClassName="add-dashboard-modal-backdrop"
      dialogClassName="add-dashboard-modal-dialog"
      contentClassName="add-dashboard-modal-content"
    >
      <form onSubmit={handleSubmit} className="add-dashboard-form">
        <div className="add-dashboard-modal-header">
          <h2 className="add-dashboard-modal-title" id="add-dashboard-modal-title">
            New dashboard
          </h2>
          <button
            type="button"
            className="add-dashboard-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <FiX size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="add-dashboard-modal-body">
          <label htmlFor="dashboardName" className="add-dashboard-label">
            Name
          </label>
          <input
            type="text"
            id="dashboardName"
            className="add-dashboard-input"
            placeholder=""
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="add-dashboard-modal-footer">
          <button type="button" onClick={handleClose} className="add-dashboard-btn add-dashboard-btn--text">
            Cancel
          </button>
          <button
            type="submit"
            className="add-dashboard-btn add-dashboard-btn--text"
            disabled={!name.trim()}
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

AddDashboardModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default AddDashboardModal;
