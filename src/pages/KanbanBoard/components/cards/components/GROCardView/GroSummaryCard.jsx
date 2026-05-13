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

export default GroSummaryCard;
