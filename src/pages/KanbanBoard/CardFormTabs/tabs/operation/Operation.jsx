import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import GroupSettingsIcon from "../../../../../assets/images/cv.png";
import CircleTickIcon from "../../../../../assets/images/CircleTick.svg";
import Checklist from "../appointment/Checklist";
import { notify } from "../../../../../components/Toaster";
import { SendReportFullWidthView, SendReportButton } from "../../services/sendReportFullWidthView";
import {
  buildPreArrivalReportBody,
  buildArrivalReportBody,
  buildArrivalDailyReportBody,
  buildDepartureReportBody,
} from "../../services/sendReportBodyBuilder";
import AttachmentsList from "../appointment/AttachmentsList";
import NavTabButton from "../../../../../components/NavTabButton";
import "../../../../../design/scss/operations.scss";

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

const PreArrivalContent = ({ formValues, handleChange, ownerInitial, cardUser, cardColor, onAddLink, onRemoveLink, onOpenReportPreview, isViewOnly = false }) => {
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
        {onOpenReportPreview && !isViewOnly && (
          <SendReportButton
            onClick={() =>
              onOpenReportPreview({
                tabName: "Pre Arrival",
                formSectionLabel: "Pre-Arrival Information",
                getBody: () => buildPreArrivalReportBody(formValues),
                getAttachments: () => formValues.saberUtDocumentsAttachments || [],
              })
            }
            cardColor={cardColor}
            tabName="Pre Arrival"
          />
        )}
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="general-info-two-column operation-section-form-layout">
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
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onOpenReportPreview: PropTypes.func,
  isViewOnly: PropTypes.bool,
};

const ArrivalContent = ({ formValues, handleChange, cardColor, onAddLink, onRemoveLink, onOpenReportPreview, isViewOnly = false }) => {
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
};

const DepartureContent = ({ formValues, handleChange, cardColor, onAddLink, onRemoveLink, onOpenReportPreview, isViewOnly = false }) => {
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
};

const CheckListContent = ({ card, formValues, handleChange, onOpenReportPreview, cardColor, isViewOnly = false, isDAModule = false }) => {
  return (
    <Checklist
      card={card}
      formValues={formValues}
      handleChange={handleChange}
      onOpenReportPreview={onOpenReportPreview}
      cardColor={cardColor}
      isViewOnly={isViewOnly}
      isDAModule={isDAModule}
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

function Operation({ card, formValues, handleChange, ownerInitial, isDAModule = false }) {
  const [activeOperationTab, setActiveOperationTab] = useState(OPERATION_TABS.PRE_ARRIVAL);
  const [viewMode, setViewMode] = useState("form");
  const [reportPreviewConfig, setReportPreviewConfig] = useState(null);
  const cardColor = card?.color || "#2A00FF";

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
};

export default Operation;

