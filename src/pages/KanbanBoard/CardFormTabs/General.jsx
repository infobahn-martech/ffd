import PropTypes from "prop-types";
import { useMemo } from "react";
import "../../../design/scss/general.scss";
import "../../../design/css/CardForm.css";

// Job statuses in order with icons and descriptions (10 statuses required)
const JOB_STATUSES = [
  { id: 1, title: "Pre-Arrival", key: "preArrival", icon: "🚢", description: "Vessel approaching port" },
  { id: 2, title: "Customs Inspection", key: "customsInspection", icon: "🔍", description: "Customs clearance process" },
  { id: 3, title: "Crew Immigration", key: "crewImmigration", icon: "👥", description: "Crew documentation check" },
  { id: 4, title: "Vessel Inward Formalities", key: "vesselInwardFormalities", icon: "📋", description: "Inward documentation" },
  { id: 5, title: "Marine Work Permit", key: "marineWorkPermit", icon: "⚓", description: "Work permit approval" },
  { id: 6, title: "SABER UT", key: "saberUt", icon: "✅", description: "SABER system update" },
  { id: 7, title: "Outward Clearance", key: "outwardClearance", icon: "📤", description: "Outward documentation" },
  { id: 8, title: "Vessel Sailed", key: "vesselSailed", icon: "⛵", description: "Vessel departed port" },
  { id: 9, title: "Operations Completed", key: "operationsCompleted", icon: "✔️", description: "All operations finished" },
  { id: 10, title: "Closed", key: "closed", icon: "🔒", description: "Job completed and closed" },
];


// Form Components
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

const FormInput = ({ type = "text", value, onChange, placeholder, className = "", readOnly = false }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
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
  readOnly: PropTypes.bool,
};

