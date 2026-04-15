import { FiX } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import './SelectWorkflowModal.scss';

function WorkflowCardIllustrationKanban() {
  return (
    <svg className="select-workflow-card-illustration" viewBox="0 0 160 120" aria-hidden>
      <defs>
        <linearGradient id="swm-k1" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id="swm-k2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="swm-k3" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect x="8" y="12" width="44" height="96" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
      <rect x="12" y="16" width="36" height="10" rx="3" fill="url(#swm-k1)" />
      <rect x="14" y="32" width="32" height="8" rx="2" fill="#dbeafe" />
      <rect x="14" y="44" width="32" height="8" rx="2" fill="#eff6ff" />
      <rect x="58" y="12" width="44" height="96" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
      <rect x="62" y="16" width="36" height="10" rx="3" fill="url(#swm-k2)" />
      <rect x="64" y="32" width="32" height="8" rx="2" fill="#ffedd5" />
      <rect x="108" y="12" width="44" height="96" rx="8" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
      <rect x="112" y="16" width="36" height="10" rx="3" fill="url(#swm-k3)" />
      <rect x="114" y="32" width="32" height="8" rx="2" fill="#dcfce7" />
      <circle cx="24" cy="104" r="3" fill="#94a3b8" opacity="0.5" />
      <path d="M24 104 Q 50 80 90 95 T 140 88" fill="none" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 4" />
    </svg>
  );
}

function WorkflowCardIllustrationFlow() {
  return (
    <svg className="select-workflow-card-illustration" viewBox="0 0 160 120" aria-hidden>
      <rect x="18" y="22" width="124" height="76" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
      <rect x="28" y="34" width="36" height="14" rx="6" fill="#e0e7ff" />
      <rect x="36" y="38" width="14" height="3" rx="1" fill="#4f46e5" opacity="0.85" />
      <rect x="36" y="43" width="10" height="3" rx="1" fill="#4f46e5" opacity="0.85" />
      <circle cx="52" cy="72" r="8" fill="#3b82f6" opacity="0.9" />
      <circle cx="96" cy="58" r="8" fill="#22c55e" opacity="0.9" />
      <circle cx="118" cy="82" r="6" fill="#a855f7" opacity="0.85" />
      <path d="M60 72 Q78 52 88 58" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M104 58 Q110 68 112 76" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="102" y="28" width="28" height="10" rx="4" fill="#fff" stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
}

const DEFAULT_DESCRIPTION =
  "New cards open in this workflow's columns so you can track work in the right swimlanes.";

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
          <h2 className="select-workflow-modal-title" id="select-workflow-modal-title">
            Select Workflow
          </h2>
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
            <ul
              className="select-workflow-modal-cards"
              role="radiogroup"
              aria-labelledby="select-workflow-modal-title"
            >
              {workflows.map((w, index) => (
                <li key={String(w.id)}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={isSelected(w.id)}
                    className={`select-workflow-card ${isSelected(w.id) ? 'is-selected' : ''}`}
                    onClick={() => onSelectWorkflowId(w.id)}
                  >
                    <div className="select-workflow-card-copy">
                      <h3 className="select-workflow-card-title">{w.name}</h3>
                      <p className="select-workflow-card-desc">{w.description ?? DEFAULT_DESCRIPTION}</p>
                    </div>
                    <div className="select-workflow-card-art" aria-hidden>
                      {index % 2 === 0 ? <WorkflowCardIllustrationKanban /> : <WorkflowCardIllustrationFlow />}
                    </div>
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
      description: PropTypes.string,
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
