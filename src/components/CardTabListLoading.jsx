import PropTypes from "prop-types";
import { Spinner } from "react-bootstrap";
import "../design/scss/card-tab-list-loading.scss";

function CardTabListLoading({ message, cardColor }) {
  const color = cardColor || "#2a00ff";

  return (
    <div className="card-tab-list-loading" role="status" aria-live="polite" aria-busy="true">
      <Spinner
        animation="border"
        className="card-tab-list-loading__spinner"
        style={{ color }}
        aria-hidden
      />
      <p className="card-tab-list-loading__label">{message}</p>
    </div>
  );
}

CardTabListLoading.propTypes = {
  message: PropTypes.string.isRequired,
  cardColor: PropTypes.string,
};

export default CardTabListLoading;
