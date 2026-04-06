import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import '../../structure/SideNav/components/AddDashboardModal.scss';

const CreateWorkflowModal = ({ show, onClose, onSave, isSaving = false }) => {
  const [workflowName, setWorkflowName] = useState('');

  useEffect(() => {
    if (!show) setWorkflowName('');
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!workflowName.trim() || isSaving) return;
    if (onSave) {
      onSave({
        workflow_name: workflowName.trim(),
      });
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    setWorkflowName('');
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
          <h2 className="add-dashboard-modal-title" id="create-workflow-modal-title">
            New workflow
          </h2>
          <button
            type="button"
            className="add-dashboard-modal-close"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <FiX size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="add-dashboard-modal-body">
          <label htmlFor="workflowName" className="add-dashboard-label">
            Name
          </label>
          <input
            type="text"
            id="workflowName"
            className="add-dashboard-input"
            placeholder=""
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            disabled={isSaving}
            autoFocus
          />
        </div>

        <div className="add-dashboard-modal-footer">
          <button
            type="button"
            onClick={handleClose}
            className="add-dashboard-btn add-dashboard-btn--text"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="add-dashboard-btn add-dashboard-btn--text"
            disabled={!workflowName.trim() || isSaving}
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkflowModal;
