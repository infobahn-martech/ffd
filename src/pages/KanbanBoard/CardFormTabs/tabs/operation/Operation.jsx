import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../assets/images/cv.png";
import CircleTickIcon from "../../../../../assets/images/CircleTick.svg";
import Checklist from "../appointment/Checklist";
import { notify } from "../../../../../components/Toaster";
import callFileService from "../../../../../services/callFileService";
import stageTimeMappingService from "../../../../../services/stageTimeMappingService";
import {
  buildPreArrivalReportBody,
  buildArrivalReportBody,
  buildArrivalDailyReportBody,
  buildDepartureReportBody,
} from "../../services/sendReportBodyBuilder";
import NavTabButton from "../../../../../components/NavTabButton";
import {
  DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING,
  collectPreArrivalProcessAttachments,
} from "./preArrivalDocumentHandling";
import DateTimePickerField from "../../components/DateTimePickerField";
import "../../../../../design/scss/operations.scss";
import preArrivalInfoService from "../../../../../services/preArrivalInfoService";
import userService from "../../../../../services/userService";
import preArrivalService from "../../../../../services/preArrivalService";
import appointmentAcceptanceService from "../../../../../services/appointmentAcceptanceService";

// Constants
const OPERATION_TABS = {
  PRE_ARRIVAL: "preArrival",
  CHECK_LIST: "checkList",
  ARRIVAL: "arrival",
  DEPARTURE: "departure",
};

const PRE_ARRIVAL_SABER_STATUS_OPTIONS = [
  { value: "Applied by Client", label: "Applied by Client" },
  { value: "Applied by Sedres", label: "Applied by Sedres" },
];

const PRE_ARRIVAL_WEATHER_FORECAST_OPTIONS = [
  { value: "Normal weather", label: "Normal weather" },
  { value: "Bad weather", label: "Bad weather" },
];

const SABER_APPLIED_BY_SEDRES = "Applied by Sedres";
const BAD_WEATHER = "Bad weather";

const EVENT_NAME_FIELD_KEY_MAP = {
  "expected time of arrival": "expectedArrival",
  "expected commencement of custom inspection": "customsInspection",
  "expected commencement of immigration clearance for crew": "immigrationClearance",
  "expected completion of inward clearance": "inwardClearance",
  "actual time of arrival": "actualArrival",
  "custom inspection commenced": "customInspectionCommenced",
  "custom inspection completed": "customInspectionCompleted",
  "crew immigration commenced": "crewImmigrationCommenced",
  "crew immigration completed": "crewImmigrationCompleted",
  "vessel inward formalities completed": "vesselInwardFormalitiesCompleted",
  "marine work permit applied": "marineWorkPermitApplied",
  "marine work permit issued": "marineWorkPermitIssued",
  "marine work permit expires": "marineWorkPermitExpires",
  "request for outward clearance received": "outwardClearanceRequestReceived",
  "outward clearance issued": "outwardClearanceIssued",
  "outward clearance delivered": "outwardClearanceDelivered",
  "vessel sailed": "vesselSailed",
};

const toPascalCase = (text = "") =>
  String(text)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

const getEventFieldKeyPrefix = (eventName = "") => {
  const normalized = String(eventName).trim().toLowerCase();
  if (EVENT_NAME_FIELD_KEY_MAP[normalized]) {
    return EVENT_NAME_FIELD_KEY_MAP[normalized];
  }
  const pascal = toPascalCase(eventName);
  return pascal ? `operation${pascal}` : "operationEvent";
};

