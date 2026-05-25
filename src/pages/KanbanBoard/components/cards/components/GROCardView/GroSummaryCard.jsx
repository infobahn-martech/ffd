import PropTypes from "prop-types";

const GroSummaryCard = ({ label, value }) => (
  <div className="gro-summary-card">
    <div className="gro-summary-label">{label}</div>
    <div className="gro-summary-value">{value}</div>
  </div>
);

GroSummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export const GroSummaryFieldCard = ({ label, children, error }) => (
  <div className={`gro-summary-card gro-summary-card--field${error ? " gro-summary-card--error" : ""}`}>
    <div className="gro-summary-label">{label}</div>
    <div className="gro-summary-value gro-summary-value--select">{children}</div>
    {error ? <div className="gro-summary-field-error">{error}</div> : null}
  </div>
);

GroSummaryFieldCard.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  error: PropTypes.string,
};

export default GroSummaryCard;
