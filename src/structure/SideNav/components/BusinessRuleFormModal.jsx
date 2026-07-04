import { useEffect, useState } from 'react';
import { FiX, FiPlus, FiChevronDown, FiChevronUp, FiTrash2 } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import BusinessRuleIcon from './BusinessRuleIcon';
import {
  SHARE_WITH_OPTIONS, THEN_ACTION_SECTIONS, CREATE_ACTION_OPTIONS, LINK_ACTION_OPTIONS,
  DUMMY_REGULAR_FIELDS, DUMMY_TIME_UNITS, DUMMY_CUSTOM_FIELDS,
} from './businessRulesData';
import useBusinessRuleReducer from '../../../store/BusinessRuleReducer';
import useWorkSpaceReducer from '../../../store/WorkSpaceReducer';
import { PRIMARY_PRESET_COLORS, SECONDARY_PRESET_COLORS } from '../../../components/SedresColorPicker/sedresColorPickerConstants';

const DEFAULT_OWNER = { name: 'You', initials: 'YO' };

const PROPERTY_DOT_COLORS = [...PRIMARY_PRESET_COLORS, ...SECONDARY_PRESET_COLORS];

const getFieldLabel = (field) =>
  field.field_label ?? field.unit_label ?? field.field_name ?? field.custom_field_name ?? field.unit_name ?? '';

const getPropertyDotColor = (idx) => PROPERTY_DOT_COLORS[idx % PROPERTY_DOT_COLORS.length];

