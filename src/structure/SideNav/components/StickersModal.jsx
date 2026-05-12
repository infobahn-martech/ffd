import { useState, useRef, useEffect } from 'react';
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

const StickersModal = ({ show, onClose }) => {
  const cardStickers = useKanbanManagementReducer((s) => s.cardStickers);
  const cardStickersLoading = useKanbanManagementReducer((s) => s.cardStickersLoading);
  const cardStickersError = useKanbanManagementReducer((s) => s.cardStickersError);
  const cardStickersPagination = useKanbanManagementReducer((s) => s.cardStickersPagination);
  const workspaceBoardOptions = useKanbanManagementReducer((s) => s.workspaceBoardOptions);
  const workspaceBoardsLoading = useKanbanManagementReducer((s) => s.workspaceBoardsLoading);

  const fetchKanbanCardStickers = useKanbanManagementReducer((s) => s.fetchKanbanCardStickers);
  const fetchWorkspaceBoardPickerOptions = useKanbanManagementReducer(
    (s) => s.fetchWorkspaceBoardPickerOptions
  );
  const createKanbanCardSticker = useKanbanManagementReducer((s) => s.createKanbanCardSticker);
  const updateKanbanCardStickerRecord = useKanbanManagementReducer(
    (s) => s.updateKanbanCardStickerRecord
  );
  const disableKanbanCardStickerRecord = useKanbanManagementReducer(
    (s) => s.disableKanbanCardStickerRecord
  );
  const deleteKanbanCardStickerRecord = useKanbanManagementReducer(
    (s) => s.deleteKanbanCardStickerRecord
  );

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNewStickerModal, setShowNewStickerModal] = useState(false);
  const [editingSticker, setEditingSticker] = useState(null);

  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const selectAllCheckboxRef = useRef(null);
  const actionMenuRefs = useRef({});

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
    fetchKanbanCardStickers({ search: debouncedSearch, page: currentPage, limit });
  }, [show, debouncedSearch, currentPage, limit, fetchKanbanCardStickers]);

  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => cardStickers.some((row) => String(row.id) === id))
    );
  }, [cardStickers]);

  useEffect(() => {
    const serverPage = Number(cardStickersPagination?.current_page || 1);
    if (serverPage !== currentPage) {
      setCurrentPage(serverPage);
    }
  }, [cardStickersPagination?.current_page, currentPage]);

  const handleCheckboxChange = (stickerId) => {
    const id = String(stickerId);
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cardStickers.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cardStickers.map((b) => String(b.id)));
    }
  };

  const isAllSelected =
    selectedItems.length === cardStickers.length && cardStickers.length > 0;
  const isIndeterminate =
    selectedItems.length > 0 && selectedItems.length < cardStickers.length;

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

  const refreshParams = () => ({
    search: debouncedSearch,
    page: currentPage,
    limit,
  });

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
      await disableKanbanCardStickerRecord(id, refreshParams());
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
        await deleteKanbanCardStickerRecord(id, refreshParams());
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

  const handleStickerFormSave = async (payload) => {
    const apiBody = {
      sticker_name: payload.label,
      color_code: payload.color_code,
      icon_name: payload.icon,
      board_ids: payload.board_ids,
      availability_level: payload.availability_level,
    };
    if (payload.mode === 'create') {
      await createKanbanCardSticker(apiBody, refreshParams());
    } else {
      await updateKanbanCardStickerRecord(payload.sticker_id, apiBody, refreshParams());
    }
  };

  const stickerLimit = Number(cardStickersPagination?.limit) || limit;
  const hasMetaLastPage = Number(cardStickersPagination?.last_page || 0) > 0;
  const hasNextByMeta = hasMetaLastPage
    ? currentPage < Number(cardStickersPagination.last_page)
    : true;
  const hasNextPage = hasNextByMeta && cardStickers.length === stickerLimit;

  const handleSearchChange = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
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

        {cardStickersError && (
          <div className="tags-modal-error-banner" role="alert">
            <FiAlertCircle size={18} aria-hidden />
            <span className="tags-modal-error-text">{cardStickersError}</span>
            <button
              type="button"
              className="tags-modal-error-retry"
              onClick={() =>
                fetchKanbanCardStickers({
                  search: debouncedSearch,
                  page: currentPage,
                  limit,
                })
              }
            >
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
              {cardStickersLoading ? (
                <tr>
                  <td colSpan="6" className="tags-modal-loading-cell">
                    Loading stickers…
                  </td>
                </tr>
              ) : cardStickers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '40px', color: '#999' }}
                  >
                    No stickers found
                  </td>
                </tr>
              ) : (
                cardStickers.map((row) => (
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
            disabled={currentPage <= 1 || cardStickersLoading}
          >
            Previous
          </button>
          <span className="tags-modal-pagination-page">Page {currentPage}</span>
          <button
            type="button"
            className="tags-modal-pagination-btn"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNextPage || cardStickersLoading}
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
