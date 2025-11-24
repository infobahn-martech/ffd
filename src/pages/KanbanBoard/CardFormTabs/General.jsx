import PropTypes from "prop-types";

function General({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <div className="operation-content-box">
            <h2>General Information</h2>
            <p>General card information and details will be displayed here.</p>
            {/* Add your general form fields here */}
          </div>
        </div>
      </div>
    </div>
  );
}

General.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default General;