const FormSelect = ({ value, onChange, options = [], placeholder, className = "" }) => {
  return (
    <div className={`cf-select ${className}`}>
      <select value={value || ""} onChange={onChange}>
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

const OwnerField = ({ value, onChange, ownerInitial, cardUser }) => {
  return (
    <FormField label="Owner">
      <div className="cf-owner-row">
        <div className="cf-owner-avatar">{ownerInitial}</div>
        <select
          value={value || "None"}
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

function General({ card, formValues, handleChange, ownerInitial, cardUser }) {
  const accentColor = useMemo(() => card?.color || "#2A00FF", [card?.color]);

  // Determine current job status from card data (updated for 10 statuses)
  const currentStatus = useMemo(() => {
    // Map card properties to status keys
    if (card?.closed) return "closed";
    if (card?.operationsCompleted) return "operationsCompleted";
    if (card?.vesselSailed) return "vesselSailed";
    if (card?.outwardClearance) return "outwardClearance";
    if (card?.saberUt) return "saberUt";
    if (card?.marineWorkPermit) return "marineWorkPermit";
    if (card?.vesselInwardFormalities) return "vesselInwardFormalities";
    if (card?.crewImmigration) return "crewImmigration";
    if (card?.customsInspection) return "customsInspection";
    return "preArrival";
  }, [card]);

  const typeOfCallOptions = [
    { value: "Import", label: "Import" },
    { value: "Export", label: "Export" },
    { value: "Domestic", label: "Domestic" },
  ];

  // Get owner initial from card user or formValues
  const ownerInitialValue = ownerInitial || (cardUser ? cardUser.charAt(0).toUpperCase() : "U");

  return (
    <div className="cardform-body general-tab-body">
      <div className="general-sections-wrapper">
        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-title">Job Status</div>
          </div>
          <div className="cf-section-body">

          </div>
        </div>

        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-title">General Information</div>
          </div>
          <div className="cf-section-body">
            <div className="pre-arrival-form">
              <OwnerField
                value={formValues?.owner || "None"}
                onChange={handleChange("owner")}
                ownerInitial={ownerInitialValue}
                cardUser={cardUser || card?.user}
              />

              <div className="form-group">
                <h3 className="form-group-title">Appointment Details</h3>
                <div className="cf-grid two">
                  <FormField label="Appointment Received">
                    <div className="cf-input date-time-row">
                      <input
                        type="date"
                        value={formValues?.appointmentReceivedDate || ""}
                        onChange={handleChange("appointmentReceivedDate")}
                        placeholder="Select date"
                      />
                      <input
                        type="time"
                        value={formValues?.appointmentReceivedTime || ""}
                        onChange={handleChange("appointmentReceivedTime")}
                        placeholder="Select time"
                      />
                    </div>
                  </FormField>

                  <FormField label="Appointment Acceptance">
                    <div className="cf-input date-time-row">
                      <input
                        type="date"
                        value={formValues?.appointmentAcceptanceDate || ""}
                        onChange={handleChange("appointmentAcceptanceDate")}
                        placeholder="Select date"
                      />
                      <input
                        type="time"
                        value={formValues?.appointmentAcceptanceTime || ""}
                        onChange={handleChange("appointmentAcceptanceTime")}
                        placeholder="Select time"
                      />
                    </div>
                  </FormField>
                </div>
              </div>

              <div className="form-group">
                <h3 className="form-group-title">Service Information</h3>
                <div className="cf-grid two">
                  <FormField label="Type of call / Service">
                    <FormSelect
                      value={formValues?.typeOfCall || ""}
                      onChange={handleChange("typeOfCall")}
                      options={typeOfCallOptions}
                      placeholder="Select type of call..."
                    />
                  </FormField>

                  <FormField label="Main Billing entity">
                    <FormSelect
                      value={formValues?.mainBillingEntity || ""}
                      onChange={handleChange("mainBillingEntity")}
                      options={[]}
                      placeholder="Select billing entity..."
                    />
                  </FormField>
                </div>
              </div>

              <div className="form-group">
                <h3 className="form-group-title">Vessel Information</h3>
                <div className="cf-grid two">
                  <FormField label="Port">
                    <FormSelect
                      value={formValues?.port || ""}
                      onChange={handleChange("port")}
                      options={[]}
                      placeholder="Select port..."
                    />
                  </FormField>

                  <FormField label="Vessel type">
                    <FormSelect
                      value={formValues?.vesselType || ""}
                      onChange={handleChange("vesselType")}
                      options={[]}
                      placeholder="Select vessel type..."
                    />
                  </FormField>

                  <FormField label="Barge type">
                    <FormSelect
                      value={formValues?.bargeType || ""}
                      onChange={handleChange("bargeType")}
                      options={[]}
                      placeholder="Select barge type..."
                    />
                  </FormField>

                  <FormField label="Vessel Name">
                    <FormInput
                      type="text"
                      placeholder="Enter vessel name..."
                      value={formValues?.vesselName || ""}
                      onChange={handleChange("vesselName")}
                    />
                  </FormField>

                  <FormField label="Vessel Owner">
                    <FormInput
                      type="text"
                      placeholder="Enter vessel owner..."
                      value={formValues?.vesselOwner || ""}
                      onChange={handleChange("vesselOwner")}
                    />
                  </FormField>

                  <FormField label="Vessel Principal">
                    <FormInput
                      type="text"
                      placeholder="Enter vessel principal..."
                      value={formValues?.vesselPrincipal || ""}
                      onChange={handleChange("vesselPrincipal")}
                    />
                  </FormField>

                  <FormField label="Vessel Manager">
                    <FormInput
                      type="text"
                      placeholder="Enter vessel manager..."
                      value={formValues?.vesselManager || ""}
                      onChange={handleChange("vesselManager")}
                    />
                  </FormField>

                  <FormField label="Other billing entity">
                    <FormSelect
                      value={formValues?.otherBillingEntity || ""}
                      onChange={handleChange("otherBillingEntity")}
                      options={[]}
                      placeholder="Select billing entity..."
                    />
                  </FormField>

                  <FormField label="Assigned Operator">
                    <FormSelect
                      value={formValues?.assignedOperator || ""}
                      onChange={handleChange("assignedOperator")}
                      options={[]}
                      placeholder="Select operator..."
                    />
                  </FormField>

                  <FormField label="Service Requestor Name">
                    <FormInput
                      type="text"
                      placeholder="Enter service requestor name..."
                      value={formValues?.serviceRequestorName || ""}
                      onChange={handleChange("serviceRequestorName")}
                    />
                  </FormField>

                  <FormField label="Service Requestor Email">
                    <FormInput
                      type="email"
                      placeholder="Enter service requestor email..."
                      value={formValues?.serviceRequestorEmail || ""}
                      onChange={handleChange("serviceRequestorEmail")}
                    />
                  </FormField>

                  <FormField label="Daily Report Email Id">
                    <FormInput
                      type="email"
                      placeholder="Enter daily report email..."
                      value={formValues?.dailyReportEmail || ""}
                      onChange={handleChange("dailyReportEmail")}
                    />
                  </FormField>

                  <FormField label="Billing instructions">
                    <FormInput
                      type="text"
                      placeholder="Auto pop up"
                      value={formValues?.billingInstructions || ""}
                      onChange={handleChange("billingInstructions")}
                      readOnly
                    />
                  </FormField>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

General.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
  ownerInitial: PropTypes.string,
  cardUser: PropTypes.string,
};

export default General;

