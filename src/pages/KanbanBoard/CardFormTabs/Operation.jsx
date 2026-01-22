import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import GroupSettingsIcon from "../../../assets/images/cv.png";
import CircleTickIcon from "../../../assets/images/CircleTick.svg";
import Checklist from "./Checklist";
import CustomModal from "../../../components/CustomModal";
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
    { id: OPERATION_TABS.ARRIVAL, label: "Arrival" },
    { id: OPERATION_TABS.DEPARTURE, label: "Departure" },
    { id: OPERATION_TABS.CHECK_LIST, label: "Check List" },
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

const PreArrivalContent = ({ formValues, handleChange, ownerInitial, cardUser, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink, onSendReport, isViewOnly = false }) => {
  const [isDraggingSaberUtDocuments, setIsDraggingSaberUtDocuments] = useState(false);
  const saberUtFileInputRef = useRef(null);

  const typeOfCallOptions = [
    { value: "Import", label: "Import" },
    { value: "Export", label: "Export" },
    { value: "Domestic", label: "Domestic" },
  ];

  // Handle SABER UT documents file upload
  const handleSaberUtDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSaberUtDocuments(true);
  };

  const handleSaberUtDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSaberUtDocuments(false);
  };

  const handleSaberUtDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSaberUtDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingSaberUtDocuments(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const currentAttachments = formValues.saberUtDocumentsAttachments || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("saberUtDocumentsAttachments")(syntheticEvent);
    }
  };

  const handleSaberUtFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentAttachments = formValues.saberUtDocumentsAttachments || [];
      const newAttachments = files.map((file) => ({
        name: file.name,
        file: file,
        size: file.size,
        type: file.type,
      }));
      const updatedAttachments = [...currentAttachments, ...newAttachments];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("saberUtDocumentsAttachments")(syntheticEvent);
    }
    if (saberUtFileInputRef.current) {
      saberUtFileInputRef.current.value = "";
    }
  };

  const handleSaberUtRemoveAttachment = (index) => {
    const currentAttachments = formValues.saberUtDocumentsAttachments || [];
    const updatedAttachments = currentAttachments.filter((_, i) => i !== index);
    const syntheticEvent = { target: { value: updatedAttachments } };
    handleChange("saberUtDocumentsAttachments")(syntheticEvent);
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
        {onSendReport && !isViewOnly && <SendReportButton onClick={onSendReport} cardColor={cardColor} tabName="Pre Arrival" />}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <FormField label="Expected time of arrival">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.expectedArrivalDate || ""}
                    onChange={handleChange("expectedArrivalDate")}
                    placeholder="Select date"
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.expectedArrivalTime || ""}
                    onChange={handleChange("expectedArrivalTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.customsInspectionTime || ""}
                    onChange={handleChange("customsInspectionTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.immigrationClearanceTime || ""}
                    onChange={handleChange("immigrationClearanceTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.inwardClearanceTime || ""}
                    onChange={handleChange("inwardClearanceTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
                  />
                </div>
              </FormField>

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
                        {(formValues.saberUtDocumentsAttachments || []).map((doc, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "12px",
                              marginBottom: index < (formValues.saberUtDocumentsAttachments || []).length - 1 ? "8px" : "0",
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
                      attachments={formValues.saberUtDocumentsAttachments || []}
                      onAdd={() => { }}
                      onRemove={handleSaberUtRemoveAttachment}
                      cardColor={cardColor}
                      isDragging={isDraggingSaberUtDocuments}
                      onDragEnter={handleSaberUtDragEnter}
                      onDragLeave={handleSaberUtDragLeave}
                      onDragOver={handleSaberUtDragOver}
                      onDrop={handleSaberUtDrop}
                      fileInputRef={saberUtFileInputRef}
                      onFileInputChange={handleSaberUtFileInputChange}
                    />
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
  isViewOnly: PropTypes.bool,
};

const ArrivalContent = ({ formValues, handleChange, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink, onSendReport, isViewOnly = false }) => {
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
        {onSendReport && <SendReportButton onClick={onSendReport} cardColor={cardColor} tabName="Arrival" />}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="arrival-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <FormField label="Actual time of arrival">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.actualArrivalDate || ""}
                    onChange={handleChange("actualArrivalDate")}
                    placeholder="Select date"
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.actualArrivalTime || ""}
                    onChange={handleChange("actualArrivalTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.customInspectionCommencedTime || ""}
                    onChange={handleChange("customInspectionCommencedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.customInspectionCompletedTime || ""}
                    onChange={handleChange("customInspectionCompletedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
                  />
                </div>
              </FormField>

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

              <FormField label="Crew immigration commenced">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.crewImmigrationCommencedDate || ""}
                    onChange={handleChange("crewImmigrationCommencedDate")}
                    placeholder="Select date"
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.crewImmigrationCommencedTime || ""}
                    onChange={handleChange("crewImmigrationCommencedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
                  />
                </div>
              </FormField>

              <FormField label="Crew immigration completed / on hold">
                <FormSelect
                  value={formValues.crewImmigrationStatus || ""}
                  onChange={handleChange("crewImmigrationStatus")}
                  options={crewImmigrationStatusOptions}
                  placeholder="Select status..."
                  disabled={isViewOnly}
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
                      disabled={isViewOnly}
                    />
                    <input
                      type="time"
                      value={formValues.crewImmigrationCompletedTime || ""}
                      onChange={handleChange("crewImmigrationCompletedTime")}
                      placeholder="Select time"
                      disabled={isViewOnly}
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
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.vesselInwardFormalitiesCompletedTime || ""}
                    onChange={handleChange("vesselInwardFormalitiesCompletedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.marineWorkPermitAppliedTime || ""}
                    onChange={handleChange("marineWorkPermitAppliedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.marineWorkPermitIssuedTime || ""}
                    onChange={handleChange("marineWorkPermitIssuedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.marineWorkPermitExpiresTime || ""}
                    onChange={handleChange("marineWorkPermitExpiresTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
                  />
                </div>
              </FormField>

              <FormField label="Attach Vessel Inward and Marine Work Permit Copies">
                <div style={{ position: "relative", marginTop: "8px" }}>
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

            <div className="general-info-right">
              <div className="card-description-wrapper">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formValues?.arrivalDescription || ""}
                    onChange={handleChange("arrivalDescription")}
                    placeholder="Enter arrival remarks..."
                    name="arrivalDescription"
                    className="arrival-quill-editor"
                    readOnly={isViewOnly}
                  />
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
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

const DepartureContent = ({ formValues, handleChange, cardColor, onAddAttachment, onRemoveAttachment, onAddLink, onRemoveLink, onSendReport, isViewOnly = false }) => {
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
        {onSendReport && <SendReportButton onClick={onSendReport} cardColor={cardColor} tabName="Departure" />}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="departure-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
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
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceIssuedTime || ""}
                    onChange={handleChange("outwardClearanceIssuedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.outwardClearanceDeliveredTime || ""}
                    onChange={handleChange("outwardClearanceDeliveredTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
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
                    disabled={isViewOnly}
                  />
                  <input
                    type="time"
                    value={formValues.vesselSailedTime || ""}
                    onChange={handleChange("vesselSailedTime")}
                    placeholder="Select time"
                    disabled={isViewOnly}
                  />
                </div>
              </FormField>



              <FormField label="Next port">
                <FormInput
                  type="text"
                  value={formValues.nextPort || ""}
                  onChange={handleChange("nextPort")}
                  placeholder="Enter next port..."
                  disabled={isViewOnly}
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

            <div className="general-info-right">
              <div className="card-description-wrapper">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formValues?.departureDescription || ""}
                    onChange={handleChange("departureDescription")}
                    placeholder="Enter departure remarks..."
                    name="departureDescription"
                    className="departure-quill-editor"
                    readOnly={isViewOnly}
                  />
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
  onAddAttachment: PropTypes.func,
  onRemoveAttachment: PropTypes.func,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
  isViewOnly: PropTypes.bool,
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

// Send Report Preview Modal Component
const SendReportPreviewModal = ({ show, onClose, cardColor, tabName }) => {
  const [formData, setFormData] = useState({
    from: "operations@shipping.com",
    to: "recipient@example.com",
    cc: "cc@example.com",
    bcc: "",
    subject: `Report - ${tabName}`,
    body: `This is a preview of the ${tabName} report.\n\nPlease review the details before sending.`,
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSend = () => {
    console.log("Sending report:", formData);
    // TODO: Implement actual send logic
    onClose();
  };

  const renderBody = () => (
    <div className="send-report-preview-modal">
      <div className="send-report-form">
        <div className="send-report-field">
          <label>From</label>
          <input
            type="email"
            value={formData.from}
            onChange={(e) => handleInputChange("from", e.target.value)}
            className="send-report-input"
          />
        </div>

        <div className="send-report-field">
          <label>To</label>
          <input
            type="email"
            value={formData.to}
            onChange={(e) => handleInputChange("to", e.target.value)}
            className="send-report-input"
          />
        </div>

        <div className="send-report-field">
          <label>CC</label>
          <input
            type="email"
            value={formData.cc}
            onChange={(e) => handleInputChange("cc", e.target.value)}
            className="send-report-input"
          />
        </div>

        <div className="send-report-field">
          <label>BCC</label>
          <input
            type="email"
            value={formData.bcc}
            onChange={(e) => handleInputChange("bcc", e.target.value)}
            className="send-report-input"
          />
        </div>

        <div className="send-report-field">
          <label>Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange("subject", e.target.value)}
            className="send-report-input"
          />
        </div>

        <div className="send-report-field">
          <label>Body</label>
          <textarea
            value={formData.body}
            onChange={(e) => handleInputChange("body", e.target.value)}
            className="send-report-textarea"
            rows={5}
          />
        </div>
      </div>

      <div className="send-report-actions">
        <button
          type="button"
          className="send-report-cancel-btn"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="send-report-send-btn"
          onClick={handleSend}
        >
          Send Report
        </button>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="modal-header">
      <h5 className="modal-title">Send Report Preview - {tabName}</h5>
    </div>
  );

  return (
    <CustomModal
      show={show}
      closeModal={onClose}
      body={renderBody()}
      header={renderHeader()}
      createModal={true}
      dialgName="modal-dialog modal-dialog-centered send-report-modal-dialog"
      className="modal fade send-report-modal"
    />
  );
};

SendReportPreviewModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  tabName: PropTypes.string.isRequired,
};

// Export for use in other components
export { SendReportPreviewModal };

// Send Report Button Component
const SendReportButton = ({ onClick, cardColor, tabName }) => {
  const [showPreview, setShowPreview] = useState(false);

  const handleSendReport = () => {
    setShowPreview(true);
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
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
      <SendReportPreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        cardColor={cardColor}
        tabName={tabName}
      />
    </>
  );
};

SendReportButton.propTypes = {
  onClick: PropTypes.func,
  cardColor: PropTypes.string,
  tabName: PropTypes.string.isRequired,
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
  arrivalDescription: "<p>Vessel arrived on time. All clearance procedures completed successfully.</p>",
  outwardClearanceRequestReceivedDate: "2024-01-20",
  outwardClearanceRequestReceivedTime: "09:00",
  outwardClearanceIssuedDate: "2024-01-20",
  outwardClearanceIssuedTime: "10:00",
  outwardClearanceDeliveredDate: "2024-01-20",
  outwardClearanceDeliveredTime: "10:30",
  vesselSailedDate: "2024-01-20",
  vesselSailedTime: "11:00",
  nextPort: "Jeddah Port",
  departureDescription: "<p>Vessel departed successfully. All outward clearance documents delivered.</p>",
});

// Main Operation Component
function Operation({ card, formValues, handleChange, ownerInitial, isDAModule = false }) {
  const [activeOperationTab, setActiveOperationTab] = useState(OPERATION_TABS.PRE_ARRIVAL);
  const cardColor = card?.color || "#2A00FF";

  // Merge dummy values with formValues for view-only mode (only for DA routes)
  // Dummy values take precedence to ensure all fields are populated
  const viewOnlyFormValues = isDAModule ? { ...formValues, ...getDummyValues() } : formValues;
  const isViewOnly = isDAModule;

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
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              ownerInitial={ownerInitial}
              cardUser={card?.user}
              cardColor={cardColor}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              onSendReport={handleSendReport}
              isViewOnly={isViewOnly}
            />
          )}
          {activeOperationTab === OPERATION_TABS.CHECK_LIST && (
            <CheckListContent
              card={card}
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              onSendReport={handleSendReport}
              cardColor={cardColor}
              isViewOnly={isViewOnly}
            />
          )}
          {activeOperationTab === OPERATION_TABS.ARRIVAL && (
            <ArrivalContent
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              cardColor={cardColor}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              onSendReport={handleSendReport}
              isViewOnly={isViewOnly}
            />
          )}
          {activeOperationTab === OPERATION_TABS.DEPARTURE && (
            <DepartureContent
              formValues={viewOnlyFormValues}
              handleChange={handleChange}
              cardColor={cardColor}
              onAddAttachment={handleAddAttachment}
              onRemoveAttachment={handleRemoveAttachment}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              onSendReport={handleSendReport}
              isViewOnly={isViewOnly}
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
};

export default Operation;

