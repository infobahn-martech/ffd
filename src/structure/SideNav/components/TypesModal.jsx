import { useState, useRef, useEffect, useCallback } from 'react';
import { FiX, FiPlus, FiMoreVertical, FiInfo, FiAlertCircle } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import NewTypeModal from './NewTypeModal';
import { normalizeTagAvailabilityLevel } from './NewTagModal';
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

/** Map persisted row → table row (swap for API mapper when backend exists). */
function normalizeKanbanTypeRowFromApi(t) {
  const boards = Array.isArray(t?.boards) ? t.boards : [];
  const availability =
    t?.availability_level != null && t.availability_level !== ''
      ? String(t.availability_level)
      : '';
  return {
    id: String(t?.type_id ?? ''),
    type_id: t?.type_id,
    label: String(t?.label ?? ''),
    color_code: normalizeHexColor(t?.color_code || '#ffffff'),
    icon: String(t?.icon ?? '').trim() || 'FiLayers',
    availabilityLevel: availability,
    boardsJoined: boards
      .map((b) => String(b?.board_name ?? '').trim())
      .filter(Boolean)
      .join(', '),
    boardsRaw: boards.map((b) => ({
      board_id: b?.board_id,
      board_name: String(b?.board_name ?? ''),
    })),
    status: t?.status ?? 'active',
  };
}

