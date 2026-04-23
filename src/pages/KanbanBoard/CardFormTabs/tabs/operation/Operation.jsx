import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import GroupSettingsIcon from "../../../../../assets/images/cv.png";
import CircleTickIcon from "../../../../../assets/images/CircleTick.svg";
import Checklist from "../appointment/Checklist";
import { notify } from "../../../../../components/Toaster";
import callFileService from "../../../../../services/callFileService";
import eventTypeService from "../../../../../services/eventTypeService";
import { SendReportFullWidthView, SendReportButton } from "../../services/sendReportFullWidthView";
import {
  buildPreArrivalReportBody,
  buildArrivalReportBody,
  buildArrivalDailyReportBody,
  buildDepartureReportBody,
} from "../../services/sendReportBodyBuilder";
import AttachmentsList from "../appointment/AttachmentsList";
import NavTabButton from "../../../../../components/NavTabButton";
import {
  DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING,
  collectPreArrivalProcessAttachments,
} from "./preArrivalDocumentHandling";
import "../../../../../design/scss/operations.scss";

// Constants
const OPERATION_TABS = {
  PRE_ARRIVAL: "preArrival",
  CHECK_LIST: "checkList",
  ARRIVAL: "arrival",
  DEPARTURE: "departure",
};

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

const mapEventFields = (responseData) =>
  (responseData?.fields || [])
    .filter((field) => field?.event_type === "datetime" && field?.event_name)
    .map((field, index) => ({
      ...field,
      keyPrefix: getEventFieldKeyPrefix(field.event_name),
      sort_order: Number(field?.sort_order ?? index + 1),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);

const FALLBACK_PRE_ARRIVAL_FIELDS = [
  { event_name: "Expected time of arrival", keyPrefix: "expectedArrival", sort_order: 1 },
  { event_name: "Expected commencement of custom inspection", keyPrefix: "customsInspection", sort_order: 2 },
  { event_name: "Expected commencement of Immigration clearance for crew", keyPrefix: "immigrationClearance", sort_order: 3 },
  { event_name: "Expected completion of inward clearance", keyPrefix: "inwardClearance", sort_order: 4 },
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

const DynamicDateTimeFields = ({ eventFields = [], formValues, handleChange, isViewOnly = false }) => {
  if (!eventFields.length) return null;

  return eventFields.map((field) => {
    const keyPrefix = field.keyPrefix;
    const dateKey = `${keyPrefix}Date`;
    const timeKey = `${keyPrefix}Time`;
    const label = field.is_required ? `${field.event_name} *` : field.event_name;

    return (
      <FormField key={`${field.stage_id || "stage"}-${field.event_name}-${keyPrefix}`} label={label}>
        <div className="cf-input date-time-row">
          <input
            type="date"
            value={formValues[dateKey] || ""}
            onChange={handleChange(dateKey)}
            placeholder="Select date"
            disabled={isViewOnly}
          />
          <input
            type="time"
            value={formValues[timeKey] || ""}
            onChange={handleChange(timeKey)}
            placeholder="Select time"
            disabled={isViewOnly}
          />
        </div>
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

// React Quill Editor Component
const ReactQuillEditor = ({ value, onChange, placeholder, name = "preArrivalDescription", className = "", readOnly = false }) => {
  const quillRef = useRef(null);

  const modules = {
    toolbar: readOnly ? false : [
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
    const syntheticEvent = { target: { value: content, name: name } };
    onChange(syntheticEvent);
  };

  return (
    <div className={`react-quill-wrapper ${className}`} style={readOnly ? {
      maxHeight: "350px",
      overflowY: "auto"
    } : {}}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Enter pre-arrival description..."}
        readOnly={readOnly}
        style={readOnly ? {
          height: "auto",
          minHeight: "200px"
        } : {}}
      />
      {readOnly && (
        <style>{`
          .react-quill-wrapper .ql-editor {
            max-height: 320px;
            overflow-y: auto;
            padding: 12px;
          }
          .react-quill-wrapper .ql-container {
            height: auto;
            min-height: 200px;
          }
        `}</style>
      )}
    </div>
  );
};

ReactQuillEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  readOnly: PropTypes.bool,
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
      <div className="document-row-status">{isRequired ? <IconAsteriskRequired /> : <span className="document-row-optional" />}</div>
      <div className="document-row-file compact-file-upload-files">
        {hasFiles ? (
          <div className="compact-file-upload-summary" title={files.map((doc) => doc.name).join("\n")}>
            {files.length === 1 ? "1 file selected" : `${files.length} files selected`}
          </div>
        ) : (
          <span className="document-row-filename document-row-filename--empty">No files</span>
        )}
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

const SaberUploadBox = ({ files = [], onAddFiles, isViewOnly = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const appendFromFileList = (fileList) => {
    const selectedFiles = Array.from(fileList || []);
    if (!selectedFiles.length) return;
    const mapped = selectedFiles.map((file) => ({
      name: file.name,
      file,
      size: file.size,
      type: file.type,
    }));
    onAddFiles(mapped);
  };

  const handleDragEnter = (e) => {
    if (isViewOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (isViewOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    if (isViewOnly) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    if (isViewOnly) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    appendFromFileList(e.dataTransfer?.files);
  };

  const handleInputChange = (e) => {
    appendFromFileList(e.target.files);
    e.target.value = "";
  };

  return (
    <div>
      <div
        className={`saber-upload-dropzone${isDragging ? " saber-upload-dropzone--active" : ""}${isViewOnly ? " saber-upload-dropzone--disabled" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
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
        aria-label="Upload SABER certificate files"
      >
        <div className="saber-upload-content">
          <p className="saber-upload-primary-text">
            Drag and drop your files here, or{" "}
            <span
              className="saber-upload-browse-link"
              onClick={(e) => {
                e.stopPropagation();
                if (!isViewOnly) inputRef.current?.click();
              }}
            >
              click to browse
            </span>
          </p>
          <p className="saber-upload-helper-text">Supports all file formats</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="document-row-file-input"
          multiple
          onChange={handleInputChange}
          aria-hidden
          tabIndex={-1}
        />
      </div>
      <div className="saber-upload-file-summary" title={(files || []).map((doc) => doc.name).join("\n")}>
        {(files || []).length === 0
          ? "No files selected"
          : files.length === 1
            ? "1 file selected"
            : `${files.length} files selected`}
      </div>
    </div>
  );
};

SaberUploadBox.propTypes = {
  files: PropTypes.array,
  onAddFiles: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
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

function PreArrivalDocumentHandlingSection({ formValues, handleChange, isViewOnly }) {
  const dh = formValues.preArrivalDocumentHandling || DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING;

  const setDh = (next) => {
    handleChange("preArrivalDocumentHandling")({ target: { value: next } });
  };

  const toggleProcess = (key) => {
    if (isViewOnly) return;
    setDh({
      ...dh,
      selectedProcesses: { ...dh.selectedProcesses, [key]: !dh.selectedProcesses[key] },
    });
  };

  const patchRowFiles = (processKey, rowId, nextFiles) => {
    const rows = (dh.documents[processKey] || []).map((r) => (r.id === rowId ? { ...r, files: nextFiles } : r));
    setDh({ ...dh, documents: { ...dh.documents, [processKey]: rows } });
  };

  const { gro: groOn, customClearance: ccOn } = dh.selectedProcesses || {};

  return (
    <div className="document-handling-section">
      <div className="document-handling-section__divider" />
      <h3 className="document-handling-section__heading">Document handling</h3>
      <p className="document-handling-section__hint">Select the processes that apply. Uploads are tracked separately for each group.</p>

      <div className="process-selector-row" role="group" aria-label="Document process selection">
        <span className="process-selector-row__label">Include</span>
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
          Custom clearance
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
    </div>
  );
}

PreArrivalDocumentHandlingSection.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

const PreArrivalContent = ({ formValues, handleChange, ownerInitial, cardUser, cardColor, onAddLink, onRemoveLink, onOpenReportPreview, isViewOnly = false, eventFields = [] }) => {
  const handleSaberUtAddFiles = (files) => {
    const currentAttachments = formValues.saberUtDocumentsAttachments || [];
    handleChange("saberUtDocumentsAttachments")({ target: { value: [...currentAttachments, ...files] } });
  };

  const handleSave = () => {
    console.log("Saving Pre Arrival data:", formValues);
  };

  const preArrivalReportAttachments = () => [
    ...(formValues.saberUtDocumentsAttachments || []),
    ...collectPreArrivalProcessAttachments(formValues.preArrivalDocumentHandling),
  ];

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Pre-Arrival Information</h3>
        {onOpenReportPreview && !isViewOnly && (
          <SendReportButton
            onClick={() =>
              onOpenReportPreview({
                tabName: "Pre Arrival",
                formSectionLabel: "Pre-Arrival Information",
                getBody: () => buildPreArrivalReportBody(formValues),
                getAttachments: preArrivalReportAttachments,
              })
            }
            cardColor={cardColor}
            tabName="Pre Arrival"
          />
        )}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="general-info-two-column operation-section-form-layout prearrival-top-grid">
            <div className="general-info-left prearrival-left-column">
              <DynamicDateTimeFields
                eventFields={eventFields}
                formValues={formValues}
                handleChange={handleChange}
                isViewOnly={isViewOnly}
              />

              <FormField label="SABER Status">
                <FormInput
                  type="text"
                  value={formValues.saberUtStatus || ""}
                  onChange={handleChange("saberUtStatus")}
                  placeholder="Enter SABER Status..."
                  disabled={isViewOnly}
                />
              </FormField>

              <FormField label="SABER Certificate Upload">
                <SaberUploadBox
                  files={formValues.saberUtDocumentsAttachments || []}
                  onAddFiles={handleSaberUtAddFiles}
                  isViewOnly={isViewOnly}
                />
              </FormField>
            </div>

            <div className="general-info-right prearrival-right-column">
              <div
                className="card-description-wrapper"
                style={{
                  minHeight: isViewOnly ? "300px" : "auto",
                  maxHeight: isViewOnly ? "400px" : "none",
                  overflowY: isViewOnly ? "auto" : "visible",
                }}
              >
                <FormField label="Remarks">
                  <div
                    style={
                      isViewOnly
                        ? {
                            maxHeight: "350px",
                            overflowY: "auto",
                            padding: "8px",
                            border: "1px solid #e2e2ea",
                            borderRadius: "4px",
                            backgroundColor: "#ffffff",
                          }
                        : {}
                    }
                  >
                    <ReactQuillEditor
                      value={formValues?.preArrivalDescription || ""}
                      onChange={handleChange("preArrivalDescription")}
                      placeholder="Enter pre-arrival remarks..."
                      name="preArrivalDescription"
                      readOnly={isViewOnly}
                    />
                  </div>
                </FormField>
              </div>
              <div className="card-description-wrapper">
                <FormField label="Weather Forecast">
                  <FormInput
                    type="text"
                    value={formValues?.weatherForecast || ""}
                    onChange={handleChange("weatherForecast")}
                    placeholder="Enter weather forecast..."
                    disabled={isViewOnly}
                  />
                </FormField>
              </div>
              <div className="card-description-wrapper">
                <FormField label="Coordinates">
                  <FormInput
                    type="text"
                    value={formValues?.coordinates || ""}
                    onChange={handleChange("coordinates")}
                    placeholder="Enter coordinates..."
                    disabled={isViewOnly}
                  />
                </FormField>
              </div>
            </div>
          </div>

          <PreArrivalDocumentHandlingSection formValues={formValues} handleChange={handleChange} isViewOnly={isViewOnly} />

          {!isViewOnly && (
            <div className="prearrival-actions">
              <button type="button" className="form-save-button prearrival-save-button" onClick={handleSave}>
                Save
              </button>
            </div>
          )}
        </div>
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
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onOpenReportPreview: PropTypes.func,
  isViewOnly: PropTypes.bool,
  eventFields: PropTypes.array,
};

const ArrivalContent = ({
  formValues,
  handleChange,
  cardColor,
  onAddLink,
  onRemoveLink,
  onOpenReportPreview,
  isViewOnly = false,
  arrivalStageFields = [],
  postArrivalStageFields = [],
}) => {
  const [isDraggingDocuments, setIsDraggingDocuments] = useState(false);
  const documentsFileInputRef = useRef(null);

  const customInspectionStatusOptions = [
    { value: "Passed", label: "Passed" },
    { value: "Failed", label: "Failed" },
  ];

  const crewImmigrationStatusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
  ];

  // Handle documents file upload (single upload below Marine work permit expires)
  const handleDocumentsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(true);
  };

  const handleDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(false);
  };

  const handleDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocuments(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const currentAttachments = formValues.arrivalDocumentsAttachments || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("arrivalDocumentsAttachments")(syntheticEvent);
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentAttachments = formValues.arrivalDocumentsAttachments || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("arrivalDocumentsAttachments")(syntheticEvent);
    }
    if (documentsFileInputRef.current) {
      documentsFileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const currentAttachments = formValues.arrivalDocumentsAttachments || [];
    const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
    const syntheticEvent = { target: { value: updatedAttachments } };
    handleChange("arrivalDocumentsAttachments")(syntheticEvent);
  };

  const handleSendDocuments = () => {
    console.log("Sending documents:", formValues.arrivalDocumentsAttachments);
    // TODO: Implement send documents logic
  };

  // Handle save
  const handleSave = () => {
    console.log("Saving Arrival data:", formValues);
    // Add your save logic here
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Arrival Information</h3>
        {onOpenReportPreview && !isViewOnly && (
          <div style={{ display: "flex", gap: "8px" }}>
            <SendReportButton
              onClick={() =>
                onOpenReportPreview({
                  tabName: "Arrival",
                  formSectionLabel: "Arrival Information",
                  getBody: () => buildArrivalReportBody(formValues),
                  getAttachments: () => formValues.arrivalDocumentsAttachments || [],
                })
              }
              cardColor={cardColor}
              tabName="Arrival"
            />
            <SendReportButton
              onClick={() =>
                onOpenReportPreview({
                  tabName: "Daily Report",
                  formSectionLabel: "Daily Report — Arrival",
                  getBody: () => buildArrivalDailyReportBody(formValues),
                  getAttachments: () => formValues.arrivalDocumentsAttachments || [],
                })
              }
              cardColor={cardColor}
              tabName="Daily Report"
              label="Daily Report"
            />
          </div>
        )}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="arrival-form">
          <div className="general-info-two-column operation-section-form-layout">
            <div className="general-info-left">
              <DynamicDateTimeFields
                eventFields={arrivalStageFields}
                formValues={formValues}
                handleChange={handleChange}
                isViewOnly={isViewOnly}
              />

              <FormField label="Custom Inspection Status">
                <FormInput
                  type="text"
                  value={formValues.customInspectionStatus || "Passed"}
                  onChange={() => { }}
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

              <DynamicDateTimeFields
                eventFields={postArrivalStageFields}
                formValues={formValues}
                handleChange={handleChange}
                isViewOnly={isViewOnly}
              />

              <FormField label="Attach Vessel Inward and Marine Work Permit Copies">
                <div style={{ marginTop: "8px" }}>
                  {isViewOnly ? (
                    // View-only mode: Show dummy documents list
                    <div className="attachment-list-wrapper">
                      <div style={{
                        padding: "16px",
                        border: "1px solid #e2e2ea",
                        borderRadius: "8px",
                        backgroundColor: "#f8f9fa"
                      }}>
                        {(formValues.arrivalDocumentsAttachments || []).map((doc, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px",
                              marginBottom: index < (formValues.arrivalDocumentsAttachments || []).length - 1 ? "8px" : "0",
                              backgroundColor: "#ffffff",
                              borderRadius: "6px",
                              border: "1px solid #e2e2ea"
                            }}
                          >
                            <div style={{ marginRight: "12px", color: "#666" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                              </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#1a1a1a",
                                marginBottom: "4px"
                              }}>
                                {doc.name}
                              </div>
                              {doc.size && (
                                <div style={{
                                  fontSize: "12px",
                                  color: "#666"
                                }}>
                                  {(doc.size / 1024).toFixed(2)} KB
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // Handle view action
                                console.log("View document:", doc.name);
                              }}
                              style={{
                                marginLeft: "12px",
                                padding: "8px",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#3e5cb6",
                                borderRadius: "4px",
                                transition: "background-color 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f0f0f0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                              title="View document"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <AttachmentsList
                        attachments={formValues.arrivalDocumentsAttachments || []}
                        onAdd={() => { }}
                        onRemove={handleDocumentsRemoveAttachment}
                        cardColor={cardColor}
                        isDragging={isDraggingDocuments}
                        onDragEnter={handleDocumentsDragEnter}
                        onDragLeave={handleDocumentsDragLeave}
                        onDragOver={handleDocumentsDragOver}
                        onDrop={handleDocumentsDrop}
                        fileInputRef={documentsFileInputRef}
                        onFileInputChange={handleDocumentsFileInputChange}
                      />
                      <button
                        type="button"
                        onClick={handleSendDocuments}
                        className="document-send-btn"
                        title="Send documents"
                        disabled={(formValues.arrivalDocumentsAttachments || []).length === 0}
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          background: (formValues.arrivalDocumentsAttachments || []).length > 0 ? "#3e5cb6" : "#c5c5d1",
                          border: "none",
                          borderRadius: "6px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: (formValues.arrivalDocumentsAttachments || []).length > 0 ? "pointer" : "not-allowed",
                          color: "#ffffff",
                          transition: "all 0.2s ease",
                          zIndex: 10,
                          boxShadow: (formValues.arrivalDocumentsAttachments || []).length > 0 ? "0 2px 6px rgba(62, 94, 189, 0.3)" : "none",
                          opacity: (formValues.arrivalDocumentsAttachments || []).length > 0 ? 1 : 0.6,
                        }}
                        onMouseEnter={(e) => {
                          if ((formValues.arrivalDocumentsAttachments || []).length > 0) {
                            e.currentTarget.style.background = "#2e4a8f";
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(62, 94, 189, 0.4)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if ((formValues.arrivalDocumentsAttachments || []).length > 0) {
                            e.currentTarget.style.background = "#3e5cb6";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(62, 94, 189, 0.3)";
                          } else {
                            e.currentTarget.style.background = "#c5c5d1";
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M22 2L11 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 2L15 22L11 13L2 9L22 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </FormField>

              {!isViewOnly && (
                <div className="form-save-button-wrapper">
                  <button
                    type="button"
                    className="form-save-button"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="general-info-right">
              <div className="card-description-wrapper" style={{
                minHeight: isViewOnly ? "300px" : "auto",
                maxHeight: isViewOnly ? "400px" : "none",
                overflowY: isViewOnly ? "auto" : "visible"
              }}>
                <FormField label="Remarks">
                  <div style={isViewOnly ? {
                    maxHeight: "350px",
                    overflowY: "auto",
                    padding: "8px",
                    border: "1px solid #e2e2ea",
                    borderRadius: "4px",
                    backgroundColor: "#ffffff"
                  } : {}}>
                    <ReactQuillEditor
                      value={formValues?.arrivalDescription || ""}
                      onChange={handleChange("arrivalDescription")}
                      placeholder="Enter arrival remarks..."
                      name="arrivalDescription"
                      className="arrival-quill-editor"
                      readOnly={isViewOnly}
                    />
                  </div>
                </FormField>
              </div>
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
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onOpenReportPreview: PropTypes.func,
  isViewOnly: PropTypes.bool,
  arrivalStageFields: PropTypes.array,
  postArrivalStageFields: PropTypes.array,
};

const DepartureContent = ({ formValues, handleChange, cardColor, onAddLink, onRemoveLink, onOpenReportPreview, isViewOnly = false, eventFields = [] }) => {
  const [isDraggingDepartureDocuments, setIsDraggingDepartureDocuments] = useState(false);
  const departureFileInputRef = useRef(null);

  const handleDepartureDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDepartureDocuments(true);
  };

  const handleDepartureDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDepartureDocuments(false);
  };

  const handleDepartureDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDepartureDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDepartureDocuments(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const currentAttachments = formValues.departureAttachments || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("departureAttachments")(syntheticEvent);
    }
  };

  const handleDepartureFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentAttachments = formValues.departureAttachments || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("departureAttachments")(syntheticEvent);
    }
    if (departureFileInputRef.current) {
      departureFileInputRef.current.value = "";
    }
  };

  const handleDepartureRemoveAttachment = (index) => {
    const currentAttachments = formValues.departureAttachments || [];
    const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
    const syntheticEvent = { target: { value: updatedAttachments } };
    handleChange("departureAttachments")(syntheticEvent);
  };

  // Handle save
  const handleSave = () => {
    console.log("Saving Departure data:", formValues);
    // Add your save logic here
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Departure Information</h3>
        {onOpenReportPreview && !isViewOnly && (
          <SendReportButton
            onClick={() =>
              onOpenReportPreview({
                tabName: "Departure",
                formSectionLabel: "Departure Information",
                getBody: () => buildDepartureReportBody(formValues),
                getAttachments: () => formValues.departureAttachments || [],
              })
            }
            cardColor={cardColor}
            tabName="Departure"
          />
        )}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="departure-form">
          <div className="general-info-two-column operation-section-form-layout">
            <div className="general-info-left">
              <FormField label="Email Requested Accept">
                <div style={{ marginTop: "8px" }}>
                  {isViewOnly ? (
                    // View-only mode: Show dummy documents list
                    <div className="attachment-list-wrapper">
                      <div style={{
                        padding: "16px",
                        border: "1px solid #e2e2ea",
                        borderRadius: "8px",
                        backgroundColor: "#f8f9fa"
                      }}>
                        {(formValues.departureAttachments || []).map((doc, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px",
                              marginBottom: index < (formValues.departureAttachments || []).length - 1 ? "8px" : "0",
                              backgroundColor: "#ffffff",
                              borderRadius: "6px",
                              border: "1px solid #e2e2ea"
                            }}
                          >
                            <div style={{ marginRight: "12px", color: "#666" }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                              </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#1a1a1a",
                                marginBottom: "4px"
                              }}>
                                {doc.name}
                              </div>
                              {doc.size && (
                                <div style={{
                                  fontSize: "12px",
                                  color: "#666"
                                }}>
                                  {(doc.size / 1024).toFixed(2)} KB
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // Handle view action
                                console.log("View document:", doc.name);
                              }}
                              style={{
                                marginLeft: "12px",
                                padding: "8px",
                                border: "none",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#3e5cb6",
                                borderRadius: "4px",
                                transition: "background-color 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#f0f0f0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                              title="View document"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <AttachmentsList
                      attachments={formValues.departureAttachments || []}
                      onAdd={() => { }}
                      onRemove={handleDepartureRemoveAttachment}
                      cardColor={cardColor}
                      isDragging={isDraggingDepartureDocuments}
                      onDragEnter={handleDepartureDragEnter}
                      onDragLeave={handleDepartureDragLeave}
                      onDragOver={handleDepartureDragOver}
                      onDrop={handleDepartureDrop}
                      fileInputRef={departureFileInputRef}
                      onFileInputChange={handleDepartureFileInputChange}
                    />
                  )}
                </div>
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


              {!isViewOnly && (
                <div className="form-save-button-wrapper">
                  <button
                    type="button"
                    className="form-save-button"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="general-info-right">
              <div className="card-description-wrapper" style={{
                minHeight: isViewOnly ? "300px" : "auto",
                maxHeight: isViewOnly ? "400px" : "none",
                overflowY: isViewOnly ? "auto" : "visible"
              }}>
                <FormField label="Remarks">
                  <div style={isViewOnly ? {
                    maxHeight: "350px",
                    overflowY: "auto",
                    padding: "8px",
                    border: "1px solid #e2e2ea",
                    borderRadius: "4px",
                    backgroundColor: "#ffffff"
                  } : {}}>
                    <ReactQuillEditor
                      value={formValues?.departureDescription || ""}
                      onChange={handleChange("departureDescription")}
                      placeholder="Enter departure remarks..."
                      name="departureDescription"
                      className="departure-quill-editor"
                      readOnly={isViewOnly}
                    />
                  </div>
                </FormField>
              </div>
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
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onOpenReportPreview: PropTypes.func,
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
  saberUtStatus: "Approved",
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
  weatherForecast: "Clear skies, 25°C, light winds",
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
  const [viewMode, setViewMode] = useState("form");
  const [reportPreviewConfig, setReportPreviewConfig] = useState(null);
  const [callDetailData, setCallDetailData] = useState(null);
  const [callDetailLoading, setCallDetailLoading] = useState(false);
  const [eventTypeFieldsByStage, setEventTypeFieldsByStage] = useState({
    1: [],
    2: [],
    3: [],
    4: [],
  });
  const cardColor = card?.color || "#2A00FF";

  const currentCallId = useMemo(
    () => card?.call_id ?? formValues?.call_id ?? card?.callId ?? "",
    [card?.call_id, card?.callId, formValues?.call_id]
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

    const loadEventTypeFields = async () => {
      try {
        const [stage1, stage2, stage3, stage4] = await Promise.all([
          eventTypeService.getEventTypesByStage(1),
          eventTypeService.getEventTypesByStage(2),
          eventTypeService.getEventTypesByStage(3),
          eventTypeService.getEventTypesByStage(4),
        ]);

        if (cancelled) return;

        setEventTypeFieldsByStage({
          1: mapEventFields(stage1?.data),
          2: mapEventFields(stage2?.data),
          3: mapEventFields(stage3?.data),
          4: mapEventFields(stage4?.data),
        });
      } catch (error) {
        if (!cancelled) {
          setEventTypeFieldsByStage({ 1: [], 2: [], 3: [], 4: [] });
        }
        // eslint-disable-next-line no-console
        console.error("[Operation] eventtypes fetch failed", error);
      }
    };

    loadEventTypeFields();

    return () => {
      cancelled = true;
    };
  }, []);

  const preArrivalEventFields = (eventTypeFieldsByStage[1] || []).length
    ? eventTypeFieldsByStage[1]
    : FALLBACK_PRE_ARRIVAL_FIELDS;
  const { arrivalStageFields, postArrivalStageFields } = useMemo(() => {
    const arrivalStageFields = (eventTypeFieldsByStage[2] || []).length
      ? [...eventTypeFieldsByStage[2]].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      : FALLBACK_ARRIVAL_FIELDS.filter((field) => field.stage_id === 2);

    const postArrivalStageFields = (eventTypeFieldsByStage[3] || []).length
      ? [...eventTypeFieldsByStage[3]].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      : FALLBACK_ARRIVAL_FIELDS.filter((field) => field.stage_id === 3);

    return { arrivalStageFields, postArrivalStageFields };
  }, [eventTypeFieldsByStage]);
  const departureEventFields = (eventTypeFieldsByStage[4] || []).length
    ? eventTypeFieldsByStage[4]
    : FALLBACK_DEPARTURE_FIELDS;

  // Merge dummy values with formValues for view-only mode (only for DA routes)
  // Dummy values take precedence to ensure all fields are populated
  const viewOnlyFormValues = isDAModule ? { ...formValues, ...getDummyValues() } : formValues;
  const isViewOnly = isDAModule;

  const handleTabChange = useCallback((tab) => {
    setActiveOperationTab(tab);
    setViewMode("form");
  }, []);

  const handleOpenReportPreview = useCallback((config) => {
    setReportPreviewConfig(config);
    setViewMode("reportPreview");
  }, []);

  const handleBackToForm = useCallback(() => {
    setViewMode("form");
  }, []);

  const handleSendReportRequest = useCallback(async (payload) => {
    try {
      await sendOperationReportRequest(payload);
      notify("Report sent successfully.", "success");
      setViewMode("form");
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

  const showSendReportView = viewMode === "reportPreview" && reportPreviewConfig;

  return (
    <div className="operation-wrapper" style={{ "--card-color": cardColor }}>
      <div className="operation-content-container">
        <OperationTabs
          activeTab={activeOperationTab}
          onTabChange={handleTabChange}
        />
        <div
          className={`operation-right${showSendReportView ? " operation-right--send-report" : ""}`}
        >
          {/* Keep form mounted but hidden in report mode so local component state (e.g. Checklist) is preserved */}
          <div
            className="operation-form-pane"
            style={{ display: showSendReportView ? "none" : "block" }}
            aria-hidden={showSendReportView}
          >
            {activeOperationTab === OPERATION_TABS.PRE_ARRIVAL && (
              <PreArrivalContent
                formValues={viewOnlyFormValues}
                handleChange={handleChange}
                ownerInitial={ownerInitial}
                cardUser={card?.user}
                cardColor={cardColor}
                onAddLink={handleAddLink}
                onRemoveLink={handleRemoveLink}
                onOpenReportPreview={handleOpenReportPreview}
                isViewOnly={isViewOnly}
                eventFields={preArrivalEventFields}
              />
            )}
            {activeOperationTab === OPERATION_TABS.CHECK_LIST && (
              <CheckListContent
                card={card}
                formValues={viewOnlyFormValues}
                handleChange={handleChange}
                onOpenReportPreview={handleOpenReportPreview}
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
                onOpenReportPreview={handleOpenReportPreview}
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
                onOpenReportPreview={handleOpenReportPreview}
                isViewOnly={isViewOnly}
                eventFields={departureEventFields}
              />
            )}
          </div>
          {showSendReportView && (
            <div className="operation-report-pane">
              <SendReportFullWidthView
                tabName={reportPreviewConfig.tabName}
                formSectionLabel={reportPreviewConfig.formSectionLabel}
                getBody={reportPreviewConfig.getBody}
                getAttachments={reportPreviewConfig.getAttachments}
                onBack={handleBackToForm}
                onSend={handleSendReportRequest}
              />
            </div>
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

