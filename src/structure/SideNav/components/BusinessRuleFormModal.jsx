import { useEffect, useRef, useState } from 'react';
import { FiX, FiPlus, FiChevronDown, FiSearch, FiTrash2 } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import BusinessRuleIcon from './BusinessRuleIcon';
import { SHARE_WITH_OPTIONS, THEN_ACTION_SECTIONS } from './businessRulesData';
import useBusinessRuleReducer from '../../../store/BusinessRuleReducer';

const DEFAULT_OWNER = { name: 'You', initials: 'YO' };

function PropertyPicker({ fields, isLoading, onSelect, onClose, pickerRef }) {
  const [search, setSearch] = useState('');

  const filteredCategories = (fields ?? [])
    .map((cat) => ({
      ...cat,
      fields: (cat.fields ?? []).filter((f) => {
        const label = f.field_label ?? f.unit_label ?? f.field_name ?? '';
        return label.toLowerCase().includes(search.toLowerCase().trim());
      }),
    }))
    .filter((cat) => cat.fields.length > 0);

  return (
    <div className="br-property-picker" ref={pickerRef}>
      <div className="br-property-picker-search">
        <FiSearch size={14} className="br-property-picker-search-icon" />
        <input
          type="text"
          className="br-property-picker-search-input"
          placeholder="Search fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className="br-property-picker-list">
        {isLoading ? (
          <div className="br-property-picker-empty">Loading...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="br-property-picker-empty">No fields found</div>
        ) : (
          filteredCategories.map((cat) => (
            <div key={cat.field_category_id} className="br-property-picker-group">
              <div className="br-property-picker-group-label">{cat.category_label}</div>
              {cat.fields.map((field, idx) => {
                const label = field.field_label ?? field.unit_label ?? field.field_name ?? '';
                const key = field.regular_field_id ?? field.time_unit_id ?? field.custom_field_id ?? idx;
                return (
                  <button
                    key={key}
                    type="button"
                    className="br-property-picker-item"
                    onClick={() => onSelect(field, cat)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BusinessRuleFormModal({ show, rule, boardName, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [shareWith, setShareWith] = useState(SHARE_WITH_OPTIONS[0].value);
  const [disallowTriggerChain, setDisallowTriggerChain] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const pickerRef = useRef(null);

  const { fields, isLoadingFields, getFields } = useBusinessRuleReducer((s) => s);

  useEffect(() => {
    if (!show || !rule) return;
    setName(rule.name ?? '');
    setDescription(rule.description ?? '');
    setTags('');
    setShareWith(SHARE_WITH_OPTIONS[0].value);
    setDisallowTriggerChain(false);
    setConditions([]);
    setShowPropertyPicker(false);
  }, [show, rule]);

  useEffect(() => {
    if (!showPropertyPicker) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPropertyPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPropertyPicker]);

  if (!rule) return null;

  const handleSave = () => {
    onSave?.({
      triggerRuleId: rule.id,
      name: name.trim(),
      description: description.trim(),
      tags: tags.trim(),
      shareWith,
      disallowTriggerChain,
      conditions,
    });
    onClose();
  };

  const handleOpenPropertyPicker = () => {
    if (fields.length === 0) getFields();
    setShowPropertyPicker((prev) => !prev);
  };

  const handleSelectProperty = (field, category) => {
    const label = field.field_label ?? field.unit_label ?? field.field_name ?? '';
    setConditions((prev) => [
      ...prev,
      {
        id: Date.now(),
        fieldLabel: label,
        fieldKey: field.field_key ?? field.unit_key ?? String(field.custom_field_id ?? ''),
        category: category.category_key,
        value: '',
      },
    ]);
    setShowPropertyPicker(false);
  };

  const handleRemoveCondition = (id) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
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
              <label htmlFor="br-form-name" className="business-rule-form-label">Name</label>
              <input
                id="br-form-name"
                type="text"
                className="business-rule-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="business-rule-form-field">
              <label htmlFor="br-form-description" className="business-rule-form-label">Description</label>
              <textarea
                id="br-form-description"
                className="business-rule-form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="business-rule-form-secondary-grid">
              <div className="business-rule-form-field">
                <label htmlFor="br-form-tags" className="business-rule-form-label">Tags</label>
                <input
                  id="br-form-tags"
                  type="text"
                  className="business-rule-form-input business-rule-form-control"
                  placeholder="Add tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="business-rule-form-field">
                <span className="business-rule-form-label">Owner</span>
                <div className="business-rule-form-owner business-rule-form-control">
                  <span className="business-rule-form-owner-avatar" aria-hidden>{DEFAULT_OWNER.initials}</span>
                  <span className="business-rule-form-owner-name">{DEFAULT_OWNER.name}</span>
                </div>
              </div>

              <div className="business-rule-form-field">
                <label htmlFor="br-form-share" className="business-rule-form-label">Share with</label>
                <div className="business-rule-form-select-wrap business-rule-form-control">
                  <select
                    id="br-form-share"
                    className="business-rule-form-select"
                    value={shareWith}
                    onChange={(e) => setShareWith(e.target.value)}
                  >
                    {SHARE_WITH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
                </div>
              </div>

              <div className="business-rule-form-field business-rule-form-field--toggle">
                <span className="business-rule-form-label business-rule-form-label--spacer" aria-hidden="true">Tags</span>
                <div className="business-rule-form-toggle-box business-rule-form-control">
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
                </div>
              </div>
            </div>
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

                {conditions.map((cond) => (
                  <div key={cond.id} className="business-rule-form-condition">
                    <span className="business-rule-form-condition-label">{cond.fieldLabel}</span>
                    <div className="business-rule-form-condition-row">
                      <input
                        type="text"
                        className="business-rule-form-condition-input"
                        placeholder="Enter value"
                        value={cond.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConditions((prev) =>
                            prev.map((c) => c.id === cond.id ? { ...c, value: val } : c)
                          );
                        }}
                      />
                      <button
                        type="button"
                        className="business-rule-form-condition-remove"
                        onClick={() => handleRemoveCondition(cond.id)}
                        aria-label="Remove condition"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="br-add-property-wrap">
                  <button
                    type="button"
                    className="business-rule-form-add-link"
                    onClick={handleOpenPropertyPicker}
                  >
                    <FiPlus size={14} aria-hidden />
                    Add new property
                  </button>

                  {showPropertyPicker && (
                    <PropertyPicker
                      fields={fields}
                      isLoading={isLoadingFields}
                      onSelect={handleSelectProperty}
                      onClose={() => setShowPropertyPicker(false)}
                      pickerRef={pickerRef}
                    />
                  )}
                </div>
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
            <strong>Note:</strong> Due to their asynchronous nature, the business rules may sometimes run with a short delay. In rare cases it may take up to 30 minutes.
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

PropertyPicker.propTypes = {
  fields: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  pickerRef: PropTypes.object.isRequired,
};

export default BusinessRuleFormModal;