const TypeIconSwatch = ({ color_code, iconKey }) => {
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

const getInitialTypeCatalog = () => [
  {
    type_id: '1',
    label: 'HAHA',
    color_code: '#FCD34D',
    icon: 'LuUsb',
    availability_level: 'On-demand',
    status: 'active',
    boards: [
      { board_id: 'b1', board_name: 'Team B' },
      { board_id: 'b2', board_name: 'Team A' },
      { board_id: 'b3', board_name: 'Strategic Objectives' },
    ],
  },
  {
    type_id: '2',
    label: 'Waiting on others',
    color_code: '#A78BFA',
    icon: 'LuHourglass',
    availability_level: 'Auto',
    status: 'active',
    boards: [
      { board_id: 'b1', board_name: 'Team B' },
      { board_id: 'b2', board_name: 'Team A' },
      { board_id: 'b3', board_name: 'Strategic Objectives' },
    ],
  },
  {
    type_id: '3',
    label: 'Waiting on us',
    color_code: '#EF4444',
    icon: 'LuHourglass',
    availability_level: 'Auto',
    status: 'active',
    boards: [
      { board_id: 'b1', board_name: 'Team B' },
      { board_id: 'b2', board_name: 'Team A' },
      { board_id: 'b3', board_name: 'Strategic Objectives' },
    ],
  },
];

const TypesModal = ({ show, onClose }) => {
  const workspaceBoardOptions = useKanbanManagementReducer((s) => s.workspaceBoardOptions);
  const workspaceBoardsLoading = useKanbanManagementReducer((s) => s.workspaceBoardsLoading);
  const fetchWorkspaceBoardPickerOptions = useKanbanManagementReducer(
    (s) => s.fetchWorkspaceBoardPickerOptions
  );

  const [typeCatalog, setTypeCatalog] = useState(() => getInitialTypeCatalog());
  const [types, setTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [typesError, setTypesError] = useState('');
  const [typesPagination, setTypesPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;
  const [selectedItems, setSelectedItems] = useState([]);
  const [showNewTypeModal, setShowNewTypeModal] = useState(false);
  const [editingType, setEditingType] = useState(null);

  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const selectAllCheckboxRef = useRef(null);
  const actionMenuRefs = useRef({});

  const loadTypes = useCallback(() => {
    if (!show) {
      setTypesLoading(false);
      return;
    }
    setTypesLoading(true);
    setTypesError('');
    window.setTimeout(() => {
      try {
        const active = typeCatalog.filter((t) => (t.status ?? 'active') !== 'disabled');
        const q = debouncedSearch.trim().toLowerCase();
        const filtered = !q
          ? active
          : active.filter((t) => String(t.label ?? '').toLowerCase().includes(q));
        const lastPage = Math.max(1, Math.ceil(filtered.length / perPage) || 1);
        let page = Math.min(Math.max(1, currentPage), lastPage);
        const start = (page - 1) * perPage;
        const slice = filtered.slice(start, start + perPage);
        setTypes(slice.map(normalizeKanbanTypeRowFromApi));
        setTypesPagination({
          current_page: page,
          last_page: lastPage,
          total: filtered.length,
          per_page: perPage,
        });
        if (page !== currentPage) {
          setCurrentPage(page);
        }
      } catch {
        setTypesError('Unable to load types. Please try again.');
        setTypes([]);
      } finally {
        setTypesLoading(false);
      }
    }, 0);
  }, [show, typeCatalog, debouncedSearch, currentPage, perPage]);

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
    loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    setSelectedItems((prev) => prev.filter((id) => types.some((row) => String(row.id) === id)));
  }, [types]);

  const handleCheckboxChange = (typeId) => {
    const id = String(typeId);
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === types.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(types.map((b) => String(b.id)));
    }
  };

  const isAllSelected =
    selectedItems.length === types.length && types.length > 0;
  const isIndeterminate =
    selectedItems.length > 0 && selectedItems.length < types.length;

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

  const handleActionMenuToggle = (typeId, event) => {
    event.stopPropagation();
    const id = String(typeId);
    setOpenActionMenuId(openActionMenuId === id ? null : id);
  };

  const handleEdit = (row) => {
    setEditingType({
      type_id: row.type_id,
      label: row.label,
      availability_level: normalizeTagAvailabilityLevel(row.availabilityLevel),
      color_code: row.color_code,
      icon: row.icon,
      boards: row.boardsRaw,
    });
    setShowNewTypeModal(true);
    setOpenActionMenuId(null);
  };

  const handleDisable = (typeId) => {
    const id = String(typeId);
    setOpenActionMenuId(null);
    setTypeCatalog((prev) =>
      prev.map((t) =>
        String(t.type_id) === id ? { ...t, status: 'disabled' } : t
      )
    );
  };

  const handleDelete = (typeId) => {
    const id = String(typeId);
    setOpenActionMenuId(null);
    if (!window.confirm('Delete this type? This cannot be undone.')) {
      return;
    }
    setTypeCatalog((prev) => prev.filter((t) => String(t.type_id) !== id));
  };

  const handleAddType = () => {
    setEditingType(null);
    setShowNewTypeModal(true);
  };

  const closeTypeFormModal = () => {
    setShowNewTypeModal(false);
    setEditingType(null);
  };

  const handleTypeFormSave = async (payload) => {
    const board_ids = payload.board_ids;
    const boardsFromIds = () => {
      const flat = workspaceBoardOptions.flatMap((ws) => ws.boards);
      return board_ids.map((bid) => {
        const found = flat.find((b) => String(b.board_id) === String(bid));
        return {
          board_id: bid,
          board_name: found ? String(found.board_name ?? '') : String(bid),
        };
      });
    };

    if (payload.mode === 'create') {
      const newId = globalThis.crypto?.randomUUID?.() ?? `t-${Date.now()}`;
      setTypeCatalog((prev) => [
        ...prev,
        {
          type_id: newId,
          label: payload.label,
          color_code: payload.color_code,
          icon: payload.icon,
          availability_level: payload.availability_level,
          status: 'active',
          boards: boardsFromIds(),
        },
      ]);
    } else {
      setTypeCatalog((prev) =>
        prev.map((t) =>
          String(t.type_id) === String(payload.type_id)
            ? {
                ...t,
                label: payload.label,
                color_code: payload.color_code,
                icon: payload.icon,
                availability_level: payload.availability_level,
                boards: boardsFromIds(),
              }
            : t
        )
      );
    }
  };

  const hasMetaLastPage = Number(typesPagination?.last_page || 0) > 0;
  const hasNextByMeta = hasMetaLastPage ? currentPage < Number(typesPagination.last_page) : true;
  const hasNextPage = hasNextByMeta && types.length === perPage;

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
        <Modal.Title className="blockers-modal-title">Types</Modal.Title>
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
              aria-label="Add type"
              onClick={handleAddType}
            >
              <FiPlus size={20} />
            </button>
          </div>
        </div>

        {typesError && (
          <div className="tags-modal-error-banner" role="alert">
            <FiAlertCircle size={18} aria-hidden />
            <span className="tags-modal-error-text">{typesError}</span>
            <button type="button" className="tags-modal-error-retry" onClick={() => loadTypes()}>
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
              {typesLoading ? (
                <tr>
                  <td colSpan="6" className="tags-modal-loading-cell">
                    Loading types…
                  </td>
                </tr>
              ) : types.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '40px', color: '#999' }}
                  >
                    No types found
                  </td>
                </tr>
              ) : (
                types.map((row) => (
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
                      <TypeIconSwatch color_code={row.color_code} iconKey={row.icon} />
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
                              onClick={() => handleDisable(row.id)}
                            >
                              Disable
                            </button>
                            <button
                              type="button"
                              className="blockers-action-menu-item blockers-action-menu-item-danger"
                              onClick={() => handleDelete(row.id)}
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
            disabled={currentPage <= 1 || typesLoading}
          >
            Previous
          </button>
          <span className="tags-modal-pagination-page">Page {currentPage}</span>
          <button
            type="button"
            className="tags-modal-pagination-btn"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNextPage || typesLoading}
          >
            Next
          </button>
        </div>
      </Modal.Body>
      <NewTypeModal
        show={showNewTypeModal}
        onClose={closeTypeFormModal}
        editingType={editingType}
        workspaceBoardOptions={workspaceBoardOptions}
        workspaceBoardsLoading={workspaceBoardsLoading}
        onSave={handleTypeFormSave}
      />
    </Modal>
  );
};

export default TypesModal;
