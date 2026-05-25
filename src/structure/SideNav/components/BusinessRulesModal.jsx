import { useState } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { Modal } from 'react-bootstrap';
import '../../../design/scss/business-rules-modal.scss';

const businessRules = [
  {
    id: 1,
    name: 'Card is created',
    icon: 'create',
    description:
      'Triggers when a new card is created. Use this to send notifications, assign defaults, or start workflows automatically.',
  },
  {
    id: 2,
    name: 'Card is updated',
    icon: 'update',
    description:
      'Triggers when any field on a card changes. Use this to track changes, update related cards, or send change notifications.',
  },
  {
    id: 3,
    name: 'Card is moved',
    icon: 'moved',
    description:
      'Triggers when a card moves between columns or lanes. Use this to update status, notify stakeholders, or run location-based workflows.',
  },
  {
    id: 4,
    name: 'Child card is blocked',
    icon: 'child-blocked',
    description:
      'Triggers when a child card is marked blocked. Use this to notify stakeholders, pause parent progress, or escalate blocked work.',
  },
  {
    id: 5,
    name: 'Child card is moved',
    icon: 'child-moved',
    description:
      'Triggers when a child card moves. Use this to sync parent status, align child movement with parent workflows, or send updates.',
  },
  {
    id: 6,
    name: 'All children are moved',
    icon: 'all-children-moved',
    description:
      'Triggers when every child card has moved to the target location or status. Use this to complete parents or start the next phase.',
  },
];

const BusinessRuleIcon = ({ iconType }) => {
  const renderIcon = () => {
    switch (iconType) {
      case 'create':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <rect x="4" y="4" width="32" height="32" rx="6" fill="#10B981" />
            <path
              d="M20 13v14M13 20h14"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'update':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <rect x="4" y="4" width="32" height="32" rx="6" fill="#F59E0B" />
            <path
              d="M14 20l5 5 11-12"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'moved':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <rect x="4" y="4" width="32" height="32" rx="6" fill="#3B82F6" />
            <path
              d="M15 20h10M22 15l5 5-5 5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'child-blocked':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <circle cx="20" cy="20" r="16" fill="#EF4444" />
            <path
              d="M13 13l14 14M27 13L13 27"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        );
      case 'child-moved':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <rect x="4" y="4" width="32" height="32" rx="6" fill="#3B82F6" />
            <rect x="9" y="9" width="10" height="10" rx="2" fill="white" fillOpacity="0.9" />
            <path
              d="M21 20h8M26 16l4 4-4 4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'all-children-moved':
        return (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <rect x="4" y="4" width="32" height="32" rx="6" fill="#3B82F6" />
            <rect x="9" y="8" width="7" height="5" rx="1" fill="white" fillOpacity="0.9" />
            <rect x="9" y="15" width="7" height="5" rx="1" fill="white" fillOpacity="0.9" />
            <rect x="9" y="22" width="7" height="5" rx="1" fill="white" fillOpacity="0.9" />
            <path
              d="M20 20h9M25 16l4 4-4 4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return <div className="business-rules-card-icon">{renderIcon()}</div>;
};

const BusinessRuleDetailModal = ({ show, onClose, rule }) => {
  if (!rule) return null;

  return (
    <Modal
      show={show}
      onHide={onClose}
      className="business-rule-detail-modal"
      centered
      size="md"
    >
      <Modal.Header className="business-rule-detail-modal-header">
        <Modal.Title className="business-rule-detail-modal-title">{rule.name}</Modal.Title>
        <button
          type="button"
          className="business-rule-detail-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </Modal.Header>
      <Modal.Body className="business-rule-detail-modal-body">
        <div className="business-rule-detail-icon">
          <BusinessRuleIcon iconType={rule.icon} />
        </div>
        <p className="business-rule-detail-description">{rule.description}</p>
      </Modal.Body>
    </Modal>
  );
};

const BusinessRulesModal = ({ show, onClose }) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedRule, setSelectedRule] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredRules = businessRules.filter((rule) =>
    rule.name.toLowerCase().includes(searchValue.toLowerCase().trim())
  );

  const handleCardClick = (rule) => {
    setSelectedRule(rule);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRule(null);
  };

  return (
    <>
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

          <div className="business-rules-grid-wrapper">
            {filteredRules.length > 0 ? (
              <div className="business-rules-grid">
                {filteredRules.map((rule) => (
                  <button
                    key={rule.id}
                    type="button"
                    className="business-rules-card"
                    onClick={() => handleCardClick(rule)}
                  >
                    <BusinessRuleIcon iconType={rule.icon} />
                    <span className="business-rules-card-title">{rule.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="business-rules-empty-state">No business rules found</div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <BusinessRuleDetailModal
        show={showDetailModal}
        onClose={handleCloseDetailModal}
        rule={selectedRule}
      />
    </>
  );
};

export default BusinessRulesModal;
