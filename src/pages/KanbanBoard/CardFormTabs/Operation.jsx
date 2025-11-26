import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../assets/images/cv.png";
import CircleTickIcon from "../../../assets/images/CircleTick.svg";
import "../../../design/scss/operations.scss";

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
      {title && (
        <div className="cf-section-header">
          <span className="cf-section-icon">
            <img src={icon} alt={title} />
          </span>
          <span className="cf-section-title">{title}</span>
        </div>
      )}
      <div className="cf-section-body">{children}</div>
    </div>
  );
};

FormSection.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
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

const FormSelect = ({ value, onChange, options = [], placeholder, className = "" }) => {
  return (
    <div className={`cf-select ${className}`}>
      <select value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

FormSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

const FormTextarea = ({ value, onChange, placeholder, className = "", rows = 3 }) => {
  return (
    <div className={`cf-textarea ${className}`}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
};

FormTextarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
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

const AttachmentsList = ({ attachments = [], onAdd, onRemove }) => {
  if (attachments.length === 0) {
    return (
      <EmptySection
        message="No attachments added."
        buttonText="+ Add attachment"
        onButtonClick={onAdd}
      />
    );
  }

  return (
    <div className="cf-list-container">
      <button className="cf-add-btn" onClick={onAdd} type="button">
        + Add attachment
      </button>
      <div className="cf-list-items">
        {attachments.map((item, index) => (
          <div key={index} className="cf-list-item">
            <span>{item.name || item}</span>
            <button
              className="cf-remove-btn"
              onClick={() => onRemove(index)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

AttachmentsList.propTypes = {
  attachments: PropTypes.array,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
};

const LinksList = ({ links = [], onAdd, onRemove }) => {
  if (links.length === 0) {
    return (
      <EmptySection
        message="No links added."
        buttonText="+ Add Link"
        onButtonClick={onAdd}
      />
    );
  }

  return (
    <div className="cf-list-container">
      <button className="cf-add-btn" onClick={onAdd} type="button">
        + Add Link
      </button>
      <div className="cf-list-items">
        {links.map((item, index) => (
          <div key={index} className="cf-list-item">
            <a href={item.url || item} target="_blank" rel="noopener noreferrer">
              {item.name || item.url || item}
            </a>
            <button
              className="cf-remove-btn"
              onClick={() => onRemove(index)}
              type="button"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

LinksList.propTypes = {
  links: PropTypes.array,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
};

const PreArrivalContent = ({ formValues, handleChange, ownerInitial, cardUser, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink }) => {
  const typeOfCallOptions = [
    { value: "Import", label: "Import" },
    { value: "Export", label: "Export" },
    { value: "Domestic", label: "Domestic" },
  ];

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <OwnerField
            value={formValues.owner}
            onChange={handleChange("owner")}
            ownerInitial={ownerInitial}
            cardUser={cardUser}
          />

          <div className="form-group">
            <h3 className="form-group-title">Service Information</h3>
            <div className="cf-grid two">
              <FormField label="Type of call / Service">
                <FormSelect
                  value={formValues.typeOfCall}
                  onChange={handleChange("typeOfCall")}
                  options={typeOfCallOptions}
                  placeholder="Select type of call..."
                />
              </FormField>

              <FormField label="Main Billing entity">
                <FormSelect
                  value={formValues.mainBillingEntity}
                  onChange={handleChange("mainBillingEntity")}
                  options={[]}
                  placeholder="Select billing entity..."
                />
              </FormField>
            </div>
          </div>

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
              <FormField label="Port">
                <FormSelect
                  value={formValues.port}
                  onChange={handleChange("port")}
                  options={[]}
                  placeholder="Select port..."
                />
              </FormField>

              <FormField label="Vessel type">
                <FormSelect
                  value={formValues.vesselType}
                  onChange={handleChange("vesselType")}
                  options={[]}
                  placeholder="Select vessel type..."
                />
              </FormField>

              <FormField label="Barge type">
                <FormSelect
                  value={formValues.bargeType}
                  onChange={handleChange("bargeType")}
                  options={[]}
                  placeholder="Select barge type..."
                />
              </FormField>

              <FormField label="Vessel Name">
                <FormInput
                  type="text"
                  placeholder="Enter vessel name..."
                  value={formValues.vesselName}
                  onChange={handleChange("vesselName")}
                />
              </FormField>

              <FormField label="Vessel Owner">
                <FormInput
                  type="text"
                  placeholder="Enter vessel owner..."
                  value={formValues.vesselOwner}
                  onChange={handleChange("vesselOwner")}
                />
              </FormField>

              <FormField label="Vessel Principal">
                <FormInput
                  type="text"
                  placeholder="Enter vessel principal..."
                  value={formValues.vesselPrincipal}
                  onChange={handleChange("vesselPrincipal")}
                />
              </FormField>

              <FormField label="Vessel Manager">
                <FormInput
                  type="text"
                  placeholder="Enter vessel manager..."
                  value={formValues.vesselManager}
                  onChange={handleChange("vesselManager")}
                />
              </FormField>

              <FormField label="Other billing entity">
                <FormSelect
                  value={formValues.otherBillingEntity}
                  onChange={handleChange("otherBillingEntity")}
                  options={[]}
                  placeholder="Select billing entity..."
                />
              </FormField>

              <FormField label="Assigned Operator">
                <FormSelect
                  value={formValues.assignedOperator}
                  onChange={handleChange("assignedOperator")}
                  options={[]}
                  placeholder="Select operator..."
                />
              </FormField>

              <FormField label="Service Requestor Name">
                <FormInput
                  type="text"
                  placeholder="Enter service requestor name..."
                  value={formValues.serviceRequestorName}
                  onChange={handleChange("serviceRequestorName")}
                />
              </FormField>

              <FormField label="Service Requestor Email">
                <FormInput
                  type="email"
                  placeholder="Enter service requestor email..."
                  value={formValues.serviceRequestorEmail}
                  onChange={handleChange("serviceRequestorEmail")}
                />
              </FormField>

              <FormField label="Daily Report Email Id">
                <FormInput
                  type="email"
                  placeholder="Enter daily report email..."
                  value={formValues.dailyReportEmail}
                  onChange={handleChange("dailyReportEmail")}
                />
              </FormField>

              <FormField label="Billing instructions">
                <FormInput
                  type="text"
                  placeholder="Auto pop up"
                  value={formValues.billingInstructions}
                  onChange={handleChange("billingInstructions")}
                  readOnly
                />
              </FormField>
            </div>
          </div>

          <div className="form-group">
            <h3 className="form-group-title">Pre-Arrival Information</h3>
            <div className="cf-grid two">
              <FormField label="Expected time of arrival">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.expectedArrivalDate}
                    onChange={handleChange("expectedArrivalDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.expectedArrivalTime}
                    onChange={handleChange("expectedArrivalTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Expected commencement of custom inspection">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.customsInspectionDate}
                    onChange={handleChange("customsInspectionDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.customsInspectionTime}
                    onChange={handleChange("customsInspectionTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Expected commencement of Immigration clearance for crew">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.immigrationClearanceDate}
                    onChange={handleChange("immigrationClearanceDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.immigrationClearanceTime}
                    onChange={handleChange("immigrationClearanceTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Expected completion of inward clearance">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.inwardClearanceDate}
                    onChange={handleChange("inwardClearanceDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.inwardClearanceTime}
                    onChange={handleChange("inwardClearanceTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection icon={CircleTickIcon} title="Attachments">
        <AttachmentsList
          attachments={formValues.attachments || []}
          onAdd={onAddAttachment}
          onRemove={onRemoveAttachment}
        />
      </FormSection>

      <FormSection icon={CircleTickIcon} title="Links">
        <LinksList
          links={formValues.links || []}
          onAdd={onAddLink}
          onRemove={onRemoveLink}
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
  cardColor: PropTypes.string,
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
};

const ArrivalContent = ({ formValues, handleChange, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink }) => {
  const customInspectionStatusOptions = [
    { value: "Passed", label: "Passed" },
    { value: "Failed", label: "Failed" },
  ];

  const crewImmigrationStatusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
  ];

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Arrival Information</h3>
            <div className="cf-grid two">
              <FormField label="Actual time of arrival">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.actualArrivalDate || ""}
                    onChange={handleChange("actualArrivalDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.actualArrivalTime || ""}
                    onChange={handleChange("actualArrivalTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Custom Inspection commenced">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.customInspectionCommencedDate || ""}
                    onChange={handleChange("customInspectionCommencedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.customInspectionCommencedTime || ""}
                    onChange={handleChange("customInspectionCommencedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Custom Inspection completed">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.customInspectionCompletedDate || ""}
                    onChange={handleChange("customInspectionCompletedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.customInspectionCompletedTime || ""}
                    onChange={handleChange("customInspectionCompletedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Custom Inspection passed or Failed">
                <FormSelect
                  value={formValues.customInspectionStatus || ""}
                  onChange={handleChange("customInspectionStatus")}
                  options={customInspectionStatusOptions}
                  placeholder="Select status..."
                />
              </FormField>

              {formValues.customInspectionStatus === "Failed" && (
                <FormField label="Reason for fail" className="cf-field-full">
                  <FormTextarea
                    value={formValues.customInspectionFailReason || ""}
                    onChange={handleChange("customInspectionFailReason")}
                    placeholder="Specify reason for fail..."
                    rows={3}
                  />
                </FormField>
              )}

              <FormField label="Crew immigration commenced">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.crewImmigrationCommencedDate || ""}
                    onChange={handleChange("crewImmigrationCommencedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.crewImmigrationCommencedTime || ""}
                    onChange={handleChange("crewImmigrationCommencedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Crew immigration completed / on hold">
                <FormSelect
                  value={formValues.crewImmigrationStatus || ""}
                  onChange={handleChange("crewImmigrationStatus")}
                  options={crewImmigrationStatusOptions}
                  placeholder="Select status..."
                />
              </FormField>

              {formValues.crewImmigrationStatus === "Completed" && (
                <FormField label="Crew immigration completed">
                  <div className="cf-input date-time-row">
                    <input
                      type="date"
                      value={formValues.crewImmigrationCompletedDate || ""}
                      onChange={handleChange("crewImmigrationCompletedDate")}
                      placeholder="Select date"
                    />
                    <input
                      type="time"
                      value={formValues.crewImmigrationCompletedTime || ""}
                      onChange={handleChange("crewImmigrationCompletedTime")}
                      placeholder="Select time"
                    />
                  </div>
                </FormField>
              )}

              {formValues.crewImmigrationStatus === "On Hold" && (
                <FormField label="Reason for hold (Remarks)" className="cf-field-full">
                  <FormTextarea
                    value={formValues.crewImmigrationHoldRemarks || ""}
                    onChange={handleChange("crewImmigrationHoldRemarks")}
                    placeholder="Specify reason for hold..."
                    rows={3}
                  />
                </FormField>
              )}

              <FormField label="Vessel Inward formalities completed">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.vesselInwardFormalitiesCompletedDate || ""}
                    onChange={handleChange("vesselInwardFormalitiesCompletedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.vesselInwardFormalitiesCompletedTime || ""}
                    onChange={handleChange("vesselInwardFormalitiesCompletedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Marine work permit applied">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.marineWorkPermitAppliedDate || ""}
                    onChange={handleChange("marineWorkPermitAppliedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.marineWorkPermitAppliedTime || ""}
                    onChange={handleChange("marineWorkPermitAppliedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Marine work permit issued">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.marineWorkPermitIssuedDate || ""}
                    onChange={handleChange("marineWorkPermitIssuedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.marineWorkPermitIssuedTime || ""}
                    onChange={handleChange("marineWorkPermitIssuedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="SABER UT closed">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.saberUtClosedDate || ""}
                    onChange={handleChange("saberUtClosedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.saberUtClosedTime || ""}
                    onChange={handleChange("saberUtClosedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

ArrivalContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
};

const DepartureContent = ({ formValues, handleChange, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink }) => {
  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="departure-form">
          <div className="form-group">
            <h3 className="form-group-title">Departure Information</h3>
            <div className="cf-grid two">
              <FormField label="Request for outward clearance received">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.outwardClearanceRequestReceivedDate || ""}
                    onChange={handleChange("outwardClearanceRequestReceivedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceRequestReceivedTime || ""}
                    onChange={handleChange("outwardClearanceRequestReceivedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Outward clearance issued">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.outwardClearanceIssuedDate || ""}
                    onChange={handleChange("outwardClearanceIssuedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceIssuedTime || ""}
                    onChange={handleChange("outwardClearanceIssuedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Outward clearance delivered">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.outwardClearanceDeliveredDate || ""}
                    onChange={handleChange("outwardClearanceDeliveredDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceDeliveredTime || ""}
                    onChange={handleChange("outwardClearanceDeliveredTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Vessel Sailed (optional)">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.vesselSailedDate || ""}
                    onChange={handleChange("vesselSailedDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.vesselSailedTime || ""}
                    onChange={handleChange("vesselSailedTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Cast off">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.castOffDate || ""}
                    onChange={handleChange("castOffDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.castOffTime || ""}
                    onChange={handleChange("castOffTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

DepartureContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
};

// Main Operation Component
function Operation({ card, formValues, handleChange, ownerInitial }) {
  const [activeOperationTab, setActiveOperationTab] = useState(OPERATION_TABS.PRE_ARRIVAL);
  const cardColor = card?.color || "#2A00FF";

  const handleTabChange = useCallback((tab) => {
    setActiveOperationTab(tab);
  }, []);

  const handleAddAttachment = useCallback(() => {
    // TODO: Implement attachment add logic
    console.log("Add attachment");
  }, []);

  const handleRemoveAttachment = useCallback((index) => {
    // TODO: Implement attachment remove logic
    console.log("Remove attachment", index);
  }, []);

  const handleAddLink = useCallback(() => {
    // TODO: Implement link add logic
    console.log("Add link");
  }, []);

  const handleRemoveLink = useCallback((index) => {
    // TODO: Implement link remove logic
    console.log("Remove link", index);
  }, []);

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
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
              cardColor={cardColor}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
            />
          )}
          {activeOperationTab === OPERATION_TABS.ARRIVAL && (
            <ArrivalContent
              formValues={formValues}
              handleChange={handleChange}
              cardColor={cardColor}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
            />
          )}
          {activeOperationTab === OPERATION_TABS.DEPARTURE && (
            <DepartureContent
              formValues={formValues}
              handleChange={handleChange}
              cardColor={cardColor}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
            />
          )}
        </div>
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

