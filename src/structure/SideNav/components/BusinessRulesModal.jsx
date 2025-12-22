import { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import '../../../design/scss/business-rules-modal.scss';

// Business rules data based on the image description
const businessRules = [
  { id: 1, name: 'Card is created', icon: 'create' },
  { id: 2, name: 'Recurring create cards', icon: 'recurring-create' },
  { id: 3, name: 'Card is updated', icon: 'update' },
  { id: 4, name: 'Recurring update cards', icon: 'recurring-update' },
  { id: 5, name: 'Card updated by email', icon: 'email-update' },
  { id: 6, name: 'Child card is blocked', icon: 'child-blocked' },
  { id: 7, name: 'All children are unblocked', icon: 'children-unblocked' },
  { id: 8, name: 'Card is moved', icon: 'moved' },
  { id: 9, name: 'Child card is moved', icon: 'child-moved' },
  { id: 10, name: 'Child card is updated', icon: 'child-updated' },
  { id: 11, name: 'All children are moved', icon: 'all-children-moved' },
  { id: 12, name: 'Relative card is moved', icon: 'relative-moved' },
  { id: 13, name: 'Relative card is updated', icon: 'relative-updated' },
  { id: 14, name: 'Time-based rule', icon: 'time-based' },
  { id: 15, name: 'WIP limit is reached', icon: 'wip-reached' },
  { id: 16, name: 'WIP limit is exceeded', icon: 'wip-exceeded' },
];

// Icon component for business rules
const BusinessRuleIcon = ({ iconType }) => {
  const iconStyle = {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    marginBottom: '12px',
  };

  // Simple icon representations based on the descriptions
  const renderIcon = () => {
    switch (iconType) {
      case 'create':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#10B981" />
            <path d="M16 10v12M10 16h12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'recurring-create':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" fill="#10B981" />
            <path d="M16 8v8M12 12h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 20c0 2.5 2 4.5 4.5 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'update':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#F59E0B" />
            <path d="M12 16l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'recurring-update':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" fill="#F59E0B" />
            <path d="M12 16l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'email-update':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="8" width="24" height="16" rx="2" fill="#F59E0B" />
            <path d="M4 10l12 8 12-8" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'child-blocked':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" fill="#EF4444" />
            <path d="M10 10l12 12M22 10l-12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'children-unblocked':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#10B981" />
            <path d="M10 16l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'moved':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#3B82F6" />
            <path d="M12 16h8M16 12l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'child-moved':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#3B82F6" />
            <rect x="8" y="8" width="8" height="8" rx="2" fill="white" opacity="0.3" />
            <path d="M16 16h4M18 14l2 2-2 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'child-updated':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#F59E0B" />
            <rect x="8" y="8" width="8" height="8" rx="2" fill="white" opacity="0.3" />
            <path d="M16 16l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'all-children-moved':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#3B82F6" />
            <rect x="8" y="6" width="6" height="6" rx="1" fill="white" opacity="0.3" />
            <rect x="8" y="14" width="6" height="6" rx="1" fill="white" opacity="0.3" />
            <rect x="8" y="22" width="6" height="6" rx="1" fill="white" opacity="0.3" />
            <path d="M18 16h4M20 14l2 2-2 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'relative-moved':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#3B82F6" />
            <rect x="8" y="10" width="16" height="3" rx="1.5" fill="white" opacity="0.3" />
            <rect x="8" y="19" width="16" height="3" rx="1.5" fill="white" opacity="0.3" />
            <path d="M20 16h4M22 14l2 2-2 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'relative-updated':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#F59E0B" />
            <rect x="8" y="10" width="16" height="3" rx="1.5" fill="white" opacity="0.3" />
            <rect x="8" y="19" width="16" height="3" rx="1.5" fill="white" opacity="0.3" />
            <path d="M20 16l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'time-based':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" fill="#F59E0B" />
            <circle cx="16" cy="16" r="1.5" fill="white" />
            <path d="M16 10v6l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'wip-reached':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L4 12v8c0 6.627 5.373 12 12 12s12-5.373 12-12v-8L16 4z" fill="#F59E0B" />
            <circle cx="16" cy="16" r="8" fill="white" opacity="0.2" />
            <path d="M16 8v8l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'wip-exceeded':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L4 12v8c0 6.627 5.373 12 12 12s12-5.373 12-12v-8L16 4z" fill="#EF4444" />
            <circle cx="16" cy="16" r="8" fill="white" opacity="0.2" />
            <path d="M16 8v8l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 8l16 16M24 8L8 24" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#6B7280" />
          </svg>
        );
    }
  };

  return <div style={iconStyle}>{renderIcon()}</div>;
};

const BusinessRulesModal = ({ show, onClose }) => {
  const [searchValue, setSearchValue] = useState('');

  const filteredRules = businessRules.filter(rule =>
    rule.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      className="business-rules-modal"
      centered
      size="xl"
    >
      <Modal.Header className="business-rules-modal-header">
        <Modal.Title className="business-rules-modal-title">Business Rules</Modal.Title>
        <button
          type="button"
          className="business-rules-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="business-rules-modal-body">
        {/* Search Section */}
        <div className="business-rules-search-section">
          <div className="business-rules-search-wrapper">
            <FiSearch className="business-rules-search-icon" />
            <input
              type="text"
              className="business-rules-search-input"
              placeholder="Filter by business rule name"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        {/* Cards Grid Section */}
        <div className="business-rules-grid-wrapper">
          {filteredRules.length > 0 ? (
            <div className="business-rules-grid">
              {filteredRules.map(rule => (
                <div key={rule.id} className="business-rules-card">
                  <BusinessRuleIcon iconType={rule.icon} />
                  <h3 className="business-rules-card-title">{rule.name}</h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="business-rules-empty-state">
              No business rules found
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BusinessRulesModal;

