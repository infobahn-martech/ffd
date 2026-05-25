import { useEffect, useState } from 'react';
import { FiX, FiPlus, FiChevronDown } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import BusinessRuleIcon from './BusinessRuleIcon';
import { SHARE_WITH_OPTIONS, THEN_ACTION_SECTIONS } from './businessRulesData';

const DEFAULT_OWNER = { name: 'You', initials: 'YO' };

function BusinessRuleFormModal({ show, rule, boardName, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [shareWith, setShareWith] = useState(SHARE_WITH_OPTIONS[0].value);
  const [disallowTriggerChain, setDisallowTriggerChain] = useState(false);

  useEffect(() => {
    if (!show || !rule) return;
    setName(rule.name ?? '');
    setDescription(rule.description ?? '');
    setTags('');
    setShareWith(SHARE_WITH_OPTIONS[0].value);
    setDisallowTriggerChain(false);
  }, [show, rule]);

  if (!rule) return null;

  const handleSave = () => {
    onSave?.({
      triggerRuleId: rule.id,
      name: name.trim(),
      description: description.trim(),
      tags: tags.trim(),
      shareWith,
      disallowTriggerChain,
    });
    onClose();
  };

  const boardLabel = boardName?.trim() || 'Current board';

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="business-rule-form-modal"
      dialogClassName="business-rule-form-modal-dialog"
      backdropClassName="business-rule-form-modal-backdrop"
      centered={false}
      backdrop="static"
      scrollable
    >
      <div className="business-rule-form-modal-shell">
        <header className="business-rule-form-modal-header">
          <h2 className="business-rule-form-modal-title">Add business rule</h2>
          <button
            type="button"
            className="business-rule-form-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="business-rule-form-modal-body">
          <section className="business-rule-form-meta">
            <div className="business-rule-form-field">
              <label htmlFor="br-form-name" className="business-rule-form-label">
                Name
              </label>
              <input
                id="br-form-name"
                type="text"
                className="business-rule-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="business-rule-form-field">
              <label htmlFor="br-form-description" className="business-rule-form-label">
                Description
              </label>
              <textarea
                id="br-form-description"
                className="business-rule-form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="business-rule-form-field">
              <label htmlFor="br-form-tags" className="business-rule-form-label">
                Tags
              </label>
              <input
                id="br-form-tags"
                type="text"
                className="business-rule-form-input"
                placeholder="Add tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="business-rule-form-row business-rule-form-row--split">
              <div className="business-rule-form-field business-rule-form-field--owner">
                <span className="business-rule-form-label">Owner</span>
                <div className="business-rule-form-owner">
                  <span className="business-rule-form-owner-avatar" aria-hidden>
                    {DEFAULT_OWNER.initials}
                  </span>
                  <span className="business-rule-form-owner-name">{DEFAULT_OWNER.name}</span>
                </div>
              </div>

              <div className="business-rule-form-field">
                <label htmlFor="br-form-share" className="business-rule-form-label">
                  Share with
                </label>
                <div className="business-rule-form-select-wrap">
                  <select
                    id="br-form-share"
                    className="business-rule-form-select"
                    value={shareWith}
                    onChange={(e) => setShareWith(e.target.value)}
                  >
                    {SHARE_WITH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
                </div>
              </div>
            </div>

            <label className="business-rule-form-toggle">
              <input
                type="checkbox"
                checked={disallowTriggerChain}
                onChange={(e) => setDisallowTriggerChain(e.target.checked)}
              />
              <span className="business-rule-form-toggle-track" aria-hidden />
              <span className="business-rule-form-toggle-label">
                Disallow business rule actions to trigger this rule
              </span>
            </label>
          </section>

          <section className="business-rule-form-flow" aria-label="Rule builder">
            <div className="business-rule-form-column">
              <h3 className="business-rule-form-column-title">WHEN</h3>
              <div className="business-rule-form-column-card business-rule-form-column-card--when">
                <BusinessRuleIcon iconType={rule.icon} className="business-rule-form-when-icon" />
                <span className="business-rule-form-trigger-name">{rule.name}</span>
              </div>
            </div>

            <div className="business-rule-form-column">
              <h3 className="business-rule-form-column-title">AND</h3>
              <div className="business-rule-form-column-card">
                <div className="business-rule-form-condition">
                  <span className="business-rule-form-condition-label">Board is</span>
                  <button type="button" className="business-rule-form-condition-value">
                    {boardLabel}
                    <FiChevronDown size={16} aria-hidden />
                  </button>
                </div>
                <button type="button" className="business-rule-form-add-link">
                  <FiPlus size={14} aria-hidden />
                  Add filter
                </button>
              </div>
            </div>

            <div className="business-rule-form-column business-rule-form-column--then">
              <h3 className="business-rule-form-column-title">THEN</h3>
              <div className="business-rule-form-then-stack">
                {THEN_ACTION_SECTIONS.map((section) => (
                  <div key={section.id} className="business-rule-form-action-section">
                    <h4 className="business-rule-form-action-title">{section.title}</h4>
                    <button type="button" className="business-rule-form-add-action">
                      <FiPlus size={14} aria-hidden />
                      Add new action
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="business-rule-form-modal-footer">
          <p className="business-rule-form-footer-note">
            <strong>Note:</strong> This rule runs automatically when the trigger and filters match.
          </p>
          <button type="button" className="business-rule-form-save-btn" onClick={handleSave}>
            Save
          </button>
        </footer>
      </div>
    </Modal>
  );
}

BusinessRuleFormModal.propTypes = {
  show: PropTypes.bool.isRequired,
  rule: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    icon: PropTypes.string,
    description: PropTypes.string,
  }),
  boardName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default BusinessRuleFormModal;
