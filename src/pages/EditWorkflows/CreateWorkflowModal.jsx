import { useState } from 'react';
import CustomModal from '../../components/CustomModal';
import '../../design/scss/EditWorkflows.scss';

const CreateWorkflowModal = ({ show, onClose, onSave }) => {
  const [workflowName, setWorkflowName] = useState('');

  const handleSave = () => {
    if (workflowName.trim()) {
      if (onSave) {
        onSave({
          name: workflowName.trim(),
        });
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setWorkflowName('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && workflowName.trim()) {
      handleSave();
    }
  };

  return (
    <CustomModal
      show={show}
      closeModal={handleClose}
      className="create-workflow-modal"
      dialgName="modal-dialog modal-dialog-centered"
      createModal={false}
      body={
        <div className="create-workflow-modal-content">
          {/* Header */}
          <div className="create-workflow-modal-header">
            <h2 className="create-workflow-modal-title">Create New Workflow</h2>
            <button
              type="button"
              className="create-workflow-modal-close"
              onClick={handleClose}
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

          {/* Workflow Name Input */}
          <div className="create-workflow-name-section">
            <label className="create-workflow-name-label">Workflow name</label>
            <input
              type="text"
              className="create-workflow-name-input"
              placeholder="Enter workflow name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="create-workflow-actions">
            <button
              type="button"
              className="create-workflow-btn create-workflow-btn-cancel"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="create-workflow-btn create-workflow-btn-save"
              onClick={handleSave}
              disabled={!workflowName.trim()}
            >
              Save
            </button>
          </div>
        </div>
      }
    />
  );
};

export default CreateWorkflowModal;

