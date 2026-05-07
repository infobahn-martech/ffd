import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPlus, FiSearch } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import SedresColorPicker from '../../../components/SedresColorPicker/SedresColorPicker';
import { normalizeHexColor } from '../../../components/SedresColorPicker/sedresColorPickerConstants';
import '../../../design/scss/new-blocker-modal.scss';

/** Sample data — replace with API-driven list when available */
export const WORKSPACE_BOARD_OPTIONS = [
  {
    workspace_id: 1,
    workspace_name: 'Team A',
    boards: [
      { board_id: 1, board_name: 'Strategic Objectives' },
      { board_id: 2, board_name: 'Operations' },
    ],
  },
  {
    workspace_id: 2,
    workspace_name: 'Team B',
    boards: [{ board_id: 3, board_name: 'Team B Board' }],
  },
];

const COLOR_PICKER_PORTAL_Z = 10800;

/** Tag availability values — keep in sync with TagsModal / API */
export const TAG_AVAILABILITY_OPTIONS = ['On Demand', 'Auto', 'Global'];

function sortSelectedBoards(selected, sourceWorkspaces) {
  const order = new Map();
  let i = 0;
  sourceWorkspaces.forEach((ws) => {
    ws.boards.forEach((b) => {
      order.set(b.board_id, i++);
    });
  });
  return [...selected].sort((a, b) => (order.get(a.board_id) ?? 999) - (order.get(b.board_id) ?? 999));
}

