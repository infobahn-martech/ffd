import { useState, useRef, useEffect } from 'react';
import { FiX, FiFilter, FiPlus, FiMoreVertical, FiInfo } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import NewTagModal from './NewTagModal';
import '../../../design/scss/blockers-modal.scss';

// Tags data
const tagsData = [
  {
    id: 1,
    label: 'HAHA',
    icon: { color: '#FCD34D', symbol: 'usb' }, // Yellow
    availabilityLevel: 'On-demand',
    boards: ['Team B', 'Team A', 'Strategic Objectives'],
  },
  {
    id: 2,
    label: 'Waiting on others',
    icon: { color: '#A78BFA', symbol: 'hourglass' }, // Purple
    availabilityLevel: 'Auto',
    boards: ['Team B', 'Team A', 'Strategic Objectives'],
  },
  {
    id: 3,
    label: 'Waiting on us',
    icon: { color: '#EF4444', symbol: 'hourglass' }, // Red
    availabilityLevel: 'Auto',
    boards: ['Team B', 'Team A', 'Strategic Objectives'],
  },
];

// Icon component for tags
const TagIcon = ({ icon }) => {
  const { color, symbol } = icon;

  const renderSymbol = () => {
    switch (symbol) {
      case 'usb':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="4" y="2" width="8" height="12" rx="1" fill="currentColor" />
            <rect x="6" y="4" width="4" height="2" fill="white" />
            <rect x="6" y="10" width="4" height="2" fill="white" />
          </svg>
        );
      case 'hourglass':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 2h8M4 14h8M4 2l2 4 2-4M4 14l2-4 2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        flexShrink: 0,
      }}
    >
      {renderSymbol()}
    </div>
  );
};

const TagsModal = ({ show, onClose }) => {
  const [filterValue, setFilterValue] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLabelFilter, setShowLabelFilter] = useState(false);
  const [showAvailabilityFilter, setShowAvailabilityFilter] = useState(false);
  const [showBoardsFilter, setShowBoardsFilter] = useState(false);
  const [showNewTagModal, setShowNewTagModal] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const selectAllCheckboxRef = useRef(null);
  const actionMenuRefs = useRef({});

  const filteredTags = tagsData.filter(tag =>
    tag.label.toLowerCase().includes(filterValue.toLowerCase())
  );

  const handleCheckboxChange = (tagId) => {
    setSelectedItems(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredTags.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredTags.map(b => b.id));
    }
  };

  const isAllSelected = selectedItems.length === filteredTags.length && filteredTags.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < filteredTags.length;

  // Set indeterminate state for select all checkbox
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Close action menu when clicking outside
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

  const handleActionMenuToggle = (tagId, event) => {
    event.stopPropagation();
    setOpenActionMenuId(openActionMenuId === tagId ? null : tagId);
  };

  const handleEdit = (tagId) => {
    console.log('Edit tag:', tagId);
    setOpenActionMenuId(null);
  };

  const handleDelete = (tagId) => {
    console.log('Delete tag:', tagId);
    setOpenActionMenuId(null);
  };

  const handleAddTag = () => {
    setShowNewTagModal(true);
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
        <Modal.Title className="blockers-modal-title">Tags</Modal.Title>
        <button
          type="button"
          className="blockers-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="blockers-modal-body">
        {/* Filter Bar */}
        <div className="blockers-filter-bar">
          <div className="blockers-filter-left">
            <button
              type="button"
              className="blockers-filter-icon-btn"
              onClick={() => setShowLabelFilter(!showLabelFilter)}
            >
              <FiFilter size={18} />
            </button>
            <input
              type="text"
              className="blockers-filter-input"
              placeholder="Filter"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </div>
          <div className="blockers-filter-right">
            {/* <div className="blockers-selected-dropdown">
              <span className="blockers-selected-text">
                {selectedItems.length === 0
                  ? 'No items selected'
                  : `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} selected`}
              </span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div> */}
            <button
              type="button"
              className="blockers-add-btn"
              aria-label="Add tag"
              onClick={handleAddTag}
            >
              <FiPlus size={20} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="blockers-table-wrapper">
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
                    <path d="M2 4h12M2 8h12M2 12h12" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="4" cy="4" r="1" fill="#666" />
                    <circle cx="4" cy="8" r="1" fill="#666" />
                    <circle cx="4" cy="12" r="1" fill="#666" />
                  </svg>
                </th>
                <th>
                  <div className="blockers-th-content">
                    <span>Label</span>
                    <button
                      type="button"
                      className="blockers-th-filter-btn"
                      onClick={() => setShowLabelFilter(!showLabelFilter)}
                    >
                      <FiFilter size={14} />
                    </button>
                  </div>
                </th>
                <th>
                  <div className="blockers-th-content">
                    <span>Availability level</span>
                    <button
                      type="button"
                      className="blockers-th-info-btn"
                      onClick={() => setShowAvailabilityFilter(!showAvailabilityFilter)}
                    >
                      <FiInfo size={14} />
                    </button>
                    <button
                      type="button"
                      className="blockers-th-filter-btn"
                      onClick={() => setShowAvailabilityFilter(!showAvailabilityFilter)}
                    >
                      <FiFilter size={14} />
                    </button>
                  </div>
                </th>
                <th>
                  <div className="blockers-th-content">
                    <span>Boards</span>
                    <button
                      type="button"
                      className="blockers-th-filter-btn"
                      onClick={() => setShowBoardsFilter(!showBoardsFilter)}
                    >
                      <FiFilter size={14} />
                    </button>
                  </div>
                </th>
                <th style={{ width: '40px' }}>
                  <span>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No tags found
                  </td>
                </tr>
              ) : (
                filteredTags.map(tag => (
                  <tr key={tag.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(tag.id)}
                        onChange={() => handleCheckboxChange(tag.id)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                        }}
                      />
                    </td>
                    <td>
                      <TagIcon icon={tag.icon} />
                    </td>
                    <td>
                      <span className="blockers-label-text">{tag.label}</span>
                    </td>
                    <td>
                      <span className="blockers-availability-text">{tag.availabilityLevel}</span>
                    </td>
                    <td>
                      <span className="blockers-boards-text">
                        {tag.boards.join(', ')}
                      </span>
                    </td>
                    <td>
                      <div
                        ref={(el) => (actionMenuRefs.current[tag.id] = el)}
                        style={{ position: 'relative' }}
                      >
                        <button
                          type="button"
                          className="blockers-kebab-btn"
                          aria-label="Action"
                          onClick={(e) => handleActionMenuToggle(tag.id, e)}
                        >
                          <FiMoreVertical size={18} />
                        </button>
                        {openActionMenuId === tag.id && (
                          <div className="blockers-action-menu">
                            <button
                              type="button"
                              className="blockers-action-menu-item"
                              onClick={() => handleEdit(tag.id)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="blockers-action-menu-item blockers-action-menu-item-danger"
                              onClick={() => handleDelete(tag.id)}
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
      </Modal.Body>
      <NewTagModal
        show={showNewTagModal}
        onClose={() => setShowNewTagModal(false)}
        onSave={(tagData) => {
          // Handle saving the new tag
          console.log('New tag data:', tagData);
          // You can add logic here to update the tags list
          setShowNewTagModal(false);
        }}
      />
    </Modal>
  );
};

export default TagsModal;

