import PropTypes from 'prop-types';

function BusinessRuleIcon({ iconType, className = '' }) {
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

  return <div className={`business-rules-card-icon ${className}`.trim()}>{renderIcon()}</div>;
}

BusinessRuleIcon.propTypes = {
  iconType: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default BusinessRuleIcon;
