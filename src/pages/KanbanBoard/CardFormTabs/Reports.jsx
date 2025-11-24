import PropTypes from "prop-types";

function Reports({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <div className="operation-content-box">
            <h2>Reports</h2>
            <p>Reports and analytics will be displayed here.</p>
            {/* Add your reports form fields here */}
          </div>
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

