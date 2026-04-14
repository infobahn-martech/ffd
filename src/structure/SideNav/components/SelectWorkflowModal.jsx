import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './SelectWorkflowModal.scss';

function SelectWorkflowModal({
  show,
  workflows,
  selectedWorkflowId,
  onSelectWorkflowId,
  onClose,
  onContinue,
  onExited,
}) {
  const handleClose = () => {
    onClose();
  };

  const handleContinue = () => {
    if (!workflows || workflows.length === 0 || selectedWorkflowId == null) return;
    onContinue();
  };

  const empty = !workflows || workflows.length === 0;

  const isSelected = (id) =>
    selectedWorkflowId != null && (selectedWorkflowId === id || String(selectedWorkflowId) === String(id));

  return (
    <Modal
      show={show}
      onHide={handleClose}
      onExited={onExited}
      className="select-workflow-modal"
      centered
      backdrop="static"
      backdropClassName="select-workflow-modal-backdrop"
      dialogClassName="select-workflow-modal-dialog"
      contentClassName="select-workflow-modal-content"
    >
      <div className="select-workflow-modal-inner">
        <div className="select-workflow-modal-header">
          <div>
            <h2 className="select-workflow-modal-title" id="select-workflow-modal-title">
              Select Workflow
            </h2>
            <p className="select-workflow-modal-subtitle">Choose the workflow where you want to create the card</p>
          </div>
          <button type="button" className="select-workflow-modal-close" onClick={handleClose} aria-label="Close">
            <FiX size={22} strokeWidth={2} />
          </button>
        </div>

        <div className="select-workflow-modal-body">
          {empty ? (
            <div className="select-workflow-modal-empty" role="status">
              No workflows are available on this board yet. Add or configure workflows before creating a card.
            </div>
          ) : (
            <ul className="select-workflow-modal-list" role="radiogroup" aria-labelledby="select-workflow-modal-title">
              {workflows.map((w) => (
                <li key={String(w.id)}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected(w.id)}
                    className={`select-workflow-option ${isSelected(w.id) ? 'is-selected' : ''}`}
                    onClick={() => onSelectWorkflowId(w.id)}
                  >
                    <span className="select-workflow-option-radio" aria-hidden />
                    <span className="select-workflow-option-label">{w.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="select-workflow-modal-footer">
          <button type="button" onClick={handleClose} className="select-workflow-btn select-workflow-btn--text">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="select-workflow-btn select-workflow-btn--primary"
            disabled={empty || selectedWorkflowId == null}
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}

SelectWorkflowModal.propTypes = {
  show: PropTypes.bool.isRequired,
  workflows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  selectedWorkflowId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSelectWorkflowId: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  onExited: PropTypes.func,
};

SelectWorkflowModal.defaultProps = {
  workflows: [],
  selectedWorkflowId: null,
  onExited: undefined,
};

export default SelectWorkflowModal;
