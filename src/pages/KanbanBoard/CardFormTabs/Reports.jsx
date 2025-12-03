import PropTypes from "prop-types";
import ReportsList from "./Reports/ReportsList";

function Reports({ card, formValues, handleChange }) {
  const cardColor = card?.color || "#2A00FF";

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <div className="operation-right">
          <ReportsList
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
        </div>
      </div>
    </div>
  );
}

Reports.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Reports;

