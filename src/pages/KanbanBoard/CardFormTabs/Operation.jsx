import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../assets/images/cv.png";
import CircleTickIcon from "../../../assets/images/CircleTick.svg";

// Constants
const OPERATION_TABS = {
  PRE_ARRIVAL: "preArrival",
  ARRIVAL: "arrival",
  DEPARTURE: "departure",
};

// Sub-components
const OperationTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: OPERATION_TABS.PRE_ARRIVAL, label: "Pre Arrival" },
    { id: OPERATION_TABS.ARRIVAL, label: "Arrival" },
    { id: OPERATION_TABS.DEPARTURE, label: "Departure" },
  ];

  return (
    <div className="operation-left">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`op-tab ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

OperationTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

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

const FormField = ({ label, children, className = "" }) => {
  return (
    <div className={`cf-field ${className}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

const FormInput = ({ type = "text", value, onChange, placeholder, className = "" }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

const OwnerField = ({ value, onChange, ownerInitial, cardUser }) => {
  return (
    <FormField label="Owner">
      <div className="cf-owner-row">
        <div className="cf-owner-avatar">{ownerInitial}</div>
        <select
          value={value}
          onChange={onChange}
          className="cf-owner-select"
        >
          <option value="None">None</option>
          {cardUser && <option value={cardUser}>{cardUser}</option>}
        </select>
      </div>
    </FormField>
  );
};

OwnerField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  ownerInitial: PropTypes.string.isRequired,
  cardUser: PropTypes.string,
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

const PreArrivalContent = ({ formValues, handleChange, ownerInitial, cardUser }) => {
  return (
    <div className="cardform-left-full">
      <FormSection icon={GroupSettingsIcon} title="Card Information">
        <div className="pre-arrival-form">
          <OwnerField
            value={formValues.owner}
            onChange={handleChange("owner")}
            ownerInitial={ownerInitial}
            cardUser={cardUser}
          />

          <div className="form-group">
            <h3 className="form-group-title">Appointment Details</h3>
            <div className="cf-grid two">
              <FormField label="Appointment Received Date">
                <FormInput
                  type="date"
                  value={formValues.appointmentReceivedDate}
                  onChange={handleChange("appointmentReceivedDate")}
                />
              </FormField>

              <FormField label="Appointment Acceptance Date">
                <FormInput
                  type="date"
                  value={formValues.appointmentAcceptanceDate}
                  onChange={handleChange("appointmentAcceptanceDate")}
                />
              </FormField>
            </div>
          </div>

          <div className="form-group">
            <h3 className="form-group-title">Vessel Information</h3>
            <div className="cf-grid two">
              <FormField label="Last Port">
                <FormInput
                  type="text"
                  placeholder="Enter last port..."
                  value={formValues.lastPort}
                  onChange={handleChange("lastPort")}
                />
              </FormField>

              <FormField label="Estimated Time of Arrival (ETA)">
                <div className="cf-input eta-row">
                  <input
                    type="date"
                    value={formValues.etaDate}
                    onChange={handleChange("etaDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.etaTime}
                    onChange={handleChange("etaTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>
            </div>
          </div>

          <div className="form-group">
            <h3 className="form-group-title">Customs & Clearance</h3>
            <FormField label="Expected commencement of customs inspection">
              <FormInput
                type="text"
                placeholder="Enter expected customs inspection time..."
                value={formValues.customsStart}
                onChange={handleChange("customsStart")}
              />
            </FormField>

            <FormField label="Expected completion of inward clearance">
              <FormInput
                type="text"
                placeholder="Enter expected clearance completion time..."
                value={formValues.clearanceCompletion}
                onChange={handleChange("clearanceCompletion")}
              />
            </FormField>
          </div>
        </div>
      </FormSection>

      <FormSection icon={CircleTickIcon} title="Attachments">
        <EmptySection
          message="No attachments added."
          buttonText="+ Add attachment"
        />
      </FormSection>

      <FormSection icon={CircleTickIcon} title="Links">
        <EmptySection
          message="No links added."
          buttonText="+ Add Link"
        />
      </FormSection>
    </div>
  );
};

PreArrivalContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  ownerInitial: PropTypes.string.isRequired,
  cardUser: PropTypes.string,
};

const OperationContent = ({ activeTab }) => {
  const contentMap = {
    [OPERATION_TABS.ARRIVAL]: {
      title: "Arrival Details",
      message: "Show arrival details here…",
    },
    [OPERATION_TABS.DEPARTURE]: {
      title: "Departure Details",
      message: "Show departure details here…",
    },
  };

  const content = contentMap[activeTab];

  if (!content) return null;

  return (
    <div className="operation-content-box">
      <h2>{content.title}</h2>
      <p>{content.message}</p>
    </div>
  );
};

OperationContent.propTypes = {
  activeTab: PropTypes.string.isRequired,
};

// Main Operation Component
function Operation({ card, formValues, handleChange, ownerInitial }) {
  const [activeOperationTab, setActiveOperationTab] = useState(OPERATION_TABS.PRE_ARRIVAL);

  const handleTabChange = useCallback((tab) => {
    setActiveOperationTab(tab);
  }, []);

  return (
    <div className="operation-wrapper">
      <OperationTabs
        activeTab={activeOperationTab}
        onTabChange={handleTabChange}
      />
      <div className="operation-right">
        {activeOperationTab === OPERATION_TABS.PRE_ARRIVAL && (
          <PreArrivalContent
            formValues={formValues}
            handleChange={handleChange}
            ownerInitial={ownerInitial}
            cardUser={card?.user}
          />
        )}
        {(activeOperationTab === OPERATION_TABS.ARRIVAL ||
          activeOperationTab === OPERATION_TABS.DEPARTURE) && (
          <OperationContent activeTab={activeOperationTab} />
        )}
      </div>
    </div>
  );
}

Operation.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  ownerInitial: PropTypes.string.isRequired,
};

export default Operation;

