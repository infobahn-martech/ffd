import PropTypes from "prop-types";

const ClIcon = () => (
  <div className="cl-empty-ico" aria-hidden>
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="48" height="40" rx="6" fill="#F4F5FB" stroke="#C7CDEA" />
      <path d="M20 24H44" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 32H40" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 40H36" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const ChecklistEmptyState = ({ title, message, variant = "default" }) => (
  <div className={`cl-empty cl-empty--${variant}`}>
    <ClIcon />
    <h5 className="cl-empty__title">{title}</h5>
    <p className="cl-empty__msg">{message}</p>
  </div>
);

ChecklistEmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.string,
};

export default ChecklistEmptyState;
