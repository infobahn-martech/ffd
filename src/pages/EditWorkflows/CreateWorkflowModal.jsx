import { useState } from 'react';
import CustomModal from '../../components/CustomModal';
import '../../design/scss/EditWorkflows.scss';

const CreateWorkflowModal = ({ show, onClose, onSave }) => {
  const [workflowName, setWorkflowName] = useState('');
  const [selectedWorkflowType, setSelectedWorkflowType] = useState(null);

  const workflowTypes = [
    {
      id: 'cards',
      name: 'Cards Workflow',
      description: 'The Cards Workflow represents the team process. This is the place where all tasks are visualized as Kanban cards. In the Cards workflow, you can create new cards that are either independent or linked to an Initiative.',
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="12" width="32" height="24" rx="4" fill="#3b82f6" opacity="0.2" />
          <rect x="8" y="12" width="32" height="6" rx="2" fill="#3b82f6" />
          <circle cx="12" cy="15" r="1.5" fill="#ffffff" />
          <rect x="8" y="20" width="32" height="6" rx="2" fill="#f59e0b" />
          <circle cx="12" cy="23" r="1.5" fill="#ffffff" />
          <rect x="8" y="28" width="32" height="6" rx="2" fill="#ef4444" />
          <circle cx="12" cy="31" r="1.5" fill="#ffffff" />
          <rect x="8" y="36" width="32" height="6" rx="2" fill="#10b981" />
          <circle cx="12" cy="39" r="1.5" fill="#ffffff" />
        </svg>
      ),
    },
  ];

  const handleSave = () => {
    if (workflowName && selectedWorkflowType) {
      if (onSave) {
        onSave({
          name: workflowName,
          type: selectedWorkflowType,
        });
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setWorkflowName('');
    setSelectedWorkflowType(null);
    onClose();
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
            />
          </div>

          {/* Workflow Type Selection */}
          <div className="create-workflow-type-section">
            <h3 className="create-workflow-type-title">Workflow type</h3>
            <div className="create-workflow-type-cards">
              {workflowTypes.map((type) => (
                <div
                  key={type.id}
                  className={`create-workflow-type-card ${selectedWorkflowType === type.id ? 'selected' : ''}`}
                  onClick={() => setSelectedWorkflowType(type.id)}
                >
                  <div className="create-workflow-type-icon">{type.icon}</div>
                  <h4 className="create-workflow-type-name">{type.name}</h4>
                  <p className="create-workflow-type-description">{type.description}</p>
                </div>
              ))}
            </div>
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
              disabled={!workflowName || !selectedWorkflowType}
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

