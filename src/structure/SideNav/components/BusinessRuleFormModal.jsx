import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPlus, FiChevronDown, FiChevronUp, FiTrash2, FiFilter, FiUsers, FiInfo } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import ReactQuill, { Quill } from 'react-quill-new';
import QuillTableBetter from 'quill-table-better';
import 'react-quill-new/dist/quill.snow.css';
import 'quill-table-better/dist/quill-table-better.css';
import BusinessRuleIcon from './BusinessRuleIcon';
import {
  THEN_ACTION_SECTIONS, CREATE_ACTION_OPTIONS, LINK_ACTION_OPTIONS, MOVE_ACTION_OPTIONS, NOTIFY_ACTION_OPTIONS, UPDATE_ACTION_OPTIONS,
  INVOKE_ACTION_OPTIONS, DUMMY_INVOKE_METHOD_OPTIONS, DUMMY_INVOKE_AUTH_OPTIONS, INVOKE_METHODS_WITH_BODY,
  INVOKE_API_KEY_LOCATIONS, INVOKE_API_KEY_LOCATION_LABELS, DUMMY_INVOKE_PAYLOAD_FIELDS, DUMMY_URL_FIELD_OPTIONS,
  DUMMY_REGULAR_FIELDS, DUMMY_TIME_UNITS, DUMMY_CUSTOM_FIELDS, DUMMY_BOARD_TITLE,
  DUMMY_BOARD_AREA_GROUPS, DUMMY_BOARD_HEADER_CELLS, DUMMY_BOARD_LEAF_COLUMNS, DUMMY_BOARD_SWIMLANES, DUMMY_BOARD_BOTTOM_STAGES,
  DUMMY_WORKSPACE_BOARDS,
  DUMMY_NOTIFICATION_FROM_EMAIL, DUMMY_INTERNAL_USERS,
  DUMMY_NOTIFICATION_SUBJECT_PARTS, DUMMY_NOTIFICATION_BODY_DELTA_OPS, INTERNAL_USER_ROLE_OPTIONS,
  DUMMY_LINK_ACTION_OPERATORS, DUMMY_FIELD_OPERATORS,
} from './businessRulesData';
import useBusinessRuleReducer from '../../../store/BusinessRuleReducer';
import useWorkSpaceReducer from '../../../store/WorkSpaceReducer';
import useCommonReducer from '../../../store/CommonReducer';
import useAuthReducer from '../../../store/AuthReducer';
import { pickForegroundOnSwimlaneBackground } from '../../../pages/EditWorkflows/workflow.utils';
import { getInitials } from '../../../shared/utils/utils';
import SedresColorPicker from '../../../components/SedresColorPicker/SedresColorPicker';
import { PRIMARY_PRESET_COLORS, SECONDARY_PRESET_COLORS, normalizeHexColor } from '../../../components/SedresColorPicker/sedresColorPickerConstants';

Quill.register({ 'modules/table-better': QuillTableBetter }, true);
QuillTableBetter.register();

// Custom inline format so the "field pill" tokens (e.g. Title, Author) in the
// notification body survive Quill's HTML sanitization instead of collapsing to
// plain text — Quill only preserves attributes tied to a registered format.
const QuillInlineBlot = Quill.import('blots/inline');
class NotificationPillBlot extends QuillInlineBlot {}
NotificationPillBlot.blotName = 'pill';
NotificationPillBlot.tagName = 'span';
NotificationPillBlot.className = 'notification-pill';
// Quill's Inline.compare() (used to decide DOM nesting order for overlapping
// formats) only recognizes names listed in Inline.order — an unlisted name makes
// the comparison always resolve as "don't wrap", so the pill format would never
// actually apply. Registering it here is required, not optional.
QuillInlineBlot.order.push('pill');
// Our tagName ('span') is identical to Quill's own generic Inline wrapper tag, so
// the inherited static formats() (which special-cases that tag to mean "no format,
// just a bare wrapper") reports empty formats for us too — Quill's optimizer then
// unwraps/removes the span right after creating it. Overriding formats() to always
// report true stops it from being treated as an empty wrapper.
NotificationPillBlot.formats = () => true;
Quill.register(NotificationPillBlot);
const QuillDelta = Quill.import('delta');

// Swimlanes at the bottom of the "Board Minimap" grid that use the DUMMY_BOARD_BOTTOM_STAGES
// column set (Backlog/Requested/In Progress/Done/Ready to Archive) instead of the main
// DUMMY_BOARD_LEAF_COLUMNS set shown for the swimlanes above them.
const BOTTOM_GROUP_SWIMLANE_NAMES = ['TEST', 'Default Swimlane', 'New Swimlane'];

const PROPERTY_DOT_COLORS = [...PRIMARY_PRESET_COLORS, ...SECONDARY_PRESET_COLORS];

const getFieldLabel = (field) =>
  field.field_label ?? field.unit_label ?? field.field_name ?? field.custom_field_name ?? field.unit_name ?? '';

const getPropertyDotColor = (idx) => PROPERTY_DOT_COLORS[idx % PROPERTY_DOT_COLORS.length];

const TOOLBAR_MORE_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';

// Keeps the Quill toolbar on a single row: instead of the browser's default
// inline-wrap (which pushes overflowing controls onto a second line), controls
// that no longer fit are moved into a "more" (⋮) dropdown appended to the end
// of the toolbar. Operates on the live DOM nodes Quill already bound its click
// handlers to, so moving them (rather than cloning) keeps every control working.
function attachToolbarOverflow(toolbar) {
  const originalGroups = Array.from(toolbar.children);
  if (originalGroups.length === 0) return () => {};

  const moreWrap = document.createElement('span');
  moreWrap.className = 'ql-toolbar-more';

  const moreBtn = document.createElement('button');
  moreBtn.type = 'button';
  moreBtn.className = 'ql-toolbar-more-trigger';
  moreBtn.setAttribute('aria-label', 'More formatting options');
  moreBtn.innerHTML = TOOLBAR_MORE_ICON_SVG;

  const moreMenu = document.createElement('div');
  moreMenu.className = 'ql-toolbar-more-menu';
  moreMenu.hidden = true;

  moreWrap.appendChild(moreBtn);
  moreWrap.appendChild(moreMenu);
  toolbar.appendChild(moreWrap);

  const closeMenu = () => { moreMenu.hidden = true; };
  const toggleMenu = (e) => {
    e.stopPropagation();
    moreMenu.hidden = !moreMenu.hidden;
  };
  moreBtn.addEventListener('click', toggleMenu);

  const onDocMouseDown = (e) => {
    if (moreWrap.contains(e.target)) return;
    closeMenu();
  };
  document.addEventListener('mousedown', onDocMouseDown);

  const sync = () => {
    // Reset: every original group back on the toolbar, in order, before the "more" trigger.
    originalGroups.forEach((group) => toolbar.insertBefore(group, moreWrap));
    moreMenu.replaceChildren();

    const overflowed = [];
    while (toolbar.scrollWidth > toolbar.clientWidth) {
      const lastGroup = moreWrap.previousElementSibling;
      if (!lastGroup || lastGroup === originalGroups[0]) break;
      overflowed.push(lastGroup);
      moreMenu.insertBefore(lastGroup, moreMenu.firstChild);
    }

    moreWrap.style.display = overflowed.length > 0 ? '' : 'none';
    if (overflowed.length === 0) closeMenu();
  };

  const resizeObserver = new ResizeObserver(sync);
  resizeObserver.observe(toolbar);
  sync();

  return () => {
    resizeObserver.disconnect();
    document.removeEventListener('mousedown', onDocMouseDown);
    moreBtn.removeEventListener('click', toggleMenu);
    originalGroups.forEach((group) => toolbar.insertBefore(group, moreWrap));
    moreWrap.remove();
  };
}

// Shared by every picker that scopes custom fields to a trigger type (card property
// match, refine update criteria, ...) so the trigger_type_id filtering logic lives in
// one place instead of being duplicated per modal.
function useCustomFieldsByTrigger({ show, triggerTypeId, boardId, showDisabled, search }) {
  const { customFields, isLoadingCustomFields, getCustomFields } = useBusinessRuleReducer((s) => s);

  // A single effect (instead of a separate "on open" + "on filter change" pair) so
  // toggling the board/disabled/search filters right after opening can't race an
  // in-flight initial fetch and have a stale, unfiltered response win.
  useEffect(() => {
    if (!show) return;
    getCustomFields({ params: { board_ids: boardId || undefined, show_disabled: showDisabled ? 1 : undefined, search: search || undefined, trigger_type_id: triggerTypeId } });
  }, [show, boardId, showDisabled, search, triggerTypeId]);

  // Some backend responses include a per-field `disabled` flag and return
  // enabled+disabled together for show_disabled=1 (needs narrowing here); others
  // scope the response to disabled-only server-side and never send that flag at all.
  // Only narrow when the flag is actually present, so we don't zero out an already
  // correctly-scoped response.
  const hasDisabledFlag = customFields.some((field) => Object.prototype.hasOwnProperty.call(field, 'disabled'));
  const scopedCustomFields = showDisabled && hasDisabledFlag
    ? customFields.filter((field) => Number(field.disabled) === 1)
    : customFields;

  return { customFields: scopedCustomFields, isLoadingCustomFields };
}

