import PropTypes from "prop-types";

function SalesOrder({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <div className="operation-content-box">
            <h2>Sales Order</h2>
            <p>Sales order information and details will be displayed here.</p>
            {/* Add your sales order form fields here */}
          </div>
        </div>
      </div>
    </div>
  );
}

SalesOrder.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default SalesOrder;

