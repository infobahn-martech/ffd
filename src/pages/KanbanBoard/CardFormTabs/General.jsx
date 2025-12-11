import PropTypes from "prop-types";
import { useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../design/scss/general.scss";
import "../../../design/css/CardForm.css";

// Job statuses in order with icons and descriptions (4 statuses)
const JOB_STATUSES = [
  { id: 1, title: "Received", key: "received", icon: "🚢", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry" },
  { id: 2, title: "Expected", key: "expected", icon: "🚢", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry" },
  { id: 3, title: "Arrived", key: "arrived", icon: "🔍", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry" },
  { id: 4, title: "Cleared", key: "cleared", icon: "✅", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry" },
  { id: 5, title: "Sailed", key: "sailed", icon: "⛵", description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.Lorem Ipsum is simply dummy text of the printing and typesetting industry" },
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

// React Quill Editor Component
const ReactQuillEditor = ({ value, onChange, placeholder }) => {
  const quillRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "link",
    "image",
  ];

  const handleChange = (content) => {
    const syntheticEvent = { target: { value: content, name: "cardDescription" } };
    onChange(syntheticEvent);
  };

  return (
    <div className="react-quill-wrapper">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Enter card description..."}
      />
    </div>
  );
};

ReactQuillEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};


// Helper function to format date and time
const formatDateTime = (date, time) => {
  if (!date && !time) return "Not set";
  const dateStr = date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  const timeStr = time || '';
  return dateStr && timeStr ? `${dateStr} at ${timeStr}` : dateStr || timeStr || "Not set";
};

// Helper function to get status date/time from card/formValues
const getStatusDateTime = (card, formValues, statusKey) => {
  // Map status keys to potential date/time fields in card or formValues
  const dateTimeMap = {
    expected: { date: formValues?.expectedDate || card?.expectedDate, time: formValues?.expectedTime || card?.expectedTime },
    arrived: { date: formValues?.arrivedDate || card?.arrivedDate, time: formValues?.arrivedTime || card?.arrivedTime },
    cleared: { date: formValues?.clearedDate || card?.clearedDate, time: formValues?.clearedTime || card?.clearedTime },
    sailed: { date: formValues?.sailedDate || card?.sailedDate, time: formValues?.sailedTime || card?.sailedTime },
  };

  return dateTimeMap[statusKey] || { date: null, time: null };
};

// Horizontal Progress Bar Component
const HorizontalProgressBar = ({ stages, currentStatus, accentColor, card, formValues }) => {
  const currentIndex = stages.findIndex(stage => stage.key === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  // Calculate progress width - reach the center of the active stage dot
  // Since dots are evenly distributed using flexbox with space-between,
  // the line spans from first dot center (0%) to last dot center (100%)
  // Each dot center is positioned at: (index / (totalStages - 1)) * 100
  const calculateProgressWidth = () => {
    if (stages.length <= 1) return 0;
    if (activeIndex === 0) {
      return 0;
    }
    if (activeIndex === stages.length - 1) {
      return 100;
    }

    // Calculate the exact percentage to reach the center of the active dot
    // Since dots are evenly spaced using flexbox with space-between,
    // the center of each dot is at: (index / (stages.length - 1)) * 100
    // For Custom Inspection (index 1) with 10 stages: 1/9 * 100 = 11.11%
    const dotCenterPosition = (activeIndex / (stages.length - 1)) * 100;

    // Add a visual offset to ensure the green line reaches the center of the dot
    // This accounts for:
    // 1. Dot width (28px) - line needs to extend to dot center
    // 2. Flexbox spacing calculations
    // 3. Subpixel rendering differences
    // For index 1 (Custom Inspection), we add ~2.5% to ensure it reaches the center
    const offsetPercentage = activeIndex <= 2 ? 2.5 : 2.0;
    return Math.min(dotCenterPosition + offsetPercentage, 100);
  };

  const progressWidth = calculateProgressWidth();

  return (
    <div className="job-status-progress-container" style={{ "--progress-color": "#2e7d32" }}>
      <div className="job-status-progress-line">
        <div
          className="job-status-progress-fill"
          style={{
            width: `${progressWidth}%`,
            transition: "width 0.5s ease"
          }}
        />
      </div>
      <div className="job-status-progress-stages">
        {stages.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;
          const statusDateTime = getStatusDateTime(card, formValues, stage.key);
          const formattedDateTime = formatDateTime(statusDateTime.date, statusDateTime.time);

          return (
            <div
              key={stage.id}
              className={`job-status-progress-stage ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
            >
              <div className="job-status-tooltip-content">
                <div className="tooltip-description">{stage.description}</div>
              </div>
              <div className={`job-status-progress-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
                {isCompleted && <span className="check-icon">✓</span>}
                {isActive && <span className="active-dot"></span>}
                {isPending && <span className="pending-dot"></span>}
              </div>
              <div className="job-status-progress-label">
                {stage.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

HorizontalProgressBar.propTypes = {
  stages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    icon: PropTypes.string,
    description: PropTypes.string,
  })).isRequired,
  currentStatus: PropTypes.string,
  accentColor: PropTypes.string,
  card: PropTypes.object,
  formValues: PropTypes.object,
};

function General({ card, formValues, handleChange, ownerInitial, cardUser, onSave }) {
  const accentColor = useMemo(() => card?.color || "#2A00FF", [card?.color]);

  // Determine current job status from card data (updated for 4 statuses)
  const currentStatus = useMemo(() => {
    // Map card properties to status keys
    if (card?.sailed) return "sailed";
    if (card?.cleared) return "cleared";
    if (card?.arrived) return "arrived";
    // Default to Expected
    return "expected";
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
        <div className="cf-section job-status-section">
          <div className="cf-section-header">
            <div className="cf-section-title">Job Status</div>
          </div>
          <div className="cf-section-body job-status-section-body">
            <HorizontalProgressBar
              stages={JOB_STATUSES}
              currentStatus={currentStatus}
              accentColor={accentColor}
              card={card}
              formValues={formValues}
            />
          </div>
        </div>

        <div className="cf-section general-info-section">
          <div className="cf-section-header">
            <div className="cf-section-title">General Information</div>
          </div>
          <div className="cf-section-body">
            <div className="general-info-two-column">
              <div className="general-info-left">
                <div className="card-description-wrapper">
                  <FormField label="Card Description">
                    <ReactQuillEditor
                      value={formValues?.cardDescription || ""}
                      onChange={handleChange("cardDescription")}
                      placeholder="Enter card description..."
                    />
                  </FormField>
                </div>
              </div>

              <div className="general-info-right">
                <div className="pre-arrival-form">
                  <OwnerField
                    value={formValues?.owner || "None"}
                    onChange={handleChange("owner")}
                    ownerInitial={ownerInitialValue}
                    cardUser={cardUser || card?.user}
                  />

                  <div className="form-group">
                    <h3 className="form-group-title">Appointment Details</h3>
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

                  <div className="form-group">
                    <h3 className="form-group-title">Service Information</h3>
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

                  <div className="form-group">
                    <h3 className="form-group-title">Vessel Information</h3>
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
                        placeholder="Enter billing instructions..."
                        value={formValues?.billingInstructions || ""}
                        onChange={handleChange("billingInstructions")}
                      />
                    </FormField>
                  </div>

                  <div className="form-save-button-wrapper">
                    <button
                      type="button"
                      onClick={onSave || (() => { })}
                      className="form-save-button"
                    >
                      Save
                    </button>
                  </div>
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
  onSave: PropTypes.func,
};

export default General;