const NewTagModal = ({ show, onClose, onSave, workspaceBoardOptions = WORKSPACE_BOARD_OPTIONS }) => {
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [label, setLabel] = useState('');
  const [availability, setAvailability] = useState('On Demand');
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPlacement, setColorPickerPlacement] = useState({ top: 0, left: 0 });
  const [isBoardSelectorOpen, setIsBoardSelectorOpen] = useState(false);
  const [boardSearch, setBoardSearch] = useState('');

  const colorTriggerRef = useRef(null);
  const colorPickerPopoverRef = useRef(null);
  const boardSelectorRef = useRef(null);
  const addBoardBtnRef = useRef(null);

  const filteredWorkspaceOptions = useMemo(() => {
    const q = boardSearch.trim().toLowerCase();
    if (!q) return workspaceBoardOptions;
    return workspaceBoardOptions
      .map((ws) => {
        const wsMatch = ws.workspace_name.toLowerCase().includes(q);
        const boards = wsMatch ? ws.boards : ws.boards.filter((b) => b.board_name.toLowerCase().includes(q));
        if (boards.length === 0) return null;
        return { ...ws, boards };
      })
      .filter(Boolean);
  }, [boardSearch, workspaceBoardOptions]);

  const selectedIds = useMemo(() => new Set(selectedBoards.map((b) => b.board_id)), [selectedBoards]);

  const isWorkspaceFullySelected = useCallback(
    (ws) => ws.boards.length > 0 && ws.boards.every((b) => selectedIds.has(b.board_id)),
    [selectedIds]
  );

  const toggleBoard = useCallback((board) => {
    setSelectedBoards((prev) => {
      const exists = prev.some((b) => b.board_id === board.board_id);
      if (exists) return prev.filter((b) => b.board_id !== board.board_id);
      return [...prev, { board_id: board.board_id, board_name: board.board_name }];
    });
  }, []);

  const toggleWorkspaceAll = useCallback(
    (ws) => {
      const allOn = isWorkspaceFullySelected(ws);
      setSelectedBoards((prev) => {
        const ids = new Set(ws.boards.map((b) => b.board_id));
        if (allOn) return prev.filter((b) => !ids.has(b.board_id));
        const map = new Map(prev.map((b) => [b.board_id, b]));
        ws.boards.forEach((b) => map.set(b.board_id, { board_id: b.board_id, board_name: b.board_name }));
        return sortSelectedBoards(Array.from(map.values()), workspaceBoardOptions);
      });
    },
    [isWorkspaceFullySelected, workspaceBoardOptions]
  );

  const removeBoardChip = useCallback((boardId) => {
    setSelectedBoards((prev) => prev.filter((b) => b.board_id !== boardId));
  }, []);

  const resetForm = useCallback(() => {
    setSelectedColor('#ffffff');
    setLabel('');
    setAvailability('On Demand');
    setSelectedBoards([]);
    setIsColorPickerOpen(false);
    setIsBoardSelectorOpen(false);
    setBoardSearch('');
  }, []);

  const handleSave = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    if (!TAG_AVAILABILITY_OPTIONS.includes(availability)) return;
    const boardsPayload = selectedBoards.map((b) => ({ board_id: b.board_id, board_name: b.board_name }));
    if (onSave) {
      onSave({
        color: normalizeHexColor(selectedColor),
        label: trimmed,
        availability,
        boards: boardsPayload,
      });
    }
    resetForm();
    onClose();
  };

  const openColorPicker = () => {
    if (colorTriggerRef.current) {
      const r = colorTriggerRef.current.getBoundingClientRect();
      setColorPickerPlacement({ top: r.bottom + 8, left: r.left });
    }
    setIsColorPickerOpen(true);
  };

  const closeColorPicker = useCallback(() => {
    setIsColorPickerOpen(false);
  }, []);

  useEffect(() => {
    if (!isColorPickerOpen) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (colorTriggerRef.current?.contains(t)) return;
      if (colorPickerPopoverRef.current?.contains(t)) return;
      closeColorPicker();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isColorPickerOpen, closeColorPicker]);

  useEffect(() => {
    if (!isBoardSelectorOpen) return undefined;
    const onDocMouseDown = (event) => {
      const t = event.target;
      if (boardSelectorRef.current?.contains(t)) return;
      if (addBoardBtnRef.current?.contains(t)) return;
      setIsBoardSelectorOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isBoardSelectorOpen]);

  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show, resetForm]);

  const sortedChips = useMemo(
    () => sortSelectedBoards(selectedBoards, workspaceBoardOptions),
    [selectedBoards, workspaceBoardOptions]
  );

  const previewHex = normalizeHexColor(selectedColor);

  const canSave = Boolean(label.trim()) && TAG_AVAILABILITY_OPTIONS.includes(availability);

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="new-blocker-modal"
      centered
      size="md"
      dialogClassName="new-blocker-modal-dialog"
    >
      <Modal.Header className="new-blocker-modal-header">
        <Modal.Title className="new-blocker-modal-title">New Card Tag</Modal.Title>
        <button type="button" className="new-blocker-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="new-blocker-modal-body">
        <div className="new-blocker-form">
          <div className="new-blocker-row-fields">
            <div className="new-blocker-field">
              <label className="new-blocker-label">Color</label>
              <div className="new-blocker-color-wrapper">
                <button
                  ref={colorTriggerRef}
                  type="button"
                  className="new-blocker-color-swatch"
                  style={{ backgroundColor: previewHex }}
                  onClick={() => (isColorPickerOpen ? closeColorPicker() : openColorPicker())}
                  aria-haspopup="dialog"
                  aria-expanded={isColorPickerOpen}
                  aria-label="Open color picker"
                />
              </div>
            </div>

            <div className="new-blocker-field-cluster">
              <div className="new-blocker-tag-fields-inline">
                <div className="new-blocker-field new-blocker-field-label-with-availability">
                  <label className="new-blocker-label" htmlFor="new-tag-label-input">
                    Label
                  </label>
                  <input
                    id="new-tag-label-input"
                    type="text"
                    className="new-blocker-input"
                    placeholder="Enter tag label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </div>
                <div className="new-blocker-field new-blocker-field-availability">
                  <label className="new-blocker-label" htmlFor="new-tag-availability-select">
                    Availability
                  </label>
                  <select
                    id="new-tag-availability-select"
                    className="new-blocker-select"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    aria-required
                  >
                    {TAG_AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="new-blocker-field new-blocker-boards-field">
            <p className="new-blocker-boards-text">The tag is applied to the following boards</p>
            <div className="new-blocker-boards-controls">
              <button
                ref={addBoardBtnRef}
                type="button"
                className="new-blocker-add-board-btn"
                aria-label="Choose boards"
                aria-expanded={isBoardSelectorOpen}
                onClick={() => setIsBoardSelectorOpen((v) => !v)}
              >
                <FiPlus size={20} />
              </button>

              {isBoardSelectorOpen && (
                <div className="new-blocker-board-selector" ref={boardSelectorRef}>
                  <div className="new-blocker-board-selector-header">
                    <FiSearch size={16} className="new-blocker-board-selector-search-icon" aria-hidden />
                    <input
                      type="search"
                      className="new-blocker-board-selector-search"
                      placeholder="Search workspaces or boards…"
                      value={boardSearch}
                      onChange={(e) => setBoardSearch(e.target.value)}
                      aria-label="Filter workspaces and boards"
                    />
                  </div>
                  <div className="new-blocker-board-selector-scroll">
                    {filteredWorkspaceOptions.length === 0 ? (
                      <div className="new-blocker-board-selector-empty">No matches</div>
                    ) : (
                      filteredWorkspaceOptions.map((ws) => (
                        <div key={ws.workspace_id} className="new-blocker-workspace-group">
                          <div className="new-blocker-workspace-head">
                            <span className="new-blocker-workspace-title">{ws.workspace_name}</span>
                            <button
                              type="button"
                              className="new-blocker-workspace-select-all"
                              onClick={() => toggleWorkspaceAll(ws)}
                            >
                              {isWorkspaceFullySelected(ws) ? 'Deselect all' : 'Select all'}
                            </button>
                          </div>
                          {ws.boards.map((board) => (
                            <label key={board.board_id} className="new-blocker-board-option">
                              <input
                                type="checkbox"
                                className="new-blocker-board-checkbox"
                                checked={selectedIds.has(board.board_id)}
                                onChange={() => toggleBoard(board)}
                              />
                              <span className="new-blocker-board-option-label">{board.board_name}</span>
                            </label>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {sortedChips.length > 0 && (
              <div className="new-blocker-boards-list">
                {sortedChips.map((b) => (
                  <span key={b.board_id} className="new-blocker-selected-board-chip">
                    <span className="new-blocker-selected-board-chip-text">{b.board_name}</span>
                    <button
                      type="button"
                      className="new-blocker-selected-board-chip-remove"
                      onClick={() => removeBoardChip(b.board_id)}
                      aria-label={`Remove ${b.board_name}`}
                    >
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="new-blocker-modal-footer">
        <button
          type="button"
          className="new-blocker-save-btn"
          onClick={handleSave}
          disabled={!canSave}
        >
          Save
        </button>
      </Modal.Footer>

      {isColorPickerOpen &&
        createPortal(
          <div
            className="new-blocker-color-picker-portal"
            style={{
              position: 'fixed',
              top: colorPickerPlacement.top,
              left: colorPickerPlacement.left,
              zIndex: COLOR_PICKER_PORTAL_Z,
            }}
          >
            <SedresColorPicker
              popoverRef={colorPickerPopoverRef}
              popoverId="new-tag-color-picker"
              initialHex={previewHex}
              onApply={(hex) => {
                setSelectedColor(normalizeHexColor(hex));
                setIsColorPickerOpen(false);
              }}
              onCancel={closeColorPicker}
              ariaLabel="Pick tag color"
              hexInputId="newTagColorHex"
            />
          </div>,
          document.body
        )}
    </Modal>
  );
};

NewTagModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  workspaceBoardOptions: PropTypes.arrayOf(
    PropTypes.shape({
      workspace_id: PropTypes.number.isRequired,
      workspace_name: PropTypes.string.isRequired,
      boards: PropTypes.arrayOf(
        PropTypes.shape({
          board_id: PropTypes.number.isRequired,
          board_name: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ),
};

export default NewTagModal;
