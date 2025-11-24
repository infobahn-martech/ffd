import PropTypes from "prop-types";

function Tasks({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <div className="operation-content-box">
            <h2>Tasks</h2>
            <p>Tasks and assignments will be displayed here.</p>
            {/* Add your tasks form fields here */}
          </div>
        </div>
      </div>
    </div>
  );
}

Tasks.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Tasks;