const mapEventFields = (responseData) => {
  const rows = responseData?.fields || responseData?.data || responseData?.time_objects || [];
  return rows
    .filter((field) => {
      const eventName = field?.event_name ?? field?.time_object;
      const eventType = String(field?.event_type || "").toLowerCase();
      const inputType = String(field?.input_type || "").toLowerCase();
      return Boolean(eventName) && (eventType === "datetime" || inputType === "datetime" || !field?.event_type);
    })
    .map((field, index) => ({
      ...field,
      event_name: field?.event_name ?? field?.time_object ?? "",
      event_type_id: field?.event_type_id ?? field?.time_object_id,
      keyPrefix: getEventFieldKeyPrefix(field?.event_name ?? field?.time_object ?? ""),
      sort_order: Number(field?.sort_order ?? index + 1),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);
};

const FALLBACK_PRE_ARRIVAL_FIELDS = [
  { event_name: "Expected time of arrival", keyPrefix: "expectedArrival", event_type_id: 1, sort_order: 1 },
  { event_name: "Expected commencement of custom inspection", keyPrefix: "customsInspection", event_type_id: 2, sort_order: 2 },
  { event_name: "Expected commencement of Immigration clearance for crew", keyPrefix: "immigrationClearance", event_type_id: 3, sort_order: 3 },
  { event_name: "Expected completion of inward clearance", keyPrefix: "inwardClearance", event_type_id: 4, sort_order: 4 },
];

const FALLBACK_ARRIVAL_FIELDS = [
  { event_name: "Actual time of arrival", keyPrefix: "actualArrival", stage_id: 2, sort_order: 1 },
  { event_name: "Custom Inspection commenced", keyPrefix: "customInspectionCommenced", stage_id: 2, sort_order: 2 },
  { event_name: "Custom Inspection completed", keyPrefix: "customInspectionCompleted", stage_id: 2, sort_order: 3 },
  { event_name: "Crew immigration commenced", keyPrefix: "crewImmigrationCommenced", stage_id: 2, sort_order: 4 },
  { event_name: "Crew immigration completed", keyPrefix: "crewImmigrationCompleted", stage_id: 2, sort_order: 5 },
  { event_name: "Vessel Inward formalities completed", keyPrefix: "vesselInwardFormalitiesCompleted", stage_id: 3, sort_order: 1 },
  { event_name: "Marine work permit applied", keyPrefix: "marineWorkPermitApplied", stage_id: 3, sort_order: 2 },
  { event_name: "Marine work permit issued", keyPrefix: "marineWorkPermitIssued", stage_id: 3, sort_order: 3 },
  { event_name: "Marine work permit expires", keyPrefix: "marineWorkPermitExpires", stage_id: 3, sort_order: 4 },
];

const FALLBACK_DEPARTURE_FIELDS = [
  { event_name: "Request for outward clearance received", keyPrefix: "outwardClearanceRequestReceived", sort_order: 1 },
  { event_name: "Outward clearance issued", keyPrefix: "outwardClearanceIssued", sort_order: 2 },
  { event_name: "Outward clearance delivered", keyPrefix: "outwardClearanceDelivered", sort_order: 3 },
  { event_name: "Vessel Sailed", keyPrefix: "vesselSailed", sort_order: 4 },
];

// Sub-components
const OperationTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: OPERATION_TABS.PRE_ARRIVAL, label: "Pre Arrival" },
    { id: OPERATION_TABS.ARRIVAL, label: "Arrival" },
    { id: OPERATION_TABS.DEPARTURE, label: "Departure" },
    { id: OPERATION_TABS.CHECK_LIST, label: "Check List" },
  ];

  return (
    <div className="operation-left">
      {tabs.map((tab) => (
        <NavTabButton
          key={tab.id}
          className="op-tab"
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </NavTabButton>
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
    <>
      {title && (
        <div className="cf-section-header">
          <span className="cf-section-icon">
            <img src={icon} alt={title} />
          </span>
          <span className="cf-section-title">{title}</span>
        </div>
      )}
      <div className="cf-section-body">{children}</div>
    </>
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

const OperationFormCard = ({ className = "", children }) => {
  return <div className={`operation-form-card ${className}`.trim()}>{children}</div>;
};

OperationFormCard.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const DynamicDateTimeFields = ({ eventFields = [], formValues, handleChange, isViewOnly = false }) => {
  if (!eventFields.length) return null;

  return eventFields.map((field) => {
    const keyPrefix = field.keyPrefix;
    const dateKey = `${keyPrefix}Date`;
    const timeKey = `${keyPrefix}Time`;
    const label = field.is_required ? `${field.event_name} *` : field.event_name;

    return (
      <FormField key={`${field.stage_id || "stage"}-${field.event_name}-${keyPrefix}`} label={label}>
        <DateTimePickerField
          dateValue={formValues[dateKey] || ""}
          timeValue={formValues[timeKey] || ""}
          onDateChange={handleChange(dateKey)}
          onTimeChange={handleChange(timeKey)}
          dateFieldName={dateKey}
          timeFieldName={timeKey}
          disabled={isViewOnly}
        />
      </FormField>
    );
  });
};

DynamicDateTimeFields.propTypes = {
  eventFields: PropTypes.arrayOf(
    PropTypes.shape({
      stage_id: PropTypes.number,
      event_name: PropTypes.string,
      is_required: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
      keyPrefix: PropTypes.string,
    })
  ),
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

const formatAttachmentLabel = (attachment) => {
  if (!attachment) return "Attachment";
  if (typeof attachment === "string") return attachment;
  return attachment.name || attachment.file_name || attachment.filename || "Attachment";
};

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
};

const htmlToPlainText = (html = "") =>
  String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const htmlToEditableText = (html = "") =>
  String(html || "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const extractReportTemplateFields = (templatePayload) => {
  const rawData = templatePayload?.data?.data ?? templatePayload?.data ?? templatePayload ?? {};
  const row = Array.isArray(rawData) ? rawData[0] || {} : rawData;
  const rawBody = firstNonEmptyString(row?.message, row?.body, row?.email_body, row?.template);
  return {
    from: firstNonEmptyString(row?.from, row?.from_email, row?.sender_email, row?.sender),
    subject: htmlToPlainText(firstNonEmptyString(row?.subject, row?.email_subject)),
    message: firstNonEmptyString(htmlToEditableText(rawBody), htmlToPlainText(rawBody)),
  };
};

const OperationEmailPreviewPanel = ({
  reportType,
  reportTypeOptions,
  from,
  to,
  cc,
  subject,
  message,
  attachments = [],
  onChange,
  onReportTypeChange,
}) => {
  return (
    <div className="operation-email-preview-panel">
      <div className="operation-email-preview-header">
        <h4>Email Preview</h4>
        {reportTypeOptions?.length > 0 && (
          <div className="operation-email-report-type">
            <label htmlFor="operation-report-type">Report Type</label>
            <select
              id="operation-report-type"
              value={reportType || reportTypeOptions[0]?.value}
              onChange={(e) => onReportTypeChange?.(e.target.value)}
            >
              {reportTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="operation-email-preview-body">
        <FormField label="From">
          <FormInput type="text" value={from || ""} onChange={(e) => onChange?.("from", e.target.value)} placeholder="Sender email" />
        </FormField>
        <FormField label="To">
          <FormInput type="text" value={to || ""} onChange={(e) => onChange?.("to", e.target.value)} placeholder="Recipient emails" />
        </FormField>
        <FormField label="Cc">
          <FormInput type="text" value={cc || ""} onChange={(e) => onChange?.("cc", e.target.value)} placeholder="CC emails" />
        </FormField>
        <FormField label="Subject">
          <FormInput type="text" value={subject || ""} onChange={(e) => onChange?.("subject", e.target.value)} placeholder="Email subject" />
        </FormField>
        <FormField label="Message">
          <FormTextarea
            value={message || ""}
            onChange={(e) => onChange?.("message", e.target.value)}
            placeholder="Type email content here..."
            rows={11}
          />
        </FormField>
      </div>
    </div>
  );
};

OperationEmailPreviewPanel.propTypes = {
  reportType: PropTypes.string,
  reportTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  from: PropTypes.string,
  to: PropTypes.string,
  cc: PropTypes.string,
  subject: PropTypes.string,
  message: PropTypes.string,
  attachments: PropTypes.array,
  onChange: PropTypes.func,
  onReportTypeChange: PropTypes.func,
};

const FormInput = ({ type = "text", value, onChange, placeholder, className = "", disabled = false }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

// Custom Select Component (similar to MultiSelectEmail UI)
const CustomSelect = ({ value, onChange, options = [], placeholder, className = "", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  const handleSelect = (optionValue) => {
    const syntheticEvent = {
      target: { value: optionValue }
    };
    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className={`cf-multi-select-email ${disabled ? "disabled" : ""} ${className}`} ref={dropdownRef}>
      <div
        className={`cf-multi-select-email-input ${disabled ? "disabled" : ""}`}
        onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
        style={{ pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1 }}
      >
        <div className="cf-multi-select-email-tags">
          {displayValue ? (
            <span className="cf-multi-select-selected-value">{displayValue}</span>
          ) : (
            <span className="cf-multi-select-placeholder">{placeholder || "Select..."}</span>
          )}
        </div>
        <span className="cf-multi-select-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="cf-multi-select-dropdown">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <div
                key={option.value}
                className={`cf-multi-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

CustomSelect.propTypes = {
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
  disabled: PropTypes.bool,
};

const FormSelect = ({ value, onChange, options = [], placeholder, className = "", disabled = false }) => {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
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
  disabled: PropTypes.bool,
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

const FormTextarea = ({ value, onChange, placeholder, className = "", rows = 3, disabled = false }) => {
  return (
    <div className={`cf-textarea ${className}`}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
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
  disabled: PropTypes.bool,
};

const FormMultiSelect = ({ value = [], onChange, options = [], placeholder, className = "" }) => {
  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    onChange({ target: { value: selectedOptions } });
  };

  return (
    <div className={`cf-multiselect ${className}`}>
      <select multiple value={value} onChange={handleSelectChange} size={4}>
        {placeholder && value.length === 0 && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {value.length > 0 && (
        <div className="cf-multiselect-selected">
          {value.length} item(s) selected
        </div>
      )}
    </div>
  );
};

FormMultiSelect.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
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

const TimeSlotPicker = ({ value = "", onChange, placeholder, className = "", cardColor }) => {
  // Generate time slots (every 30 minutes from 00:00 to 23:30)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        slots.push({ value: timeString, label: timeString });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Find the selected option object
  const selectedOption = timeSlots.find((slot) => slot.value === value) || null;

  // Handle select change
  const handleSelectChange = (selectedOption) => {
    const syntheticEvent = { target: { value: selectedOption?.value || "" } };
    onChange(syntheticEvent);
  };

  // Custom styles for react-select - ensures dropdown opens downwards
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      border: 'none',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '2px 4px',
      '&:hover': {
        border: 'none',
        boxShadow: 'none',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px',
      minHeight: '38px',
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999',
      fontSize: '13px',
      marginLeft: '4px',
    }),
    input: (base) => ({
      ...base,
      color: '#1a1a1a',
      fontSize: '13px',
      margin: '0',
      padding: '0',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      paddingRight: '8px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#666',
      padding: '4px',
      '&:hover': {
        color: 'rgb(62 94 189)',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#999',
      padding: '4px',
      '&:hover': {
        color: '#ff0000',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e2e2ea',
      marginTop: '4px',
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '200px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'rgb(62 94 189)'
        : state.isFocused
          ? 'rgba(62, 94, 189, 0.1)'
          : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#1a1a1a',
      fontSize: '13px',
      padding: '10px 12px',
      borderRadius: '6px',
      margin: '2px 0',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: 'rgb(62 94 189)',
        color: '#ffffff',
      },
    }),
  };

  return (
    <div className={`cf-timeslot ${className}`}>
      <div className="cf-select react-select-container">
        <Select
          value={selectedOption}
          onChange={handleSelectChange}
          options={timeSlots}
          placeholder={placeholder || "Select time slot..."}
          classNamePrefix="react-select"
          styles={customSelectStyles}
          isClearable
          isSearchable
          menuPlacement="bottom"
        />
      </div>
    </div>
  );
};

TimeSlotPicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  cardColor: PropTypes.string,
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
      <button
        className="cf-link-btn"
        onClick={onButtonClick}
        type="button"
      >
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

const IconAsteriskRequired = () => (
  <span className="document-row-required" title="Required">
    *
  </span>
);

const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function openAttachmentPreview(attachment) {
  const raw = attachment?.file;
  if (raw instanceof Blob) {
    const url = URL.createObjectURL(raw);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  // eslint-disable-next-line no-console
  console.log("Preview document:", attachment?.name);
}

const CompactFileUploadRow = ({ label, files = [], isRequired = false, onAddFiles, onRemoveAt, isViewOnly = false }) => {
  const inputRef = useRef(null);
  const hasFiles = (files || []).length > 0;

  const handleInput = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      const mapped = selectedFiles.map((file) => ({
        name: file.name,
        file,
        size: file.size,
        type: file.type,
      }));
      onAddFiles(mapped);
    }
    e.target.value = "";
  };

  return (
    <div className="document-row compact-file-upload-row">
      <div className="document-row-name compact-file-upload-label">
        <span title={label}>{label}</span>
      </div>
      <div className="document-row-actions compact-file-upload-actions">
        {hasFiles && (
          <button type="button" className="document-row-icon-btn" onClick={() => openAttachmentPreview(files[0])} title="Preview">
            <IconEye />
          </button>
        )}
        {!isViewOnly && (
          <>
            <button type="button" className="document-row-icon-btn" onClick={() => inputRef.current?.click()} title={hasFiles ? "Add more files" : "Upload files"}>
              <IconUpload />
            </button>
            <input ref={inputRef} type="file" className="document-row-file-input" onChange={handleInput} aria-label={`Upload ${label}`} multiple />
            {hasFiles && (
              <button type="button" className="document-row-icon-btn document-row-icon-btn--danger" onClick={() => onRemoveAt(files.length - 1)} title="Remove latest file">
                <IconTrash />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

CompactFileUploadRow.propTypes = {
  label: PropTypes.string.isRequired,
  files: PropTypes.array,
  isRequired: PropTypes.bool,
  onAddFiles: PropTypes.func.isRequired,
  onRemoveAt: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

const OperationFileUpload = ({
  files = [],
  onAddFiles,
  isViewOnly = false,
  ariaLabel = "Upload files",
  accept,
}) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    const mapped = selectedFiles.map((file) => ({
      name: file.name,
      file,
      size: file.size,
      type: file.type,
    }));
    onAddFiles(mapped);
    e.target.value = "";
  };

  return (
    <div
      className={`operation-compact-upload-zone${isViewOnly ? " operation-compact-upload-zone--disabled" : ""}`}
      role="button"
      tabIndex={isViewOnly ? -1 : 0}
      onClick={() => !isViewOnly && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (isViewOnly) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-label={ariaLabel}
    >
      <p className="operation-compact-upload-text">
        Drag and drop your files here, or <span>click to browse</span>
      </p>
      {(files || []).length > 0 && <p className="operation-compact-upload-file">{files[0]?.name || `${files.length} file(s) selected`}</p>}
      <input
        ref={inputRef}
        type="file"
        className="operation-compact-upload-input"
        accept={accept}
        multiple
        onChange={handleInputChange}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
};

OperationFileUpload.propTypes = {
  files: PropTypes.array,
  onAddFiles: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  ariaLabel: PropTypes.string,
  accept: PropTypes.string,
};

const SaberUploadBox = ({ files = [], onAddFiles, isViewOnly = false }) => {
  return (
    <OperationFileUpload
      files={files}
      onAddFiles={onAddFiles}
      isViewOnly={isViewOnly}
      ariaLabel="Upload SABER certificate files"
    />
  );
};

SaberUploadBox.propTypes = {
  files: PropTypes.array,
  onAddFiles: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

const OperationSaveSection = ({ isViewOnly = false, onSave, isSaving = false, className = "" }) => {
  if (isViewOnly) return null;

  return (
    <div className={`operation-sticky-actions ${className}`.trim()}>
      <button type="button" className="form-save-button operation-save-button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

OperationSaveSection.propTypes = {
  isViewOnly: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  className: PropTypes.string,
};

function DocumentGroupCard({ title, children }) {
  return (
    <div className="document-group-card">
      <h4 className="document-group-card__title">{title}</h4>
      <div className="document-group-card__body">{children}</div>
    </div>
  );
}

DocumentGroupCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function PreArrivalDocumentHandlingSection({ formValues, handleChange, isViewOnly, portId }) {
  const dh = formValues.preArrivalDocumentHandling || DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING;
  const dhRef = useRef(dh);
  const selectedGroOption = formValues.assignedGro || "";
  const selectedCustomClearanceOption = formValues.assignedCustom || "";
  const [groOptions, setGroOptions] = useState([]);
  const [customClearanceOptions, setCustomClearanceOptions] = useState([]);

  useEffect(() => {
    dhRef.current = dh;
  }, [dh]);

  const setDh = (next) => {
    handleChange("preArrivalDocumentHandling")({ target: { value: next } });
  };

  const toggleProcess = (key) => {
    if (isViewOnly) return;
    const isCurrentlySelected = Boolean(dh.selectedProcesses?.[key]);
    setDh({
      ...dh,
      selectedProcesses: {
        gro: false,
        customClearance: false,
        [key]: !isCurrentlySelected,
      },
    });
  };

  const patchRowFiles = (processKey, rowId, nextFiles) => {
    const rows = (dh.documents[processKey] || []).map((r) => (r.id === rowId ? { ...r, files: nextFiles } : r));
    setDh({ ...dh, documents: { ...dh.documents, [processKey]: rows } });
  };

  const mergeRoleDocuments = useCallback((existingRows = [], incomingRows = []) => {
    const normalizedIncoming = (Array.isArray(incomingRows) ? incomingRows : []).map((row, index) => ({
      id: row?.document_id != null ? String(row.document_id) : `role-doc-${index}`,
      name: row?.document_name || row?.name || `Document ${index + 1}`,
      is_required: Boolean(row?.is_required ?? row?.required),
      files: [],
    }));

    return normalizedIncoming.map((incomingRow) => {
      const matched = (existingRows || []).find((row) => String(row?.id) === String(incomingRow.id));
      return {
        ...incomingRow,
        files: Array.isArray(matched?.files) ? matched.files : [],
      };
    });
  }, []);

  const { gro: groOn, customClearance: ccOn } = dh.selectedProcesses || {};
  const showDocumentHandlingContent = Boolean(selectedGroOption && selectedCustomClearanceOption);

  useEffect(() => {
    let cancelled = false;

    const mapUserOptions = (response) =>
      (response?.data?.data || response?.data || [])
        .filter((user) => user?.user_id != null)
        .map((user) => ({
          value: String(user.user_id),
          label: user.name || `User ${user.user_id}`,
          roleId: user.role_id ?? user.roleId ?? user?.role?.role_id ?? user?.role?.id ?? null,
        }));

    const loadUserOptions = async () => {
      if (!portId) {
        setGroOptions([]);
        setCustomClearanceOptions([]);
        handleChange("assignedGro")({ target: { value: "" } });
        handleChange("assignedCustom")({ target: { value: "" } });
        return;
      }

      try {
        const [groRes, clearanceRes] = await Promise.all([
          userService.getUsersByRole({ role_id: 4, port_id: portId }),
          userService.getUsersByRole({ role_id: 5, port_id: portId }),
        ]);
        if (cancelled) return;

        const nextGroOptions = mapUserOptions(groRes);
        const nextCustomClearanceOptions = mapUserOptions(clearanceRes);
        setGroOptions(nextGroOptions);
        setCustomClearanceOptions(nextCustomClearanceOptions);

        if (selectedGroOption && !nextGroOptions.some((option) => option.value === selectedGroOption)) {
          handleChange("assignedGro")({ target: { value: "" } });
        }
        if (
          selectedCustomClearanceOption &&
          !nextCustomClearanceOptions.some((option) => option.value === selectedCustomClearanceOption)
        ) {
          handleChange("assignedCustom")({ target: { value: "" } });
        }
      } catch (error) {
        if (cancelled) return;
        setGroOptions([]);
        setCustomClearanceOptions([]);
        handleChange("assignedGro")({ target: { value: "" } });
        handleChange("assignedCustom")({ target: { value: "" } });
        // eslint-disable-next-line no-console
        console.error("[Operation] users/get_users_by_role failed", error);
      }
    };

    loadUserOptions();

    return () => {
      cancelled = true;
    };
  }, [portId, selectedGroOption, selectedCustomClearanceOption, handleChange]);

  useEffect(() => {
    let cancelled = false;

    const selectedGroRoleId = groOptions.find((option) => option.value === selectedGroOption)?.roleId;
    const selectedCustomRoleId = customClearanceOptions.find(
      (option) => option.value === selectedCustomClearanceOption
    )?.roleId;

    const loadRoleBasedDocuments = async () => {
      const tasks = [];
      if (selectedGroRoleId) {
        tasks.push(preArrivalInfoService.getDocumentsByRole(selectedGroRoleId));
      } else {
        tasks.push(Promise.resolve(null));
      }
      if (selectedCustomRoleId) {
        tasks.push(preArrivalInfoService.getDocumentsByRole(selectedCustomRoleId));
      } else {
        tasks.push(Promise.resolve(null));
      }

      try {
        const [groResponse, customResponse] = await Promise.all(tasks);
        if (cancelled) return;

        const currentDh = dhRef.current || DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING;
        const groRows = mergeRoleDocuments(currentDh?.documents?.gro || [], groResponse?.data?.data || []);
        const customRows = mergeRoleDocuments(
          currentDh?.documents?.customClearance || [],
          customResponse?.data?.data || []
        );

        setDh({
          ...currentDh,
          documents: {
            ...currentDh.documents,
            gro: selectedGroRoleId ? groRows : [],
            customClearance: selectedCustomRoleId ? customRows : [],
          },
        });
      } catch (error) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[Operation] pre_arrival/get_documents_by_role failed", error);
      }
    };

    loadRoleBasedDocuments();

    return () => {
      cancelled = true;
    };
  }, [
    selectedGroOption,
    selectedCustomClearanceOption,
    groOptions,
    customClearanceOptions,
    mergeRoleDocuments,
  ]);

  return (
    <div className="document-handling-section">
      <div className="document-handling-preselect">
        <FormField label="Select GRO">
          <FormSelect
            value={formValues.assignedGro || ""}
            onChange={handleChange("assignedGro")}
            options={groOptions}
            placeholder="Select GRO"
            disabled={isViewOnly || !portId}
          />
        </FormField>
        <FormField label="Select Custom clearance">
          <FormSelect
            value={formValues.assignedCustom || ""}
            onChange={handleChange("assignedCustom")}
            options={customClearanceOptions}
            placeholder="Select Custom clearance"
            disabled={isViewOnly || !portId}
          />
        </FormField>
      </div>

      {showDocumentHandlingContent && (
        <>
          <div className="document-handling-section__divider" />
          <div className="document-handling-header-row" role="group" aria-label="Document process selection">
            <h3 className="document-handling-section__heading">Document handling</h3>
            <button
              type="button"
              className={`process-selector-option${groOn ? " process-selector-option--active" : ""}`}
              onClick={() => toggleProcess("gro")}
              disabled={isViewOnly}
            >
              GRO
            </button>
            <button
              type="button"
              className={`process-selector-option${ccOn ? " process-selector-option--active" : ""}`}
              onClick={() => toggleProcess("customClearance")}
              disabled={isViewOnly}
            >
              Custom
            </button>
          </div>

          {groOn && (
            <DocumentGroupCard title="GRO documents">
              {(dh.documents.gro || []).map((doc) => (
                <CompactFileUploadRow
                  key={doc.id}
                  label={doc.name}
                  files={doc.files || []}
                  isRequired={Boolean(doc.is_required)}
                  isViewOnly={isViewOnly}
                  onAddFiles={(newFiles) => patchRowFiles("gro", doc.id, [...(doc.files || []), ...newFiles])}
                  onRemoveAt={(idx) => patchRowFiles("gro", doc.id, (doc.files || []).filter((_, i) => i !== idx))}
                />
              ))}
            </DocumentGroupCard>
          )}

          {ccOn && (
            <DocumentGroupCard title="Custom clearance documents">
              {(dh.documents.customClearance || []).map((doc) => (
                <CompactFileUploadRow
                  key={doc.id}
                  label={doc.name}
                  files={doc.files || []}
                  isRequired={Boolean(doc.is_required)}
                  isViewOnly={isViewOnly}
                  onAddFiles={(newFiles) => patchRowFiles("customClearance", doc.id, [...(doc.files || []), ...newFiles])}
                  onRemoveAt={(idx) => patchRowFiles("customClearance", doc.id, (doc.files || []).filter((_, i) => i !== idx))}
                />
              ))}
            </DocumentGroupCard>
          )}
        </>
      )}
    </div>
  );
}

PreArrivalDocumentHandlingSection.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const PreArrivalContent = ({
  card,
  formValues,
  handleChange,
  ownerInitial,
  cardUser,
  cardColor,
  onAddLink,
  onRemoveLink,
  onSendReport,
  isViewOnly = false,
  eventFields = [],
  portId,
  callTypeId,
}) => {
  const [isSavingPreArrival, setIsSavingPreArrival] = useState(false);
  const [reportDraft, setReportDraft] = useState({
    from: "operations@shipping.com",
    to: "",
    cc: "",
    subject: "Report - Pre Arrival",
    message: "",
  });

  const handleSaberUtAddFiles = (files) => {
    const currentAttachments = formValues.saberUtDocumentsAttachments || [];
    handleChange("saberUtDocumentsAttachments")({ target: { value: [...currentAttachments, ...files] } });
  };

  const handleSaberUtStatusChange = (e) => {
    const value = e.target.value;
    handleChange("saberUtStatus")(e);
    if (value !== SABER_APPLIED_BY_SEDRES) {
      handleChange("saberUtDocumentsAttachments")({ target: { value: [] } });
    }
  };

  const handleWeatherForecastChange = (e) => {
    const value = e.target.value;
    handleChange("weatherForecast")(e);

    if (value === BAD_WEATHER) {
      notify(
        "Bad weather selected. Please re-check ETA and clearance time objects.",
        "warning"
      );
      handleChange("preArrivalTimeObjectsNeedRecheck")({
        target: { value: true },
      });
    } else {
      handleChange("preArrivalTimeObjectsNeedRecheck")({
        target: { value: false },
      });
    }
  };

  const handlePreArrivalTimeObjectChange = useCallback(
    (fieldName) => (event) => {
      handleChange(fieldName)(event);
      if (formValues.preArrivalTimeObjectsNeedRecheck) {
        handleChange("preArrivalTimeObjectsNeedRecheck")({ target: { value: false } });
      }
    },
    [handleChange, formValues.preArrivalTimeObjectsNeedRecheck]
  );

  const savePreArrivalData = async () => {
    const callId = card?.call_id || formValues?.call_id || "";
    const cardId = card?.id || card?.card_id || formValues?.card_id || "";
    const assignedGro = formValues.assignedGro || "";
    const assignedCustom = formValues.assignedCustom || "";

    if (!callId) {
      notify("Call ID is required.", "error");
      return false;
    }
    if (!cardId) {
      notify("Card ID is required.", "error");
      return false;
    }
    if (!assignedGro) {
      notify("Assigned GRO is required.", "error");
      return false;
    }
    if (!assignedCustom) {
      notify("Assigned Custom clearance is required.", "error");
      return false;
    }

    if (
      formValues.weatherForecast === BAD_WEATHER &&
      formValues.preArrivalTimeObjectsNeedRecheck === true
    ) {
      notify(
        "Please re-check ETA and clearance time objects before saving.",
        "warning"
      );
      return false;
    }

    const events = (eventFields || [])
      .map((field, index) => {
        const dateKey = `${field.keyPrefix}Date`;
        const timeKey = `${field.keyPrefix}Time`;

        const date = formValues[dateKey];
        const time = formValues[timeKey];

        if (!date || !time) return null;
        const eventTypeId =
          field.event_type_id ??
          field.eventTypeId ??
          field.event_typeid ??
          field.id ??
          null;
        if (eventTypeId == null) {
          // eslint-disable-next-line no-console
          console.warn("[Operation] Missing event_type_id for event field", field, index);
          return null;
        }

        return {
          event_type_id: Number(eventTypeId),
          event_datetime: `${date} ${time}:00`,
        };
      })
      .filter(Boolean);

    const fd = new FormData();
    fd.append("call_id", callId);
    fd.append("card_id", cardId);
    fd.append("events", JSON.stringify(events));
    fd.append("saber_status", formValues.saberUtStatus || "");
    fd.append("weather_forecast", formValues.weatherForecast || "");
    fd.append("coordinates", formValues.coordinates || "");
    fd.append("remarks", formValues.preArrivalDescription || "");
    fd.append("assigned_gro", assignedGro);
    fd.append("assigned_custom", assignedCustom);

    if (formValues.saberUtStatus === SABER_APPLIED_BY_SEDRES) {
      (formValues.saberUtDocumentsAttachments || []).forEach((item) => {
        if (item?.file instanceof File) {
          fd.append("saber_attachments[]", item.file);
        }
      });
    }

    const dh = formValues.preArrivalDocumentHandling;
    (dh?.documents?.gro || []).forEach((doc) => {
      if ((doc.files || []).length > 0) {
        fd.append("gro_docs[document_id]", doc.id);
      }
    });

    (dh?.documents?.customClearance || []).forEach((doc) => {
      if ((doc.files || []).length > 0) {
        fd.append("custom_docs[document_id]", doc.id);
      }
    });

    try {
      setIsSavingPreArrival(true);
      await preArrivalService.savePreArrival(fd);
      notify("Pre Arrival saved successfully.", "success");
      return true;
    } catch (error) {
      notify(error?.response?.data?.message || "Failed to save Pre Arrival.", "error");
      return false;
    } finally {
      setIsSavingPreArrival(false);
    }
  };

  const preArrivalReportAttachments = [
    ...(formValues.saberUtDocumentsAttachments || []),
    ...collectPreArrivalProcessAttachments(formValues.preArrivalDocumentHandling),
  ];

  useEffect(() => {
    setReportDraft((prev) => ({
      ...prev,
      message: buildPreArrivalReportBody(formValues),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadReportTemplate = async () => {
      if (!portId || !callTypeId) return;

      try {
        const response = await appointmentAcceptanceService.getTemplateByPortCallType({
          port_id: portId,
          call_type_id: callTypeId,
          report_type_id: 2,
        });
        if (cancelled) return;

        const template = extractReportTemplateFields(response);
        setReportDraft((prev) => ({
          ...prev,
          from: template.from || prev.from,
          subject: template.subject || prev.subject,
          message: template.message || prev.message,
        }));
      } catch (error) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[Operation] report_template/get_template_by_port_calltype failed", error);
      }
    };

    loadReportTemplate();

    return () => {
      cancelled = true;
    };
  }, [portId, callTypeId]);

  const handleReportDraftChange = (field, value) => {
    setReportDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveAndSendReport = async () => {
    const saveResult = await savePreArrivalData();
    if (!saveResult) return;

    try {
      await onSendReport?.({
        tabName: "Pre Arrival",
        from: reportDraft.from,
        to: reportDraft.to,
        cc: reportDraft.cc,
        subject: reportDraft.subject,
        body: reportDraft.message || buildPreArrivalReportBody(formValues),
        attachments: preArrivalReportAttachments,
      });
    } catch (error) {
      notify(error?.message || "Report send is not available yet.", "warning");
    }
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Pre-Arrival Information</h3>
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="operation-tab-layout">
          <div className="pre-arrival-form operation-tab-scroll">
            <div className="operation-prearrival-grid">
              <OperationFormCard className="operation-form-column">
                <div
                  className={`prearrival-timeobject-highlight ${
                    formValues.weatherForecast === BAD_WEATHER && formValues.preArrivalTimeObjectsNeedRecheck
                      ? "is-warning"
                      : ""
                  }`.trim()}
                >
                  <DynamicDateTimeFields
                    eventFields={eventFields}
                    formValues={formValues}
                    handleChange={handlePreArrivalTimeObjectChange}
                    isViewOnly={isViewOnly}
                  />
                </div>

                <FormField label="SABER Status">
                  <FormSelect
                    value={formValues.saberUtStatus || ""}
                    onChange={handleSaberUtStatusChange}
                    options={PRE_ARRIVAL_SABER_STATUS_OPTIONS}
                    placeholder="Select SABER status..."
                    disabled={isViewOnly}
                  />
                </FormField>

                {formValues.saberUtStatus === SABER_APPLIED_BY_SEDRES && (
                  <FormField label="SABER Certificate Upload">
                    <SaberUploadBox
                      files={formValues.saberUtDocumentsAttachments || []}
                      onAddFiles={handleSaberUtAddFiles}
                      isViewOnly={isViewOnly}
                    />
                  </FormField>
                )}

                <FormField label="Weather Forecast">
                  <FormSelect
                    value={formValues?.weatherForecast || ""}
                    onChange={handleWeatherForecastChange}
                    options={PRE_ARRIVAL_WEATHER_FORECAST_OPTIONS}
                    placeholder="Select weather forecast..."
                    disabled={isViewOnly}
                  />
                  {formValues.weatherForecast === BAD_WEATHER && (
                    <div className="prearrival-windy-map">
                      <iframe
                        title="Windy Weather Map"
                        width="650"
                        height="450"
                        src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=8&overlay=wind&product=ecmwf&level=surface&lat=27.284&lon=49.109&detailLat=29.0525682775337&detailLon=48.087158203125&marker=true"
                        frameBorder="0"
                      />
                    </div>
                  )}
                </FormField>

                <FormField label="Coordinates">
                  <FormInput
                    type="text"
                    value={formValues?.coordinates || ""}
                    onChange={handleChange("coordinates")}
                    placeholder="Enter coordinates..."
                    disabled={isViewOnly}
                  />
                </FormField>
              </OperationFormCard>
              <OperationFormCard className="operation-document-column">
                <PreArrivalDocumentHandlingSection
                  formValues={formValues}
                  handleChange={handleChange}
                  isViewOnly={isViewOnly}
                  portId={portId}
                />
              </OperationFormCard>
              <OperationFormCard className="operation-email-column">
                <OperationEmailPreviewPanel
                  from={reportDraft.from}
                  to={reportDraft.to}
                  cc={reportDraft.cc}
                  subject={reportDraft.subject}
                  message={reportDraft.message}
                  attachments={preArrivalReportAttachments}
                  onChange={handleReportDraftChange}
                />
              </OperationFormCard>
            </div>
          </div>
          <OperationSaveSection isViewOnly={isViewOnly} onSave={handleSaveAndSendReport} isSaving={isSavingPreArrival} />
        </div>
      </FormSection>
    </div>
  );
};

PreArrivalContent.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  ownerInitial: PropTypes.string.isRequired,
  cardUser: PropTypes.string,
  cardColor: PropTypes.string,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
  isViewOnly: PropTypes.bool,
  eventFields: PropTypes.array,
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  callTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const ArrivalContent = ({
  formValues,
  handleChange,
  cardColor,
  onAddLink,
  onRemoveLink,
  onSendReport,
  isViewOnly = false,
  arrivalStageFields = [],
  postArrivalStageFields = [],
}) => {
  const [reportDraft, setReportDraft] = useState({
    reportType: "arrival",
    from: "operations@shipping.com",
    to: "",
    cc: "",
    subject: "Report - Arrival",
    message: "",
  });

  const crewImmigrationStatusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
  ];

  const handleArrivalDocumentsAdd = (files) => {
    if (files.length > 0) {
      const currentAttachments = formValues.arrivalDocumentsAttachments || [];
      const updatedAttachments = [...currentAttachments, ...files];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("arrivalDocumentsAttachments")(syntheticEvent);
    }
  };

  const handleReportDraftChange = (field, value) => {
    setReportDraft((prev) => ({ ...prev, [field]: value }));
  };

  const getArrivalMessage = (reportType) =>
    reportType === "daily" ? buildArrivalDailyReportBody(formValues) : buildArrivalReportBody(formValues);

  useEffect(() => {
    setReportDraft((prev) => ({
      ...prev,
      message: getArrivalMessage(prev.reportType),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReportTypeChange = (nextType) => {
    setReportDraft((prev) => ({
      ...prev,
      reportType: nextType,
      subject: nextType === "daily" ? "Report - Daily Arrival" : "Report - Arrival",
      message: getArrivalMessage(nextType),
    }));
  };

  const saveArrivalData = async () => {
    console.log("Saving Arrival data:", formValues);
    // TODO: replace with Arrival save API call
    return true;
  };

  const handleSaveAndSendReport = async () => {
    const saveResult = await saveArrivalData();
    if (!saveResult) return;

    await onSendReport?.({
      tabName: reportDraft.reportType === "daily" ? "Daily Report" : "Arrival",
      from: reportDraft.from,
      to: reportDraft.to,
      cc: reportDraft.cc,
      subject: reportDraft.subject,
      body: reportDraft.message || getArrivalMessage(reportDraft.reportType),
      attachments: formValues.arrivalDocumentsAttachments || [],
    });
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Arrival Information</h3>
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="operation-tab-layout">
          <div className="arrival-form">
            <div className="operation-two-column-grid operation-two-column-grid--split-scroll">
              <OperationFormCard className="operation-form-column">
                <OperationFormCard >
                  <DynamicDateTimeFields
                    eventFields={arrivalStageFields}
                    formValues={formValues}
                    handleChange={handleChange}
                    isViewOnly={isViewOnly}
                  />
                  <DynamicDateTimeFields
                    eventFields={postArrivalStageFields}
                    formValues={formValues}
                    handleChange={handleChange}
                    isViewOnly={isViewOnly}
                  />
                </OperationFormCard>

                <FormField label="Custom Inspection Status">
                  <FormInput
                    type="text"
                    value={formValues.customInspectionStatus || "Passed"}
                    onChange={handleChange("customInspectionStatus")}
                    placeholder=""
                    disabled={isViewOnly}
                  />
                </FormField>

                {formValues.customInspectionStatus === "Failed" && (
                  <FormField label="Reason for fail" className="cf-field-full">
                    <FormTextarea
                      value={formValues.customInspectionFailReason || ""}
                      onChange={handleChange("customInspectionFailReason")}
                      placeholder="Specify reason for fail..."
                      rows={3}
                      disabled={isViewOnly}
                    />
                  </FormField>
                )}

                <FormField label="Crew immigration completed / on hold">
                  <FormSelect
                    value={formValues.crewImmigrationStatus || ""}
                    onChange={handleChange("crewImmigrationStatus")}
                    options={crewImmigrationStatusOptions}
                    placeholder="Select status..."
                    disabled={isViewOnly}
                  />
                </FormField>

                {formValues.crewImmigrationStatus === "On Hold" && (
                  <FormField label="Reason for hold (Remarks)" className="cf-field-full">
                    <FormTextarea
                      value={formValues.crewImmigrationHoldRemarks || ""}
                      onChange={handleChange("crewImmigrationHoldRemarks")}
                      placeholder="Specify reason for hold..."
                      rows={3}
                      disabled={isViewOnly}
                    />
                  </FormField>
                )}

                <FormField label="Attach Vessel Inward and Marine Work Permit Copies">
                  <OperationFileUpload
                    files={formValues.arrivalDocumentsAttachments || []}
                    onAddFiles={handleArrivalDocumentsAdd}
                    isViewOnly={isViewOnly}
                    ariaLabel="Upload arrival documents"
                  />
                </FormField>
              </OperationFormCard>
              <OperationFormCard className="operation-email-column">
                <OperationEmailPreviewPanel
                  reportType={reportDraft.reportType}
                  reportTypeOptions={[
                    { value: "arrival", label: "Arrival Report" },
                    { value: "daily", label: "Daily Report" },
                  ]}
                  from={reportDraft.from}
                  to={reportDraft.to}
                  cc={reportDraft.cc}
                  subject={reportDraft.subject}
                  message={reportDraft.message}
                  attachments={formValues.arrivalDocumentsAttachments || []}
                  onChange={handleReportDraftChange}
                  onReportTypeChange={handleReportTypeChange}
                />
              </OperationFormCard>
            </div>
          </div>
          <OperationSaveSection isViewOnly={isViewOnly} onSave={handleSaveAndSendReport} />
        </div>
      </FormSection>
    </div>
  );
};

ArrivalContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
  isViewOnly: PropTypes.bool,
  arrivalStageFields: PropTypes.array,
  postArrivalStageFields: PropTypes.array,
};

const DepartureContent = ({ formValues, handleChange, cardColor, onAddLink, onRemoveLink, onSendReport, isViewOnly = false, eventFields = [] }) => {
  const [reportDraft, setReportDraft] = useState({
    from: "operations@shipping.com",
    to: "",
    cc: "",
    subject: "Report - Departure",
    message: "",
  });

  const handleDepartureDocumentsAdd = (files) => {
    if (files.length > 0) {
      const currentAttachments = formValues.departureAttachments || [];
      const updatedAttachments = [...currentAttachments, ...files];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("departureAttachments")(syntheticEvent);
    }
  };

  useEffect(() => {
    setReportDraft((prev) => ({
      ...prev,
      message: buildDepartureReportBody(formValues),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReportDraftChange = (field, value) => {
    setReportDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveDepartureData = async () => {
    console.log("Saving Departure data:", formValues);
    // TODO: replace with Departure save API call
    return true;
  };

  const handleSaveAndSendReport = async () => {
    const saveResult = await saveDepartureData();
    if (!saveResult) return;

    await onSendReport?.({
      tabName: "Departure",
      from: reportDraft.from,
      to: reportDraft.to,
      cc: reportDraft.cc,
      subject: reportDraft.subject,
      body: reportDraft.message || buildDepartureReportBody(formValues),
      attachments: formValues.departureAttachments || [],
    });
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Departure Information</h3>
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="operation-tab-layout">
          <div className="departure-form">
            <div className="operation-two-column-grid operation-two-column-grid--split-scroll">
              <OperationFormCard className="operation-form-column">
                <FormField label="Email Requested Accept">
                  <OperationFileUpload
                    files={formValues.departureAttachments || []}
                    onAddFiles={handleDepartureDocumentsAdd}
                    isViewOnly={isViewOnly}
                    ariaLabel="Upload departure documents"
                  />
                </FormField>

                <DynamicDateTimeFields
                  eventFields={eventFields}
                  formValues={formValues}
                  handleChange={handleChange}
                  isViewOnly={isViewOnly}
                />
                <FormField label="Next port">
                  <FormInput
                    type="text"
                    value={formValues.nextPort || ""}
                    onChange={handleChange("nextPort")}
                    placeholder="Enter next port..."
                    disabled={isViewOnly}
                  />
                </FormField>
              </OperationFormCard>
              <OperationFormCard className="operation-email-column">
                <OperationEmailPreviewPanel
                  from={reportDraft.from}
                  to={reportDraft.to}
                  cc={reportDraft.cc}
                  subject={reportDraft.subject}
                  message={reportDraft.message}
                  attachments={formValues.departureAttachments || []}
                  onChange={handleReportDraftChange}
                />
              </OperationFormCard>
            </div>
          </div>
          <OperationSaveSection isViewOnly={isViewOnly} onSave={handleSaveAndSendReport} />
        </div>
      </FormSection>
    </div>
  );
};

DepartureContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
  isViewOnly: PropTypes.bool,
  eventFields: PropTypes.array,
};

const CheckListContent = ({
  card,
  formValues,
  handleChange,
  onOpenReportPreview,
  cardColor,
  isViewOnly = false,
  isDAModule = false,
  cardDetail,
  callDetailLoading = false,
}) => {
  return (
    <Checklist
      card={card}
      formValues={formValues}
      handleChange={handleChange}
      onOpenReportPreview={onOpenReportPreview}
      cardColor={cardColor}
      isViewOnly={isViewOnly}
      isDAModule={isDAModule}
      cardDetail={cardDetail}
      callDetailLoading={callDetailLoading}
    />
  );
};

CheckListContent.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  onOpenReportPreview: PropTypes.func,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  isDAModule: PropTypes.bool,
  cardDetail: PropTypes.object,
  callDetailLoading: PropTypes.bool,
};

// Dummy values for view-only mode
const getDummyValues = () => ({
  expectedArrivalDate: "2024-01-15",
  expectedArrivalTime: "10:30",
  customsInspectionDate: "2024-01-15",
  customsInspectionTime: "11:00",
  immigrationClearanceDate: "2024-01-15",
  immigrationClearanceTime: "12:00",
  inwardClearanceDate: "2024-01-15",
  inwardClearanceTime: "14:00",
  saberUtStatus: SABER_APPLIED_BY_SEDRES,
  saberUtDocumentsAttachments: [
    { name: "SABER_Certificate_001.pdf", size: 245678, type: "application/pdf" },
    { name: "SABER_UT_Document_002.pdf", size: 189234, type: "application/pdf" },
    { name: "Pre_Arrival_Documentation.pdf", size: 312456, type: "application/pdf" },
  ],
  preArrivalDocumentHandling: {
    selectedProcesses: { gro: true, customClearance: true },
    documents: {
      gro: [
        {
          id: "pre-gro-1",
          name: "GRO appointment confirmation",
          is_required: true,
          files: [{ name: "GRO_Appointment.pdf", size: 120400, type: "application/pdf" }],
        },
        { id: "pre-gro-2", name: "Berthing allocation (GRO)", is_required: false, files: [] },
      ],
      customClearance: [
        {
          id: "pre-cc-1",
          name: "Customs import declaration",
          is_required: true,
          files: [{ name: "Customs_Declaration.pdf", size: 98000, type: "application/pdf" }],
        },
        {
          id: "pre-cc-2",
          name: "Bill of lading / cargo manifest",
          is_required: true,
          files: [{ name: "BOL_Manifest.pdf", size: 210000, type: "application/pdf" }],
        },
        { id: "pre-cc-3", name: "Delivery order", is_required: false, files: [] },
      ],
    },
  },
  preArrivalDescription: "<p><strong>Pre-Arrival Summary:</strong></p><p>Vessel is expected to arrive on schedule. All pre-arrival documentation has been submitted and verified. The vessel SS Central Bay is proceeding according to the planned timeline.</p><p><strong>Documentation Status:</strong></p><ul><li>SABER certificate has been approved and uploaded</li><li>Customs inspection documents are ready</li><li>Immigration clearance paperwork is complete</li><li>All required permits have been obtained</li></ul><p><strong>Additional Notes:</strong></p><p>The vessel is currently en route and maintaining good communication. Weather conditions are favorable for arrival. All port services have been notified and are on standby. The crew is prepared for the arrival procedures.</p>",
  weatherForecast: "Normal weather",
  coordinates: "24.7136° N, 46.6753° E",
  actualArrivalDate: "2024-01-15",
  actualArrivalTime: "10:35",
  customInspectionCommencedDate: "2024-01-15",
  customInspectionCommencedTime: "11:05",
  customInspectionCompletedDate: "2024-01-15",
  customInspectionCompletedTime: "13:30",
  customInspectionStatus: "Passed",
  crewImmigrationCommencedDate: "2024-01-15",
  crewImmigrationCommencedTime: "12:05",
  crewImmigrationStatus: "Completed",
  crewImmigrationCompletedDate: "2024-01-15",
  crewImmigrationCompletedTime: "13:00",
  vesselInwardFormalitiesCompletedDate: "2024-01-15",
  vesselInwardFormalitiesCompletedTime: "14:15",
  marineWorkPermitAppliedDate: "2024-01-15",
  marineWorkPermitAppliedTime: "14:30",
  marineWorkPermitIssuedDate: "2024-01-15",
  marineWorkPermitIssuedTime: "15:00",
  marineWorkPermitExpiresDate: "2024-02-15",
  marineWorkPermitExpiresTime: "15:00",
  arrivalDocumentsAttachments: [
    { name: "Vessel_Inward_Clearance_001.pdf", size: 456789, type: "application/pdf" },
    { name: "Marine_Work_Permit_002.pdf", size: 321456, type: "application/pdf" },
    { name: "Custom_Inspection_Report.pdf", size: 234567, type: "application/pdf" },
    { name: "Immigration_Clearance_Document.pdf", size: 198765, type: "application/pdf" },
  ],
  arrivalDescription: "<p><strong>Arrival Summary:</strong></p><p>Vessel arrived on time. All clearance procedures completed successfully. The vessel SS Central Bay docked at the designated berth without any issues.</p><p><strong>Clearance Status:</strong></p><ul><li>Custom inspection: Passed without any discrepancies</li><li>Crew immigration: Completed for all crew members</li><li>Vessel inward formalities: Successfully completed</li><li>Marine work permit: Issued and valid until expiration date</li></ul><p><strong>Operational Notes:</strong></p><p>All required documentation has been submitted and verified. The vessel is now cleared for operations. Port services have been notified and are ready to commence. Weather conditions were favorable during arrival. All safety protocols were followed during the docking procedure.</p>",
  outwardClearanceRequestReceivedDate: "2024-01-20",
  outwardClearanceRequestReceivedTime: "09:00",
  outwardClearanceIssuedDate: "2024-01-20",
  outwardClearanceIssuedTime: "10:00",
  outwardClearanceDeliveredDate: "2024-01-20",
  outwardClearanceDeliveredTime: "10:30",
  vesselSailedDate: "2024-01-20",
  vesselSailedTime: "11:00",
  nextPort: "Jeddah Port",
  departureAttachments: [
    { name: "Outward_Clearance_Request_001.pdf", size: 345678, type: "application/pdf" },
    { name: "Outward_Clearance_Issued_002.pdf", size: 298765, type: "application/pdf" },
    { name: "Outward_Clearance_Delivered_003.pdf", size: 267890, type: "application/pdf" },
    { name: "Vessel_Sailing_Certificate.pdf", size: 189234, type: "application/pdf" },
  ],
  departureDescription: "<p><strong>Departure Summary:</strong></p><p>Vessel departed successfully. All outward clearance documents have been delivered and verified. The vessel SS Central Bay has completed all port formalities and is now en route to the next destination.</p><p><strong>Clearance Status:</strong></p><ul><li>Outward clearance request: Received and processed</li><li>Outward clearance issued: Completed on schedule</li><li>Outward clearance delivered: All documents delivered to vessel</li><li>Vessel sailing: Departed on time without any issues</li></ul><p><strong>Next Port Information:</strong></p><p>The vessel is proceeding to Jeddah Port as scheduled. All required documentation for the next port has been prepared and is ready. The crew has been briefed on the next port procedures. Weather conditions are favorable for the journey.</p>",
});

// Main Operation Component
async function sendOperationReportRequest(payload) {
  // Replace with a real API call (e.g. POST report email) when the backend is available.
  void payload;
  await new Promise((r) => setTimeout(r, 600));
}

function Operation({ card, formValues, handleChange, ownerInitial, isDAModule = false, isAddMode = false }) {
  const [activeOperationTab, setActiveOperationTab] = useState(OPERATION_TABS.PRE_ARRIVAL);
  const [callDetailData, setCallDetailData] = useState(null);
  const [callDetailLoading, setCallDetailLoading] = useState(false);
  const [eventTypeFieldsByStage, setEventTypeFieldsByStage] = useState({
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const lastEtaDependentRequestRef = useRef("");
  const cardColor = card?.color || "#2A00FF";

  const currentCallId = useMemo(
    () => card?.call_id ?? formValues?.call_id ?? card?.callId ?? "",
    [card?.call_id, card?.callId, formValues?.call_id]
  );
  const preArrivalPortId = useMemo(
    () =>
      callDetailData?.port_id ??
      callDetailData?.portId ??
      callDetailData?.port?.port_id ??
      formValues?.port_id ??
      formValues?.portId ??
      card?.port_id ??
      card?.portId ??
      "",
    [callDetailData, formValues?.port_id, formValues?.portId, card?.port_id, card?.portId]
  );
  const preArrivalCallTypeId = useMemo(
    () =>
      callDetailData?.call_type_id ??
      callDetailData?.callTypeId ??
      callDetailData?.call_type?.call_type_id ??
      formValues?.call_type_id ??
      formValues?.typeOfCall ??
      card?.call_type_id ??
      card?.typeOfCall ??
      "",
    [
      callDetailData,
      formValues?.call_type_id,
      formValues?.typeOfCall,
      card?.call_type_id,
      card?.typeOfCall,
    ]
  );

  useEffect(() => {
    if (isAddMode || !currentCallId) {
      setCallDetailData(null);
      setCallDetailLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setCallDetailLoading(true);
      try {
        const { data } = await callFileService.getCallDetail(currentCallId);
        const detail = data?.data ?? data ?? null;
        if (!cancelled) {
          setCallDetailData(detail);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[Operation] get_call_detail failed", e);
        if (!cancelled) setCallDetailData(null);
      } finally {
        if (!cancelled) setCallDetailLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAddMode, currentCallId]);

  useEffect(() => {
    let cancelled = false;

    if (!preArrivalPortId || !preArrivalCallTypeId) {
      setEventTypeFieldsByStage({ 2: [], 3: [], 4: [], 5: [] });
      return () => {
        cancelled = true;
      };
    }

    const loadEventTypeFields = async () => {
      try {
        const [stage2, stage3, stage4, stage5] = await Promise.all([
          stageTimeMappingService.getStageTimeObjects({
            stage_id: 2,
            port_id: preArrivalPortId,
            call_type_id: preArrivalCallTypeId,
          }),
          stageTimeMappingService.getStageTimeObjects({
            stage_id: 3,
            port_id: preArrivalPortId,
            call_type_id: preArrivalCallTypeId,
          }),
          stageTimeMappingService.getStageTimeObjects({
            stage_id: 4,
            port_id: preArrivalPortId,
            call_type_id: preArrivalCallTypeId,
          }),
          stageTimeMappingService.getStageTimeObjects({
            stage_id: 5,
            port_id: preArrivalPortId,
            call_type_id: preArrivalCallTypeId,
          }),
        ]);

        if (cancelled) return;

        setEventTypeFieldsByStage({
          2: mapEventFields(stage2?.data),
          3: mapEventFields(stage3?.data),
          4: mapEventFields(stage4?.data),
          5: mapEventFields(stage5?.data),
        });
      } catch (error) {
        if (!cancelled) {
          setEventTypeFieldsByStage({ 2: [], 3: [], 4: [], 5: [] });
        }
        // eslint-disable-next-line no-console
        console.error("[Operation] stage time objects fetch failed", error);
      }
    };

    loadEventTypeFields();

    return () => {
      cancelled = true;
    };
  }, [preArrivalPortId, preArrivalCallTypeId]);

  const preArrivalEventFields = (eventTypeFieldsByStage[2] || []).length
    ? eventTypeFieldsByStage[2]
    : FALLBACK_PRE_ARRIVAL_FIELDS;
  const firstPreArrivalField = preArrivalEventFields[0];
  const etaDateKey = firstPreArrivalField ? `${firstPreArrivalField.keyPrefix}Date` : "";
  const etaTimeKey = firstPreArrivalField ? `${firstPreArrivalField.keyPrefix}Time` : "";
  const etaDateValue = etaDateKey ? formValues?.[etaDateKey] || "" : "";
  const etaTimeValue = etaTimeKey ? formValues?.[etaTimeKey] || "" : "";
  const { arrivalStageFields, postArrivalStageFields } = useMemo(() => {
    const arrivalStageFields = (eventTypeFieldsByStage[3] || []).length
      ? [...eventTypeFieldsByStage[3]].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      : FALLBACK_ARRIVAL_FIELDS.filter((field) => field.stage_id === 2);

    const postArrivalStageFields = (eventTypeFieldsByStage[4] || []).length
      ? [...eventTypeFieldsByStage[4]].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      : FALLBACK_ARRIVAL_FIELDS.filter((field) => field.stage_id === 3);

    return { arrivalStageFields, postArrivalStageFields };
  }, [eventTypeFieldsByStage]);
  const departureEventFields = (eventTypeFieldsByStage[5] || []).length
    ? eventTypeFieldsByStage[5]
    : FALLBACK_DEPARTURE_FIELDS;
  // Merge dummy values with formValues for view-only mode (only for DA routes)
  // Dummy values take precedence to ensure all fields are populated
  const viewOnlyFormValues = isDAModule ? { ...formValues, ...getDummyValues() } : formValues;
  const isViewOnly = isDAModule;

  useEffect(() => {
    if (isViewOnly || !etaDateValue || !etaTimeValue) return;

    if (!preArrivalPortId || !preArrivalCallTypeId) return;

    const eta_date_time = `${etaDateValue} ${etaTimeValue}:00`;
    const requestKey = `${eta_date_time}|2|${preArrivalPortId}|${preArrivalCallTypeId}`;
    if (lastEtaDependentRequestRef.current === requestKey) return;
    lastEtaDependentRequestRef.current = requestKey;

    let cancelled = false;
    const loadEtaDependentTimes = async () => {
      try {
        const response = await preArrivalInfoService.getEtaDependentTimes({
          eta_date_time,
          stage_id: 2,
          port_id: preArrivalPortId,
          call_type_id: preArrivalCallTypeId,
        });
        if (cancelled) return;

        const dependentEvents = response?.data?.data || [];
        dependentEvents.forEach((eventItem) => {
          const rawDateTime = String(
            eventItem?.value || eventItem?.event_datetime || eventItem?.event_date_time || ""
          ).trim();
          if (!rawDateTime) return;

          // API shape: "YYYY-MM-DD HH:mm:ss" (or ISO-compatible variants)
          const normalizedDateTime = rawDateTime.replace("T", " ");
          const [datePart = "", timePart = ""] = normalizedDateTime.split(" ");
          const normalizedTime = timePart.slice(0, 5);
          if (!datePart || !normalizedTime) return;

          const matchedField = preArrivalEventFields.find((field) => {
            if (eventItem?.time_object_id != null && field?.event_type_id != null) {
              return Number(field.event_type_id) === Number(eventItem.time_object_id);
            }
            if (eventItem?.event_type_id != null && field?.event_type_id != null) {
              return Number(field.event_type_id) === Number(eventItem.event_type_id);
            }
            return (
              String(field?.event_name || "").trim().toLowerCase() ===
              String(eventItem?.event_name || "").trim().toLowerCase()
            );
          });

          const keyPrefix = matchedField?.keyPrefix || getEventFieldKeyPrefix(eventItem?.event_name || "");
          if (!keyPrefix) return;

          handleChange(`${keyPrefix}Date`)({ target: { value: datePart } });
          handleChange(`${keyPrefix}Time`)({ target: { value: normalizedTime } });
        });
      } catch (error) {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error("[Operation] pre_arrival/get_eta_dependent_times failed", error);
      }
    };

    loadEtaDependentTimes();

    return () => {
      cancelled = true;
    };
  }, [
    isViewOnly,
    etaDateValue,
    etaTimeValue,
    preArrivalEventFields,
    preArrivalPortId,
    preArrivalCallTypeId,
    handleChange,
  ]);

  const handleTabChange = useCallback((tab) => {
    setActiveOperationTab(tab);
  }, []);

  const handleSendReportRequest = useCallback(async (payload) => {
    try {
      await sendOperationReportRequest(payload);
      notify("Report sent successfully.", "success");
    } catch (err) {
      notify(err?.message || "Failed to send report.", "error");
    }
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
              card={card}
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              ownerInitial={ownerInitial}
              cardUser={card?.user}
              cardColor={cardColor}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              onSendReport={handleSendReportRequest}
              isViewOnly={isViewOnly}
              eventFields={preArrivalEventFields}
              portId={preArrivalPortId}
              callTypeId={preArrivalCallTypeId}
            />
          )}
          {activeOperationTab === OPERATION_TABS.CHECK_LIST && (
            <CheckListContent
              card={card}
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              cardColor={cardColor}
              isViewOnly={isViewOnly}
              isDAModule={isDAModule}
              cardDetail={callDetailData}
              callDetailLoading={callDetailLoading}
            />
          )}
          {activeOperationTab === OPERATION_TABS.ARRIVAL && (
            <ArrivalContent
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              cardColor={cardColor}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              onSendReport={handleSendReportRequest}
              isViewOnly={isViewOnly}
              arrivalStageFields={arrivalStageFields}
              postArrivalStageFields={postArrivalStageFields}
            />
          )}
          {activeOperationTab === OPERATION_TABS.DEPARTURE && (
            <DepartureContent
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              cardColor={cardColor}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              onSendReport={handleSendReportRequest}
              isViewOnly={isViewOnly}
              eventFields={departureEventFields}
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
  isDAModule: PropTypes.bool,
  isAddMode: PropTypes.bool,
};

export default Operation;

