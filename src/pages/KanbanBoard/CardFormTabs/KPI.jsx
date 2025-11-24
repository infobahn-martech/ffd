import PropTypes from "prop-types";

function KPI({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <div className="operation-content-box">
            <h2>KPI</h2>
            <p>Key Performance Indicators will be displayed here.</p>
            {/* Add your KPI form fields here */}
          </div>
        </div>
      </div>
    </div>
  );
}

KPI.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default KPI;

