import PropTypes from "prop-types";
import CircleTickIcon from "../../../assets/images/CircleTick.svg";

const FormSection = ({ icon, title, children }) => {
  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <span className="cf-section-icon">
          <img src={icon} alt={title} />
        </span>
        <span className="cf-section-title">{title}</span>
      </div>
      <div className="cf-section-body">{children}</div>
    </div>
  );
};

FormSection.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const EmptySection = ({ message, buttonText, onButtonClick }) => {
  return (
    <div className="cf-empty-row">
      <p>{message}</p>
      <button className="cf-link-btn" onClick={onButtonClick} type="button">
        {buttonText}
      </button>
    </div>
  );
};

EmptySection.propTypes = {
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func,
};

function Attachments({ card, formValues, handleChange }) {
  return (
    <div className="operation-wrapper">
      <div className="operation-right" style={{ width: "100%" }}>
        <div className="cardform-left-full">
          <FormSection icon={CircleTickIcon} title="Attachments">
            <EmptySection
              message="No attachments added."
              buttonText="+ Add attachment"
            />
          </FormSection>
        </div>
      </div>
    </div>
  );
}

Attachments.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Attachments;

