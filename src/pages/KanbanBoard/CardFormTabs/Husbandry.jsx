import PropTypes from "prop-types";

function Husbandry({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <div className="operation-content-box">
            <h2>Husbandry</h2>
            <p>Husbandry information and details will be displayed here.</p>
            {/* Add your husbandry form fields here */}
          </div>
        </div>
      </div>
    </div>
  );
}

Husbandry.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Husbandry;

