import PropTypes from "prop-types";

function Checklist({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <div className="operation-content-box">
            <h2>Checklist</h2>
            <p>Checklist items and tasks will be displayed here.</p>
            {/* Add your checklist form fields here */}
          </div>
        </div>
      </div>
    </div>
  );
}

Checklist.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Checklist;

