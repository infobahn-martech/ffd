import { useState, useEffect } from 'react';
import CustomModal from '../../components/CustomModal';
import '../../design/scss/Workspaces.scss';

const RenameWorkspaceModal = ({ show, onClose, onSave, currentName, isSaving = false }) => {
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    if (show) {
      setWorkspaceName(currentName || '');
    }
  }, [show, currentName]);

  const handleSave = () => {
    if (workspaceName.trim() && workspaceName !== currentName) {
      onSave(workspaceName.trim());
    } else {
      onClose();
    }
  };

  const handleClose = () => {
    setWorkspaceName(currentName || '');
    onClose();
  };

  return (
    <CustomModal
      show={show}
      closeModal={handleClose}
      className="rename-board-modal"
      dialgName="rename-board-modal-dialog"
      createModal={false}
      body={
        <div className="rename-board-modal-content">
          <div className="rename-board-modal-header">
            <h2 className="rename-board-modal-title">Rename Workspace</h2>
            <button
              type="button"
              className="rename-board-modal-close"
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

          <div className="rename-board-form">
            <div className="rename-board-form-field">
              <label className="rename-board-form-label">Workspace name</label>
              <input
                type="text"
                className="rename-board-form-input"
                placeholder="Enter workspace name"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
                autoFocus
              />
            </div>

            <div className="rename-board-form-actions">
              <button
                type="button"
                className="rename-board-form-btn rename-board-form-btn-cancel"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rename-board-form-btn rename-board-form-btn-save"
                onClick={handleSave}
                disabled={!workspaceName.trim() || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      }
    />
  );
};

export default RenameWorkspaceModal;

