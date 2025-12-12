import { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import GroupSettingsIcon from "../../../assets/images/cv.png";
import CircleTickIcon from "../../../assets/images/CircleTick.svg";
import Checklist from "./Checklist";
import "../../../design/scss/operations.scss";

// Constants
const OPERATION_TABS = {
  PRE_ARRIVAL: "preArrival",
  CHECK_LIST: "checkList",
  ARRIVAL: "arrival",
  DEPARTURE: "departure",
};

// Sub-components
const OperationTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: OPERATION_TABS.PRE_ARRIVAL, label: "Pre Arrival" },
    { id: OPERATION_TABS.CHECK_LIST, label: "Check List" },
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

const FormInput = ({ type = "text", value, onChange, placeholder, className = "" }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={true}
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

// React Quill Editor Component
const ReactQuillEditor = ({ value, onChange, placeholder, name = "preArrivalDescription", className = "" }) => {
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
    const syntheticEvent = { target: { value: content, name: name } };
    onChange(syntheticEvent);
  };

  return (
    <div className={`react-quill-wrapper ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Enter pre-arrival description..."}
      />
    </div>
  );
};

ReactQuillEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
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

const AttachmentsList = ({ attachments = [], onAdd, onRemove, cardColor, isDragging, onDragEnter, onDragLeave, onDragOver, onDrop, fileInputRef, onFileInputChange }) => {
  return (
    <div className="attachment-list-wrapper">
      {/* Always show drag and drop zone */}
      <div className="attachment-upload-section">
        <div
          className={`document-upload-zone ${isDragging ? "dragging" : ""}`}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ "--card-color": "#00368c" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-input-hidden"
            accept="*/*"
            multiple
            onChange={onFileInputChange}
          />
          <div className="upload-zone-content">
            <div className="upload-icon-wrapper">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: "#00368c" }}
              >
                <path
                  d="M12 15V3M12 3L8 7M12 3L16 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 11L12 6L17 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="upload-text-content">
              <p className="upload-main-text">
                Drag and drop your files here, or{" "}
                <span className="upload-link">click to browse</span>
              </p>
              <p className="upload-sub-text">Supports all file formats</p>
            </div>

            {/* Show file names inside upload zone */}
            {attachments.length > 0 && (
              <div className="upload-zone-files-list">
                {attachments.map((item, index) => (
                  <div key={index} className="upload-zone-file-item">
                    <span className="upload-zone-file-name">{item.name || item}</span>
                    <button
                      className="upload-zone-remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                      }}
                      type="button"
                      title="Remove file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

AttachmentsList.propTypes = {
  attachments: PropTypes.array,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
  cardColor: PropTypes.string,
  isDragging: PropTypes.bool,
  onDragEnter: PropTypes.func,
  onDragLeave: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  fileInputRef: PropTypes.object,
  onFileInputChange: PropTypes.func,
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

const PreArrivalContent = ({ formValues, handleChange, ownerInitial, cardUser, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink, onSendReport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const typeOfCallOptions = [
    { value: "Import", label: "Import" },
    { value: "Export", label: "Export" },
    { value: "Domestic", label: "Domestic" },
  ];

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0 && onAddAttachment) {
      files.forEach((file) => {
        const attachment = {
          name: file.name,
          file: file,
          size: file.size,
          type: file.type,
        };
        onAddAttachment(attachment);
      });
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onAddAttachment) {
      files.forEach((file) => {
        const attachment = {
          name: file.name,
          file: file,
          size: file.size,
          type: file.type,
        };
        onAddAttachment(attachment);
      });
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle save
  const handleSave = () => {
    console.log("Saving Pre Arrival data:", formValues);
    // Add your save logic here
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Pre-Arrival Information</h3>
        {onSendReport && <SendReportButton onClick={onSendReport} cardColor={cardColor} />}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <div className="card-description-wrapper">
                <FormField label="Description">
                  <ReactQuillEditor
                    value={formValues?.preArrivalDescription || ""}
                    onChange={handleChange("preArrivalDescription")}
                    placeholder="Enter pre-arrival description..."
                    name="preArrivalDescription"
                  />
                </FormField>
              </div>
            </div>

            <div className="general-info-right">
              <FormField label="Expected time of arrival">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.expectedArrivalDate || ""}
                    onChange={handleChange("expectedArrivalDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.expectedArrivalTime || ""}
                    onChange={handleChange("expectedArrivalTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Expected commencement of custom inspection">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.customsInspectionDate || ""}
                    onChange={handleChange("customsInspectionDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.customsInspectionTime || ""}
                    onChange={handleChange("customsInspectionTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Expected commencement of Immigration clearance for crew">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.immigrationClearanceDate || ""}
                    onChange={handleChange("immigrationClearanceDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.immigrationClearanceTime || ""}
                    onChange={handleChange("immigrationClearanceTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Expected completion of inward clearance">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.inwardClearanceDate || ""}
                    onChange={handleChange("inwardClearanceDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.inwardClearanceTime || ""}
                    onChange={handleChange("inwardClearanceTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Attachments">
                <AttachmentsList
                  attachments={formValues.attachments || []}
                  onAdd={onAddAttachment}
                  onRemove={onRemoveAttachment}
                  cardColor={cardColor}
                  isDragging={isDragging}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  fileInputRef={fileInputRef}
                  onFileInputChange={handleFileInputChange}
                />
              </FormField>

              <div className="form-save-button-wrapper">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
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
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
};

const ArrivalContent = ({ formValues, handleChange, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink, onSendReport }) => {
  const customInspectionStatusOptions = [
    { value: "Passed", label: "Passed" },
    { value: "Failed", label: "Failed" },
  ];

  const crewImmigrationStatusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
  ];

  // Handle save
  const handleSave = () => {
    console.log("Saving Arrival data:", formValues);
    // Add your save logic here
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Arrival Information</h3>
        {onSendReport && <SendReportButton onClick={onSendReport} cardColor={cardColor} />}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="arrival-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <div className="card-description-wrapper">
                <FormField label="Description">
                  <ReactQuillEditor
                    value={formValues?.arrivalDescription || ""}
                    onChange={handleChange("arrivalDescription")}
                    placeholder="Enter arrival description..."
                    name="arrivalDescription"
                    className="arrival-quill-editor"
                  />
                </FormField>
              </div>
            </div>

            <div className="general-info-right">
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

              <FormField label="Custom Inspection Status">
                <FormInput
                  type="text"
                  value="Passed"
                  onChange={() => { }}
                  placeholder=""
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
              <FormField label="Marine work permit expires">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.marineWorkPermitExpiresDate || ""}
                    onChange={handleChange("marineWorkPermitExpiresDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.marineWorkPermitExpiresTime || ""}
                    onChange={handleChange("marineWorkPermitExpiresTime")}
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

              <div className="form-save-button-wrapper">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
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
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
};

const DepartureContent = ({ formValues, handleChange, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink, onSendReport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0 && onAddAttachment) {
      files.forEach((file) => {
        const attachment = {
          name: file.name,
          file: file,
          size: file.size,
          type: file.type,
        };
        onAddAttachment(attachment);
      });
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0 && onAddAttachment) {
      files.forEach((file) => {
        const attachment = {
          name: file.name,
          file: file,
          size: file.size,
          type: file.type,
        };
        onAddAttachment(attachment);
      });
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
        {onSendReport && <SendReportButton onClick={onSendReport} cardColor={cardColor} />}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="departure-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <div className="card-description-wrapper">
                <FormField label="Description">
                  <ReactQuillEditor
                    value={formValues?.departureDescription || ""}
                    onChange={handleChange("departureDescription")}
                    placeholder="Enter departure description..."
                    name="departureDescription"
                    className="departure-quill-editor"
                  />
                </FormField>
              </div>
            </div>

            <div className="general-info-right">
              <FormField label="Email Requested Accept">
                <AttachmentsList
                  attachments={formValues.attachments || []}
                  onAdd={onAddAttachment}
                  onRemove={onRemoveAttachment}
                  cardColor={cardColor}
                  isDragging={isDragging}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  fileInputRef={fileInputRef}
                  onFileInputChange={handleFileInputChange}
                />
              </FormField>

              <FormField label="Request for outward clearance received">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.outwardClearanceRequestReceivedDate || ""}
                    onChange={handleChange("outwardClearanceRequestReceivedDate")}
                    placeholder="Select date"
                    disabled
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceRequestReceivedTime || ""}
                    onChange={handleChange("outwardClearanceRequestReceivedTime")}
                    placeholder="Select time"
                    disabled
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
                    disabled
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceIssuedTime || ""}
                    onChange={handleChange("outwardClearanceIssuedTime")}
                    placeholder="Select time"
                    disabled
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
                    disabled
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceDeliveredTime || ""}
                    onChange={handleChange("outwardClearanceDeliveredTime")}
                    placeholder="Select time"
                    disabled
                  />
                </div>
              </FormField>

              <FormField label="Vessel Sailed">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.vesselSailedDate || ""}
                    onChange={handleChange("vesselSailedDate")}
                    placeholder="Select date"
                    disabled
                  />
                  <input
                    type="time"
                    value={formValues.vesselSailedTime || ""}
                    onChange={handleChange("vesselSailedTime")}
                    placeholder="Select time"
                    disabled
                  />
                </div>
              </FormField>



              <FormField label="Next port">
                <FormInput
                  type="text"
                  value={formValues.nextPort || ""}
                  onChange={handleChange("nextPort")}
                  placeholder="Enter next port..."
                  disabled
                />
              </FormField>


              <div className="form-save-button-wrapper">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
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
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
};

const CheckListContent = ({ card, formValues, handleChange, onSendReport, cardColor }) => {
  return <Checklist card={card} formValues={formValues} handleChange={handleChange} onSendReport={onSendReport} cardColor={cardColor} />;
};

CheckListContent.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  onSendReport: PropTypes.func,
  cardColor: PropTypes.string,
};

// Send Report Button Component
const SendReportButton = ({ onClick, cardColor }) => {
  const handleSendReport = () => {
    if (onClick) {
      onClick();
    } else {
      console.log("Send report clicked");
      // TODO: Implement send report logic
    }
  };

  return (
    <button
      type="button"
      className="operation-send-report-btn"
      onClick={handleSendReport}
      title="Send Report"
    >
      <svg
        width="20"
        height="20"
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
      <span className="send-report-text">Send Report</span>
    </button>
  );
};

SendReportButton.propTypes = {
  onClick: PropTypes.func,
  cardColor: PropTypes.string,
};

// Main Operation Component
function Operation({ card, formValues, handleChange, ownerInitial }) {
  const [activeOperationTab, setActiveOperationTab] = useState(OPERATION_TABS.PRE_ARRIVAL);
  const cardColor = card?.color || "#2A00FF";

  const handleTabChange = useCallback((tab) => {
    setActiveOperationTab(tab);
  }, []);

  const handleSendReport = useCallback(() => {
    console.log("Sending report for tab:", activeOperationTab);
    // TODO: Implement send report logic
  }, [activeOperationTab]);

  const handleAddAttachment = useCallback((attachment) => {
    const currentAttachments = formValues.attachments || [];
    const updatedAttachments = [...currentAttachments, attachment];
    const syntheticEvent = { target: { value: updatedAttachments } };
    handleChange("attachments")(syntheticEvent);
  }, [formValues.attachments, handleChange]);

  const handleRemoveAttachment = useCallback((index) => {
    const currentAttachments = formValues.attachments || [];
    const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
    const syntheticEvent = { target: { value: updatedAttachments } };
    handleChange("attachments")(syntheticEvent);
  }, [formValues.attachments, handleChange]);

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
              onSendReport={handleSendReport}
            />
          )}
          {activeOperationTab === OPERATION_TABS.CHECK_LIST && (
            <CheckListContent
              card={card}
              formValues={formValues}
              handleChange={handleChange}
              onSendReport={handleSendReport}
              cardColor={cardColor}
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
              onSendReport={handleSendReport}
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
              onSendReport={handleSendReport}
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

