import PropTypes from "prop-types";
import SalesOrderList from "./SalesOrder/SalesOrderList";

function SalesOrder({ card, formValues, handleChange }) {
  const cardColor = card?.color || "#2A00FF";

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <div className="operation-right">
          <SalesOrderList
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
          />
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

