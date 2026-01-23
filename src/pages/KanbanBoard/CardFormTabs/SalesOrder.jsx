import PropTypes from "prop-types";
import SalesOrderList from "./SalesOrder/SalesOrderList";

function SalesOrder({ card, formValues, handleChange, isSimplifiedMode = false, isDAModule = false }) {
  const cardColor = "#e2e6ff";

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <div className="operation-right">
          <SalesOrderList
            formValues={formValues}
            handleChange={handleChange}
            cardColor={cardColor}
            readOnly={isSimplifiedMode}
            showPOStatus={isDAModule}
            isDAModule={isDAModule}
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
  isSimplifiedMode: PropTypes.bool,
  isDAModule: PropTypes.bool,
};

export default SalesOrder;

