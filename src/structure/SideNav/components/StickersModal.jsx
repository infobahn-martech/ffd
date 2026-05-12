import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FiX, FiPlus, FiMoreVertical, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import NewStickerModal from './NewStickerModal';
import DynamicIcon from './DynamicIcon';
import useKanbanManagementReducer from '../../../store/KanbanManagementReducer';
import { normalizeHexColor } from '../../../components/SedresColorPicker/sedresColorPickerConstants';
import '../../../design/scss/blockers-modal.scss';

const contrastIconFg = (bg) => {
  if (!bg || typeof bg !== 'string') return '#1a1a1a';
  let r;
  let g;
  let b;
  const trimmed = bg.trim();
  if (trimmed.startsWith('#')) {
    const h = trimmed.slice(1);
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    if (full.length < 6) return '#1a1a1a';
    r = parseInt(full.slice(0, 2), 16);
    g = parseInt(full.slice(2, 4), 16);
    b = parseInt(full.slice(4, 6), 16);
  } else {
    const m = trimmed.match(/\d+/g);
    if (!m || m.length < 3) return '#1a1a1a';
    r = Number(m[0]);
    g = Number(m[1]);
    b = Number(m[2]);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#1a1a1a' : '#ffffff';
};

/** Same circular icon preview pattern as TypesModal `TypeIconSwatch` */
const StickerIconSwatch = ({ color_code, iconKey }) => {
  const hex = normalizeHexColor(color_code);
  const fg = contrastIconFg(hex);
  return (
    <div
      className="tags-modal-tag-color-swatch"
      style={{
        backgroundColor: hex,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden
    >
      <DynamicIcon iconKey={iconKey} size={16} color={fg} />
    </div>
  );
};

function boardsRawFromIds(board_ids, workspaceBoardOptions) {
  const nameById = new Map();
  (workspaceBoardOptions || []).forEach((ws) => {
    (ws.boards || []).forEach((b) => {
      nameById.set(String(b.board_id), String(b.board_name ?? ''));
    });
  });
  return (board_ids || []).map((id) => ({
    board_id: id,
    board_name: nameById.get(String(id)) ?? '',
  }));
}

function normalizeStickerTableRow({
  sticker_id,
  label,
  color_code,
  icon,
  availability_level,
  boardsRaw,
}) {
  const boardsJoined = (boardsRaw || [])
    .map((b) => String(b?.board_name ?? '').trim())
    .filter(Boolean)
    .join(', ');
  return {
    id: String(sticker_id),
    sticker_id,
    label: String(label ?? ''),
    color_code: normalizeHexColor(color_code || '#ffffff'),
    icon: String(icon ?? '').trim() || 'FiLayers',
    availabilityLevel: String(availability_level ?? '').trim() || 'Auto',
    boardsJoined,
    boardsRaw: (boardsRaw || []).map((b) => ({
      board_id: b?.board_id,
      board_name: String(b?.board_name ?? ''),
    })),
  };
}

const StickersModal = ({ show, onClose }) => {
  const workspaceBoardOptions = useKanbanManagementReducer((s) => s.workspaceBoardOptions);
  const workspaceBoardsLoading = useKanbanManagementReducer((s) => s.workspaceBoardsLoading);
  const fetchWorkspaceBoardPickerOptions = useKanbanManagementReducer(
    (s) => s.fetchWorkspaceBoardPickerOptions
  );

  const [allStickers, setAllStickers] = useState([]);
  const [stickersLoading, setStickersLoading] = useState(false);
  const [stickersError, setStickersError] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNewStickerModal, setShowNewStickerModal] = useState(false);
  const [editingSticker, setEditingSticker] = useState(null);

  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const selectAllCheckboxRef = useRef(null);
  const actionMenuRefs = useRef({});
  const nextStickerIdRef = useRef(1);

  const filteredStickers = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return allStickers;
    return allStickers.filter((row) => row.label.toLowerCase().includes(q));
  }, [allStickers, debouncedSearch]);

  const lastPage = Math.max(1, Math.ceil(filteredStickers.length / perPage) || 1);

  const pageStickers = useMemo(
    () =>
      filteredStickers.slice(
        (Math.min(currentPage, lastPage) - 1) * perPage,
        Math.min(currentPage, lastPage) * perPage
      ),
    [filteredStickers, currentPage, lastPage, perPage]
  );

  useEffect(() => {
    if (!show) {
      setSearchValue('');
      setDebouncedSearch('');
      setCurrentPage(1);
      setSelectedItems([]);
      return;
    }
    fetchWorkspaceBoardPickerOptions();
  }, [show, fetchWorkspaceBoardPickerOptions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  useEffect(() => {
    if (!show) return;
    let cancelled = false;
    (async () => {
      setStickersLoading(true);
      setStickersError('');
      try {
        /* Replace with API fetch when backend exists; list is client-held until then */
        await Promise.resolve();
        if (!cancelled) {
          setStickersLoading(false);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ??
          err?.message ??
          'Unable to load stickers. Please try again.';
        if (!cancelled) {
          setStickersError(msg);
          setStickersLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show]);

  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => pageStickers.some((row) => String(row.id) === id))
    );
  }, [pageStickers]);

  useEffect(() => {
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [lastPage, currentPage]);

  const handleCheckboxChange = (stickerId) => {
    const id = String(stickerId);
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === pageStickers.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(pageStickers.map((b) => String(b.id)));
    }
  };

  const isAllSelected =
    selectedItems.length === pageStickers.length && pageStickers.length > 0;
  const isIndeterminate =
    selectedItems.length > 0 && selectedItems.length < pageStickers.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenuId !== null) {
        const menuRef = actionMenuRefs.current[openActionMenuId];
        if (menuRef && !menuRef.contains(event.target)) {
          setOpenActionMenuId(null);
        }
      }
    };

    if (openActionMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openActionMenuId]);

  const handleActionMenuToggle = (stickerId, event) => {
    event.stopPropagation();
    const id = String(stickerId);
    setOpenActionMenuId(openActionMenuId === id ? null : id);
  };

  const handleEdit = (row) => {
    setEditingSticker({
      sticker_id: row.sticker_id,
      label: row.label,
      color_code: row.color_code,
      icon: row.icon,
      availability_level: row.availabilityLevel,
      boards: row.boardsRaw,
    });
    setShowNewStickerModal(true);
    setOpenActionMenuId(null);
  };

  const handleDisable = async (stickerId) => {
    const id = String(stickerId);
    setOpenActionMenuId(null);
    try {
      /* await disableKanbanStickerRecord(id, { search: debouncedSearch, page: currentPage, per_page: perPage }); */
      await Promise.resolve();
      setAllStickers((prev) => prev.filter((r) => String(r.sticker_id) !== id));
    } catch {
      /* AlertReducer in store */
    }
  };

  const handleDelete = (stickerId) => {
    const id = String(stickerId);
    setOpenActionMenuId(null);
    if (!window.confirm('Delete this sticker? This cannot be undone.')) {
      return;
    }
    (async () => {
      try {
        /* await deleteKanbanStickerRecord(id, { search: debouncedSearch, page: currentPage, per_page: perPage }); */
        await Promise.resolve();
        setAllStickers((prev) => prev.filter((r) => String(r.sticker_id) !== id));
      } catch {
        /* AlertReducer in store */
      }
    })();
  };

  const handleAddSticker = () => {
    setEditingSticker(null);
    setShowNewStickerModal(true);
  };

  const closeStickerFormModal = () => {
    setShowNewStickerModal(false);
    setEditingSticker(null);
  };

  const handleStickerFormSave = useCallback(
    async (payload) => {
      const boardsRaw = boardsRawFromIds(payload.board_ids, workspaceBoardOptions);
      const row = normalizeStickerTableRow({
        sticker_id:
          payload.mode === 'edit'
            ? payload.sticker_id
            : `local-${nextStickerIdRef.current++}`,
        label: payload.label,
        color_code: payload.color_code,
        icon: payload.icon,
        availability_level: payload.availability_level,
        boardsRaw,
      });
      if (payload.mode === 'create') {
        setAllStickers((prev) => [...prev, row]);
      } else {
        setAllStickers((prev) =>
          prev.map((r) =>
            String(r.sticker_id) === String(payload.sticker_id) ? row : r
          )
        );
      }
    },
    [workspaceBoardOptions]
  );

  const hasNextPage = currentPage < lastPage;

  const handleSearchChange = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const retryFetch = () => {
    setStickersError('');
    setStickersLoading(true);
    Promise.resolve()
      .then(() => setStickersLoading(false))
      .catch(() => {
        setStickersError('Unable to load stickers. Please try again.');
        setStickersLoading(false);
      });
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="blockers-modal"
      centered
      size="xl"
    >
      <Modal.Header className="blockers-modal-header">
        <Modal.Title className="blockers-modal-title">Stickers</Modal.Title>
        <button
          type="button"
          className="blockers-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="blockers-modal-body tags-modal-body">
        <div className="blockers-filter-bar">
          <div className="blockers-filter-left">
            <input
              type="text"
              className="blockers-filter-input"
              placeholder="Filter"
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="blockers-filter-right">
            <button
              type="button"
              className="blockers-add-btn"
              aria-label="Add sticker"
              onClick={handleAddSticker}
            >
              <FiPlus size={20} />
            </button>
          </div>
        </div>

        {stickersError && (
          <div className="tags-modal-error-banner" role="alert">
            <FiAlertCircle size={18} aria-hidden />
            <span className="tags-modal-error-text">{stickersError}</span>
            <button type="button" className="tags-modal-error-retry" onClick={retryFetch}>
              Retry
            </button>
          </div>
        )}

        <div className="blockers-table-wrapper blockers-table-wrapper--tags-min-body">
          <table className="blockers-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    ref={selectAllCheckboxRef}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                </th>
                <th style={{ width: '50px' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M2 4h12M2 8h12M2 12h12"
                      stroke="#666"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="4" cy="4" r="1" fill="#666" />
                    <circle cx="4" cy="8" r="1" fill="#666" />
                    <circle cx="4" cy="12" r="1" fill="#666" />
                  </svg>
                </th>
                <th>
                  <div className="blockers-th-content">
                    <span>Label</span>
                  </div>
                </th>
                <th>
                  <div className="blockers-th-content">
                    <span>Availability level</span>
                    <button type="button" className="blockers-th-info-btn">
                      <FiInfo size={14} />
                    </button>
                  </div>
                </th>
                <th>
                  <div className="blockers-th-content">
                    <span>Boards</span>
                  </div>
                </th>
                <th style={{ width: '40px' }}>
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {stickersLoading ? (
                <tr>
                  <td colSpan="6" className="tags-modal-loading-cell">
                    Loading stickers…
                  </td>
                </tr>
              ) : pageStickers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '40px', color: '#999' }}
                  >
                    No stickers found
                  </td>
                </tr>
              ) : (
                pageStickers.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(String(row.id))}
                        onChange={() => handleCheckboxChange(row.id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                        }}
                      />
                    </td>
                    <td>
                      <StickerIconSwatch color_code={row.color_code} iconKey={row.icon} />
                    </td>
                    <td>
                      <span className="blockers-label-text">{row.label}</span>
                    </td>
                    <td>
                      <span className="blockers-availability-text">{row.availabilityLevel}</span>
                    </td>
                    <td>
                      <span className="blockers-boards-text">{row.boardsJoined}</span>
                    </td>
                    <td>
                      <div
                        ref={(el) => {
                          actionMenuRefs.current[String(row.id)] = el;
                        }}
                        style={{ position: 'relative' }}
                      >
                        <button
                          type="button"
                          className="blockers-kebab-btn"
                          aria-label="Action"
                          onClick={(e) => handleActionMenuToggle(row.id, e)}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                        {openActionMenuId === String(row.id) && (
                          <div className="blockers-action-menu">
                            <button
                              type="button"
                              className="blockers-action-menu-item"
                              onClick={() => handleEdit(row)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="blockers-action-menu-item"
                              onClick={() => handleDisable(row.sticker_id ?? row.id)}
                            >
                              Disable
                            </button>
                            <button
                              type="button"
                              className="blockers-action-menu-item blockers-action-menu-item-danger"
                              onClick={() => handleDelete(row.sticker_id ?? row.id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="tags-modal-pagination">
          <button
            type="button"
            className="tags-modal-pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1 || stickersLoading}
          >
            Previous
          </button>
          <span className="tags-modal-pagination-page">Page {currentPage}</span>
          <button
            type="button"
            className="tags-modal-pagination-btn"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNextPage || stickersLoading}
          >
            Next
          </button>
        </div>
      </Modal.Body>
      <NewStickerModal
        show={showNewStickerModal}
        onClose={closeStickerFormModal}
        editingSticker={editingSticker}
        workspaceBoardOptions={workspaceBoardOptions}
        workspaceBoardsLoading={workspaceBoardsLoading}
        onSave={handleStickerFormSave}
      />
    </Modal>
  );
};

export default StickersModal;
