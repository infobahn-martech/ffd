import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';

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
    >
      <Modal.Header className="modal-header">
        <Modal.Title className="modal-title">Add New Dashboard</Modal.Title>
        <button
          type="button"
          className="modal-close-btn"
          onClick={handleClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="permInputs row mb-lg-3">
            <div className="col-lg-12 col-sm-12 mb-3">
              <label htmlFor="dashboardName" className="form-label">
                Name <span className="text-danger">*</span>
              </label>
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
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer className="modal-footer">
        <div className="two-btn">
          <button
            type="button"
            onClick={handleClose}
            className="btn-common close"
            data-bs-dismiss="modal"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="save btn-common green-btn"
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