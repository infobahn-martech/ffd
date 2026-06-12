import PropTypes from "prop-types";
import "../../../../../../design/scss/general.scss";

function Approval({ card, formValues }) {
  const callId = formValues?.call_id || formValues?.callId || card?.call_id || card?.callId || "";

  return (
    <div className="general-tab-content approval-tab-content">
      <div className="general-form-section">
        <h3 className="general-section-title">Approval</h3>
        <p className="text-muted mb-0">
          Export call approval{callId ? ` (Call ID: ${callId})` : ""}.
        </p>
      </div>
    </div>
  );
}

Approval.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
};

export default Approval;