// Anchored, workspace-grouped board picker used everywhere a "board is ..." filter
// appears (custom field board filter, "Board is" rule condition, ...) — matches the
// Board Minimap picker's design instead of a plain <select>, which doesn't scale once
// a workspace has more than a handful of boards.
function BoardFilterPicker({ workspaces, value, onChange, wrapClassName, triggerClassName, triggerIconSize, panelClassName, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // Sample groups appended after the real workspaces so the picker has enough
  // content to test scrolling/layout even with a sparsely-populated backend.
  const displayWorkspaces = [...workspaces, ...DUMMY_WORKSPACE_BOARDS];
  const boards = displayWorkspaces.flatMap((w) => w.boards ?? []);
  const selectedBoard = boards.find((b) => String(b.board_id) === String(value));

  const filterQuery = filterText.trim().toLowerCase();
  const filteredGroups = displayWorkspaces
    .map((w) => {
      const wsMatch = w.workspace_name.toLowerCase().includes(filterQuery);
      const groupBoards = wsMatch
        ? (w.boards ?? [])
        : (w.boards ?? []).filter((b) => b.board_name.toLowerCase().includes(filterQuery));
      return { workspace_id: w.workspace_id, workspace_name: w.workspace_name, boards: groupBoards };
    })
    .filter((g) => g.boards.length > 0);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isOpen]);

  const handlePick = (board) => {
    onChange(board.board_id);
    setIsOpen(false);
    setFilterText('');
  };

  return (
    <div className={`board-minimap-picker-wrap ${wrapClassName || 'br-property-board-picker-wrap'}`}>
      <button
        type="button"
        ref={triggerRef}
        className={triggerClassName || 'board-minimap-board-trigger br-property-board-trigger'}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{selectedBoard ? selectedBoard.board_name : (placeholder || 'All Boards')}</span>
        <FiChevronDown size={triggerIconSize} aria-hidden />
      </button>

      {isOpen && (
        <div className={`board-minimap-picker-panel ${panelClassName || 'br-property-board-picker-panel'}`} ref={panelRef}>
          <div className="board-minimap-picker-search">
            <FiFilter size={20} className="board-minimap-picker-search-icon" aria-hidden />
            <input
              type="text"
              placeholder="Filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
            />
          </div>

          <div className="board-minimap-picker-scroll">
            {filteredGroups.length === 0 ? (
              <div className="br-property-picker-empty">No matches</div>
            ) : (
              filteredGroups.map((ws) => (
                <div key={ws.workspace_id} className="board-minimap-picker-group">
                  <div className="board-minimap-picker-group-head">
                    <FiUsers size={20} aria-hidden />
                    <span>{ws.workspace_name}</span>
                  </div>
                  <div className="board-minimap-picker-grid">
                    {ws.boards.map((board) => (
                      <button
                        type="button"
                        key={`${ws.workspace_id}-${board.board_id}`}
                        className={`board-minimap-picker-tile${String(board.board_id) === String(value) ? ' board-minimap-picker-tile--selected' : ''}`}
                        onClick={() => handlePick(board)}
                      >
                        {board.board_name}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Rendered via portal to document.body so the tooltip can escape the scrollable
// owner list's overflow clipping instead of being cut off mid-content.
function OwnerInfoTooltip({ user }) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'top' });
  const triggerRef = useRef(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    const placeAbove = r.top > 160;
    setCoords({
      top: placeAbove ? r.top - gap : r.bottom + gap,
      left: r.left + r.width / 2,
      placement: placeAbove ? 'top' : 'bottom',
    });
  };

  const handleShow = () => {
    updatePosition();
    setIsVisible(true);
  };
  const handleHide = () => setIsVisible(false);

  return (
    <span
      ref={triggerRef}
      className="br-owner-picker-info"
      tabIndex={0}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      onFocus={handleShow}
      onBlur={handleHide}
    >
      <FiInfo size={14} aria-hidden />
      {isVisible && createPortal(
        <span
          className={`br-owner-picker-tooltip br-owner-picker-tooltip--${coords.placement}`}
          role="tooltip"
          style={{ top: coords.top, left: coords.left }}
        >
          <span className="br-owner-picker-tooltip-line"><strong>Full name:</strong> {user.name}</span>
          {user.email && (
            <span className="br-owner-picker-tooltip-line"><strong>Email:</strong> {user.email}</span>
          )}
          {user.role && (
            <span className="br-owner-picker-tooltip-line"><strong>Role:</strong> {user.role}</span>
          )}
          {(user.port || user.phone) && (
            <>
              <span className="br-owner-picker-tooltip-divider">User attributes</span>
              {user.port && (
                <span className="br-owner-picker-tooltip-line"><strong>Port:</strong> {user.port}</span>
              )}
              {user.phone && (
                <span className="br-owner-picker-tooltip-line"><strong>Phone:</strong> {user.phone}</span>
              )}
            </>
          )}
        </span>,
        document.body
      )}
    </span>
  );
}

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

function CardPropertyMatchModal({ show, onClose, onSelect, existingFieldLabels, triggerTypeId }) {
  const [selectedRegularFields, setSelectedRegularFields] = useState([]);
  const [selectedTimeUnits, setSelectedTimeUnits] = useState([]);
  const [selectedCustomFields, setSelectedCustomFields] = useState([]);
  const [expandedRegularFields, setExpandedRegularFields] = useState(true);
  const [expandedTimeUnit, setExpandedTimeUnit] = useState(true);
  const [expandedCustomFields, setExpandedCustomFields] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [showDisabled, setShowDisabled] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const {
    regularFields, isLoadingRegularFields, getRegularFields,
    timeUnits, isLoadingTimeUnits, getTimeUnits,
  } = useBusinessRuleReducer((s) => s);

  const { customFields, isLoadingCustomFields } = useCustomFieldsByTrigger({
    show, triggerTypeId, boardId: selectedBoardId, showDisabled, search: debouncedSearch,
  });

  const { workspaces, listAllWorkspaces } = useWorkSpaceReducer((s) => s);

  // Dev-only fallback so the modal can be visually tested without a live backend.
  const displayRegularFields = regularFields.length > 0 ? regularFields : DUMMY_REGULAR_FIELDS;
  const displayTimeUnits = timeUnits.length > 0 ? timeUnits : DUMMY_TIME_UNITS;
  // Only fall back to dummy data in the untouched/no-filter state — once a board,
  // the disabled toggle, or a search term narrows the results, an empty response is a
  // real answer (e.g. "no disabled fields on this board") and must be shown as empty,
  // not masked by an unrelated generic dummy list.
  const isCustomFieldsUnfiltered = !selectedBoardId && !showDisabled && !debouncedSearch;
  const displayCustomFields = customFields.length > 0
    ? customFields
    : (isCustomFieldsUnfiltered ? DUMMY_CUSTOM_FIELDS : []);

  const isFieldUsed = (field) =>
    (existingFieldLabels ?? []).includes(getFieldLabel(field).trim().toLowerCase());

  const filteredCustomFields = displayCustomFields;

  useEffect(() => {
    if (!show) return;
    setSelectedRegularFields([]);
    setSelectedTimeUnits([]);
    setSelectedCustomFields([]);
    setFilterText('');
    setDebouncedSearch('');
    if (workspaces.length === 0) listAllWorkspaces();
  }, [show]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filterText.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [filterText]);

  useEffect(() => {
    if (!show) return;
    getRegularFields({ params: { trigger_type_id: triggerTypeId, search: debouncedSearch || undefined } });
  }, [show, debouncedSearch, triggerTypeId]);

  useEffect(() => {
    if (!show) return;
    getTimeUnits({ params: { trigger_type_id: triggerTypeId, search: debouncedSearch || undefined } });
  }, [show, debouncedSearch, triggerTypeId]);

  const handleToggleRegularField = (field, key) => {
    setSelectedRegularFields((prev) =>
      prev.some((item) => item.key === key)
        ? prev.filter((item) => item.key !== key)
        : [...prev, { key, field }]
    );
  };

  // Time unit only ever allows a single selection, unlike regular/custom fields —
  // picking one replaces whatever was picked before instead of adding to it.
  const handleToggleTimeUnit = (field, key) => {
    setSelectedTimeUnits((prev) =>
      prev.some((item) => item.key === key) ? [] : [{ key, field }]
    );
  };

  const handleToggleCustomField = (field, key) => {
    setSelectedCustomFields((prev) =>
      prev.some((item) => item.key === key)
        ? prev.filter((item) => item.key !== key)
        : [...prev, { key, field }]
    );
  };

  const handleAdd = () => {
    if (selectedRegularFields.length === 0 && selectedTimeUnits.length === 0 && selectedCustomFields.length === 0) return;
    selectedRegularFields.forEach(({ field }) => onSelect(field, { category_key: 'regular' }));
    selectedTimeUnits.forEach(({ field }) => onSelect(field, { category_key: 'time_unit' }));
    selectedCustomFields.forEach(({ field }) => onSelect(field, { category_key: 'custom' }));
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
                ) : displayRegularFields.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  displayRegularFields.map((field, idx) => {
                    const key = `regular-${field.regular_field_id ?? idx}`;
                    return (
                      <PropertyPill
                        key={key}
                        pillKey={key}
                        label={getFieldLabel(field)}
                        selected={selectedRegularFields.some((item) => item.key === key)}
                        disabled={isFieldUsed(field)}
                        onClick={() => handleToggleRegularField(field, key)}
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
                ) : displayTimeUnits.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  displayTimeUnits.map((field, idx) => {
                    const key = `time_unit-${field.time_unit_id ?? idx}`;
                    return (
                      <PropertyPill
                        key={key}
                        pillKey={key}
                        label={getFieldLabel(field)}
                        selected={selectedTimeUnits.some((item) => item.key === key)}
                        onClick={() => handleToggleTimeUnit(field, key)}
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
                    <BoardFilterPicker
                      workspaces={workspaces ?? []}
                      value={selectedBoardId}
                      onChange={setSelectedBoardId}
                    />
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
                          selected={selectedCustomFields.some((item) => item.key === key)}
                          dotColor={getPropertyDotColor(idx)}
                          disabled={isFieldUsed(field)}
                          onClick={() => handleToggleCustomField(field, key)}
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
            disabled={selectedRegularFields.length === 0 && selectedTimeUnits.length === 0 && selectedCustomFields.length === 0}
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
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expandedRegularFields, setExpandedRegularFields] = useState(true);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    if (!show) return;
    setSelectedKeys([]);
    setFilterText('');
  }, [show]);

  const filterQuery = filterText.trim().toLowerCase();
  const filteredOptions = filterQuery
    ? CREATE_ACTION_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(filterQuery))
    : CREATE_ACTION_OPTIONS;

  const handleToggleOption = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAdd = () => {
    if (selectedKeys.length === 0) return;
    CREATE_ACTION_OPTIONS
      .filter((opt) => selectedKeys.includes(opt.key))
      .forEach((option) => onSelect(option));
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
                      selected={selectedKeys.includes(option.key)}
                      onClick={() => handleToggleOption(option.key)}
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
            disabled={selectedKeys.length === 0}
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
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expandedActions, setExpandedActions] = useState(true);
  const [filterText, setFilterText] = useState('');

  const { linkCardActions, isLoadingLinkCardActions, getLinkCardPossibleActions } = useBusinessRuleReducer((s) => s);

  useEffect(() => {
    if (!show) return;
    setSelectedKeys([]);
    setFilterText('');
    getLinkCardPossibleActions();
  }, [show]);

  const mappedActions = linkCardActions.map((action) => ({
    key: action.relation_key,
    label: action.relation_label,
  }));

  // Dev-only fallback so the modal can be visually tested without a live backend.
  const linkActionOptions = mappedActions.length > 0 ? mappedActions : (import.meta.env.DEV ? LINK_ACTION_OPTIONS : []);

  const filterQuery = filterText.trim().toLowerCase();
  const filteredOptions = filterQuery
    ? linkActionOptions.filter((opt) => opt.label.toLowerCase().includes(filterQuery))
    : linkActionOptions;

  const handleToggleOption = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAdd = () => {
    if (selectedKeys.length === 0) return;
    linkActionOptions
      .filter((opt) => selectedKeys.includes(opt.key))
      .forEach((option) => onSelect(option));
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
                {isLoadingLinkCardActions ? (
                  <div className="br-property-picker-empty">Loading...</div>
                ) : filteredOptions.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  filteredOptions.map((option) => (
                    <PropertyPill
                      key={option.key}
                      pillKey={option.key}
                      label={option.label}
                      selected={selectedKeys.includes(option.key)}
                      onClick={() => handleToggleOption(option.key)}
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
            disabled={selectedKeys.length === 0}
            onClick={handleAdd}
          >
            Add
          </button>
        </footer>
      </div>
    </Modal>
  );
}

function BoardMinimapModal({ show, onClose, onSave, initialBoardId }) {
  const [boardId, setBoardId] = useState('');
  const [isBoardPickerOpen, setIsBoardPickerOpen] = useState(false);
  const [boardFilterText, setBoardFilterText] = useState('');
  const [hoveredLeafColumnId, setHoveredLeafColumnId] = useState(null);
  const [hoveredSwimlaneId, setHoveredSwimlaneId] = useState(null);

  const boardPickerTriggerRef = useRef(null);
  const boardPickerPanelRef = useRef(null);

  const { workspaces, listAllWorkspaces } = useWorkSpaceReducer((s) => s);
  const displayWorkspaces = useMemo(() => workspaces ?? [], [workspaces]);
  const boards = displayWorkspaces.flatMap((w) =>
    (w.boards ?? []).map((b) => ({ ...b, workspace_name: w.workspace_name }))
  );

  const boardFilterQuery = boardFilterText.trim().toLowerCase();
  const filteredWorkspaceGroups = displayWorkspaces
    .map((w) => {
      const wsMatch = w.workspace_name.toLowerCase().includes(boardFilterQuery);
      const groupBoards = wsMatch
        ? (w.boards ?? [])
        : (w.boards ?? []).filter((b) => b.board_name.toLowerCase().includes(boardFilterQuery));
      return { workspace_id: w.workspace_id, workspace_name: w.workspace_name, boards: groupBoards };
    })
    .filter((g) => g.boards.length > 0);

  const selectedBoard = boards.find((b) => String(b.board_id) === String(boardId));

  const handlePickBoard = (board) => {
    setBoardId(board.board_id);
    setIsBoardPickerOpen(false);
    setBoardFilterText('');
  };

  useEffect(() => {
    if (!show) return;
    setBoardId(initialBoardId ?? '');
    setIsBoardPickerOpen(false);
    setBoardFilterText('');
    if (workspaces.length === 0) listAllWorkspaces();
  }, [show]);

  useEffect(() => {
    if (!show || boardId || initialBoardId) return;
    const firstBoard = displayWorkspaces[0]?.boards?.[0];
    if (firstBoard) setBoardId(firstBoard.board_id);
  }, [show, boardId, initialBoardId, displayWorkspaces]);

  useEffect(() => {
    if (!isBoardPickerOpen) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (boardPickerPanelRef.current?.contains(t)) return;
      if (boardPickerTriggerRef.current?.contains(t)) return;
      setIsBoardPickerOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isBoardPickerOpen]);

  // The swimlanes and the column/header layout below are a fixed demo dataset (see
  // DUMMY_BOARD_* in businessRulesData.js) shown for every board regardless of its
  // real structure, per client-facing walkthrough requirements.
  const swimlanes = DUMMY_BOARD_SWIMLANES;
  const areaGroups = DUMMY_BOARD_AREA_GROUPS;
  const headerCells = DUMMY_BOARD_HEADER_CELLS;
  const leafColumns = DUMMY_BOARD_LEAF_COLUMNS;

  const handlePickCell = (swimlane, leafColumn) => {
    onSave({
      boardId,
      boardName: selectedBoard?.board_name ?? '',
      swimlaneId: swimlane.id,
      swimlaneName: swimlane.name,
      stageId: leafColumn.id,
      stageName: leafColumn.name,
    });
    onClose();
  };

  // Column header pick: matches this stage in any swimlane (row left blank).
  const handlePickColumn = (leafColumn) => {
    onSave({
      boardId,
      boardName: selectedBoard?.board_name ?? '',
      swimlaneId: '',
      swimlaneName: '',
      stageId: leafColumn.id,
      stageName: leafColumn.name,
    });
    onClose();
  };

  // Row header pick: matches any stage within this swimlane (column left blank).
  const handlePickRow = (swimlane) => {
    onSave({
      boardId,
      boardName: selectedBoard?.board_name ?? '',
      swimlaneId: swimlane.id,
      swimlaneName: swimlane.name,
      stageId: '',
      stageName: '',
    });
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="card-property-match-modal board-minimap-modal"
      dialogClassName="card-property-match-modal-dialog board-minimap-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell">
        <header className="card-property-match-modal-header">
          <h2 className="card-property-match-modal-title">Board Minimap</h2>
          <button
            type="button"
            className="business-rule-form-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="card-property-match-modal-body board-minimap-body">
          <div className="board-minimap-picker-wrap">
            <button
              type="button"
              ref={boardPickerTriggerRef}
              className="board-minimap-board-trigger"
              onClick={() => setIsBoardPickerOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={isBoardPickerOpen}
            >
              <span>
                {selectedBoard ? `${selectedBoard.workspace_name} / ${selectedBoard.board_name}` : 'Select a board'}
              </span>
              <FiChevronDown aria-hidden />
            </button>

            {isBoardPickerOpen && (
              <div className="board-minimap-picker-panel" ref={boardPickerPanelRef}>
                <div className="board-minimap-picker-search">
                  <FiFilter size={20} className="board-minimap-picker-search-icon" aria-hidden />
                  <input
                    type="text"
                    placeholder="Filter"
                    value={boardFilterText}
                    onChange={(e) => setBoardFilterText(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="board-minimap-picker-scroll">
                  {filteredWorkspaceGroups.length === 0 ? (
                    <div className="br-property-picker-empty">No matches</div>
                  ) : (
                    filteredWorkspaceGroups.map((ws) => (
                      <div key={ws.workspace_id} className="board-minimap-picker-group">
                        <div className="board-minimap-picker-group-head">
                          <FiUsers size={20} aria-hidden />
                          <span>{ws.workspace_name}</span>
                        </div>
                        <div className="board-minimap-picker-grid">
                          {ws.boards.map((board) => (
                            <button
                              type="button"
                              key={board.board_id}
                              className={`board-minimap-picker-tile${String(board.board_id) === String(boardId) ? ' board-minimap-picker-tile--selected' : ''}`}
                              onClick={() => handlePickBoard(board)}
                            >
                              {board.board_name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {!boardId ? (
            <div className="br-property-picker-empty">Select a board to view its structure</div>
          ) : swimlanes.length === 0 ? (
            <div className="br-property-picker-empty">No lanes found for this board</div>
          ) : (
            <div className="board-minimap-grid">
              <div className="board-minimap-title-bar">{DUMMY_BOARD_TITLE}</div>

              <div className="board-minimap-area-row">
                {areaGroups.map((group, idx) => (
                  <div
                    key={`${group.area}-${idx}`}
                    className="board-minimap-area-cell"
                    style={{ flexGrow: group.span, backgroundColor: group.color }}
                  >
                    {group.area}
                  </div>
                ))}
              </div>

              <div className="board-minimap-header-grid">
                {headerCells.map((cell) => {
                  // Only cells that map 1:1 to a real leaf column (e.g. not the
                  // PREPARE ORDER / ORDER COMPLETED group labels, which span
                  // several leaf columns and have no single stageId of their own)
                  // are selectable as "whole column".
                  const leafColumn = leafColumns.find((lc) => lc.id === cell.gridArea);
                  const isClickable = Boolean(leafColumn);
                  return (
                    <div
                      key={cell.gridArea}
                      className={`board-minimap-header-cell board-minimap-header-cell--${cell.gridArea}${isClickable ? ' board-minimap-header-cell--clickable' : ''}`}
                      role={isClickable ? 'button' : undefined}
                      tabIndex={isClickable ? 0 : undefined}
                      onMouseEnter={isClickable ? () => setHoveredLeafColumnId(leafColumn.id) : undefined}
                      onMouseLeave={isClickable ? () => setHoveredLeafColumnId(null) : undefined}
                      onClick={isClickable ? () => handlePickColumn(leafColumn) : undefined}
                    >
                      {cell.name}
                    </div>
                  );
                })}
              </div>

              {swimlanes.map((swimlane) => {
                const isBottomGroup = BOTTOM_GROUP_SWIMLANE_NAMES.includes(swimlane.name);
                const rowStages = isBottomGroup ? DUMMY_BOARD_BOTTOM_STAGES : leafColumns;
                const showStageLabels = swimlane.name === 'TEST';

                return (
                  <div key={swimlane.id} className="board-minimap-lane-row">
                    <div
                      className="board-minimap-lane-label"
                      style={swimlane.colorCode
                        ? { backgroundColor: swimlane.colorCode, color: pickForegroundOnSwimlaneBackground(swimlane.colorCode) }
                        : undefined}
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => setHoveredSwimlaneId(swimlane.id)}
                      onMouseLeave={() => setHoveredSwimlaneId(null)}
                      onClick={() => handlePickRow(swimlane)}
                    >
                      {swimlane.name}
                    </div>
                    <div className="board-minimap-lane-cells">
                      {rowStages.map((stage) => (
                        <button
                          type="button"
                          key={stage.id}
                          className={`board-minimap-cell${stage.accent ? ` board-minimap-cell--${stage.accent}` : ''}${showStageLabels ? ' board-minimap-cell--labeled' : ''}${hoveredLeafColumnId === stage.id && !showStageLabels ? ' board-minimap-cell--col-active' : ''}${hoveredSwimlaneId === swimlane.id ? ' board-minimap-cell--row-active' : ''}`}
                          style={showStageLabels ? { borderTopColor: stage.color } : undefined}
                          onMouseEnter={showStageLabels ? () => setHoveredLeafColumnId(stage.id) : undefined}
                          onMouseLeave={showStageLabels ? () => setHoveredLeafColumnId(null) : undefined}
                          onClick={() => handlePickCell(swimlane, stage)}
                          aria-label={`Move to ${swimlane.name}, ${stage.name}`}
                        >
                          {showStageLabels ? stage.name : null}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function RefineUpdateCriteriaModal({ show, onClose, onSelect, existingFieldLabels, triggerTypeId }) {
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectedCustomFields, setSelectedCustomFields] = useState([]);
  const [expandedRegularFields, setExpandedRegularFields] = useState(true);
  const [expandedCustomFields, setExpandedCustomFields] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [showDisabled, setShowDisabled] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { customFields, isLoadingCustomFields } = useCustomFieldsByTrigger({
    show, triggerTypeId, boardId: selectedBoardId, showDisabled, search: debouncedSearch,
  });
  const { workspaces, listAllWorkspaces } = useWorkSpaceReducer((s) => s);

  // Only fall back to dummy data in the untouched/no-filter state — once a board,
  // the disabled toggle, or a search term narrows the results, an empty response is a
  // real answer (e.g. "no disabled fields on this board") and must be shown as empty,
  // not masked by an unrelated generic dummy list.
  const isCustomFieldsUnfiltered = !selectedBoardId && !showDisabled && !debouncedSearch;
  const displayCustomFields = customFields.length > 0
    ? customFields
    : (isCustomFieldsUnfiltered ? DUMMY_CUSTOM_FIELDS : []);

  const isFieldUsed = (field) =>
    (existingFieldLabels ?? []).includes(getFieldLabel(field).trim().toLowerCase());

  const filterQuery = filterText.trim().toLowerCase();
  const filteredRegularOptions = filterQuery
    ? UPDATE_ACTION_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(filterQuery))
    : UPDATE_ACTION_OPTIONS;
  const filteredCustomFields = displayCustomFields;

  useEffect(() => {
    if (!show) return;
    setSelectedActions([]);
    setSelectedCustomFields([]);
    setFilterText('');
    setDebouncedSearch('');
    if (workspaces.length === 0) listAllWorkspaces();
  }, [show]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filterText.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [filterText]);

  const handlePickAction = (option) => {
    const key = `action-${option.key}`;
    setSelectedActions((prev) =>
      prev.some((item) => item.key === key)
        ? prev.filter((item) => item.key !== key)
        : [...prev, { key, item: option }]
    );
  };

  const handlePickCustom = (field, idx) => {
    const key = `custom-${field.custom_field_id ?? idx}`;
    setSelectedCustomFields((prev) =>
      prev.some((item) => item.key === key)
        ? prev.filter((item) => item.key !== key)
        : [...prev, { key, item: field }]
    );
  };

  const handleAdd = () => {
    if (selectedActions.length === 0 && selectedCustomFields.length === 0) return;
    selectedActions.forEach(({ item }) => onSelect(item, { category_key: 'action' }));
    selectedCustomFields.forEach(({ item }) => onSelect(item, { category_key: 'custom' }));
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
          <h2 className="card-property-match-modal-title">Refine Update Criteria</h2>
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
                {filteredRegularOptions.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  filteredRegularOptions.map((option) => (
                    <PropertyPill
                      key={option.key}
                      pillKey={option.key}
                      label={option.label}
                      selected={selectedActions.some((item) => item.key === `action-${option.key}`)}
                      onClick={() => handlePickAction(option)}
                    />
                  ))
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
                    <BoardFilterPicker
                      workspaces={workspaces ?? []}
                      value={selectedBoardId}
                      onChange={setSelectedBoardId}
                    />
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
                          selected={selectedCustomFields.some((item) => item.key === key)}
                          dotColor={getPropertyDotColor(idx)}
                          disabled={isFieldUsed(field)}
                          onClick={() => handlePickCustom(field, idx)}
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
            disabled={selectedActions.length === 0 && selectedCustomFields.length === 0}
            onClick={handleAdd}
          >
            Add
          </button>
        </footer>
      </div>
    </Modal>
  );
}

function UserPill({ pillKey, label, selected, onClick }) {
  return (
    <button
      type="button"
      key={pillKey}
      className={`br-property-pill br-user-pill${selected ? ' br-property-pill--selected' : ''}`}
      onClick={onClick}
    >
      <span className="br-user-pill-avatar" aria-hidden>{label.charAt(0).toUpperCase()}</span>
      {label}
    </button>
  );
}

function InternalUsersPickerModal({ show, onClose, onApply }) {
  const [filterText, setFilterText] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [selectedNames, setSelectedNames] = useState([]);

  const { users, usersLoading, getUsers } = useCommonReducer((s) => s);

  useEffect(() => {
    if (!show) return;
    setFilterText('');
    setExpanded(true);
    setSelectedNames([]);
    if (users.length === 0 && !usersLoading) getUsers({ params: { limit: 200 } });
  }, [show]);

  const realUserNames = users.map((u) => u.name).filter(Boolean);
  const displayUserNames = realUserNames.length > 0 ? realUserNames : (import.meta.env.DEV ? DUMMY_INTERNAL_USERS : []);
  const allOptions = [...INTERNAL_USER_ROLE_OPTIONS, ...displayUserNames];

  const filterQuery = filterText.trim().toLowerCase();
  const filteredOptions = filterQuery
    ? allOptions.filter((name) => name.toLowerCase().includes(filterQuery))
    : allOptions;

  const handleToggle = (name) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleApply = () => {
    if (selectedNames.length === 0) return;
    onApply(selectedNames);
    onClose();
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="card-property-match-modal internal-users-picker-modal"
      dialogClassName="card-property-match-modal-dialog internal-users-picker-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell br-floating-close-shell">
        <button
          type="button"
          className="br-floating-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        <header className="card-property-match-modal-header br-floating-close-header">
          <h2 className="card-property-match-modal-title">Select Internal Users</h2>
        </header>

        <div className="card-property-match-modal-body">
          <input
            type="text"
            className="br-property-filter-input"
            placeholder="John or john@doe.com"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            autoFocus
          />

          <div className="br-property-section">
            <button
              type="button"
              className="br-property-section-toggle"
              onClick={() => setExpanded((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Users
            </button>
            {expanded && (
              <div className="br-property-pill-grid">
                {usersLoading ? (
                  <div className="br-property-picker-empty">Loading...</div>
                ) : filteredOptions.length === 0 ? (
                  <div className="br-property-picker-empty">No users found</div>
                ) : (
                  filteredOptions.map((name) => (
                    <UserPill
                      key={name}
                      pillKey={name}
                      label={name}
                      selected={selectedNames.includes(name)}
                      onClick={() => handleToggle(name)}
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
            disabled={selectedNames.length === 0}
            onClick={handleApply}
          >
            Apply
          </button>
        </footer>
      </div>
    </Modal>
  );
}

InternalUsersPickerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};

function CustomFieldPickerModal({ show, onClose, onApply, triggerTypeId }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [showDisabled, setShowDisabled] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedFieldKeys, setSelectedFieldKeys] = useState([]);

  const { customFields, isLoadingCustomFields } = useCustomFieldsByTrigger({
    show, triggerTypeId, boardId: selectedBoardId, showDisabled, search: debouncedSearch,
  });
  const { workspaces, listAllWorkspaces } = useWorkSpaceReducer((s) => s);

  // Only fall back to dummy data in the untouched/no-filter state — once a board,
  // the disabled toggle, or a search term narrows the results, an empty response is a
  // real answer (e.g. "no disabled fields on this board") and must be shown as empty,
  // not masked by an unrelated generic dummy list.
  const isCustomFieldsUnfiltered = !selectedBoardId && !showDisabled && !debouncedSearch;
  const displayCustomFields = customFields.length > 0
    ? customFields
    : (isCustomFieldsUnfiltered ? DUMMY_CUSTOM_FIELDS : []);

  useEffect(() => {
    if (!show) return;
    setExpanded(true);
    setSelectedBoardId('');
    setShowDisabled(false);
    setFilterText('');
    setDebouncedSearch('');
    setSelectedFieldKeys([]);
    if (workspaces.length === 0) listAllWorkspaces();
  }, [show]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filterText.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [filterText]);

  const handleToggleField = (key) => {
    setSelectedFieldKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleApply = () => {
    const labels = selectedFieldKeys
      .map((key) => displayCustomFields.find((f, idx) => `custom-${f.custom_field_id ?? idx}` === key))
      .filter(Boolean)
      .map((field) => getFieldLabel(field));
    if (labels.length === 0) return;
    onApply(labels);
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
      <div className="card-property-match-modal-shell br-floating-close-shell">
        <button
          type="button"
          className="br-floating-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        <header className="card-property-match-modal-header br-floating-close-header">
          <h2 className="card-property-match-modal-title">Select a field</h2>
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
              onClick={() => setExpanded((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Custom fields
            </button>
            {expanded && (
              <>
                <div className="br-property-board-filter">
                  <span className="br-property-board-filter-label">Show fields from board:</span>
                  <div className="br-property-board-filter-row">
                    <BoardFilterPicker
                      workspaces={workspaces ?? []}
                      value={selectedBoardId}
                      onChange={setSelectedBoardId}
                    />
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
                  ) : displayCustomFields.length === 0 ? (
                    <div className="br-property-picker-empty">No custom fields found</div>
                  ) : (
                    displayCustomFields.map((field, idx) => {
                      const key = `custom-${field.custom_field_id ?? idx}`;
                      return (
                        <PropertyPill
                          key={key}
                          pillKey={key}
                          label={getFieldLabel(field)}
                          selected={selectedFieldKeys.includes(key)}
                          dotColor={getPropertyDotColor(idx)}
                          onClick={() => handleToggleField(key)}
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
            disabled={selectedFieldKeys.length === 0}
            onClick={handleApply}
          >
            Apply
          </button>
        </footer>
      </div>
    </Modal>
  );
}

CustomFieldPickerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  triggerTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

// Single-select "Select a field" picker covering Regular fields, Time unit and
// Custom fields together, used by the notification Subject/Body "add card
// fields" triggers so any card field (not just a fixed shortlist) can be
// inserted as a pill.
function CardFieldPickerModal({ show, onClose, onApply, triggerTypeId }) {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expandedRegularFields, setExpandedRegularFields] = useState(true);
  const [expandedTimeUnit, setExpandedTimeUnit] = useState(true);
  const [expandedCustomFields, setExpandedCustomFields] = useState(true);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [showDisabled, setShowDisabled] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const {
    regularFields, isLoadingRegularFields, getRegularFields,
    timeUnits, isLoadingTimeUnits, getTimeUnits,
  } = useBusinessRuleReducer((s) => s);

  const { customFields, isLoadingCustomFields } = useCustomFieldsByTrigger({
    show, triggerTypeId, boardId: selectedBoardId, showDisabled, search: debouncedSearch,
  });

  const { workspaces, listAllWorkspaces } = useWorkSpaceReducer((s) => s);

  const displayRegularFields = regularFields.length > 0 ? regularFields : DUMMY_REGULAR_FIELDS;
  const displayTimeUnits = timeUnits.length > 0 ? timeUnits : DUMMY_TIME_UNITS;
  // Only fall back to dummy data in the untouched/no-filter state — once a board,
  // the disabled toggle, or a search term narrows the results, an empty response is a
  // real answer (e.g. "no disabled fields on this board") and must be shown as empty,
  // not masked by an unrelated generic dummy list.
  const isCustomFieldsUnfiltered = !selectedBoardId && !showDisabled && !debouncedSearch;
  const displayCustomFields = customFields.length > 0
    ? customFields
    : (isCustomFieldsUnfiltered ? DUMMY_CUSTOM_FIELDS : []);

  useEffect(() => {
    if (!show) return;
    setSelectedKeys([]);
    setFilterText('');
    setDebouncedSearch('');
    setSelectedBoardId('');
    setShowDisabled(false);
    if (workspaces.length === 0) listAllWorkspaces();
  }, [show]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filterText.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [filterText]);

  useEffect(() => {
    if (!show) return;
    getRegularFields({ params: { trigger_type_id: triggerTypeId, search: debouncedSearch || undefined } });
  }, [show, debouncedSearch, triggerTypeId]);

  useEffect(() => {
    if (!show) return;
    getTimeUnits({ params: { trigger_type_id: triggerTypeId, search: debouncedSearch || undefined } });
  }, [show, debouncedSearch, triggerTypeId]);

  const handleToggleKey = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleToggleTimeUnitKey = (key) => {
    setSelectedKeys((prev) => {
      const withoutTimeUnits = prev.filter((k) => !k.startsWith('time_unit-'));
      return prev.includes(key) ? withoutTimeUnits : [...withoutTimeUnits, key];
    });
  };

  const findLabelForKey = (key) => {
    if (key.startsWith('regular-')) {
      const field = displayRegularFields.find((f, idx) => `regular-${f.regular_field_id ?? idx}` === key);
      return field ? getFieldLabel(field) : null;
    }
    if (key.startsWith('time_unit-')) {
      const field = displayTimeUnits.find((f, idx) => `time_unit-${f.time_unit_id ?? idx}` === key);
      return field ? getFieldLabel(field) : null;
    }
    const field = displayCustomFields.find((f, idx) => `custom-${f.custom_field_id ?? idx}` === key);
    return field ? getFieldLabel(field) : null;
  };

  const handleApply = () => {
    const labels = selectedKeys.map(findLabelForKey).filter(Boolean);
    if (labels.length === 0) return;
    onApply(labels);
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
      <div className="card-property-match-modal-shell br-floating-close-shell">
        <button
          type="button"
          className="br-floating-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        <header className="card-property-match-modal-header br-floating-close-header">
          <h2 className="card-property-match-modal-title">Select a field</h2>
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
                ) : displayRegularFields.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  displayRegularFields.map((field, idx) => {
                    const key = `regular-${field.regular_field_id ?? idx}`;
                    return (
                      <PropertyPill
                        key={key}
                        pillKey={key}
                        label={getFieldLabel(field)}
                        selected={selectedKeys.includes(key)}
                        onClick={() => handleToggleKey(key)}
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
                ) : displayTimeUnits.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  displayTimeUnits.map((field, idx) => {
                    const key = `time_unit-${field.time_unit_id ?? idx}`;
                    return (
                      <PropertyPill
                        key={key}
                        pillKey={key}
                        label={getFieldLabel(field)}
                        selected={selectedKeys.includes(key)}
                        onClick={() => handleToggleTimeUnitKey(key)}
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
                    <BoardFilterPicker
                      workspaces={workspaces ?? []}
                      value={selectedBoardId}
                      onChange={setSelectedBoardId}
                    />
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
                  ) : displayCustomFields.length === 0 ? (
                    <div className="br-property-picker-empty">No custom fields found</div>
                  ) : (
                    displayCustomFields.map((field, idx) => {
                      const key = `custom-${field.custom_field_id ?? idx}`;
                      return (
                        <PropertyPill
                          key={key}
                          pillKey={key}
                          label={getFieldLabel(field)}
                          selected={selectedKeys.includes(key)}
                          dotColor={getPropertyDotColor(idx)}
                          onClick={() => handleToggleKey(key)}
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
            disabled={selectedKeys.length === 0}
            onClick={handleApply}
          >
            Apply
          </button>
        </footer>
      </div>
    </Modal>
  );
}

CardFieldPickerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  triggerTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function NotificationSettingsModal({ show, onClose, onSave, initialSettings, triggerTypeId }) {
  const [to, setTo] = useState([]);
  const [cc, setCc] = useState([]);
  const [subjectParts, setSubjectParts] = useState(DUMMY_NOTIFICATION_SUBJECT_PARTS);
  const [bodyContent, setBodyContent] = useState(() => new QuillDelta(DUMMY_NOTIFICATION_BODY_DELTA_OPS));
  const [showInternalUsersModal, setShowInternalUsersModal] = useState(false);
  const [internalUsersTarget, setInternalUsersTarget] = useState(null);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [customFieldTarget, setCustomFieldTarget] = useState(null);
  const [showCardFieldModal, setShowCardFieldModal] = useState(false);
  const [cardFieldTarget, setCardFieldTarget] = useState(null);
  const quillRef = useRef(null);
  const quillWrapRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    setTo(initialSettings?.to ?? []);
    setCc(initialSettings?.cc ?? []);
    setSubjectParts(initialSettings?.subjectParts ?? DUMMY_NOTIFICATION_SUBJECT_PARTS);
    setBodyContent(initialSettings?.bodyContent ?? new QuillDelta(DUMMY_NOTIFICATION_BODY_DELTA_OPS));
    setShowInternalUsersModal(false);
    setInternalUsersTarget(null);
    setShowCustomFieldModal(false);
    setCustomFieldTarget(null);
    setShowCardFieldModal(false);
    setCardFieldTarget(null);
  }, [show, initialSettings]);

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill || quill._pillMatcherAdded) return;
    quill.clipboard.addMatcher('span.notification-pill', (node) => new QuillDelta().insert(node.textContent, { pill: true }));
    quill._pillMatcherAdded = true;
  }, [show]);

  const appendTokens = (setter, labels, type) => {
    setter((prev) => [
      ...prev,
      ...labels.filter((label) => !prev.some((t) => t.label === label)).map((label) => ({ label, type })),
    ]);
  };

  const handleRemoveToken = (target, label) => {
    const setter = target === 'cc' ? setCc : setTo;
    setter((prev) => prev.filter((t) => t.label !== label));
  };

  const handleOpenInternalUsersModal = (target) => {
    setInternalUsersTarget(target);
    setShowInternalUsersModal(true);
  };

  const handleApplyInternalUsers = (names) => {
    appendTokens(internalUsersTarget === 'cc' ? setCc : setTo, names, 'user');
    setInternalUsersTarget(null);
  };

  const handleOpenCustomFieldModal = (target) => {
    setCustomFieldTarget(target);
    setShowCustomFieldModal(true);
  };

  const handleApplyCustomField = (fieldLabels) => {
    appendTokens(customFieldTarget === 'cc' ? setCc : setTo, fieldLabels, 'field');
    setCustomFieldTarget(null);
  };

  const handleAddSubjectField = (field) => {
    setSubjectParts((prev) => [...prev, { type: 'pill', value: field }]);
  };

  const handleAddBodyField = (field) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const index = quill.getSelection(true)?.index ?? quill.getLength();
    quill.insertText(index, field, { pill: true });
    quill.insertText(index + field.length, ' ', { pill: false });
    quill.setSelection(index + field.length + 1, 0);
  };

  const handleOpenCardFieldModal = (target) => {
    setCardFieldTarget(target);
    setShowCardFieldModal(true);
  };

  const handleApplyCardField = (fieldLabels) => {
    fieldLabels.forEach((label) => {
      if (cardFieldTarget === 'body') {
        handleAddBodyField(label);
      } else {
        handleAddSubjectField(label);
      }
    });
    setCardFieldTarget(null);
  };

  const handleSave = () => {
    onSave({ to, cc, subjectParts, bodyContent });
    onClose();
  };

  const quillModules = useMemo(() => ({
    table: false,
    toolbar: [
      [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['image', 'table-better'],
      ['clean'],
    ],
    'table-better': {
      language: 'en_US',
      menus: ['column', 'row', 'merge', 'table', 'cell', 'wrap', 'delete'],
      toolbarTable: true,
    },
    keyboard: { bindings: QuillTableBetter.keyboardBindings },
  }), []);

  useLayoutEffect(() => {
    if (!show) return undefined;
    const toolbar = quillWrapRef.current?.querySelector('.ql-toolbar');
    if (!toolbar) return undefined;
    return attachToolbarOverflow(toolbar);
  }, [show]);

  return (
    <>
    <Modal
      show={show}
      onHide={onClose}
      className="card-property-match-modal notification-settings-modal"
      dialogClassName="card-property-match-modal-dialog notification-settings-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell">
        <header className="card-property-match-modal-header">
          <h2 className="card-property-match-modal-title">Notification Message Settings</h2>
          <button
            type="button"
            className="business-rule-form-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="card-property-match-modal-body notification-settings-body">
          <div className="notification-field">
            <label className="business-rule-form-label">From:</label>
            <div className="business-rule-form-select-wrap">
              <select className="business-rule-form-select" value={DUMMY_NOTIFICATION_FROM_EMAIL} disabled>
                <option value={DUMMY_NOTIFICATION_FROM_EMAIL}>{DUMMY_NOTIFICATION_FROM_EMAIL}</option>
              </select>
              <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
            </div>
          </div>

          <div className="notification-field">
            <div className="notification-field-head">
              <label className="business-rule-form-label">To:</label>
              <div className="notification-field-actions">
                <button
                  type="button"
                  className="notification-dropdown-trigger"
                  onClick={() => handleOpenInternalUsersModal('to')}
                >
                  add internal users <FiChevronDown size={12} aria-hidden />
                </button>
                <button
                  type="button"
                  className="notification-dropdown-trigger"
                  onClick={() => handleOpenCustomFieldModal('to')}
                >
                  add custom fields <FiChevronDown size={12} aria-hidden />
                </button>
              </div>
            </div>
            <div className="notification-subject-box">
              {to.map((token) => (
                <span key={token.label} className={`notification-user-pill notification-user-pill--${token.type}`}>
                  {token.label}
                  <button
                    type="button"
                    className="notification-user-pill-remove"
                    onClick={() => handleRemoveToken('to', token.label)}
                    aria-label={`Remove ${token.label}`}
                  >
                    <FiX size={12} aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="notification-field">
            <div className="notification-field-head">
              <label className="business-rule-form-label">Cc:</label>
              <div className="notification-field-actions">
                <button
                  type="button"
                  className="notification-dropdown-trigger"
                  onClick={() => handleOpenInternalUsersModal('cc')}
                >
                  add internal users <FiChevronDown size={12} aria-hidden />
                </button>
                <button
                  type="button"
                  className="notification-dropdown-trigger"
                  onClick={() => handleOpenCustomFieldModal('cc')}
                >
                  add custom fields <FiChevronDown size={12} aria-hidden />
                </button>
              </div>
            </div>
            <div className="notification-subject-box">
              {cc.map((token) => (
                <span key={token.label} className={`notification-user-pill notification-user-pill--${token.type}`}>
                  {token.label}
                  <button
                    type="button"
                    className="notification-user-pill-remove"
                    onClick={() => handleRemoveToken('cc', token.label)}
                    aria-label={`Remove ${token.label}`}
                  >
                    <FiX size={12} aria-hidden />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="notification-field">
            <div className="notification-field-head">
              <label className="business-rule-form-label">Subject:</label>
              <div className="notification-field-actions">
                <button
                  type="button"
                  className="notification-dropdown-trigger"
                  onClick={() => handleOpenCardFieldModal('subject')}
                >
                  add card fields <FiChevronDown size={12} aria-hidden />
                </button>
              </div>
            </div>
            <div className="notification-subject-box">
              {subjectParts.map((part, idx) => (
                part.type === 'pill' ? (
                  <span key={idx} className="notification-pill">{part.value}</span>
                ) : (
                  <span key={idx} className="notification-subject-text">{part.value}</span>
                )
              ))}
            </div>
          </div>

          <div className="notification-field">
            <div className="notification-field-head">
              <label className="business-rule-form-label">Body:</label>
            </div>
            <div className="notification-quill-wrap" ref={quillWrapRef}>
              <ReactQuill ref={quillRef} theme="snow" modules={quillModules} value={bodyContent} onChange={setBodyContent} />
            </div>
          </div>
        </div>

        <footer className="card-property-match-modal-footer">
          <button type="button" className="br-property-add-btn" onClick={handleSave}>
            Save
          </button>
        </footer>
      </div>
    </Modal>

    <InternalUsersPickerModal
      show={showInternalUsersModal}
      onClose={() => setShowInternalUsersModal(false)}
      onApply={handleApplyInternalUsers}
    />

    <CustomFieldPickerModal
      show={showCustomFieldModal}
      onClose={() => setShowCustomFieldModal(false)}
      onApply={handleApplyCustomField}
      triggerTypeId={triggerTypeId}
    />

    <CardFieldPickerModal
      show={showCardFieldModal}
      onClose={() => setShowCardFieldModal(false)}
      onApply={handleApplyCardField}
      triggerTypeId={triggerTypeId}
    />
    </>
  );
}

function SelectFieldModal({ show, onClose, onSelect, fields }) {
  const [filterText, setFilterText] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    if (!show) return;
    setFilterText('');
    setExpanded(true);
    setSelectedFields([]);
  }, [show]);

  const filterQuery = filterText.trim().toLowerCase();
  const filteredFields = filterQuery
    ? fields.filter((f) => f.toLowerCase().includes(filterQuery))
    : fields;

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const handleApply = () => {
    if (selectedFields.length === 0) return;
    onSelect(selectedFields);
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
      <div className="card-property-match-modal-shell br-floating-close-shell">
        <button
          type="button"
          className="br-floating-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        <header className="card-property-match-modal-header br-floating-close-header">
          <h2 className="card-property-match-modal-title">Select fields</h2>
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
              onClick={() => setExpanded((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Regular fields
            </button>
            {expanded && (
              <div className="br-property-pill-grid">
                {filteredFields.length === 0 ? (
                  <div className="br-property-picker-empty">No fields found</div>
                ) : (
                  filteredFields.map((field) => (
                    <PropertyPill
                      key={field}
                      pillKey={field}
                      label={field}
                      selected={selectedFields.includes(field)}
                      onClick={() => toggleField(field)}
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
            disabled={selectedFields.length === 0}
            onClick={handleApply}
          >
            Apply{selectedFields.length > 0 ? ` (${selectedFields.length})` : ''}
          </button>
        </footer>
      </div>
    </Modal>
  );
}

SelectFieldModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const makeInvokeRowId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// The service invoke rows always keep one blank trailing row so the user can
// start typing directly into it, instead of clicking a separate "Add" link.
const isBlankHeaderRow = (row) => !row.key.trim() && !row.value.trim();
const isBlankParamRow = (row) => !row.key.trim() && !row.value.trim() && row.fields.length === 0;

const withTrailingBlankHeader = (list) =>
  (list.length === 0 || !isBlankHeaderRow(list[list.length - 1]))
    ? [...list, { id: makeInvokeRowId(), key: '', value: '' }]
    : list;

const withTrailingBlankParam = (list) =>
  (list.length === 0 || !isBlankParamRow(list[list.length - 1]))
    ? [...list, { id: makeInvokeRowId(), key: '', value: '', fields: [] }]
    : list;

// POST/PUT/PATCH/DELETE requests automatically carry a default parameter with
// the triggering card's information; GET requests have no body to carry it in.
const DEFAULT_PAYLOAD_KEY = 'kanbanize_payload';
const DEFAULT_PAYLOAD_FIELD = 'Kanbanize Payload';
const isDefaultPayloadRow = (row) => row.key === DEFAULT_PAYLOAD_KEY && row.fields.length === 1 && row.fields[0] === DEFAULT_PAYLOAD_FIELD;

const withDefaultPayloadRow = (list, supportsBody) => {
  const hasDefault = list.some(isDefaultPayloadRow);
  if (supportsBody && !hasDefault) {
    return [{ id: makeInvokeRowId(), key: DEFAULT_PAYLOAD_KEY, value: '', fields: [DEFAULT_PAYLOAD_FIELD] }, ...list];
  }
  if (!supportsBody && hasDefault) {
    return list.filter((row) => !isDefaultPayloadRow(row));
  }
  return list;
};

// The default payload row is only auto-seeded the first time an invoke action
// is configured. Once the action has been saved at least once (its params were
// persisted, e.g. the user deliberately deleted the default row), that choice
// is respected instead of silently re-adding the row on every reopen/re-save.
const buildInitialInvokeParams = (initialParams, supportsBody, hasSavedParams) =>
  withTrailingBlankParam(
    hasSavedParams ? (initialParams ?? []) : withDefaultPayloadRow(initialParams ?? [], supportsBody)
  );

// Card fields inserted into the Url are stored inline as "{Field Name}" tokens
// in the saved url string (so the shape stays a plain string on the wire), but
// shown in the editor as removable pills like the Params value box — this pulls
// the tokens back out into a pill list on load.
const URL_FIELD_TOKEN_RE = /\{([^}]+)\}/g;
const splitUrlFields = (rawUrl) => {
  const fields = [];
  const base = (rawUrl ?? '').replace(URL_FIELD_TOKEN_RE, (_, name) => {
    fields.push(name);
    return '';
  });
  return { base, fields };
};
const joinUrlFields = (base, fields) => base + fields.map((f) => `{${f}}`).join('');

function WebInvokeSettingsModal({ show, onClose, onSave, initialSettings }) {
  const [serviceName, setServiceName] = useState('');
  const [url, setUrl] = useState('');
  const [urlFields, setUrlFields] = useState([]);
  const [method, setMethod] = useState(DUMMY_INVOKE_METHOD_OPTIONS[1]);
  const [authentication, setAuthentication] = useState(DUMMY_INVOKE_AUTH_OPTIONS[0]);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [authApiKeyName, setAuthApiKeyName] = useState('');
  const [authApiKeyValue, setAuthApiKeyValue] = useState('');
  const [authApiKeyLocation, setAuthApiKeyLocation] = useState(INVOKE_API_KEY_LOCATIONS[0]);
  const [sendParamsInBody, setSendParamsInBody] = useState(false);
  const [expandedHeaders, setExpandedHeaders] = useState(true);
  const [expandedParams, setExpandedParams] = useState(true);
  const [headers, setHeaders] = useState([]);
  const [params, setParams] = useState([]);
  const [fieldPickerTarget, setFieldPickerTarget] = useState(null);

  const methodSupportsBody = INVOKE_METHODS_WITH_BODY.includes(method);

  useEffect(() => {
    if (!show) return;
    const initialMethod = initialSettings?.method ?? DUMMY_INVOKE_METHOD_OPTIONS[1];
    const supportsBody = INVOKE_METHODS_WITH_BODY.includes(initialMethod);
    setServiceName(initialSettings?.serviceName ?? '');
    const { base: initialUrlBase, fields: initialUrlFields } = splitUrlFields(initialSettings?.url);
    setUrl(initialUrlBase);
    setUrlFields(initialUrlFields);
    setMethod(initialMethod);
    setAuthentication(initialSettings?.authentication ?? DUMMY_INVOKE_AUTH_OPTIONS[0]);
    setAuthUsername(initialSettings?.authUsername ?? '');
    setAuthPassword(initialSettings?.authPassword ?? '');
    setAuthToken(initialSettings?.authToken ?? '');
    setAuthApiKeyName(initialSettings?.authApiKeyName ?? '');
    setAuthApiKeyValue(initialSettings?.authApiKeyValue ?? '');
    setAuthApiKeyLocation(initialSettings?.authApiKeyLocation ?? INVOKE_API_KEY_LOCATIONS[0]);
    setSendParamsInBody(supportsBody ? (initialSettings?.sendParamsInBody ?? false) : false);
    setHeaders(withTrailingBlankHeader(initialSettings?.headers ?? []));
    setParams(buildInitialInvokeParams(initialSettings?.params, supportsBody, initialSettings?.params !== undefined));
    setExpandedHeaders(true);
    setExpandedParams(true);
    setFieldPickerTarget(null);
  }, [show, initialSettings]);

  const handleMethodChange = (newMethod) => {
    const supportsBody = INVOKE_METHODS_WITH_BODY.includes(newMethod);
    setMethod(newMethod);
    setAuthentication('NONE');
    if (!supportsBody) setSendParamsInBody(false);
    setParams((prev) => withTrailingBlankParam(withDefaultPayloadRow(prev, supportsBody)));
  };

  const handleAddUrlFields = (fields) => {
    setUrlFields((prev) => Array.from(new Set([...prev, ...fields])));
  };
  const handleRemoveUrlField = (field) => {
    setUrlFields((prev) => prev.filter((f) => f !== field));
  };

  // Only re-seed a blank row when the list would otherwise be completely
  // empty (so there's still something to click into) — deleting the blank
  // trailing row while another row remains above it should actually remove
  // it, not get silently replaced by an identical one.
  const handleRemoveHeader = (id) => {
    setHeaders((prev) => {
      const next = prev.filter((h) => h.id !== id);
      return next.length === 0 ? withTrailingBlankHeader(next) : next;
    });
  };
  const handleHeaderChange = (id, field, value) => {
    setHeaders((prev) => withTrailingBlankHeader(prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))));
  };
  // Clicking into the last row's Header/Value box opens the next blank row
  // immediately, rather than waiting for the user to type a character first.
  const handleHeaderFocus = (id) => {
    setHeaders((prev) =>
      prev[prev.length - 1]?.id === id
        ? [...prev, { id: makeInvokeRowId(), key: '', value: '' }]
        : prev
    );
  };

  // Only re-seed a blank row when the list would otherwise be completely
  // empty (so there's still something to click into) — deleting the blank
  // trailing row while another row remains above it should actually remove
  // it, not get silently replaced by an identical one.
  const handleRemoveParam = (id) => {
    setParams((prev) => {
      const next = prev.filter((p) => p.id !== id);
      return next.length === 0 ? withTrailingBlankParam(next) : next;
    });
  };
  const handleParamChange = (id, field, value) => {
    setParams((prev) => withTrailingBlankParam(prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))));
  };
  // Clicking into the last row's Key/Value box opens the next blank row
  // immediately, rather than waiting for the user to type a character first.
  const handleParamFocus = (id) => {
    setParams((prev) =>
      prev[prev.length - 1]?.id === id
        ? [...prev, { id: makeInvokeRowId(), key: '', value: '', fields: [] }]
        : prev
    );
  };
  const handleAddParamFields = (paramId, fields) => {
    setParams((prev) =>
      withTrailingBlankParam(
        prev.map((p) => (p.id === paramId ? { ...p, fields: Array.from(new Set([...p.fields, ...fields])) } : p))
      )
    );
  };
  const handleRemoveParamField = (paramId, field) => {
    setParams((prev) =>
      withTrailingBlankParam(
        prev.map((p) => (p.id === paramId ? { ...p, fields: p.fields.filter((f) => f !== field) } : p))
      )
    );
  };

  const handleApplyFieldPicker = (fields) => {
    if (fieldPickerTarget === 'url') {
      handleAddUrlFields(fields);
    } else if (fieldPickerTarget?.paramId != null) {
      handleAddParamFields(fieldPickerTarget.paramId, fields);
    }
  };

  const handleSave = () => {
    onSave({
      serviceName, url: joinUrlFields(url, urlFields), method, authentication,
      authUsername, authPassword, authToken, authApiKeyName, authApiKeyValue, authApiKeyLocation,
      sendParamsInBody, headers, params,
    });
    onClose();
  };

  return (
    <>
    <Modal
      show={show}
      onHide={onClose}
      className="card-property-match-modal notification-settings-modal"
      dialogClassName="card-property-match-modal-dialog notification-settings-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell br-invoke-modal-shell">
        <button
          type="button"
          className="br-floating-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={16} />
        </button>

        <header className="card-property-match-modal-header br-floating-close-header">
          <h2 className="card-property-match-modal-title">Service Invoke Settings</h2>
        </header>

        <div className="card-property-match-modal-body notification-settings-body">
          <div className="notification-field">
            <label className="business-rule-form-label br-invoke-field-label">Name</label>
            <input
              type="text"
              className="business-rule-form-input"
              placeholder="Enter name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>

          <div className="notification-field">
            <div className="notification-field-head">
              <label className="business-rule-form-label br-invoke-field-label">Url</label>
              <div className="notification-field-actions">
                <button
                  type="button"
                  className="notification-dropdown-trigger"
                  onClick={() => setFieldPickerTarget('url')}
                >
                  add card fields <FiChevronDown size={12} aria-hidden />
                </button>
              </div>
            </div>
            <div className="br-invoke-value-box">
              {urlFields.length > 0 ? (
                <div className="br-invoke-value-pills">
                  {urlFields.map((f) => (
                    <span key={f} className="notification-pill br-invoke-value-pill">
                      {f}
                      <button
                        type="button"
                        className="br-invoke-value-pill-remove"
                        onClick={() => handleRemoveUrlField(f)}
                        aria-label={`Remove ${f}`}
                      >
                        <FiX size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="br-invoke-value-input"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="br-invoke-two-col">
            <div className="notification-field">
              <label className="business-rule-form-label br-invoke-field-label">Method</label>
              <div className="business-rule-form-select-wrap">
                <select className="business-rule-form-select" value={method} onChange={(e) => handleMethodChange(e.target.value)}>
                  {DUMMY_INVOKE_METHOD_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
              </div>
            </div>

            <div className="notification-field">
              <label className="business-rule-form-label br-invoke-field-label">Authentication</label>
              <div className="business-rule-form-select-wrap">
                <select className="business-rule-form-select" value={authentication} onChange={(e) => setAuthentication(e.target.value)}>
                  {DUMMY_INVOKE_AUTH_OPTIONS.map((a) => (
                    <option key={a} value={a}>{a.replace('_', ' ')}</option>
                  ))}
                </select>
                <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
              </div>
            </div>
          </div>

          {authentication === 'BASIC' && (
            <div className="br-invoke-two-col">
              <div className="notification-field">
                <label className="business-rule-form-label br-invoke-field-label">Username</label>
                <input
                  type="text"
                  className="business-rule-form-input"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                />
              </div>
              <div className="notification-field">
                <label className="business-rule-form-label br-invoke-field-label">Password</label>
                <input
                  type="password"
                  className="business-rule-form-input"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {authentication === 'TOKEN' && (
            <div className="notification-field">
              <label className="business-rule-form-label br-invoke-field-label">Token</label>
              <input
                type="password"
                className="business-rule-form-input"
                placeholder="Bearer token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
              />
            </div>
          )}

          {authentication === 'API_KEY' && (
            <div className="br-invoke-two-col">
              <div className="notification-field">
                <label className="business-rule-form-label br-invoke-field-label">API KEY header name</label>
                <input
                  type="text"
                  className="business-rule-form-input"
                  placeholder="Enter header name"
                  value={authApiKeyName}
                  onChange={(e) => setAuthApiKeyName(e.target.value)}
                />
              </div>
              <div className="notification-field">
                <label className="business-rule-form-label br-invoke-field-label">API KEY header value</label>
                <input
                  type="password"
                  className="business-rule-form-input"
                  placeholder="Enter header value"
                  value={authApiKeyValue}
                  onChange={(e) => setAuthApiKeyValue(e.target.value)}
                />
              </div>
            </div>
          )}

          {methodSupportsBody && (
            <div className="br-property-section">
              <button
                type="button"
                className="br-property-section-toggle"
                onClick={() => setExpandedHeaders((v) => !v)}
              >
                <span className="br-property-section-toggle-icon">
                  {expandedHeaders ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                </span>
                Headers
              </button>
              {expandedHeaders && (
                <>
                  <div className="br-invoke-kv-columns">
                    <span>Header</span>
                    <span>Value</span>
                  </div>
                  <div className="br-invoke-kv-list">
                    {headers.map((h) => (
                      <div key={h.id} className="br-invoke-kv-row">
                        <input
                          type="text"
                          className="business-rule-form-input"
                          value={h.key}
                          onChange={(e) => handleHeaderChange(h.id, 'key', e.target.value)}
                          onFocus={() => handleHeaderFocus(h.id)}
                        />
                        <input
                          type="text"
                          className="business-rule-form-input"
                          value={h.value}
                          onChange={(e) => handleHeaderChange(h.id, 'value', e.target.value)}
                          onFocus={() => handleHeaderFocus(h.id)}
                        />
                        <button
                          type="button"
                          className="br-invoke-row-delete"
                          onClick={() => handleRemoveHeader(h.id)}
                          aria-label="Remove header"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="br-property-section">
            <button
              type="button"
              className="br-property-section-toggle"
              onClick={() => setExpandedParams((v) => !v)}
            >
              <span className="br-property-section-toggle-icon">
                {expandedParams ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
              </span>
              Parameters
            </button>
            {expandedParams && (
              <>
                {methodSupportsBody && (
                  <label className="br-link-checkbox-row br-invoke-body-checkbox">
                    <input
                      type="checkbox"
                      checked={sendParamsInBody}
                      onChange={(e) => setSendParamsInBody(e.target.checked)}
                    />
                    Send the parameters in the body of the web service call
                  </label>
                )}

                <div className="br-invoke-kv-columns">
                  <span>Key</span>
                  <span>Value</span>
                </div>
                <div className="br-invoke-kv-list">
                  {params.map((p) => (
                    <div key={p.id} className="br-invoke-kv-row">
                      <input
                        type="text"
                        className="business-rule-form-input"
                        value={p.key}
                        onChange={(e) => handleParamChange(p.id, 'key', e.target.value)}
                        onFocus={() => handleParamFocus(p.id)}
                      />
                      <div className="br-invoke-value-box">
                        {p.fields.length > 0 ? (
                          <div className="br-invoke-value-pills">
                            {p.fields.map((f) => (
                              <span key={f} className="notification-pill br-invoke-value-pill">
                                {f}
                                <button
                                  type="button"
                                  className="br-invoke-value-pill-remove"
                                  onClick={() => handleRemoveParamField(p.id, f)}
                                  aria-label={`Remove ${f}`}
                                >
                                  <FiX size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <input
                            type="text"
                            className="br-invoke-value-input"
                            value={p.value}
                            onChange={(e) => handleParamChange(p.id, 'value', e.target.value)}
                            onFocus={() => handleParamFocus(p.id)}
                          />
                        )}
                        <button
                          type="button"
                          className="br-invoke-value-add-btn"
                          onClick={() => setFieldPickerTarget({ paramId: p.id })}
                          aria-label="Insert card fields"
                        >
                          <FiPlus size={14} aria-hidden />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="br-invoke-row-delete"
                        onClick={() => handleRemoveParam(p.id)}
                        aria-label="Remove param"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="card-property-match-modal-footer br-invoke-modal-footer">
          <button type="button" className="br-invoke-test-btn">
            Test Settings
          </button>
          <button type="button" className="br-property-add-btn" onClick={handleSave}>
            Save Service
          </button>
        </footer>
      </div>
    </Modal>

    <SelectFieldModal
      show={fieldPickerTarget != null}
      onClose={() => setFieldPickerTarget(null)}
      onSelect={handleApplyFieldPicker}
      fields={fieldPickerTarget === 'url' ? DUMMY_URL_FIELD_OPTIONS : DUMMY_INVOKE_PAYLOAD_FIELDS}
    />
    </>
  );
}

WebInvokeSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  initialSettings: PropTypes.shape({
    serviceName: PropTypes.string,
    url: PropTypes.string,
    method: PropTypes.string,
    authentication: PropTypes.string,
    authUsername: PropTypes.string,
    authPassword: PropTypes.string,
    authToken: PropTypes.string,
    authApiKeyName: PropTypes.string,
    authApiKeyValue: PropTypes.string,
    authApiKeyLocation: PropTypes.string,
    sendParamsInBody: PropTypes.bool,
    headers: PropTypes.array,
    params: PropTypes.array,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

function ShareWithModal({ show, onClose, permissions, onSave }) {
  const [filterText, setFilterText] = useState('');
  const [draftPermissions, setDraftPermissions] = useState(permissions);
  const [isSharedFilterActive, setIsSharedFilterActive] = useState(false);
  const { users, usersLoading, getUsers } = useCommonReducer((s) => s);

  useEffect(() => {
    if (!show) return;
    setFilterText('');
    setDraftPermissions(permissions);
    setIsSharedFilterActive(Object.values(permissions).some((p) => p.viewer || p.editor));
    if (users.length === 0 && !usersLoading) getUsers({ params: { limit: 200 } });
  }, [show]);

  const handleToggleDraftPermission = (userId, type) => {
    setDraftPermissions((prev) => {
      const current = prev[userId] ?? { viewer: false, editor: false };
      return { ...prev, [userId]: { ...current, [type]: !current[type] } };
    });
  };

  const handleClearSharedFilter = () => setIsSharedFilterActive(false);

  const handleCancel = () => {
    setDraftPermissions(permissions);
    onClose();
  };

  const handleSave = () => {
    onSave?.(draftPermissions);
    onClose();
  };

  const filterQuery = filterText.trim().toLowerCase();
  const baseUsers = isSharedFilterActive
    ? users.filter((user) => {
        const perm = draftPermissions[user.user_id];
        return perm && (perm.viewer || perm.editor);
      })
    : users;
  const filteredUsers = filterQuery
    ? baseUsers.filter((user) =>
        (user.name ?? '').toLowerCase().includes(filterQuery) || (user.username ?? '').toLowerCase().includes(filterQuery)
      )
    : baseUsers;

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      className="card-property-match-modal"
      dialogClassName="card-property-match-modal-dialog"
      backdropClassName="card-property-match-modal-backdrop"
      centered
      scrollable
    >
      <div className="card-property-match-modal-shell">
        <header className="card-property-match-modal-header">
          <h2 className="card-property-match-modal-title">Shared with</h2>
          <button
            type="button"
            className="business-rule-form-modal-close"
            onClick={handleCancel}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="card-property-match-modal-body">
          <div className="share-with-filter-row">
            <span className="share-with-filter-icon" aria-hidden>
              <FiFilter size={14} />
            </span>
            {isSharedFilterActive && (
              <span className="share-with-filter-chip">
                Shared with
                <button
                  type="button"
                  className="share-with-filter-chip-remove"
                  onClick={handleClearSharedFilter}
                  aria-label="Clear shared with filter"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            <input
              type="text"
              className="share-with-filter-input"
              placeholder="Filter"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
            />
          </div>

          <div className="share-with-table">
            <div className="share-with-table-head">
              <span>Name</span>
              <span>Username</span>
              <span>Viewer</span>
              <span>Editor</span>
            </div>
            {usersLoading ? (
              <div className="br-property-picker-empty">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="br-property-picker-empty">No users found</div>
            ) : (
              filteredUsers.map((user) => {
                const perm = draftPermissions[user.user_id] ?? { viewer: false, editor: false };
                return (
                  <div key={user.user_id} className="share-with-row">
                    <span className="share-with-name">{user.name}</span>
                    <span className="share-with-username">
                      <span className="share-with-avatar" aria-hidden>{getInitials(user.name)}</span>
                      {user.username}
                    </span>
                    <label className="business-rule-form-toggle share-with-toggle">
                      <input
                        type="checkbox"
                        checked={perm.viewer}
                        onChange={() => handleToggleDraftPermission(user.user_id, 'viewer')}
                      />
                      <span className="business-rule-form-toggle-track" aria-hidden />
                    </label>
                    <label className="business-rule-form-toggle share-with-toggle">
                      <input
                        type="checkbox"
                        checked={perm.editor}
                        onChange={() => handleToggleDraftPermission(user.user_id, 'editor')}
                      />
                      <span className="business-rule-form-toggle-track" aria-hidden />
                    </label>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <footer className="card-property-match-modal-footer share-with-modal-footer">
          <button type="button" className="share-with-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="br-property-add-btn" onClick={handleSave}>
            Save
          </button>
        </footer>
      </div>
    </Modal>
  );
}

ShareWithModal.propTypes = {
  show: PropTypes.bool,
  onClose: PropTypes.func,
  permissions: PropTypes.object,
  onSave: PropTypes.func,
};

function BusinessRuleFormModal({ show, rule, boardName, onClose, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [owner, setOwner] = useState('');
  const [isOwnerPickerOpen, setIsOwnerPickerOpen] = useState(false);
  const [ownerFilterText, setOwnerFilterText] = useState('');
  const ownerPickerTriggerRef = useRef(null);
  const ownerPickerPanelRef = useRef(null);
  const [sharePermissions, setSharePermissions] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [disallowTriggerChain, setDisallowTriggerChain] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const editingConditionIdRef = useRef(null);
  const [createActions, setCreateActions] = useState([]);
  const [showCreateActionPicker, setShowCreateActionPicker] = useState(false);
  const [linkActions, setLinkActions] = useState([]);
  const [showLinkActionPicker, setShowLinkActionPicker] = useState(false);
  const editingLinkActionIdRef = useRef(null);
  const [openLinkOperatorRowId, setOpenLinkOperatorRowId] = useState(null);
  const [linkOperatorFilterText, setLinkOperatorFilterText] = useState('');
  const linkOperatorTriggerRef = useRef(null);
  const linkOperatorPanelRef = useRef(null);
  const [removeOtherChildLinks, setRemoveOtherChildLinks] = useState(false);
  const [removeOtherParentLinks, setRemoveOtherParentLinks] = useState(false);
  const [removeOtherRelativeLinks, setRemoveOtherRelativeLinks] = useState(false);
  const [moveActions, setMoveActions] = useState([]);
  const [showMoveDestinationPicker, setShowMoveDestinationPicker] = useState(false);
  const [activeMoveActionId, setActiveMoveActionId] = useState(null);
  const [updateActions, setUpdateActions] = useState([]);
  const [showUpdateActionPicker, setShowUpdateActionPicker] = useState(false);
  const [notifyActions, setNotifyActions] = useState([]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [activeNotifyActionId, setActiveNotifyActionId] = useState(null);
  const [invokeActions, setInvokeActions] = useState([]);
  const [showWebInvokeSettings, setShowWebInvokeSettings] = useState(false);
  const [activeInvokeActionId, setActiveInvokeActionId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [boardConditionRows, setBoardConditionRows] = useState([{ id: 'board-0', boardId: '', joinWord: 'OR' }]);
  const [openColorConditionId, setOpenColorConditionId] = useState(null);
  const colorConditionTriggerRef = useRef(null);
  const colorConditionPanelRef = useRef(null);
  const [openConditionOperatorId, setOpenConditionOperatorId] = useState(null);
  const [conditionOperatorFilterText, setConditionOperatorFilterText] = useState('');
  const conditionOperatorTriggerRef = useRef(null);
  const conditionOperatorPanelRef = useRef(null);

  const {
    getTriggerConfig, triggerConfig, getFieldDetails, fieldDetailsByKey, isLoadingFieldDetails,
    linkCardActionOperators, isLoadingLinkCardActionOperators, getLinkCardPossibleActionOperators,
  } = useBusinessRuleReducer((s) => s);
  const { users, usersLoading, getUsers } = useCommonReducer((s) => s);
  const { workspaces, listAllWorkspaces } = useWorkSpaceReducer((s) => s);
  const userProfile = useAuthReducer((s) => s.userProfile);
  const loggedInUserId = userProfile?.user_id ?? userProfile?.userid ?? null;
  const loggedInUserName = userProfile?.name || userProfile?.username || 'You';

  // Drives the AND section from the selected trigger type's own config instead of
  // always showing the "Card is created" (trigger_type_id 1) layout.
  const andHeaderText = triggerConfig?.and_header || 'the created card matches this filter';
  const hasBoardDefaultCondition = (triggerConfig?.default_conditions ?? [])
    .some((c) => String(c.field_label ?? '').trim().toLowerCase() === 'board');

  useEffect(() => {
    if (!show || !rule) return;
    getTriggerConfig(rule.id);
    if (users.length === 0 && !usersLoading) getUsers({ params: { limit: 200 } });
    if (workspaces.length === 0) listAllWorkspaces();
    setBoardConditionRows([{ id: 'board-0', boardId: '', joinWord: 'OR' }]);
    setName(rule.name ?? '');
    setDescription(rule.description ?? '');
    setTags('');
    setOwner(loggedInUserName);
    setIsOwnerPickerOpen(false);
    setOwnerFilterText('');
    setSharePermissions({});
    setShowShareModal(false);
    setDisallowTriggerChain(false);
    setConditions([]);
    setShowPropertyPicker(false);
    setCreateActions([]);
    setShowCreateActionPicker(false);
    setLinkActions([]);
    setShowLinkActionPicker(false);
    editingLinkActionIdRef.current = null;
    setOpenLinkOperatorRowId(null);
    setLinkOperatorFilterText('');
    setRemoveOtherChildLinks(false);
    setRemoveOtherParentLinks(false);
    setRemoveOtherRelativeLinks(false);
    setMoveActions([]);
    setShowMoveDestinationPicker(false);
    setActiveMoveActionId(null);
    setUpdateActions([]);
    setShowUpdateActionPicker(false);
    setNotifyActions([]);
    setShowNotificationSettings(false);
    setActiveNotifyActionId(null);
    setInvokeActions([]);
    setShowWebInvokeSettings(false);
    setActiveInvokeActionId(null);
    setShowCancelConfirm(false);
  }, [show, rule, loggedInUserName]);

  useEffect(() => {
    if (!isOwnerPickerOpen) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (ownerPickerPanelRef.current?.contains(t)) return;
      if (ownerPickerTriggerRef.current?.contains(t)) return;
      setIsOwnerPickerOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isOwnerPickerOpen]);

  useEffect(() => {
    if (openColorConditionId == null) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (colorConditionPanelRef.current?.contains(t)) return;
      if (colorConditionTriggerRef.current?.contains(t)) return;
      setOpenColorConditionId(null);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [openColorConditionId]);

  useEffect(() => {
    if (openConditionOperatorId == null) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (conditionOperatorPanelRef.current?.contains(t)) return;
      if (conditionOperatorTriggerRef.current?.contains(t)) return;
      setOpenConditionOperatorId(null);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [openConditionOperatorId]);

  useEffect(() => {
    if (openLinkOperatorRowId == null) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (linkOperatorPanelRef.current?.contains(t)) return;
      if (linkOperatorTriggerRef.current?.contains(t)) return;
      setOpenLinkOperatorRowId(null);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [openLinkOperatorRowId]);

  useEffect(() => {
    if (!show) return;
    const firstBoard = (workspaces ?? []).flatMap((w) => w.boards ?? [])[0];
    if (!firstBoard) return;
    setBoardConditionRows((prev) =>
      prev.length === 1 && !prev[0].boardId ? [{ ...prev[0], boardId: firstBoard.board_id }] : prev
    );
  }, [show, workspaces]);

  // Default each condition's operator to the first option (usually "is") as soon as its
  // field details load, so the row reads "Label is" instead of a blank "Select operator".
  useEffect(() => {
    setConditions((prev) => {
      let changed = false;
      const next = prev.map((cond) => {
        if (cond.operatorId) return cond;
        const detailsKey = cond.fieldType && cond.fieldId != null ? `${cond.fieldType}-${cond.fieldId}` : null;
        const operators = detailsKey ? fieldDetailsByKey[detailsKey]?.operators : null;
        if (!operators || operators.length === 0) return cond;
        changed = true;
        return { ...cond, operatorId: operators[0].field_operator_id };
      });
      return changed ? next : prev;
    });
  }, [fieldDetailsByKey]);

  if (!rule) return null;

  const handleSave = () => {
    onSave?.({
      triggerRuleId: rule.id,
      name: name.trim(),
      description: description.trim(),
      tags: tags.trim(),
      boardIds: boardConditionRows.map((row) => row.boardId || null),
      owner,
      sharePermissions,
      disallowTriggerChain,
      conditions,
      createActions,
      linkActions,
      removeOtherChildLinks,
      removeOtherParentLinks,
      removeOtherRelativeLinks,
      moveActions,
      updateActions,
      notifyActions,
      invokeActions,
    });
    onClose();
  };

  const otherOwnerUsers = users.filter((u) => String(u.user_id) !== String(loggedInUserId));
  const ownerUsers = [
    {
      user_id: loggedInUserId, name: loggedInUserName, username: userProfile?.username ?? null,
      email: userProfile?.email ?? null, role: userProfile?.role ?? null, port: userProfile?.port ?? null, phone: userProfile?.phone ?? null,
    },
    ...otherOwnerUsers.map((u) => ({
      user_id: u.user_id, name: u.name, username: u.username, email: u.email, role: u.role, port: u.port, phone: u.phone,
    })),
  ];
  const ownerFilterQuery = ownerFilterText.trim().toLowerCase();
  const filteredOwnerUsers = ownerFilterQuery
    ? ownerUsers.filter((u) => u.name.toLowerCase().includes(ownerFilterQuery))
    : ownerUsers;

  const handlePickOwner = (user) => {
    setOwner(user.name);
    setIsOwnerPickerOpen(false);
    setOwnerFilterText('');
  };

  const handleSaveSharePermissions = (nextPermissions) => {
    setSharePermissions(nextPermissions);
  };

  const sharedUsers = users.filter((u) => {
    const perm = sharePermissions[u.user_id];
    return perm && (perm.viewer || perm.editor);
  });

  const handleOpenPropertyPicker = () => {
    editingConditionIdRef.current = null;
    setShowPropertyPicker(true);
  };

  const handleOpenPropertyPickerForRow = (id) => {
    editingConditionIdRef.current = id;
    setShowPropertyPicker(true);
  };

  const handleSelectProperty = (field, category) => {
    const fieldType = category.category_key === 'custom' ? 'custom' : category.category_key === 'regular' ? 'regular' : null;
    const fieldId = field.regular_field_id ?? field.custom_field_id ?? null;
    const isRegularColorField = category.category_key === 'regular' && getFieldLabel(field).trim().toLowerCase() === 'color';
    const fieldProps = {
      fieldLabel: getFieldLabel(field),
      fieldKey: field.field_key ?? field.unit_key ?? String(field.regular_field_id ?? field.time_unit_id ?? field.custom_field_id ?? ''),
      category: category.category_key,
      fieldType,
      fieldId,
      valueType: category.category_key === 'custom' ? (field.field_type ?? null) : (isRegularColorField ? 'color' : null),
      operatorId: '',
    };
    // A blank value row for the newly picked field — re-picking a field for an
    // existing box resets its values too, since a stale value from the old field
    // type (e.g. a hex color) wouldn't make sense under the new one.
    const blankValues = [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, value: '', joinWord: 'OR' }];

    const editingId = editingConditionIdRef.current;
    if (editingId) {
      editingConditionIdRef.current = null;
      setConditions((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...fieldProps, values: blankValues } : c)));
    } else {
      setConditions((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...fieldProps, values: blankValues }]);
    }

    if (fieldType && fieldId != null) {
      getFieldDetails(fieldType, fieldId);
    }
  };

  // Removes an entire property box (all of its value rows).
  const handleRemoveCondition = (id) => {
    setConditions((prev) => prev.filter((c) => c.id !== id));
  };

  // Removes a single value row from a box; removes the whole box once its last
  // value row is gone instead of leaving an empty, header-only box behind.
  const handleRemoveConditionValue = (boxId, valueId) => {
    setConditions((prev) =>
      prev
        .map((c) => (c.id === boxId ? { ...c, values: c.values.filter((v) => v.id !== valueId) } : c))
        .filter((c) => c.id !== boxId || c.values.length > 0)
    );
  };

  // Clicking a value row's join-word pill duplicates that value (same value) directly
  // below it, inside the same box — it does not flip the pill's own AND/OR value.
  // Time unit fields never allow multiple values per box, so this is a no-op for them.
  const handleToggleConditionJoinWord = (boxId, valueId) => {
    setConditions((prev) =>
      prev.map((c) => {
        if (c.id !== boxId || c.category === 'time_unit') return c;
        const rowIndex = c.values.findIndex((v) => v.id === valueId);
        if (rowIndex === -1) return c;
        const newValue = { ...c.values[rowIndex], id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
        const nextValues = [...c.values];
        nextValues.splice(rowIndex + 1, 0, newValue);
        return { ...c, values: nextValues };
      })
    );
  };

  const handleClearConditions = () => {
    setConditions([]);
    setBoardConditionRows([{ id: 'board-0', boardId: '', joinWord: 'OR' }]);
  };

  const handleApplyConditionColor = (boxId, valueId, hex) => {
    const normalized = normalizeHexColor(hex);
    setConditions((prev) =>
      prev.map((c) =>
        c.id === boxId
          ? { ...c, values: c.values.map((v) => (v.id === valueId ? { ...v, value: normalized } : v)) }
          : c
      )
    );
    setOpenColorConditionId(null);
  };

  const handleToggleConditionOperator = (id) => {
    setConditionOperatorFilterText('');
    setOpenConditionOperatorId((prev) => (prev === id ? null : id));
  };

  const handleSelectConditionOperator = (id, operator) => {
    // "is not" implies AND across values ("is not X AND is not Y"); any other
    // operator implies OR ("is X OR Y") — switching back from "is not" must revert
    // the join word, not just leave whatever it was set to before.
    const isNegation = (operator.operator_label || '').trim().toLowerCase() === 'is not';
    setConditions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, operatorId: operator.field_operator_id, values: c.values.map((v) => ({ ...v, joinWord: isNegation ? 'AND' : 'OR' })) }
          : c
      )
    );
    setOpenConditionOperatorId(null);
  };

  const handleSelectCreateAction = (option) => {
    setCreateActions((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, key: option.key, label: option.label },
    ]);
  };

  const handleRemoveCreateAction = (id) => {
    setCreateActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectLinkAction = (option) => {
    const editingId = editingLinkActionIdRef.current;
    if (editingId) {
      editingLinkActionIdRef.current = null;
      setLinkActions((prev) => prev.map((a) => (a.id === editingId ? { ...a, key: option.key, label: option.label } : a)));
      return;
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setLinkActions((prev) => [
      ...prev,
      {
        id, key: option.key, label: option.label, operatorKey: '', operatorLabel: 'to card with id',
        values: [{ id: `${id}-0`, value: '' }],
      },
    ]);
  };

  const handleOpenLinkActionPickerForRow = (id) => {
    editingLinkActionIdRef.current = id;
    setShowLinkActionPicker(true);
  };

  const handleRemoveLinkAction = (id) => {
    setLinkActions((prev) => prev.filter((a) => a.id !== id));
    setOpenLinkOperatorRowId((prev) => (prev === id ? null : prev));
  };

  const handleClearLinkActions = () => {
    setLinkActions([]);
    setOpenLinkOperatorRowId(null);
  };

  const handleToggleLinkOperator = (id) => {
    setLinkOperatorFilterText('');
    setOpenLinkOperatorRowId((prev) => (prev === id ? null : id));
    if (linkCardActionOperators.length === 0) getLinkCardPossibleActionOperators();
  };

  const handleSelectLinkOperator = (id, operator) => {
    setLinkActions((prev) => prev.map((a) => (a.id === id
      ? {
        ...a,
        operatorKey: operator.operator_key,
        operatorLabel: operator.operator_label,
        isDynamic: operator.is_dynamic === '1' || operator.is_dynamic === 1,
      }
      : a)));
    setOpenLinkOperatorRowId(null);
  };

  const handleChangeLinkActionValue = (id, rowId, value) => {
    setLinkActions((prev) => prev.map((a) => (a.id === id
      ? { ...a, values: a.values.map((row) => (row.id === rowId ? { ...row, value } : row)) }
      : a)));
  };

  const handleAddLinkActionValueRow = (id) => {
    setLinkActions((prev) => prev.map((a) => (a.id === id
      ? { ...a, values: [...a.values, { id: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, value: '' }] }
      : a)));
  };

  const handleRemoveLinkActionValueRow = (id, rowId) => {
    setLinkActions((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      if (a.values.length <= 1) return { ...a, values: [{ id: rowId, value: '' }] };
      return { ...a, values: a.values.filter((row) => row.id !== rowId) };
    }));
  };

  // Dev-only fallback so the operator dropdown can be visually tested without a live backend.
  const linkOperatorOptions = linkCardActionOperators.length > 0
    ? linkCardActionOperators
    : (import.meta.env.DEV ? DUMMY_LINK_ACTION_OPERATORS : []);
  const linkOperatorFilterQuery = linkOperatorFilterText.trim().toLowerCase();
  const filteredLinkOperators = linkOperatorFilterQuery
    ? linkOperatorOptions.filter((op) => op.operator_label.toLowerCase().includes(linkOperatorFilterQuery))
    : linkOperatorOptions;

  const handleAddMoveAction = () => {
    const option = MOVE_ACTION_OPTIONS[0];
    setMoveActions((prev) => [
      ...prev,
      {
        id: Date.now(), key: option.key, label: option.label,
        boardId: '', boardName: '', swimlaneId: '', swimlaneName: '', stageId: '', stageName: '',
      },
    ]);
  };

  const handleRemoveMoveAction = (id) => {
    setMoveActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleOpenMoveDestination = (id) => {
    setActiveMoveActionId(id);
    setShowMoveDestinationPicker(true);
  };

  const handleSaveMoveDestination = (destination) => {
    setMoveActions((prev) => prev.map((a) => (a.id === activeMoveActionId ? { ...a, ...destination } : a)));
  };

  const activeMoveAction = moveActions.find((a) => a.id === activeMoveActionId);

  const handleSelectUpdateAction = (item, meta) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (meta.category_key === 'custom') {
      const rawLabel = getFieldLabel(item);
      setUpdateActions((prev) => [
        ...prev,
        { id, category: 'custom', key: `custom-${item.custom_field_id}`, label: `Set ${rawLabel}`, rawLabel, field: rawLabel },
      ]);
    } else {
      setUpdateActions((prev) => [
        ...prev,
        { id, category: 'action', key: item.key, label: item.label, field: item.field },
      ]);
    }
  };

  const handleRemoveUpdateAction = (id) => {
    setUpdateActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddNotifyAction = () => {
    const option = NOTIFY_ACTION_OPTIONS[0];
    setNotifyActions((prev) => [...prev, { id: Date.now(), key: option.key, label: option.label }]);
  };

  const handleRemoveNotifyAction = (id) => {
    setNotifyActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleOpenNotificationSettings = (id) => {
    setActiveNotifyActionId(id);
    setShowNotificationSettings(true);
  };

  const handleSaveNotificationSettings = (settings) => {
    setNotifyActions((prev) => prev.map((a) => (a.id === activeNotifyActionId ? { ...a, ...settings, configured: true } : a)));
  };

  const activeNotifyAction = notifyActions.find((a) => a.id === activeNotifyActionId);

  const handleAddInvokeAction = () => {
    const option = INVOKE_ACTION_OPTIONS[0];
    setInvokeActions((prev) => [...prev, { id: Date.now(), key: option.key, label: option.label }]);
  };

  const handleRemoveInvokeAction = (id) => {
    setInvokeActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleOpenWebInvokeSettings = (id) => {
    setActiveInvokeActionId(id);
    setShowWebInvokeSettings(true);
  };

  const handleSaveWebInvokeSettings = (settings) => {
    setInvokeActions((prev) => prev.map((a) => (a.id === activeInvokeActionId ? { ...a, ...settings, configured: true } : a)));
  };

  const activeInvokeAction = invokeActions.find((a) => a.id === activeInvokeActionId);

  const handlePickConditionBoard = (rowId, board) => {
    setBoardConditionRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, boardId: board?.board_id ?? '' } : row))
    );
  };

  const handleRemoveBoardConditionRow = (rowId) => {
    setBoardConditionRows((prev) => {
      if (prev.length <= 1) return [{ id: 'board-0', boardId: '', joinWord: 'OR' }];
      return prev.filter((row) => row.id !== rowId);
    });
  };

  const handleToggleBoardConditionJoinWord = (rowId) => {
    setBoardConditionRows((prev) => {
      // There's no other way to add a second "Board is" row today, so clicking a
      // row's join-word pill duplicates that row (same board) directly below it —
      // it does not flip the pill's own AND/OR value.
      const rowIndex = prev.findIndex((row) => row.id === rowId);
      if (rowIndex === -1) return prev;
      const newRow = { ...prev[rowIndex], id: `board-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
      const next = [...prev];
      next.splice(rowIndex + 1, 0, newRow);
      return next;
    });
  };

  const handleCloseAttempt = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmClose = () => {
    setShowCancelConfirm(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowCancelConfirm(false);
  };

  return (
    <>
    <Modal
      show={show}
      onHide={handleCloseAttempt}
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
            onClick={handleCloseAttempt}
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </header>

        <div className="business-rule-form-modal-body">
          <section className="business-rule-form-meta">
            <div className="business-rule-form-field">
              <label htmlFor="br-form-name" className="business-rule-form-label business-rule-form-label--hint">Name</label>
              <input
                id="br-form-name"
                type="text"
                className="business-rule-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="business-rule-form-field">
              <label htmlFor="br-form-description" className="business-rule-form-label business-rule-form-label--hint">Description</label>
              <textarea
                id="br-form-description"
                className="business-rule-form-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

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

            <div className="business-rule-form-secondary-grid">
              <div className="business-rule-form-field br-owner-picker-wrap">
                <label htmlFor="br-form-owner" className="business-rule-form-label business-rule-form-label--hint">Owner</label>
                <button
                  type="button"
                  id="br-form-owner"
                  ref={ownerPickerTriggerRef}
                  className="business-rule-form-select-wrap business-rule-form-select-wrap--owner business-rule-form-control br-owner-picker-trigger"
                  onClick={() => setIsOwnerPickerOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={isOwnerPickerOpen}
                >
                  <span className="business-rule-form-owner-avatar" aria-hidden>
                    {getInitials(owner)}
                  </span>
                  <span className="br-owner-picker-trigger-name">{owner}</span>
                  <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
                </button>

                {isOwnerPickerOpen && (
                  <div className="br-owner-picker-panel" ref={ownerPickerPanelRef}>
                    <div className="br-owner-picker-search">
                      <FiFilter size={14} className="br-owner-picker-search-icon" aria-hidden />
                      <input
                        type="text"
                        placeholder="Filter"
                        value={ownerFilterText}
                        onChange={(e) => setOwnerFilterText(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="br-owner-picker-list">
                      {usersLoading ? (
                        <div className="br-property-picker-empty">Loading...</div>
                      ) : filteredOwnerUsers.length === 0 ? (
                        <div className="br-property-picker-empty">No matches</div>
                      ) : (
                        filteredOwnerUsers.map((user) => (
                          <div key={user.user_id ?? user.name} className="br-owner-picker-row">
                            <button
                              type="button"
                              className={`br-owner-picker-row-btn${owner === user.name ? ' br-owner-picker-row-btn--selected' : ''}`}
                              onClick={() => handlePickOwner(user)}
                            >
                              <span className="business-rule-form-owner-avatar" aria-hidden>
                                {getInitials(user.name)}
                              </span>
                              <span className="br-owner-picker-row-name">{user.name}</span>
                            </button>
                            <OwnerInfoTooltip user={user} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="business-rule-form-field">
                <label htmlFor="br-form-share" className="business-rule-form-label business-rule-form-label--hint">Share with</label>
                <button
                  type="button"
                  id="br-form-share"
                  className="business-rule-form-select-wrap business-rule-form-control business-rule-form-share-trigger"
                  onClick={() => setShowShareModal(true)}
                >
                  {sharedUsers.length === 0 ? (
                    <span className="business-rule-form-share-placeholder">Add people</span>
                  ) : (
                    <span className="business-rule-form-share-pills">
                      {sharedUsers.map((u) => (
                        <span key={u.user_id} className="business-rule-form-share-pill">
                          <span className="business-rule-form-share-pill-avatar" aria-hidden>{getInitials(u.name)}</span>
                          {u.name}
                        </span>
                      ))}
                    </span>
                  )}
                  <FiChevronDown className="business-rule-form-select-icon" aria-hidden />
                </button>
              </div>
            </div>

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
                <p className="business-rule-form-filter-hint">{andHeaderText}</p>

                {hasBoardDefaultCondition && boardConditionRows.length > 0 && (
                  <div className="business-rule-form-filter-row business-rule-form-filter-row--multi">
                    <span className="business-rule-form-condition-label">Board is</span>
                    {boardConditionRows.map((row) => {
                      return (
                        <div key={row.id} className="br-board-condition-value-row">
                          <BoardFilterPicker
                            workspaces={workspaces ?? []}
                            value={row.boardId}
                            onChange={(boardId) => handlePickConditionBoard(row.id, { board_id: boardId })}
                            wrapClassName="br-board-condition-wrap"
                            triggerClassName="business-rule-form-condition-value"
                            triggerIconSize={16}
                            panelClassName="br-board-condition-panel"
                            placeholder={boardName?.trim() || 'Select board'}
                          />

                          <div className="business-rule-form-filter-row-actions">
                            <button
                              type="button"
                              className="business-rule-form-or-btn"
                              onClick={() => handleToggleBoardConditionJoinWord(row.id)}
                            >
                              {row.joinWord || 'OR'}
                            </button>
                            <button
                              type="button"
                              className="business-rule-form-filter-row-delete"
                              onClick={() => handleRemoveBoardConditionRow(row.id)}
                              aria-label="Remove filter"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {conditions.map((cond) => {
                  const detailsKey = cond.fieldType && cond.fieldId != null ? `${cond.fieldType}-${cond.fieldId}` : null;
                  const details = detailsKey ? fieldDetailsByKey[detailsKey] : null;
                  const detailsLoading = detailsKey ? Boolean(isLoadingFieldDetails[detailsKey]) : false;
                  const rawOperators = details?.operators ?? [];
                  // Dev-only fallback so the operator dropdown can be visually tested for every
                  // field (regular or custom) without a live get_field_details backend response.
                  // Shown immediately (not gated on detailsLoading) since a real request that
                  // never resolves would otherwise leave the dropdown permanently hidden.
                  const operators = rawOperators.length > 0
                    ? rawOperators
                    : (import.meta.env.DEV ? DUMMY_FIELD_OPERATORS : []);
                  const showOperator = operators.length > 0 && details?.has_operator !== '0';
                  const showValueInput = !details || details?.has_input_value !== '0';
                  const isOperatorOpen = openConditionOperatorId === cond.id;
                  const selectedOperator = operators.find((op) => op.field_operator_id === cond.operatorId);
                  const operatorFilterQuery = conditionOperatorFilterText.trim().toLowerCase();
                  const filteredConditionOperators = operatorFilterQuery
                    ? operators.filter((op) => op.operator_label.toLowerCase().includes(operatorFilterQuery))
                    : operators;

                  return (
                    <div key={cond.id} className="business-rule-form-filter-row business-rule-form-filter-row--multi">
                      <button
                        type="button"
                        className="business-rule-form-filter-row-close"
                        onClick={() => handleRemoveCondition(cond.id)}
                        aria-label="Remove condition"
                      >
                        <FiX size={14} />
                      </button>

                      <div className="business-rule-form-condition-operator-group">
                        <button
                          type="button"
                          className="business-rule-form-condition-label business-rule-form-condition-label-btn"
                          onClick={() => handleOpenPropertyPickerForRow(cond.id)}
                        >
                          {cond.fieldLabel || 'Select property'}
                        </button>
                        {showOperator && (
                          <div className="board-minimap-picker-wrap br-condition-operator-wrap">
                            <button
                              type="button"
                              ref={isOperatorOpen ? conditionOperatorTriggerRef : undefined}
                              className="br-condition-operator-trigger"
                              onClick={() => handleToggleConditionOperator(cond.id)}
                              aria-haspopup="listbox"
                              aria-expanded={isOperatorOpen}
                            >
                              {selectedOperator?.operator_label || 'Select operator'}
                              <FiChevronDown size={14} aria-hidden />
                            </button>

                            {isOperatorOpen && (
                              <div className="board-minimap-picker-panel br-condition-operator-panel" ref={conditionOperatorPanelRef}>
                                <div className="board-minimap-picker-search">
                                  <FiFilter size={16} className="board-minimap-picker-search-icon" aria-hidden />
                                  <input
                                    type="text"
                                    placeholder="Filter"
                                    value={conditionOperatorFilterText}
                                    onChange={(e) => setConditionOperatorFilterText(e.target.value)}
                                    autoFocus
                                  />
                                </div>
                                <div className="board-minimap-picker-scroll">
                                  {filteredConditionOperators.length === 0 ? (
                                    <div className="br-property-picker-empty">No matches</div>
                                  ) : (
                                    filteredConditionOperators.map((op) => (
                                      <button
                                        type="button"
                                        key={op.field_operator_id}
                                        className="br-condition-operator-option"
                                        onClick={() => handleSelectConditionOperator(cond.id, op)}
                                      >
                                        {op.operator_label}
                                      </button>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {detailsLoading && <span className="business-rule-form-condition-loading">Loading...</span>}

                      {cond.values.map((v) => (
                        <div key={v.id} className="br-board-condition-value-row">
                          {showValueInput && (
                            cond.valueType === 'color' ? (
                              <div className="board-minimap-picker-wrap br-color-condition-wrap">
                                <button
                                  type="button"
                                  ref={openColorConditionId === v.id ? colorConditionTriggerRef : undefined}
                                  className="br-color-condition-trigger"
                                  onClick={() => setOpenColorConditionId((prev) => (prev === v.id ? null : v.id))}
                                  aria-haspopup="dialog"
                                  aria-expanded={openColorConditionId === v.id}
                                >
                                  <span
                                    className="br-color-condition-swatch"
                                    style={{ backgroundColor: v.value ? normalizeHexColor(v.value) : '#e5e7eb' }}
                                    aria-hidden
                                  />
                                  <span className="br-color-condition-hex">
                                    {v.value ? normalizeHexColor(v.value) : 'Select color'}
                                  </span>
                                  <FiChevronDown size={14} aria-hidden />
                                </button>

                                {openColorConditionId === v.id && (
                                  <div className="board-minimap-picker-panel br-color-condition-panel">
                                    <SedresColorPicker
                                      popoverRef={colorConditionPanelRef}
                                      initialHex={v.value || undefined}
                                      onApply={(hex) => handleApplyConditionColor(cond.id, v.id, hex)}
                                      onCancel={() => setOpenColorConditionId(null)}
                                      ariaLabel={`Pick ${cond.fieldLabel} color`}
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <input
                                type="text"
                                className="business-rule-form-condition-input"
                                placeholder="Enter value"
                                value={v.value}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setConditions((prev) =>
                                    prev.map((c) =>
                                      c.id === cond.id
                                        ? { ...c, values: c.values.map((item) => (item.id === v.id ? { ...item, value: val } : item)) }
                                        : c
                                    )
                                  );
                                }}
                              />
                            )
                          )}

                          <div className="business-rule-form-filter-row-actions">
                            {cond.category !== 'time_unit' && (
                              <button
                                type="button"
                                className="business-rule-form-or-btn"
                                onClick={() => handleToggleConditionJoinWord(cond.id, v.id)}
                              >
                                {v.joinWord || 'OR'}
                              </button>
                            )}
                            <button
                              type="button"
                              className="business-rule-form-filter-row-delete"
                              onClick={() => handleRemoveConditionValue(cond.id, v.id)}
                              aria-label="Remove value"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

                <div className="br-add-property-wrap">
                  <button
                    type="button"
                    className="business-rule-form-add-link"
                    onClick={handleOpenPropertyPicker}
                  >
                    <FiPlus size={14} aria-hidden />
                    Add new property
                  </button>
                  {(conditions.length > 0 || boardConditionRows.some((row) => row.boardId)) && (
                    <button
                      type="button"
                      className="business-rule-form-add-link"
                      onClick={handleClearConditions}
                    >
                      Clear all
                    </button>
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

                    {section.id === 'link' && linkActions.length > 0 && (
                      <div className="br-link-card-list">
                        {linkActions.map((action) => {
                          const isOperatorOpen = openLinkOperatorRowId === action.id;
                          return (
                            <div key={action.id} className="br-link-card">
                              <button
                                type="button"
                                className="business-rule-form-action-detail-close"
                                onClick={() => handleRemoveLinkAction(action.id)}
                                aria-label="Remove action"
                              >
                                <FiX size={14} />
                              </button>

                              <div className="br-link-card-header">
                                <button
                                  type="button"
                                  className="br-link-card-as-label"
                                  onClick={() => handleOpenLinkActionPickerForRow(action.id)}
                                >
                                  {action.label}
                                </button>
                                <div className="board-minimap-picker-wrap br-link-operator-wrap">
                                  <button
                                    type="button"
                                    ref={isOperatorOpen ? linkOperatorTriggerRef : undefined}
                                    className="br-link-operator-trigger"
                                    onClick={() => handleToggleLinkOperator(action.id)}
                                    aria-haspopup="listbox"
                                    aria-expanded={isOperatorOpen}
                                  >
                                    {action.operatorLabel || 'to card with id'}
                                    <FiChevronDown size={14} aria-hidden />
                                  </button>

                                  {isOperatorOpen && (
                                    <div className="board-minimap-picker-panel br-link-operator-panel" ref={linkOperatorPanelRef}>
                                      <div className="board-minimap-picker-search br-link-operator-search">
                                        <FiFilter size={16} className="board-minimap-picker-search-icon" aria-hidden />
                                        <input
                                          type="text"
                                          placeholder="Filter"
                                          value={linkOperatorFilterText}
                                          onChange={(e) => setLinkOperatorFilterText(e.target.value)}
                                          autoFocus
                                        />
                                      </div>
                                      <div className="board-minimap-picker-scroll br-link-operator-scroll">
                                        {isLoadingLinkCardActionOperators ? (
                                          <div className="br-property-picker-empty">Loading...</div>
                                        ) : filteredLinkOperators.length === 0 ? (
                                          <div className="br-property-picker-empty">No matches</div>
                                        ) : (
                                          filteredLinkOperators.map((op) => (
                                            <button
                                              type="button"
                                              key={op.operator_id}
                                              className="br-link-operator-option"
                                              onClick={() => handleSelectLinkOperator(action.id, op)}
                                            >
                                              {op.operator_label}
                                            </button>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {action.values.map((row) => (
                                <div key={row.id} className="br-link-card-value-row">
                                  <input
                                    type="text"
                                    className="br-link-card-value-input"
                                    placeholder="Enter card id"
                                    value={row.value ?? ''}
                                    onChange={(e) => handleChangeLinkActionValue(action.id, row.id, e.target.value)}
                                  />
                                  <div className="business-rule-form-filter-row-actions">
                                    <button
                                      type="button"
                                      className="business-rule-form-or-btn"
                                      onClick={() => handleAddLinkActionValueRow(action.id)}
                                    >
                                      AND
                                    </button>
                                    <button
                                      type="button"
                                      className="business-rule-form-filter-row-delete"
                                      onClick={() => handleRemoveLinkActionValueRow(action.id, row.id)}
                                      aria-label="Remove row"
                                    >
                                      <FiTrash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })}

                        <div className="br-link-remove-others-box">
                          <label className="br-link-checkbox-row">
                            <input
                              type="checkbox"
                              checked={removeOtherChildLinks}
                              onChange={(e) => setRemoveOtherChildLinks(e.target.checked)}
                            />
                            Remove all other child links
                          </label>
                          <label className="br-link-checkbox-row">
                            <input
                              type="checkbox"
                              checked={removeOtherParentLinks}
                              onChange={(e) => setRemoveOtherParentLinks(e.target.checked)}
                            />
                            Remove all other parent links
                          </label>
                          <label className="br-link-checkbox-row">
                            <input
                              type="checkbox"
                              checked={removeOtherRelativeLinks}
                              onChange={(e) => setRemoveOtherRelativeLinks(e.target.checked)}
                            />
                            Remove all other relative links
                          </label>
                        </div>

                        <div className="br-link-footer-actions">
                          <button
                            type="button"
                            className="business-rule-form-add-link"
                            onClick={() => { editingLinkActionIdRef.current = null; setShowLinkActionPicker(true); }}
                          >
                            <FiPlus size={14} aria-hidden />
                            Add new action
                          </button>
                          <button
                            type="button"
                            className="business-rule-form-add-link"
                            onClick={handleClearLinkActions}
                          >
                            Clear all
                          </button>
                        </div>
                      </div>
                    )}

                    {section.id === 'update' && updateActions.map((action) => (
                      <div key={action.id} className="business-rule-form-action-chip">
                        <span className="business-rule-form-action-chip-label">
                          {action.field ? (
                            <>{action.field}: <span className="notification-pill">{action.field}</span></>
                          ) : action.label}
                        </span>
                        <button
                          type="button"
                          className="business-rule-form-condition-remove"
                          onClick={() => handleRemoveUpdateAction(action.id)}
                          aria-label="Remove action"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}

                    {section.id === 'move' && moveActions.map((action) => (
                      <div key={action.id} className="business-rule-form-action-detail-card">
                        <button
                          type="button"
                          className="business-rule-form-action-detail-close"
                          onClick={() => handleRemoveMoveAction(action.id)}
                          aria-label="Remove action"
                        >
                          <FiX size={14} />
                        </button>
                        <h5 className="business-rule-form-action-detail-title">{action.label}</h5>
                        <button
                          type="button"
                          className="business-rule-form-action-detail-link"
                          onClick={() => handleOpenMoveDestination(action.id)}
                        >
                          {action.boardName
                            ? `${action.boardName} → ${action.swimlaneName || 'Any lane'} / ${action.stageName || 'Any stage'}`
                            : 'Choose where to move'}
                        </button>
                      </div>
                    ))}

                    {section.id === 'notify' && notifyActions.map((action) => (
                      <div key={action.id} className="business-rule-form-action-detail-card">
                        <button
                          type="button"
                          className="business-rule-form-action-detail-close"
                          onClick={() => handleRemoveNotifyAction(action.id)}
                          aria-label="Remove action"
                        >
                          <FiX size={14} />
                        </button>
                        <h5 className="business-rule-form-action-detail-title">{action.label}</h5>
                        <button
                          type="button"
                          className="business-rule-form-action-detail-link"
                          onClick={() => handleOpenNotificationSettings(action.id)}
                        >
                          {action.configured ? 'Configured' : 'Not Set'}
                        </button>
                      </div>
                    ))}

                    {section.id === 'invoke' && invokeActions.map((action) => (
                      <div key={action.id} className="business-rule-form-action-detail-card">
                        <button
                          type="button"
                          className="business-rule-form-action-detail-close"
                          onClick={() => handleRemoveInvokeAction(action.id)}
                          aria-label="Remove action"
                        >
                          <FiX size={14} />
                        </button>
                        <h5 className="business-rule-form-action-detail-title">{action.label}</h5>
                        <button
                          type="button"
                          className="business-rule-form-action-detail-link"
                          onClick={() => handleOpenWebInvokeSettings(action.id)}
                        >
                          {action.configured ? 'Configured' : 'Not Set'}
                        </button>
                      </div>
                    ))}

                    {!(section.id === 'link' && linkActions.length > 0) && (
                      <button
                        type="button"
                        className="business-rule-form-add-action"
                        onClick={() => {
                          if (section.id === 'create') setShowCreateActionPicker(true);
                          if (section.id === 'link') setShowLinkActionPicker(true);
                          if (section.id === 'move') handleAddMoveAction();
                          if (section.id === 'update') setShowUpdateActionPicker(true);
                          if (section.id === 'notify') handleAddNotifyAction();
                          if (section.id === 'invoke') handleAddInvokeAction();
                        }}
                      >
                        <FiPlus size={14} aria-hidden />
                        Add new action
                      </button>
                    )}
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
      onClose={() => { setShowPropertyPicker(false); editingConditionIdRef.current = null; }}
      onSelect={handleSelectProperty}
      existingFieldLabels={[
        'board',
        ...conditions
          .filter((c) => c.id !== editingConditionIdRef.current)
          .map((c) => c.fieldLabel.trim().toLowerCase()),
      ]}
      triggerTypeId={rule.id}
    />

    <CreateActionModal
      show={showCreateActionPicker}
      onClose={() => setShowCreateActionPicker(false)}
      onSelect={handleSelectCreateAction}
    />

    <LinkActionModal
      show={showLinkActionPicker}
      onClose={() => { setShowLinkActionPicker(false); editingLinkActionIdRef.current = null; }}
      onSelect={handleSelectLinkAction}
    />

    <BoardMinimapModal
      show={showMoveDestinationPicker}
      onClose={() => setShowMoveDestinationPicker(false)}
      onSave={handleSaveMoveDestination}
      initialBoardId={activeMoveAction?.boardId}
    />

    <RefineUpdateCriteriaModal
      show={showUpdateActionPicker}
      onClose={() => setShowUpdateActionPicker(false)}
      onSelect={handleSelectUpdateAction}
      existingFieldLabels={updateActions
        .filter((a) => a.category === 'custom')
        .map((a) => a.rawLabel.trim().toLowerCase())}
      triggerTypeId={rule.id}
    />

    <NotificationSettingsModal
      show={showNotificationSettings}
      onClose={() => setShowNotificationSettings(false)}
      onSave={handleSaveNotificationSettings}
      initialSettings={activeNotifyAction}
      triggerTypeId={rule.id}
    />

    <WebInvokeSettingsModal
      show={showWebInvokeSettings}
      onClose={() => setShowWebInvokeSettings(false)}
      onSave={handleSaveWebInvokeSettings}
      initialSettings={activeInvokeAction}
    />

    <ShareWithModal
      show={showShareModal}
      onClose={() => setShowShareModal(false)}
      permissions={sharePermissions}
      onSave={handleSaveSharePermissions}
    />

    <Modal
      show={showCancelConfirm}
      onHide={handleCancelClose}
      className="br-cancel-confirm-modal"
      dialogClassName="br-cancel-confirm-dialog"
      backdropClassName="br-cancel-confirm-backdrop"
      backdrop="static"
    >
      <div className="br-cancel-confirm-content">
        <button type="button" className="br-cancel-confirm-close-btn" onClick={handleCancelClose}>
          <FiX size={16} />
        </button>
        <p className="br-cancel-confirm-text">Are you sure you want to cancel creating a new business rule?</p>
        <div className="br-cancel-confirm-actions">
          <button type="button" className="br-cancel-confirm-btn br-cancel-confirm-btn--no" onClick={handleCancelClose}>
            No
          </button>
          <button type="button" className="br-cancel-confirm-btn br-cancel-confirm-btn--yes" onClick={handleConfirmClose}>
            Yes
          </button>
        </div>
      </div>
    </Modal>
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
  triggerTypeId: PropTypes.number,
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

BoardMinimapModal.propTypes = {
  show: PropTypes.bool.isRequired,
  initialBoardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

RefineUpdateCriteriaModal.propTypes = {
  show: PropTypes.bool.isRequired,
  existingFieldLabels: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  triggerTypeId: PropTypes.number,
};

NotificationSettingsModal.propTypes = {
  show: PropTypes.bool.isRequired,
  initialSettings: PropTypes.shape({
    to: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, type: PropTypes.oneOf(['user', 'field']) })),
    cc: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, type: PropTypes.oneOf(['user', 'field']) })),
    subjectParts: PropTypes.array,
    bodyContent: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  triggerTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default BusinessRuleFormModal;