function PropertyPill({ pillKey, label, selected, dotColor, disabled, onClick }) {
  return (
    <button
      type="button"
      key={pillKey}
      className={`br-property-pill${selected ? ' br-property-pill--selected' : ''}${disabled ? ' br-property-pill--disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {dotColor && <span className="br-property-pill-dot" style={{ backgroundColor: dotColor }} aria-hidden />}
      {label}
    </button>
  );
}

function CardPropertyMatchModal({ show, onClose, onSelect, existingFieldLabels }) {
  const [selected, setSelected] = useState(null);
  const [expandedRegularFields, setExpandedRegularFields] = useState(true);
  const [expandedTimeUnit, setExpandedTimeUnit] = useState(true);
  const [expandedCustomFields, setExpandedCustomFields] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [showDisabled, setShowDisabled] = useState(false);
  const [filterText, setFilterText] = useState('');

  const {
    regularFields, isLoadingRegularFields, getRegularFields,
    timeUnits, isLoadingTimeUnits, getTimeUnits,
    customFields, isLoadingCustomFields, getCustomFields,
  } = useBusinessRuleReducer((s) => s);

  const { workspaces, listAllWorkspaces } = useWorkSpaceReducer((s) => s);
  const boards = (workspaces ?? []).flatMap((w) => w.boards ?? []);

  // Dev-only fallback so the modal can be visually tested without a live backend.
  const displayRegularFields = regularFields.length > 0 ? regularFields : (import.meta.env.DEV ? DUMMY_REGULAR_FIELDS : []);
  const displayTimeUnits = timeUnits.length > 0 ? timeUnits : (import.meta.env.DEV ? DUMMY_TIME_UNITS : []);
  const displayCustomFields = customFields.length > 0 ? customFields : (import.meta.env.DEV ? DUMMY_CUSTOM_FIELDS : []);

  const isFieldUsed = (field) =>
    (existingFieldLabels ?? []).includes(getFieldLabel(field).trim().toLowerCase());

  const filterQuery = filterText.trim().toLowerCase();
  const matchesFilter = (field) => getFieldLabel(field).toLowerCase().includes(filterQuery);
  const filteredRegularFields = filterQuery ? displayRegularFields.filter(matchesFilter) : displayRegularFields;
  const filteredTimeUnits = filterQuery ? displayTimeUnits.filter(matchesFilter) : displayTimeUnits;
  const filteredCustomFields = filterQuery ? displayCustomFields.filter(matchesFilter) : displayCustomFields;

  useEffect(() => {
    if (!show) return;
    setSelected(null);
    setFilterText('');
    if (regularFields.length === 0) getRegularFields();
    if (timeUnits.length === 0) getTimeUnits();
    if (workspaces.length === 0) listAllWorkspaces();
    getCustomFields({ params: { board_id: selectedBoardId || undefined, show_disabled: showDisabled } });
  }, [show]);

  useEffect(() => {
    if (!show) return;
    getCustomFields({ params: { board_id: selectedBoardId || undefined, show_disabled: showDisabled } });
  }, [selectedBoardId, showDisabled]);

  const handlePick = (type, field) => {
    const key = `${type}-${field.regular_field_id ?? field.time_unit_id ?? field.custom_field_id ?? getFieldLabel(field)}`;
    setSelected({ key, type, field });
  };

  const handleAdd = () => {
    if (!selected) return;
    onSelect(selected.field, { category_key: selected.type });
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="card-property-match-modal"
      dialogClassName="card-property-match-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell">
        <header className="card-property-match-modal-header">
          <h2 className="card-property-match-modal-title">Card property match</h2>
          <button
            type="button"
            className="business-rule-form-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="card-property-match-modal-body">
          <input
            type="text"
            className="br-property-filter-input"
            placeholder="Filter"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            autoFocus
          />

          <div className="br-property-section">
            <button
              type="button"
              className="br-property-section-toggle"
              onClick={() => setExpandedRegularFields((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expandedRegularFields ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Regular fields
            </button>
            {expandedRegularFields && (
              <div className="br-property-pill-grid">
                {isLoadingRegularFields ? (
                  <div className="br-property-picker-empty">Loading...</div>
                ) : filteredRegularFields.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  filteredRegularFields.map((field, idx) => {
                    const key = `regular-${field.regular_field_id ?? idx}`;
                    return (
                      <PropertyPill
                        key={key}
                        pillKey={key}
                        label={getFieldLabel(field)}
                        selected={selected?.key === key}
                        disabled={isFieldUsed(field)}
                        onClick={() => handlePick('regular', field)}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="br-property-section">
            <button
              type="button"
              className="br-property-section-toggle"
              onClick={() => setExpandedTimeUnit((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expandedTimeUnit ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Time unit
            </button>
            {expandedTimeUnit && (
              <div className="br-property-pill-grid">
                {isLoadingTimeUnits ? (
                  <div className="br-property-picker-empty">Loading...</div>
                ) : filteredTimeUnits.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  filteredTimeUnits.map((field, idx) => {
                    const key = `time_unit-${field.time_unit_id ?? idx}`;
                    return (
                      <PropertyPill
                        key={key}
                        pillKey={key}
                        label={getFieldLabel(field)}
                        selected={selected?.key === key}
                        onClick={() => handlePick('time_unit', field)}
                      />
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="br-property-section">
            <button
              type="button"
              className="br-property-section-toggle"
              onClick={() => setExpandedCustomFields((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expandedCustomFields ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Custom fields
            </button>
            {expandedCustomFields && (
              <>
                <div className="br-property-board-filter">
                  <span className="br-property-board-filter-label">Show fields from board:</span>
                  <div className="br-property-board-filter-row">
                    <div className="business-rule-form-select-wrap br-property-board-select-wrap">
                      <select
                        className="business-rule-form-select"
                        value={selectedBoardId}
                        onChange={(e) => setSelectedBoardId(e.target.value)}
                      >
                        <option value="">All Boards</option>
                        {boards.map((b) => (
                          <option key={b.board_id} value={b.board_id}>{b.board_name}</option>
                        ))}
                      </select>
                      <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
                    </div>
                    <button
                      type="button"
                      className="br-property-board-clear-btn"
                      onClick={() => setSelectedBoardId('')}
                      aria-label="Reset board filter"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <label className="business-rule-form-toggle br-property-disabled-toggle">
                  <input
                    type="checkbox"
                    checked={showDisabled}
                    onChange={(e) => setShowDisabled(e.target.checked)}
                  />
                  <span className="business-rule-form-toggle-track" aria-hidden />
                  <span className="business-rule-form-toggle-label">Show disabled custom fields</span>
                </label>

                <div className="br-property-pill-grid">
                  {isLoadingCustomFields ? (
                    <div className="br-property-picker-empty">Loading...</div>
                  ) : filteredCustomFields.length === 0 ? (
                    <div className="br-property-picker-empty">No custom fields found</div>
                  ) : (
                    filteredCustomFields.map((field, idx) => {
                      const key = `custom-${field.custom_field_id ?? idx}`;
                      return (
                        <PropertyPill
                          key={key}
                          pillKey={key}
                          label={getFieldLabel(field)}
                          selected={selected?.key === key}
                          dotColor={getPropertyDotColor(idx)}
                          disabled={isFieldUsed(field)}
                          onClick={() => handlePick('custom', field)}
                        />
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="card-property-match-modal-footer">
          <button
            type="button"
            className="br-property-add-btn"
            disabled={!selected}
            onClick={handleAdd}
          >
            Add
          </button>
        </footer>
      </div>
    </Modal>
  );
}

function CreateActionModal({ show, onClose, onSelect }) {
  const [selectedKey, setSelectedKey] = useState(null);
  const [expandedRegularFields, setExpandedRegularFields] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (!show) return;
    setSelectedKey(null);
    setFilterText('');
  }, [show]);

  const filterQuery = filterText.trim().toLowerCase();
  const filteredOptions = filterQuery
    ? CREATE_ACTION_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(filterQuery))
    : CREATE_ACTION_OPTIONS;

  const handleAdd = () => {
    const option = CREATE_ACTION_OPTIONS.find((opt) => opt.key === selectedKey);
    if (!option) return;
    onSelect(option);
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="card-property-match-modal"
      dialogClassName="card-property-match-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell">
        <header className="card-property-match-modal-header">
          <h2 className="card-property-match-modal-title">Create Card or Subtask</h2>
          <button
            type="button"
            className="business-rule-form-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="card-property-match-modal-body">
          <input
            type="text"
            className="br-property-filter-input"
            placeholder="Filter"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            autoFocus
          />

          <div className="br-property-section">
            <button
              type="button"
              className="br-property-section-toggle"
              onClick={() => setExpandedRegularFields((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expandedRegularFields ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Regular fields
            </button>
            {expandedRegularFields && (
              <div className="br-property-pill-grid">
                {filteredOptions.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  filteredOptions.map((option) => (
                    <PropertyPill
                      key={option.key}
                      pillKey={option.key}
                      label={option.label}
                      selected={selectedKey === option.key}
                      onClick={() => setSelectedKey(option.key)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="card-property-match-modal-footer">
          <button
            type="button"
            className="br-property-add-btn"
            disabled={!selectedKey}
            onClick={handleAdd}
          >
            Add
          </button>
        </footer>
      </div>
    </Modal>
  );
}

function LinkActionModal({ show, onClose, onSelect }) {
  const [selectedKey, setSelectedKey] = useState(null);
  const [expandedActions, setExpandedActions] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (!show) return;
    setSelectedKey(null);
    setFilterText('');
  }, [show]);

  const filterQuery = filterText.trim().toLowerCase();
  const filteredOptions = filterQuery
    ? LINK_ACTION_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(filterQuery))
    : LINK_ACTION_OPTIONS;

  const handleAdd = () => {
    const option = LINK_ACTION_OPTIONS.find((opt) => opt.key === selectedKey);
    if (!option) return;
    onSelect(option);
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="card-property-match-modal"
      dialogClassName="card-property-match-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell">
        <header className="card-property-match-modal-header">
          <h2 className="card-property-match-modal-title">Add new action</h2>
          <button
            type="button"
            className="business-rule-form-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="card-property-match-modal-body">
          <input
            type="text"
            className="br-property-filter-input"
            placeholder="Filter"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            autoFocus
          />

          <div className="br-property-section">
            <button
              type="button"
              className="br-property-section-toggle"
              onClick={() => setExpandedActions((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expandedActions ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Possible actions
            </button>
            {expandedActions && (
              <div className="br-property-pill-grid">
                {filteredOptions.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  filteredOptions.map((option) => (
                    <PropertyPill
                      key={option.key}
                      pillKey={option.key}
                      label={option.label}
                      selected={selectedKey === option.key}
                      onClick={() => setSelectedKey(option.key)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="card-property-match-modal-footer">
          <button
            type="button"
            className="br-property-add-btn"
            disabled={!selectedKey}
            onClick={handleAdd}
          >
            Add
          </button>
        </footer>
      </div>
    </Modal>
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
  const [createActions, setCreateActions] = useState([]);
  const [showCreateActionPicker, setShowCreateActionPicker] = useState(false);
  const [linkActions, setLinkActions] = useState([]);
  const [showLinkActionPicker, setShowLinkActionPicker] = useState(false);

  useEffect(() => {
    if (!show || !rule) return;
    setName(rule.name ?? '');
    setDescription(rule.description ?? '');
    setTags('');
    setShareWith(SHARE_WITH_OPTIONS[0].value);
    setDisallowTriggerChain(false);
    setConditions([]);
    setShowPropertyPicker(false);
    setCreateActions([]);
    setShowCreateActionPicker(false);
    setLinkActions([]);
    setShowLinkActionPicker(false);
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
      conditions,
      createActions,
      linkActions,
    });
    onClose();
  };

  const handleOpenPropertyPicker = () => {
    setShowPropertyPicker(true);
  };

  const handleSelectProperty = (field, category) => {
    setConditions((prev) => [
      ...prev,
      {
        id: Date.now(),
        fieldLabel: getFieldLabel(field),
        fieldKey: field.field_key ?? field.unit_key ?? String(field.regular_field_id ?? field.time_unit_id ?? field.custom_field_id ?? ''),
        category: category.category_key,
        value: '',
      },
    ]);
  };

  const handleRemoveCondition = (id) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSelectCreateAction = (option) => {
    setCreateActions((prev) => [...prev, { id: Date.now(), key: option.key, label: option.label }]);
  };

  const handleRemoveCreateAction = (id) => {
    setCreateActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectLinkAction = (option) => {
    setLinkActions((prev) => [...prev, { id: Date.now(), key: option.key, label: option.label }]);
  };

  const handleRemoveLinkAction = (id) => {
    setLinkActions((prev) => prev.filter((a) => a.id !== id));
  };

  const boardLabel = boardName?.trim() || 'Current board';

  return (
    <>
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
                </div>
              </div>
            </div>

            <div className="business-rule-form-column business-rule-form-column--then">
              <h3 className="business-rule-form-column-title">THEN</h3>
              <div className="business-rule-form-then-stack">
                {THEN_ACTION_SECTIONS.map((section) => (
                  <div key={section.id} className="business-rule-form-action-section">
                    <h4 className="business-rule-form-action-title">{section.title}</h4>

                    {section.id === 'create' && createActions.map((action) => (
                      <div key={action.id} className="business-rule-form-action-chip">
                        <span className="business-rule-form-action-chip-label">{action.label}</span>
                        <button
                          type="button"
                          className="business-rule-form-condition-remove"
                          onClick={() => handleRemoveCreateAction(action.id)}
                          aria-label="Remove action"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {section.id === 'link' && linkActions.map((action) => (
                      <div key={action.id} className="business-rule-form-action-chip">
                        <span className="business-rule-form-action-chip-label">{action.label}</span>
                        <button
                          type="button"
                          className="business-rule-form-condition-remove"
                          onClick={() => handleRemoveLinkAction(action.id)}
                          aria-label="Remove action"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="business-rule-form-add-action"
                      onClick={() => {
                        if (section.id === 'create') setShowCreateActionPicker(true);
                        if (section.id === 'link') setShowLinkActionPicker(true);
                      }}
                    >
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

    <CardPropertyMatchModal
      show={showPropertyPicker}
      onClose={() => setShowPropertyPicker(false)}
      onSelect={handleSelectProperty}
      existingFieldLabels={['board', ...conditions.map((c) => c.fieldLabel.trim().toLowerCase())]}
    />

    <CreateActionModal
      show={showCreateActionPicker}
      onClose={() => setShowCreateActionPicker(false)}
      onSelect={handleSelectCreateAction}
    />

    <LinkActionModal
      show={showLinkActionPicker}
      onClose={() => setShowLinkActionPicker(false)}
      onSelect={handleSelectLinkAction}
    />
    </>
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

PropertyPill.propTypes = {
  pillKey: PropTypes.string.isRequired,
  label: PropTypes.string,
  selected: PropTypes.bool,
  dotColor: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

CardPropertyMatchModal.propTypes = {
  show: PropTypes.bool.isRequired,
  existingFieldLabels: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

CreateActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

LinkActionModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default BusinessRuleFormModal;
