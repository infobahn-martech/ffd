import PropTypes from "prop-types";
import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../../../../../design/scss/general.scss";
import "../../../../../design/css/CardForm.css";
import AttachmentIcon from "../../../../../assets/images/Attachment.svg";
import callFileService from "../../../../../services/callFileService";
import portService from "../../../../../services/portService";
import CommonService from "../../../../../services/commonService";
import billingEntityService from "../../../../../services/billingEntityService";
import billingInstructionService from "../../../../../services/billingInstructionService";
import vesselTypeService from "../../../../../services/vesselTypeService";
import bargeTypeService from "../../../../../services/bargeTypeService";
import vesselService from "../../../../../services/vesselService";
import {
  unwrapListResponse,
  mapOperatorsToOptions,
  mapPortsToOptions,
  mapCallTypesToOptions,
  mapBillingEntitiesToOptions,
  mapVesselTypesToOptions,
  mapBargeTypesToOptions,
  mergeOptionIfMissing,
} from "../../../../../helpers/callFileFormOptions";
import { buildCreateCallFileFormData } from "../../../../../helpers/createCallFilePayload";
import { notify } from "../../../../../components/Toaster";

const splitDateTime = (value) => {
  if (!value) return { date: "", time: "" };
  const normalized = String(value).trim().replace(" ", "T");
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
  };
};

const mapCallDetailToFormFields = (detail) => {
  const appointmentParts = splitDateTime(detail?.appointment_received_date);
  const dailyReportEmail = Array.isArray(detail?.daily_report_emails)
    ? detail.daily_report_emails.map((item) => String(item?.id ?? "")).filter(Boolean)
    : [];
  const billingInstructionEmails = Array.isArray(detail?.billing_instruction_emails)
    ? detail.billing_instruction_emails.map((item) => String(item?.id ?? "")).filter(Boolean)
    : [];

  return {
    callId: detail?.call_id ? String(detail.call_id) : "",
    call_id: detail?.call_id ? String(detail.call_id) : "",
    owner: detail?.owner_id ? String(detail.owner_id) : "",
    assignedOperator: detail?.assigned_operator_id ? String(detail.assigned_operator_id) : "",
    appointmentReceivedDate: appointmentParts.date,
    appointmentReceivedTime: appointmentParts.time,
    port: detail?.port_id ? String(detail.port_id) : "",
    typeOfCall: detail?.call_type ? String(detail.call_type) : "",
    mainBillingEntity: detail?.main_billing_entity_id ? String(detail.main_billing_entity_id) : "",
    otherBillingEntity: detail?.other_billing_entity_id ? String(detail.other_billing_entity_id) : "",
    vesselType: detail?.vessel_type_id ? String(detail.vessel_type_id) : "",
    bargeType: detail?.barge_type_id ? String(detail.barge_type_id) : "",
    vesselName: detail?.vessel_id ? String(detail.vessel_id) : "",
    vesselOwner: detail?.vessel_owner ? String(detail.vessel_owner) : "",
    vesselPrincipal: detail?.vessel_principal ? String(detail.vessel_principal) : "",
    vesselManager: detail?.vessel_manager ? String(detail.vessel_manager) : "",
    serviceRequestorName: detail?.service_requestor_name ? String(detail.service_requestor_name) : "",
    serviceRequestorEmail: detail?.service_requestor_email ? String(detail.service_requestor_email) : "",
    dailyReportEmail,
    billingInstructionEmails,
    billingInstructions: detail?.billing_instruction ? String(detail.billing_instruction) : "",
  };
};

// Form Components
const FormField = ({ label, children, className = "", hasError = false }) => {
  return (
    <div className={`cf-field ${hasError ? "has-error" : ""} ${className}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hasError: PropTypes.bool,
};

const FormInput = ({ type = "text", value, onChange, placeholder, className = "", readOnly = false, disabled = false, hasError = false }) => {
  return (
    <div className={`cf-input ${hasError ? "is-invalid" : ""} ${className}`}>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
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
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
};

// Custom Select Component (similar to MultiSelectEmail UI)
const CustomSelect = ({ value, onChange, options = [], placeholder, className = "", disabled = false, hasError = false }) => {
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
    <div className={`cf-multi-select-email ${disabled ? "disabled" : ""} ${hasError ? "is-invalid" : ""} ${className}`} ref={dropdownRef}>
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
  hasError: PropTypes.bool,
};

const FormSelect = ({ value, onChange, options = [], placeholder, className = "", disabled = false, hasError = false }) => {
  const normalizedValue = value === undefined || value === null ? "" : String(value);
  return (
    <CustomSelect
      value={normalizedValue}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      hasError={hasError}
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
  hasError: PropTypes.bool,
};

const OwnerField = ({ value, onChange, options = [], placeholder = "Select owner", disabled = false, error, hasError = false }) => {
  const selected = options.find((opt) => String(opt.value) === String(value ?? ""));
  const avatarLetter = selected?.label?.trim()?.charAt(0)?.toUpperCase() || "U";
  const showErr = hasError || Boolean(error);
  return (
    <FormField label="Owner" hasError={showErr}>
      <div className={`cf-owner-row ${showErr ? "is-invalid" : ""}`}>
        <div className="cf-owner-avatar">{avatarLetter}</div>
        <select
          value={value === undefined || value === null ? "" : String(value)}
          onChange={onChange}
          className="cf-owner-select"
          disabled={disabled}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error ? <div className="cf-field-error">{error}</div> : null}
    </FormField>
  );
};

const VesselNameField = ({ value, onChange, options = [], placeholder, onSave, disabled = false }) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newVesselName, setNewVesselName] = useState("");

  const handleAddClick = () => {
    setShowAddInput(true);
    setNewVesselName("");
  };

  const handleSave = () => {
    if (newVesselName.trim()) {
      onSave(newVesselName.trim());
      setNewVesselName("");
      setShowAddInput(false);
    }
  };

  const handleCancel = () => {
    setNewVesselName("");
    setShowAddInput(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="cf-field">
      <label>Vessel Name</label>
      <div className="cf-vessel-name-row">
        <div className="cf-select" style={{ flex: 1 }}>
          <select value={value || ""} onChange={onChange} disabled={disabled}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* {!showAddInput && !disabled && (
          <button
            type="button"
            className="cf-add-vessel-btn"
            onClick={handleAddClick}
            aria-label="Add Vessel"
          >
            +
          </button>
        )} */}
      </div>
      {showAddInput && (
        <div className="cf-add-vessel-input-row">
          <div className="cf-input" style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Enter vessel name..."
              value={newVesselName}
              onChange={(e) => setNewVesselName(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
          </div>
          <button
            type="button"
            className="cf-save-vessel-btn"
            onClick={handleSave}
            aria-label="Save Vessel"
            disabled={!newVesselName.trim()}
          >
            ✓
          </button>
          <button
            type="button"
            className="cf-cancel-vessel-btn"
            onClick={handleCancel}
            aria-label="Cancel"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

VesselNameField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

OwnerField.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  hasError: PropTypes.bool,
};

// Document Upload Component
const DocumentUpload = ({ attachments = [], onAdd, onRemove, cardColor, disabled = false, type = "" }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

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

    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && onAdd) {
      files.forEach(file => onAdd(file));
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0 && onAdd) {
      files.forEach(file => onAdd(file));
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index) => {
    if (onRemove) {
      onRemove(index);
    }
  };

  // When disabled and there are attachments, show only the file list with better UI
  if (disabled && attachments.length > 0) {
    return (
      <div className="document-upload-wrapper">
        <div className="document-file-display-list">
          {attachments.map((file, index) => (
            <div key={index} className="document-file-display-item">
              <div className="document-file-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 13H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 9H9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="document-file-info">
                <span className="document-file-name">{file.name || file}</span>
                {file.size && (
                  <span className="document-file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Helper function to get file icon based on file type
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconColor = type ? `var(--upload-type-color, #3e5cb6)` : `var(--card-color, #2A00FF)`;

    if (['pdf'].includes(extension)) {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M14 2V8H20" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 13H8" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 17H8" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M14 2V8H20" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="document-upload-wrapper">
      <div
        className={`document-upload-zone ${type ? `upload-type-${type.toLowerCase().replace(/\s+/g, '-')}` : ""} ${isDragging ? "dragging" : ""}`}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : () => fileInputRef.current?.click()}
        style={{ "--card-color": "#3e5cb6" || "#2A00FF", pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input-hidden"
          accept="*/*"
          multiple
          onChange={handleFileInputChange}
          disabled={disabled}
        />
        <div className="upload-zone-content">
          <div className="upload-icon-wrapper">
          </div>
          <div className="upload-text-content">
            <p className="upload-main-text">
              Drag and drop your files here, or{" "}
              <span className="upload-link">click to browse</span>
            </p>
            {/* <p className="upload-sub-text">Supports all file formats</p> */}
          </div>
        </div>
      </div>

      {/* File Preview List - Shows below upload zone */}
      {attachments.length > 0 && (
        <div className="document-file-preview-list">
          {attachments.map((file, index) => (
            <div key={index} className="document-file-preview-item">
              <div className="document-file-preview-icon">
                {getFileIcon(file.name || file)}
              </div>
              <div className="document-file-preview-info">
                <span className="document-file-preview-name">{file.name || file}</span>
                <span className="document-file-preview-size">{formatFileSize(file.size)}</span>
              </div>
              {!disabled && (
                <button
                  className="document-file-preview-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(index);
                  }}
                  type="button"
                  title="Remove file"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

DocumentUpload.propTypes = {
  attachments: PropTypes.array,
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
  cardColor: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

// Multi-Select Email Component
const MultiSelectEmail = ({ value = [], onChange, options = [], placeholder, onAddNew, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const dropdownRef = useRef(null);

  const valuesEqual = (a, b) => String(a) === String(b);
  const valueToLabel = (val) => {
    const opt = options.find((o) => valuesEqual(o.value, val));
    return opt?.label ?? String(val);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const handleToggle = (optionValue) => {
    const newValue = selectedValues.some((v) => valuesEqual(v, optionValue))
      ? selectedValues.filter((e) => !valuesEqual(e, optionValue))
      : [...selectedValues, optionValue];

    const syntheticEvent = {
      target: { value: newValue, name: "dailyReportEmail" }
    };
    onChange(syntheticEvent);
  };

  const handleAddNewEmail = async () => {
    if (newEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      const email = newEmail.trim();
      if (
        !selectedValues.some((v) => valuesEqual(v, email)) &&
        !options.some((opt) => valuesEqual(opt.value, email))
      ) {
        handleToggle(email);
        if (onAddNew) {
          await Promise.resolve(onAddNew(email));
        }
      }
      setNewEmail("");
      setShowAddInput(false);
    }
  };

  const handleRemoveEmail = (rawVal, e) => {
    e.stopPropagation();
    const newValue = selectedValues.filter((entry) => !valuesEqual(entry, rawVal));
    const syntheticEvent = {
      target: { value: newValue, name: "dailyReportEmail" }
    };
    onChange(syntheticEvent);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddNewEmail();
    } else if (e.key === "Escape") {
      setNewEmail("");
      setShowAddInput(false);
    }
  };

  return (
    <div className={`cf-multi-select-email ${disabled ? "disabled" : ""}`} ref={dropdownRef}>
      <div
        className={`cf-multi-select-email-input ${disabled ? "disabled" : ""}`}
        onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
        style={{ pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1 }}
      >
        <div className="cf-multi-select-email-tags">
          {selectedValues.length > 0 ? (
            selectedValues.map((entryVal) => (
              <span key={String(entryVal)} className="cf-email-tag">
                {valueToLabel(entryVal)}
                {!disabled && (
                  <button
                    type="button"
                    className="cf-email-tag-remove"
                    onClick={(e) => handleRemoveEmail(entryVal, e)}
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          ) : (
            <span className="cf-multi-select-placeholder">{placeholder || "Select emails..."}</span>
          )}
        </div>
        <span className="cf-multi-select-arrow">▼</span>
      </div>
      {isOpen && (
        <div className="cf-multi-select-dropdown">
          {options.map((option) => {
            const isSelected = selectedValues.some((v) => valuesEqual(v, option.value));
            return (
              <div
                key={String(option.value)}
                className={`cf-multi-select-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleToggle(option.value)}
              >
                <span className="cf-multi-select-checkbox">
                  {isSelected && "✓"}
                </span>
                <span>{option.label}</span>
              </div>
            );
          })}
          {!showAddInput ? (
            <div
              className="cf-multi-select-option add-new"
              onClick={() => {
                setShowAddInput(true);
                setNewEmail("");
              }}
            >
              <span>+ Add New Email</span>
            </div>
          ) : (
            <div className="cf-multi-select-add-input">
              <input
                type="email"
                placeholder="Enter email address..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <button
                type="button"
                className="cf-add-email-btn"
                onClick={handleAddNewEmail}
                disabled={!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())}
              >
                ✓
              </button>
              <button
                type="button"
                className="cf-cancel-email-btn"
                onClick={() => {
                  setNewEmail("");
                  setShowAddInput(false);
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

MultiSelectEmail.propTypes = {
  value: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  onAddNew: PropTypes.func,
  disabled: PropTypes.bool,
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

// Daily Task/Todo Component
const DailyTaskTodo = ({ tasks = [], onChange, accentColor }) => {
  const [newTask, setNewTask] = useState("");
  const [localTasks, setLocalTasks] = useState(() => {
    // Initialize with dummy tasks if no tasks provided
    if (tasks && tasks.length > 0) {
      return tasks;
    }
    return [
      { id: 1, text: "Review vessel arrival documents", completed: true },
      { id: 2, text: "Coordinate with port authorities", completed: true },
      { id: 3, text: "Prepare crew change schedule", completed: false },
    ];
  });

  // Sync local tasks with prop changes
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const updatedTasks = [...localTasks, task];
      setLocalTasks(updatedTasks);
      if (onChange) {
        const syntheticEvent = { target: { value: updatedTasks } };
        onChange(syntheticEvent);
      }
      setNewTask("");
    }
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = localTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setLocalTasks(updatedTasks);
    if (onChange) {
      const syntheticEvent = { target: { value: updatedTasks } };
      onChange(syntheticEvent);
    }
  };

  const handleRemoveTask = (taskId) => {
    const updatedTasks = localTasks.filter((task) => task.id !== taskId);
    setLocalTasks(updatedTasks);
    if (onChange) {
      const syntheticEvent = { target: { value: updatedTasks } };
      onChange(syntheticEvent);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  const completedCount = localTasks.filter((t) => t.completed).length;
  const totalCount = localTasks.length;

  return (
    <div className="daily-task-todo-wrapper">
      <FormField label="Daily Tasks / Todo">
        <div className="daily-task-container">
          <div className="daily-task-input-row">
            <div className="cf-input">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
            <button
              type="button"
              className="daily-task-add-btn"
              onClick={handleAddTask}
              disabled={!newTask.trim()}
              aria-label="Add task"
            >
              +
            </button>
          </div>

          <div className="daily-task-list-scroll" aria-label="Task list">
            <div className="daily-task-list">
              {localTasks.length === 0 ? (
                <div className="daily-task-empty">
                  <p>No tasks yet. Add a task to get started!</p>
                </div>
              ) : (
                localTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`daily-task-item ${task.completed ? "completed" : ""}`}
                  >
                    <label className="daily-task-checkbox-display">
                      <input
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() => handleToggleTask(task.id)}
                        className="daily-task-checkbox-input"
                      />
                      <div
                        className={`daily-task-checkbox-icon ${task.completed ? "checked" : ""}`}
                      >
                        {task.completed && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </label>
                    <span className="daily-task-text">{task.text}</span>
                    <button
                      type="button"
                      className="daily-task-remove-btn"
                      onClick={() => handleRemoveTask(task.id)}
                      title="Remove task"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {localTasks.length > 0 && (
            <div className="daily-task-summary">
              <span className="daily-task-summary-text">
                {completedCount} of {totalCount} completed
              </span>
              <div className="daily-task-progress-bar">
                <div
                  className="daily-task-progress-fill"
                  style={{
                    width: `${(completedCount / totalCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </FormField>
    </div>
  );
};

DailyTaskTodo.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool,
      createdAt: PropTypes.string,
    })
  ),
  onChange: PropTypes.func,
  accentColor: PropTypes.string,
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
    received: { date: formValues?.receivedDate || card?.receivedDate, time: formValues?.receivedTime || card?.receivedTime },
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
    const dotCenterPosition = (activeIndex / (stages.length - 1)) * 100;

    // Add a visual offset to ensure the green line reaches the center of the dot
    // This accounts for:
    // 1. Dot width (28px) - line needs to extend to dot center
    // 2. Flexbox spacing calculations
    // 3. Subpixel rendering differences
    // For fewer stages (5), we need a larger offset to ensure proper connection
    const baseOffset = stages.length <= 5 ? 3.5 : 2.5;
    const offsetPercentage = activeIndex <= 2 ? baseOffset : baseOffset - 0.5;
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

function General({
  card,
  formValues,
  handleChange,
  onSave,
  isAddMode = false,
  isSimplifiedMode = false,
  isSavingGeneral = false,
  hasSubmitted = false,
  setHasSubmitted = () => { },
  setIsSavingGeneral = () => { },
}) {
  const accentColor = useMemo(() => card?.color || "#2A00FF", [card?.color]);
  const [vesselNameOptions, setVesselNameOptions] = useState([
    // Add vessel names here or fetch from API
  ]);
  const [vesselOptionsLoading, setVesselOptionsLoading] = useState(false);
  const [appointmentDocuments, setAppointmentDocuments] = useState([]);
  // MWP RENEWAL document states
  const [appointmentEmailDocuments, setAppointmentEmailDocuments] = useState([]);
  const [mwpCopyDocuments, setMwpCopyDocuments] = useState([]);
  const [supportingDocuments, setSupportingDocuments] = useState([]);
  const [fdaDispatchProofDocuments, setFdaDispatchProofDocuments] = useState([]);
  const [copyOfSalesOrderDocuments, setCopyOfSalesOrderDocuments] = useState([]);
  // CREW CHANGE document states
  const [crewChangeAppointmentEmailDocuments, setCrewChangeAppointmentEmailDocuments] = useState([]);
  const [launchHireSlipsDocuments, setLaunchHireSlipsDocuments] = useState([]);
  const [zawilPassCopyDocuments, setZawilPassCopyDocuments] = useState([]);
  const [cgPermitCopyDocuments, setCgPermitCopyDocuments] = useState([]);
  const [crewSummarySheetDocuments, setCrewSummarySheetDocuments] = useState([]);
  const [crewChangeSupportingDocuments, setCrewChangeSupportingDocuments] = useState([]);
  const [crewChangeFdaDispatchProofDocuments, setCrewChangeFdaDispatchProofDocuments] = useState([]);
  const [hotelInvoiceDocuments, setHotelInvoiceDocuments] = useState([]);
  const [crewChangeCopyOfSalesOrderDocuments, setCrewChangeCopyOfSalesOrderDocuments] = useState([]);
  const [inwardClearanceDocuments, setInwardClearanceDocuments] = useState([]);
  const [outwardClearanceDocuments, setOutwardClearanceDocuments] = useState([]);
  // FLEET document states
  const [fleetAppointmentEmailDocuments, setFleetAppointmentEmailDocuments] = useState([]);
  const [fleetCopyOfSalesOrderDocuments, setFleetCopyOfSalesOrderDocuments] = useState([]);
  // ON STATION document states
  const [onStationAppointmentEmailDocuments, setOnStationAppointmentEmailDocuments] = useState([]);
  const [onStationSupportingDocuments, setOnStationSupportingDocuments] = useState([]);
  const [onStationFdaDispatchProofDocuments, setOnStationFdaDispatchProofDocuments] = useState([]);
  const [onStationCopyOfSalesOrderDocuments, setOnStationCopyOfSalesOrderDocuments] = useState([]);
  const [dailyReportEmailOptions, setDailyReportEmailOptions] = useState([]);
  const [dailyReportEmailLoading, setDailyReportEmailLoading] = useState(false);
  const [billingInstructionType, setBillingInstructionType] = useState("");
  const [billingInstructionEmailOptions, setBillingInstructionEmailOptions] = useState([]);
  const [billingInstructionLoading, setBillingInstructionLoading] = useState(false);

  const [masterDataLoading, setMasterDataLoading] = useState(false);
  const [operatorOptions, setOperatorOptions] = useState([]);
  const [portSelectOptions, setPortSelectOptions] = useState([]);
  const [callTypeOptions, setCallTypeOptions] = useState([]);
  const [billingEntitySelectOptions, setBillingEntitySelectOptions] = useState([]);
  const [vesselTypeSelectOptions, setVesselTypeSelectOptions] = useState([]);
  const [bargeTypeSelectOptions, setBargeTypeSelectOptions] = useState([]);
  const [entityFields, setEntityFields] = useState([]);
  const [entityFieldValues, setEntityFieldValues] = useState({});
  const [entityFieldErrors, setEntityFieldErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [entityFieldsLoading, setEntityFieldsLoading] = useState(false);
  const [entityFieldsError, setEntityFieldsError] = useState("");
  const [callDetailLoading, setCallDetailLoading] = useState(false);
  const [callDetailData, setCallDetailData] = useState(null);

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

    const loadCallDetail = async () => {
      setCallDetailLoading(true);
      try {
        const { data } = await callFileService.getCallDetail(currentCallId);
        const detail = data?.data ?? null;
        if (!cancelled) {
          setCallDetailData(detail);
        }
      } catch (error) {
        console.error("[General] call detail fetch failed", error);
      } finally {
        if (!cancelled) {
          setCallDetailLoading(false);
        }
      }
    };

    loadCallDetail();
    return () => {
      cancelled = true;
    };
  }, [isAddMode, currentCallId]);

  const mappedCallDetail = useMemo(() => {
    if (!callDetailData) return {};
    return mapCallDetailToFormFields(callDetailData);
  }, [callDetailData]);

  // Keep existing non-add-mode preview only when API file name is unavailable.
  useEffect(() => {
    if (!isAddMode && appointmentDocuments.length === 0) {
      const dummyDocument = {
        name: "appointment_document.pdf",
        size: 1024000, // 1MB
        type: "application/pdf"
      };
      setAppointmentDocuments([dummyDocument]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddMode, appointmentDocuments.length]);

  useEffect(() => {
    let cancelled = false;

    const fetchRow = async (label, request, mapFn) => {
      try {
        const { data } = await request;
        const list = unwrapListResponse(data);
        return { label, options: mapFn(list) };
      } catch (e) {
        console.error(`[General] ${label} master data failed`, e);
        return { label, options: [] };
      }
    };

    const loadMasterData = async () => {
      setMasterDataLoading(true);
      const results = await Promise.all([
        fetchRow("operators", callFileService.getAllOperators(), mapOperatorsToOptions),
        fetchRow("ports", portService.getPorts({ params: { limit: 1000 } }), mapPortsToOptions),
        fetchRow("callTypes", CommonService.getCallTypes(), mapCallTypesToOptions),
        fetchRow(
          "billingEntities",
          billingEntityService.getBillingEntities({ params: { page: 1, limit: 1000 } }),
          mapBillingEntitiesToOptions
        ),
        fetchRow("vesselTypes", vesselTypeService.getVesselTypes({ params: { limit: 1000 } }), mapVesselTypesToOptions),
        fetchRow("bargeTypes", bargeTypeService.getBargeTypes({ params: { limit: 1000 } }), mapBargeTypesToOptions),
      ]);

      if (cancelled) return;

      for (const { label, options } of results) {
        if (label === "operators") setOperatorOptions(options);
        if (label === "ports") setPortSelectOptions(options);
        if (label === "callTypes") setCallTypeOptions(options);
        if (label === "billingEntities") setBillingEntitySelectOptions(options);
        if (label === "vesselTypes") setVesselTypeSelectOptions(options);
        if (label === "bargeTypes") setBargeTypeSelectOptions(options);
      }
      setMasterDataLoading(false);
    };

    loadMasterData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Determine current job status from card data (updated for 5 statuses)
  const currentStatus = useMemo(() => {
    // Map card properties to status keys
    if (card?.sailed) return "sailed";
    if (card?.cleared) return "cleared";
    if (card?.arrived) return "arrived";
    if (card?.expected) return "expected";
    if (card?.received) return "received";
    // Default to Received
    return "expected";
  }, [card]);

  const typeOptions = [
    { value: "Type", label: "IMPORT" },
    { value: "MWP RENEWAL", label: "MWP RENEWAL" },
    // { value: "CREW CHANGE", label: "CREW CHANGE" },
    { value: "FLEET", label: "FLEET" },
    // { value: "MATERIAL DELIVERY", label: "MATERIAL DELIVERY" },
    // { value: "ON STATION", label: "ON STATION" },
  ];

  // Dummy values for all fields when isAddMode is false
  const dummyValues = {
    owner: "John Doe",
    appointmentReceivedDate: "2024-01-15",
    appointmentReceivedTime: "10:30",
    typeOfCall: "Import",
    mainBillingEntity: "SS7",
    poNumber: "PO-12345",
    shipper: "SRT-67890",
    project: "Project Alpha",
    vesselType: "Foreign Flag",
    bargeType: "Barge Import",
    vesselName: "MV Ocean Star",
    vesselOwner: "Ocean Shipping Co.",
    vesselPrincipal: "Principal Marine Ltd.",
    vesselManager: "Marine Management Inc.",
    otherBillingEntity: "Other Entity",
    assignedOperator: "Operator Name",
    serviceRequestorName: "Requestor Name",
    serviceRequestorEmail: "requestor@example.com",
    dailyReportEmail: ["admin@example.com", "reports@example.com"],
    billingInstructions: "Standard billing instructions apply",
    // CREW CHANGE specific fields
    lastMovedDate: "2024-01-20",
    lastMovedTime: "14:30",
    taxInvoice: "TI-98765",
    srtPoWbs: "SRT-123|PO-456|WBS-789",
    totalOnsigners: "5",
    totalOffsigners: "3",
    thirdPartyItems: "Various items",
    billingEntity: "SS7",
    operationsCompletionDate: "2024-01-25",
    operationsCompletionTime: "16:00",
    invoiceAmount: "50000.00",
    sapSalesOrderNo: "SO-12345",
  };


  // Helper function to get field value - prioritize formValues, then fetched call detail, then card.
  const getFieldValue = (fieldName) => {
    if (formValues?.[fieldName] !== undefined && formValues[fieldName] !== null && formValues[fieldName] !== "") {
      return formValues[fieldName];
    }
    if (
      !isAddMode &&
      mappedCallDetail?.[fieldName] !== undefined &&
      mappedCallDetail[fieldName] !== null &&
      mappedCallDetail[fieldName] !== ""
    ) {
      return mappedCallDetail[fieldName];
    }
    if (!isAddMode && card?.[fieldName] !== undefined && card[fieldName] !== null && card[fieldName] !== "") {
      return card[fieldName];
    }
    // Last fallback only when no API/card/form value exists.
    if (!isAddMode && dummyValues[fieldName] !== undefined) {
      return dummyValues[fieldName];
    }
    return "";
  };

  const shouldShowApiField = useCallback(
    (apiKey) => {
      if (isAddMode) return true;
      if (!callDetailData) return true;
      const raw = callDetailData?.[apiKey];
      if (Array.isArray(raw)) return raw.length > 0;
      if (raw === undefined || raw === null) return false;
      if (typeof raw === "string") return raw.trim() !== "";
      return true;
    },
    [isAddMode, callDetailData]
  );

  const getTrimmedValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
  };

  const isEmptyValue = (value) => {
    if (value === undefined || value === null) return true;
    return String(value).trim() === "";
  };

  const getValueForGeneralValidation = (fieldName, snapshot = formValues) => {
    const base = snapshot && typeof snapshot === "object" ? snapshot : formValues;
    if (base && Object.prototype.hasOwnProperty.call(base, fieldName)) {
      const v = base[fieldName];
      return v === undefined || v === null ? "" : v;
    }
    return getFieldValue(fieldName);
  };

  const validateGeneralFields = (snapshot = formValues) => {
    const errors = {};
    const v = (name) => getValueForGeneralValidation(name, snapshot);
    if (isEmptyValue(v("owner"))) errors.owner = "Owner is required.";
    if (isEmptyValue(v("appointmentReceivedDate"))) errors.appointmentReceivedDate = "Appointment received is required.";
    if (isEmptyValue(v("port"))) errors.port = "Port is required.";
    if (isEmptyValue(v("typeOfCall"))) errors.typeOfCall = "Type of call / service is required.";
    if (isEmptyValue(v("mainBillingEntity"))) errors.mainBillingEntity = "Main billing entity is required.";
    const serviceEmailRaw = v("serviceRequestorEmail");
    const serviceEmailStr =
      serviceEmailRaw === undefined || serviceEmailRaw === null ? "" : String(serviceEmailRaw).trim();
    if (!isEmptyValue(serviceEmailStr) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(serviceEmailStr)) {
      errors.serviceRequestorEmail = "Invalid email format.";
    }

    const normalizedEntityId =
      selectedEntityId === undefined || selectedEntityId === null ? "" : String(selectedEntityId).trim();
    const shouldRequireFallbackEntityFields =
      normalizedEntityId !== "" &&
      !entityFieldsLoading &&
      !entityFieldsError &&
      Array.isArray(entityFields) &&
      entityFields.length === 0;

    if (shouldRequireFallbackEntityFields) {
      if (isEmptyValue(v("poNumber"))) errors.poNumber = "PO No is required.";
      if (isEmptyValue(v("project"))) errors.project = "Project is required.";
    }

    return errors;
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);

    const errors = validateGeneralFields();
    const cardTitleEmpty = isEmptyValue(getTrimmedValue(formValues?.cardTitle));
    if (Object.keys(errors).length > 0 || cardTitleEmpty) {
      setFieldErrors(errors);
      return;
    }

    const requiredErrors = validateRequiredEntityFields(entityFields, entityFieldValues);
    if (Object.keys(requiredErrors).length > 0) {
      setEntityFieldErrors(requiredErrors);
      return;
    }

    setFieldErrors({});
    setEntityFieldErrors({});

    const entityFieldsPayload = buildEntityFieldsPayload(entityFields, entityFieldValues);
    const swimlaneId =
      formValues?.swimlane_id ??
      formValues?.swimlaneId ??
      card?.swimlane_id ??
      card?.laneId;
    const formPayload = {
      ...formValues,
      swimlane_id: swimlaneId,
      entity_fields: entityFieldsPayload,
    };

    setIsSavingGeneral(true);
    try {
      const formData = buildCreateCallFileFormData(formPayload, {
        appointmentFiles: appointmentDocuments,
        dailyReportEmailOptions,
        billingInstructionEmailOptions,
      });
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      const response = await callFileService.createCallFile(formData);
      if (onSave) onSave(response);
    } catch (error) {
      console.error("Create failed:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Could not create call file.";
      notify(typeof msg === "string" ? msg : "Could not create call file.", "error");
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleValidatedChange = (fieldName) => (event) => {
    const nextVal = event?.target?.value;
    handleChange(fieldName)(event);
    if (!hasSubmitted) return;
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const merged = { ...formValues, [fieldName]: nextVal };
      const errs = validateGeneralFields(merged);
      if (!errs[fieldName]) {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      }
      return { ...prev, [fieldName]: errs[fieldName] };
    });
  };

  // Handle document upload
  const handleDocumentAdd = (file) => {
    setAppointmentDocuments([...appointmentDocuments, file]);
  };

  const handleDocumentRemove = (index) => {
    setAppointmentDocuments(appointmentDocuments.filter((_, i) => i !== index));
  };

  const normalizeEntityEmailOptions = useCallback((payload) => {
    const root = payload?.data ?? payload ?? {};
    const rows = Array.isArray(root?.emails) ? root.emails : [];
    return rows
      .map((row) => {
        const email = row?.email ? String(row.email).trim() : "";
        if (!email) return null;
        const refRaw = row?.reference ?? row?.email_id ?? row?.id;
        if (refRaw === undefined || refRaw === null || String(refRaw).trim() === "") {
          return { value: email, label: email };
        }
        return { value: String(refRaw).trim(), label: email };
      })
      .filter(Boolean);
  }, []);

  const fetchBillingEntityEmails = useCallback(
    async (entityId) => {
      const normalizedEntityId = entityId === undefined || entityId === null ? "" : String(entityId).trim();
      if (!normalizedEntityId) {
        setDailyReportEmailOptions([]);
        return [];
      }

      setDailyReportEmailLoading(true);
      try {
        const { data } = await billingEntityService.getAllEmailByEntity(normalizedEntityId);
        const opts = normalizeEntityEmailOptions(data);
        setDailyReportEmailOptions(opts);
        return opts;
      } catch (error) {
        console.error("[General] billing entity emails fetch failed", error);
        setDailyReportEmailOptions([]);
        return [];
      } finally {
        setDailyReportEmailLoading(false);
      }
    },
    [normalizeEntityEmailOptions]
  );

  const normalizeBillingInstruction = useCallback((payload) => {
    const root = payload?.data ?? payload ?? {};
    const data = root?.data ?? root ?? {};
    const instructionType = data?.instruction_type ? String(data.instruction_type).trim() : "";
    const description = data?.description ? String(data.description) : "";
    const emails = Array.isArray(data?.emails) ? data.emails : [];
    const emailOptions = emails
      .map((row) => {
        if (typeof row === "string") {
          const normalizedEmail = row.trim();
          return normalizedEmail ? { value: normalizedEmail, label: normalizedEmail } : null;
        }
        const email = row?.email ? String(row.email).trim() : "";
        if (!email) return null;
        const refRaw = row?.reference ?? row?.email_id ?? row?.id;
        if (refRaw === undefined || refRaw === null || String(refRaw).trim() === "") {
          return { value: email, label: email };
        }
        return { value: String(refRaw).trim(), label: email };
      })
      .filter(Boolean);

    return { instructionType, description, emailOptions };
  }, []);

  const fetchBillingInstructionByEntity = useCallback(
    async (entityId) => {
      const normalizedEntityId = entityId === undefined || entityId === null ? "" : String(entityId).trim();
      if (!normalizedEntityId) {
        setBillingInstructionType("");
        setBillingInstructionEmailOptions([]);
        handleChange("billingInstructions")({ target: { value: "", name: "billingInstructions" } });
        handleChange("billingInstructionEmails")({ target: { value: [], name: "billingInstructionEmails" } });
        return;
      }

      setBillingInstructionLoading(true);
      try {
        const { data } = await billingInstructionService.fetchInstructionByEntity(normalizedEntityId);
        const { instructionType, description, emailOptions } = normalizeBillingInstruction(data);
        setBillingInstructionType(instructionType);
        setBillingInstructionEmailOptions(emailOptions);

        const isEmailInstruction = instructionType.toLowerCase() === "email";
        handleChange("billingInstructionEmails")({
          target: { value: isEmailInstruction ? emailOptions.map((opt) => opt.value) : [], name: "billingInstructionEmails" }
        });
        handleChange("billingInstructions")({
          target: { value: isEmailInstruction ? "" : description, name: "billingInstructions" }
        });
      } catch (error) {
        console.error("[General] billing instruction fetch failed", error);
        setBillingInstructionType("");
        setBillingInstructionEmailOptions([]);
        handleChange("billingInstructionEmails")({ target: { value: [], name: "billingInstructionEmails" } });
      } finally {
        setBillingInstructionLoading(false);
      }
    },
    [handleChange, normalizeBillingInstruction]
  );

  useEffect(() => {
    if (isAddMode) return;
    const fileName = callDetailData?.appointment_email ? String(callDetailData.appointment_email).trim() : "";
    if (!fileName) return;
    setAppointmentDocuments([
      {
        name: fileName,
        size: 0,
        type: "application/pdf",
      },
    ]);
  }, [isAddMode, callDetailData?.appointment_email]);

  useEffect(() => {
    if (isAddMode) return;
    const rows = Array.isArray(callDetailData?.daily_report_emails) ? callDetailData.daily_report_emails : [];
    if (!rows.length) return;
    setDailyReportEmailOptions((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      rows.forEach((item) => {
        const id = item?.id === undefined || item?.id === null ? "" : String(item.id).trim();
        const email = item?.email ? String(item.email).trim() : "";
        if (!id || !email) return;
        if (!next.some((opt) => String(opt.value) === id)) {
          next.push({ value: id, label: email });
        }
      });
      return next;
    });
  }, [isAddMode, callDetailData?.daily_report_emails]);

  useEffect(() => {
    if (isAddMode) return;
    const rows = Array.isArray(callDetailData?.billing_instruction_emails) ? callDetailData.billing_instruction_emails : [];
    if (!rows.length) return;
    setBillingInstructionEmailOptions((prev) => {
      const next = Array.isArray(prev) ? [...prev] : [];
      rows.forEach((item) => {
        const id = item?.id === undefined || item?.id === null ? "" : String(item.id).trim();
        const email = item?.email ? String(item.email).trim() : "";
        if (!id || !email) return;
        if (!next.some((opt) => String(opt.value) === id)) {
          next.push({ value: id, label: email });
        }
      });
      return next;
    });
    setBillingInstructionType("email");
  }, [isAddMode, callDetailData?.billing_instruction_emails]);

  const normalizeVesselOptions = useCallback((payload) => {
    const rows = unwrapListResponse(payload);
    return rows
      .map((row) => {
        const vesselId = row?.vessel_id === undefined || row?.vessel_id === null ? "" : String(row.vessel_id);
        const vesselName = row?.vessel_name ? String(row.vessel_name).trim() : "";
        if (!vesselId || !vesselName) return null;
        return { value: vesselId, label: vesselName };
      })
      .filter(Boolean);
  }, []);

  const fetchVesselsByEntity = useCallback(
    async (entityId) => {
      const normalizedEntityId = entityId === undefined || entityId === null ? "" : String(entityId).trim();
      if (!normalizedEntityId) {
        setVesselNameOptions([]);
        return;
      }

      setVesselOptionsLoading(true);
      try {
        const { data } = await vesselService.getVesselByEntity(normalizedEntityId);
        setVesselNameOptions(normalizeVesselOptions(data));
      } catch (error) {
        console.error("[General] vessels by entity fetch failed", error);
        setVesselNameOptions([]);
      } finally {
        setVesselOptionsLoading(false);
      }
    },
    [normalizeVesselOptions]
  );

  const normalizeVesselDetails = useCallback((payload) => {
    const raw = payload?.data ?? payload ?? {};
    const detail = Array.isArray(raw) ? (raw[0] ?? {}) : raw;
    return {
      vessel_name: detail?.vessel_name ? String(detail.vessel_name) : "",
      vessel_owner: detail?.vessel_owner ? String(detail.vessel_owner) : "",
      vessel_manager: detail?.vessel_manager ? String(detail.vessel_manager) : "",
      vessel_principal: detail?.vessel_principal ? String(detail.vessel_principal) : "",
    };
  }, []);

  const handleVesselSelectionChange = useCallback(
    async (event) => {
      const selectedVesselId = event?.target?.value ?? "";
      handleChange("vesselName")(event);

      // Clear details immediately to avoid showing stale data.
      handleChange("vesselOwner")({ target: { value: "", name: "vesselOwner" } });
      handleChange("vesselManager")({ target: { value: "", name: "vesselManager" } });
      handleChange("vesselPrincipal")({ target: { value: "", name: "vesselPrincipal" } });

      const normalizedVesselId = selectedVesselId === undefined || selectedVesselId === null ? "" : String(selectedVesselId).trim();
      if (!normalizedVesselId) return;

      try {
        const { data } = await vesselService.getVesselDetailByVesselId(normalizedVesselId);
        const detail = normalizeVesselDetails(data);
        handleChange("vesselOwner")({ target: { value: detail.vessel_owner, name: "vesselOwner" } });
        handleChange("vesselManager")({ target: { value: detail.vessel_manager, name: "vesselManager" } });
        handleChange("vesselPrincipal")({ target: { value: detail.vessel_principal, name: "vesselPrincipal" } });
      } catch (error) {
        console.error("[General] vessel detail fetch failed", error);
      }
    },
    [handleChange, normalizeVesselDetails]
  );

  // Handle new email addition
  const handleAddNewEmail = useCallback(
    async (email) => {
      const normalizedEmail = email ? String(email).trim() : "";
      const currentEntityId = getFieldValue("mainBillingEntity");
      const normalizedEntityId = currentEntityId === undefined || currentEntityId === null ? "" : String(currentEntityId).trim();
      if (!normalizedEmail || !normalizedEntityId) return;

      try {
        await billingEntityService.addBillingEntityEmail({
          entity_id: normalizedEntityId,
          email: normalizedEmail,
        });
        const opts = await fetchBillingEntityEmails(normalizedEntityId);
        const match = opts.find((o) => String(o.label).toLowerCase() === normalizedEmail.toLowerCase());
        if (!match) return;
        const current = getFieldValue("dailyReportEmail");
        const arr = Array.isArray(current) ? [...current] : [];
        const idx = arr.findIndex((v) => String(v).toLowerCase() === normalizedEmail.toLowerCase());
        if (idx >= 0) {
          const next = [...arr];
          next[idx] = match.value;
          handleChange("dailyReportEmail")({ target: { value: next, name: "dailyReportEmail" } });
        }
      } catch (error) {
        console.error("[General] add billing entity email failed", error);
      }
    },
    [getFieldValue, fetchBillingEntityEmails, handleChange]
  );

  const handleAddBillingInstructionEmail = useCallback(
    async (email) => {
      const normalizedEmail = email ? String(email).trim() : "";
      const currentEntityId = getFieldValue("mainBillingEntity");
      const normalizedEntityId = currentEntityId === undefined || currentEntityId === null ? "" : String(currentEntityId).trim();
      if (!normalizedEmail || !normalizedEntityId) return;

      try {
        await billingInstructionService.addBillingInstructionEmail({
          entity_id: normalizedEntityId,
          email: normalizedEmail,
        });
        const { data } = await billingInstructionService.fetchInstructionByEntity(normalizedEntityId);
        const { instructionType, description, emailOptions } = normalizeBillingInstruction(data);
        setBillingInstructionType(instructionType);
        setBillingInstructionEmailOptions(emailOptions);

        const current = getFieldValue("billingInstructionEmails");
        const arr = Array.isArray(current) ? [...current] : [];
        const next = arr.map((v) => {
          const s = v === undefined || v === null ? "" : String(v).trim();
          if (s === "") return v;
          const byRef = emailOptions.find((o) => String(o.value) === s);
          if (byRef) return byRef.value;
          const byLabel = emailOptions.find((o) => String(o.label).toLowerCase() === s.toLowerCase());
          return byLabel ? byLabel.value : v;
        });
        handleChange("billingInstructionEmails")({
          target: { value: next, name: "billingInstructionEmails" },
        });

        const isEmailInstruction = instructionType.toLowerCase() === "email";
        handleChange("billingInstructions")({
          target: { value: isEmailInstruction ? "" : description, name: "billingInstructions" },
        });
      } catch (error) {
        console.error("[General] add billing instruction email failed", error);
      }
    },
    [getFieldValue, handleChange, normalizeBillingInstruction]
  );

  // Handle vessel save - add new vessel to options and update form value
  const handleVesselSave = (vesselName) => {
    const newVesselOption = {
      value: vesselName,
      label: vesselName,
    };

    // Add to options if not already exists
    if (!vesselNameOptions.some(opt => opt.value === newVesselOption.value)) {
      setVesselNameOptions([...vesselNameOptions, newVesselOption]);
    }

    // Update form value to the newly added vessel
    const syntheticEvent = {
      target: { value: vesselName, name: "vesselName" }
    };
    handleChange("vesselName")(syntheticEvent);
  };

  // Determine if fields should be disabled
  // In simplified mode: always enabled
  // In full mode: disabled when not in add mode (same as before)
  const isDisabled = isSimplifiedMode ? false : !isAddMode;
  const masterInputsDisabled = isDisabled || masterDataLoading;

  // Check if MWP RENEWAL type is selected in simplified mode
  const isMwPRenewal = isSimplifiedMode && getFieldValue("type") === "MWP RENEWAL";

  // Check if CREW CHANGE type is selected in simplified mode (or Type which should show same fields)
  const isCrewChange = isSimplifiedMode && (getFieldValue("type") === "CREW CHANGE" || getFieldValue("type") === "Type");

  // Check if FLEET type is selected in simplified mode
  const isFleet = isSimplifiedMode && getFieldValue("type") === "FLEET";

  // Check if MATERIAL DELIVERY type is selected in simplified mode
  const isMaterialDelivery = isSimplifiedMode && getFieldValue("type") === "MATERIAL DELIVERY";

  // Check if ON STATION type is selected in simplified mode
  const isOnStation = isSimplifiedMode && getFieldValue("type") === "ON STATION";

  const normalizeEntityFields = useCallback((rows) => {
    if (!Array.isArray(rows)) return [];
    const parsed = rows
      .map((row) => {
        const field_id = row?.field_id === undefined || row?.field_id === null ? "" : String(row.field_id);
        const field_name = row?.field_name ? String(row.field_name).trim() : "";
        const field_type = row?.field_type ? String(row.field_type).trim() : "";
        const rawRequired = row?.is_required;
        const is_required =
          rawRequired === 1 || rawRequired === "1" || rawRequired === true ? 1 : 0;
        const seqRaw = row?.sequence_order;
        let sequence_order = 0;
        if (typeof seqRaw === "number" && !Number.isNaN(seqRaw)) {
          sequence_order = seqRaw;
        } else if (seqRaw !== undefined && seqRaw !== null && String(seqRaw).trim() !== "") {
          const n = Number.parseInt(String(seqRaw), 10);
          sequence_order = Number.isNaN(n) ? 0 : n;
        }
        return { field_id, field_name, field_type, is_required, sequence_order };
      })
      .filter((row) => row.field_id && row.field_name);
    return parsed.sort((a, b) => a.sequence_order - b.sequence_order);
  }, []);

  const buildEntityFieldsPayload = useCallback(
    (fields, values) =>
      fields
        .map((field) => {
          const rawValue = values?.[field.field_id];
          const value = rawValue === undefined || rawValue === null ? "" : String(rawValue);
          return {
            field_id: field.field_id,
            field_name: field.field_name,
            value,
          };
        })
        .filter((item) => item.value.trim() !== ""),
    []
  );

  const handleEntityFieldValueChange = useCallback((fieldId) => (event) => {
    const nextValue = event?.target?.value ?? "";
    setEntityFieldValues((prev) => ({
      ...prev,
      [fieldId]: nextValue,
    }));
    setEntityFieldErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const validateRequiredEntityFields = useCallback((fields, values) => {
    const nextErrors = {};
    fields.forEach((field) => {
      if (field.is_required !== 1) return;
      const raw = values?.[field.field_id];
      const trimmed = raw === undefined || raw === null ? "" : String(raw).trim();
      if (trimmed === "") {
        const name = field.field_name || "This field";
        nextErrors[field.field_id] = `${name} is required.`;
      }
    });
    return nextErrors;
  }, []);

  const fetchEntityFields = useCallback(
    async (entityId, preservedValues = {}) => {
      const normalizedEntityId = entityId === undefined || entityId === null ? "" : String(entityId).trim();
      if (!normalizedEntityId) {
        setEntityFields([]);
        setEntityFieldValues({});
        setEntityFieldErrors({});
        setEntityFieldsLoading(false);
        setEntityFieldsError("");
        return;
      }

      setEntityFieldsLoading(true);
      setEntityFieldsError("");
      setEntityFieldErrors({});
      try {
        const { data } = await callFileService.getEntityFields(normalizedEntityId);
        const rows = unwrapListResponse(data);
        const normalizedFields = normalizeEntityFields(rows);

        setEntityFields(normalizedFields);
        setEntityFieldValues(() => {
          if (!normalizedFields.length) return {};
          const nextValues = {};
          normalizedFields.forEach((field) => {
            const previousValue = preservedValues?.[field.field_id];
            nextValues[field.field_id] = previousValue === undefined || previousValue === null ? "" : String(previousValue);
          });
          return nextValues;
        });
      } catch (error) {
        console.error("[General] entity fields fetch failed", error);
        setEntityFields([]);
        setEntityFieldValues({});
        setEntityFieldErrors({});
        setEntityFieldsError("Unable to load billing entity fields.");
      } finally {
        setEntityFieldsLoading(false);
      }
    },
    [normalizeEntityFields]
  );

  const handleMainBillingEntityChange = useCallback(
    (event) => {
      const selectedEntityId = event?.target?.value ?? "";
      handleChange("mainBillingEntity")(event);
      handleChange("dailyReportEmail")({
        target: { value: [], name: "dailyReportEmail" }
      });
      handleChange("billingInstructionEmails")({
        target: { value: [], name: "billingInstructionEmails" }
      });
      handleChange("billingInstructions")({
        target: { value: "", name: "billingInstructions" }
      });
      handleChange("vesselName")({ target: { value: "", name: "vesselName" } });
      handleChange("vesselOwner")({ target: { value: "", name: "vesselOwner" } });
      handleChange("vesselManager")({ target: { value: "", name: "vesselManager" } });
      handleChange("vesselPrincipal")({ target: { value: "", name: "vesselPrincipal" } });
      setEntityFields([]);
      setEntityFieldValues({});
      setEntityFieldErrors({});
      setEntityFieldsError("");
      void fetchEntityFields(selectedEntityId);
      void fetchBillingEntityEmails(selectedEntityId);
      void fetchBillingInstructionByEntity(selectedEntityId);
      void fetchVesselsByEntity(selectedEntityId);
    },
    [fetchBillingEntityEmails, fetchBillingInstructionByEntity, fetchEntityFields, fetchVesselsByEntity, handleChange]
  );

  const handleValidatedMainBillingEntityChange = (event) => {
    const nextVal = event?.target?.value ?? "";
    handleMainBillingEntityChange(event);
    if (!hasSubmitted) return;
    setFieldErrors((prev) => {
      if (!prev.mainBillingEntity) return prev;
      const merged = { ...formValues, mainBillingEntity: nextVal };
      const errs = validateGeneralFields(merged);
      if (!errs.mainBillingEntity) {
        const next = { ...prev };
        delete next.mainBillingEntity;
        return next;
      }
      return { ...prev, mainBillingEntity: errs.mainBillingEntity };
    });
  };

  const selectedEntityId = useMemo(
    () => getFieldValue("mainBillingEntity"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAddMode, formValues?.mainBillingEntity, card?.mainBillingEntity, card?.main_billing_entity_id, mappedCallDetail?.mainBillingEntity]
  );

  useEffect(() => {
    if (!selectedEntityId) return;
    void fetchEntityFields(selectedEntityId);
    void fetchBillingEntityEmails(selectedEntityId);
    if (isAddMode) {
      void fetchBillingInstructionByEntity(selectedEntityId);
    }
    void fetchVesselsByEntity(selectedEntityId);
  }, [
    selectedEntityId,
    isAddMode,
    fetchEntityFields,
    fetchBillingEntityEmails,
    fetchBillingInstructionByEntity,
    fetchVesselsByEntity,
  ]);




  return (
    <div className="cardform-body general-tab-body">
      <div className="general-sections-wrapper">
        <div className="cf-section general-info-section">
          {!isAddMode && (
            <div className="cf-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="cf-section-title">General Information</div>
              {isSimplifiedMode && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ minWidth: "200px" }}>
                    <FormSelect
                      value={getFieldValue("type")}
                      onChange={handleChange("type")}
                      options={typeOptions}
                      placeholder="Select type..."
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="cf-section-body">
            {!isAddMode && callDetailLoading && (
              <div className="cf-input" style={{ marginBottom: "12px" }}>
                <input type="text" value="Loading call details..." readOnly />
              </div>
            )}
            <div className={`${!isAddMode ? "general-info-three-column" : "general-info-two-column"} general-tab-form-layout`}>
              <div className="general-info-left">
                <div className="pre-arrival-form">
                  {isFleet ? (
                    <>
                      <OwnerField
                        value={getFieldValue("owner")}
                        onChange={handleChange("owner")}
                        options={mergeOptionIfMissing(operatorOptions, getFieldValue("owner"))}
                        placeholder="Select owner"
                        disabled={masterInputsDisabled}
                      />

                      <FormField label="Billing Entity">
                        <FormSelect
                          value={getFieldValue("billingEntity") || "SS7"}
                          onChange={handleChange("billingEntity")}
                          options={[{ value: "SS7", label: "SS7" }]}
                          placeholder="Select billing entity..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="VESSEL NAME">
                        <FormSelect
                          value={getFieldValue("vesselName") || "MV Ocean Star"}
                          onChange={handleChange("vesselName")}
                          options={[{ value: getFieldValue("vesselName") || "MV Ocean Star", label: getFieldValue("vesselName") || "MV Ocean Star" }]}
                          placeholder="Select vessel name..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="Last moved">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("lastMovedDate")}
                            onChange={handleChange("lastMovedDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("lastMovedTime")}
                            onChange={handleChange("lastMovedTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>
                    </>
                  ) : (isCrewChange || isMaterialDelivery) ? (
                    <>
                      <OwnerField
                        value={getFieldValue("owner")}
                        onChange={handleChange("owner")}
                        options={mergeOptionIfMissing(operatorOptions, getFieldValue("owner"))}
                        placeholder="Select owner"
                        disabled={masterInputsDisabled}
                      />

                      <FormField label="Billing Entity">
                        <FormSelect
                          value={getFieldValue("billingEntity") || "SS7"}
                          onChange={handleChange("billingEntity")}
                          options={[{ value: "SS7", label: "SS7" }]}
                          placeholder="Select billing entity..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="SRT|PO|WBS">
                        <FormInput
                          type="text"
                          placeholder="Enter SRT|PO|WBS..."
                          value={getFieldValue("srtPoWbs")}
                          onChange={handleChange("srtPoWbs")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="VESSEL NAME">
                        <FormSelect
                          value={getFieldValue("vesselName") || "MV Ocean Star"}
                          onChange={handleChange("vesselName")}
                          options={[{ value: getFieldValue("vesselName") || "MV Ocean Star", label: getFieldValue("vesselName") || "MV Ocean Star" }]}
                          placeholder="Select vessel name..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="Last moved">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("lastMovedDate")}
                            onChange={handleChange("lastMovedDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("lastMovedTime")}
                            onChange={handleChange("lastMovedTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>

                      <FormField label="Inward Clearance Date">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("inwardClearanceDate")}
                            onChange={handleChange("inwardClearanceDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("inwardClearanceTime")}
                            onChange={handleChange("inwardClearanceTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>

                      <FormField label="Outward Clearance Date">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("outwardClearanceDate")}
                            onChange={handleChange("outwardClearanceDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("outwardClearanceTime")}
                            onChange={handleChange("outwardClearanceTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>

                      <FormField label="Operations completion date">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("operationsCompletionDate")}
                            onChange={handleChange("operationsCompletionDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("operationsCompletionTime")}
                            onChange={handleChange("operationsCompletionTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>

                      <FormField label="Total Onsigners">
                        <FormInput
                          type="number"
                          placeholder="Enter total onsigners..."
                          value={getFieldValue("totalOnsigners")}
                          onChange={handleChange("totalOnsigners")}
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="Total Offsigners">
                        <FormInput
                          type="number"
                          placeholder="Enter total offsigners..."
                          value={getFieldValue("totalOffsigners")}
                          onChange={handleChange("totalOffsigners")}
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="3rd Party Items">
                        <FormInput
                          type="text"
                          placeholder="Enter 3rd party items..."
                          value={getFieldValue("thirdPartyItems")}
                          onChange={handleChange("thirdPartyItems")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Tax Invoice">
                        <FormInput
                          type="text"
                          placeholder="Enter tax invoice..."
                          value={getFieldValue("taxInvoice")}
                          onChange={handleChange("taxInvoice")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Invoice amount (Including VAT)">
                        <FormInput
                          type="text"
                          placeholder="Enter invoice amount..."
                          value={getFieldValue("invoiceAmount")}
                          onChange={handleChange("invoiceAmount")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="SAP Sales Order No">
                        <FormSelect
                          value={getFieldValue("sapSalesOrderNo") || "SO-12345"}
                          onChange={handleChange("sapSalesOrderNo")}
                          options={[{ value: getFieldValue("sapSalesOrderNo") || "SO-12345", label: getFieldValue("sapSalesOrderNo") || "SO-12345" }]}
                          placeholder="Select SAP Sales Order No..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="Service requester">
                        <FormSelect
                          value={getFieldValue("serviceRequestorName") || "Service Requester Name"}
                          onChange={handleChange("serviceRequestorName")}
                          options={[{ value: getFieldValue("serviceRequestorName") || "Service Requester Name", label: getFieldValue("serviceRequestorName") || "Service Requester Name" }]}
                          placeholder="Select service requester..."
                          disabled={true}
                        />
                      </FormField>
                    </>
                  ) : isOnStation ? (
                    <>
                      <OwnerField
                        value={getFieldValue("owner")}
                        onChange={handleChange("owner")}
                        options={mergeOptionIfMissing(operatorOptions, getFieldValue("owner"))}
                        placeholder="Select owner"
                        disabled={masterInputsDisabled}
                      />

                      <FormField label="Billing Entity">
                        <FormSelect
                          value={getFieldValue("billingEntity") || "SS7"}
                          onChange={handleChange("billingEntity")}
                          options={[{ value: "SS7", label: "SS7" }]}
                          placeholder="Select billing entity..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="SRT|PO|WBS">
                        <FormInput
                          type="text"
                          placeholder="Enter SRT|PO|WBS..."
                          value={getFieldValue("srtPoWbs")}
                          onChange={handleChange("srtPoWbs")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Operations completion Date">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("operationsCompletionDate")}
                            onChange={handleChange("operationsCompletionDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("operationsCompletionTime")}
                            onChange={handleChange("operationsCompletionTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>

                      <FormField label="VESSEL NAME">
                        <FormSelect
                          value={getFieldValue("vesselName") || "MV Ocean Star"}
                          onChange={handleChange("vesselName")}
                          options={[{ value: getFieldValue("vesselName") || "MV Ocean Star", label: getFieldValue("vesselName") || "MV Ocean Star" }]}
                          placeholder="Select vessel name..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="Last moved">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("lastMovedDate")}
                            onChange={handleChange("lastMovedDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("lastMovedTime")}
                            onChange={handleChange("lastMovedTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>

                      <FormField label="Tax Invoice">
                        <FormInput
                          type="text"
                          placeholder="Enter tax invoice..."
                          value={getFieldValue("taxInvoice")}
                          onChange={handleChange("taxInvoice")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Invoice amount (Including VAT)">
                        <FormInput
                          type="text"
                          placeholder="Enter invoice amount..."
                          value={getFieldValue("invoiceAmount")}
                          onChange={handleChange("invoiceAmount")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="SAP Sales Order No">
                        <FormSelect
                          value={getFieldValue("sapSalesOrderNo") || "SO-12345"}
                          onChange={handleChange("sapSalesOrderNo")}
                          options={[{ value: getFieldValue("sapSalesOrderNo") || "SO-12345", label: getFieldValue("sapSalesOrderNo") || "SO-12345" }]}
                          placeholder="Select SAP Sales Order No..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="Service requester">
                        <FormSelect
                          value={getFieldValue("serviceRequestorName") || "Service Requester Name"}
                          onChange={handleChange("serviceRequestorName")}
                          options={[{ value: getFieldValue("serviceRequestorName") || "Service Requester Name", label: getFieldValue("serviceRequestorName") || "Service Requester Name" }]}
                          placeholder="Select service requester..."
                          disabled={true}
                        />
                      </FormField>
                    </>
                  ) : isMwPRenewal ? (
                    <>
                      <OwnerField
                        value={getFieldValue("owner")}
                        onChange={handleChange("owner")}
                        options={mergeOptionIfMissing(operatorOptions, getFieldValue("owner"))}
                        placeholder="Select owner"
                        disabled={masterInputsDisabled}
                      />

                      <FormField label="VESSEL NAME">
                        <FormSelect
                          value="MV Ocean Star"
                          onChange={handleChange("vesselName")}
                          options={[{ value: "MV Ocean Star", label: "MV Ocean Star" }]}
                          placeholder="Select vessel name..."
                          disabled={true}
                        />
                      </FormField>

                      <FormField label="Last moved">
                        <div className="cf-input date-time-row">
                          <input
                            type="date"
                            value={getFieldValue("lastMovedDate")}
                            onChange={handleChange("lastMovedDate")}
                            placeholder="Select date"
                            disabled={isDisabled}
                          />
                          <input
                            type="time"
                            value={getFieldValue("lastMovedTime")}
                            onChange={handleChange("lastMovedTime")}
                            placeholder="Select time"
                            disabled={isDisabled}
                          />
                        </div>
                      </FormField>

                      <FormField label="Tax Invoice">
                        <FormInput
                          type="text"
                          placeholder="Enter tax invoice..."
                          value={getFieldValue("taxInvoice")}
                          onChange={handleChange("taxInvoice")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Invoice amount (Including VAT)">
                        <FormInput
                          type="text"
                          placeholder="Enter invoice amount..."
                          value={getFieldValue("invoiceAmount")}
                          onChange={handleChange("invoiceAmount")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="SAP Sales Order No">
                        <FormInput
                          type="number"
                          placeholder="Enter SAP Sales Order No..."
                          value={getFieldValue("sapSalesOrderNo")}
                          onChange={handleChange("sapSalesOrderNo")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Service requester">
                        <FormInput
                          type="text"
                          placeholder="Enter service requester..."
                          value={getFieldValue("serviceRequestorName")}
                          onChange={handleChange("serviceRequestorName")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="PO Number">
                        <FormInput
                          type="text"
                          placeholder="Enter PO number..."
                          value={getFieldValue("poNumber")}
                          onChange={handleChange("poNumber")}
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Issue Date">
                        <FormInput
                          type="date"
                          value={getFieldValue("issueDate")}
                          onChange={handleChange("issueDate")}
                          placeholder="Select issue date"
                          disabled={isDisabled}
                        />
                      </FormField>

                      <FormField label="Expiry Date">
                        <FormInput
                          type="date"
                          value={getFieldValue("expiryDate")}
                          onChange={handleChange("expiryDate")}
                          placeholder="Select expiry date"
                          disabled={isDisabled}
                        />
                      </FormField>
                    </>
                  ) : (
                    <>
                      {shouldShowApiField("owner_id") && (
                        <OwnerField
                          value={getFieldValue("owner")}
                          onChange={isAddMode ? handleValidatedChange("owner") : handleChange("owner")}
                          options={mergeOptionIfMissing(operatorOptions, getFieldValue("owner"))}
                          placeholder="Select owner"
                          disabled={masterInputsDisabled}
                          error={isAddMode ? fieldErrors.owner : undefined}
                          hasError={isAddMode && Boolean(fieldErrors.owner)}
                        />
                      )}

                      {!isSimplifiedMode && (
                        <div className="form-group">
                          <h3 className="form-group-title">Appointment Details</h3>
                          {shouldShowApiField("appointment_email") && (
                            <FormField label="Appointment Email">
                              <DocumentUpload
                                attachments={appointmentDocuments}
                                onAdd={handleDocumentAdd}
                                onRemove={handleDocumentRemove}
                                cardColor={accentColor}
                                disabled={isDisabled}
                              />
                            </FormField>
                          )}
                          {shouldShowApiField("appointment_received_date") && (
                            <FormField
                              label="Appointment Received"
                              hasError={isAddMode && Boolean(fieldErrors.appointmentReceivedDate)}
                            >
                              <div
                                className={`cf-input date-time-row ${isAddMode && fieldErrors.appointmentReceivedDate ? "is-invalid" : ""}`}
                              >
                                <input
                                  type="date"
                                  value={getFieldValue("appointmentReceivedDate")}
                                  onChange={isAddMode ? handleValidatedChange("appointmentReceivedDate") : handleChange("appointmentReceivedDate")}
                                  placeholder="Select date"
                                  disabled={isDisabled}
                                />

                                <input
                                  type="time"
                                  value={getFieldValue("appointmentReceivedTime")}
                                  onChange={handleChange("appointmentReceivedTime")}
                                  placeholder="Select time"
                                  disabled={isDisabled}
                                />
                              </div>
                              {isAddMode && fieldErrors.appointmentReceivedDate && (
                                <div className="cf-field-error">{fieldErrors.appointmentReceivedDate}</div>
                              )}
                            </FormField>
                          )}
                        </div>
                      )}

                      <div className="form-group">
                        <h3 className="form-group-title">Service Information</h3>
                        {shouldShowApiField("port_id") && (
                          <FormField label="Port" hasError={isAddMode && Boolean(fieldErrors.port)}>
                            <FormSelect
                              value={getFieldValue("port")}
                              onChange={isAddMode ? handleValidatedChange("port") : handleChange("port")}
                              options={mergeOptionIfMissing(portSelectOptions, getFieldValue("port"))}
                              placeholder="Select port"
                              disabled={masterInputsDisabled}
                              hasError={isAddMode && Boolean(fieldErrors.port)}
                            />
                            {isAddMode && fieldErrors.port && (
                              <div className="cf-field-error">{fieldErrors.port}</div>
                            )}
                          </FormField>
                        )}
                        {shouldShowApiField("call_type") && (
                          <FormField label="Type of call / Service" hasError={isAddMode && Boolean(fieldErrors.typeOfCall)}>
                            <FormSelect
                              value={getFieldValue("typeOfCall")}
                              onChange={isAddMode ? handleValidatedChange("typeOfCall") : handleChange("typeOfCall")}
                              options={mergeOptionIfMissing(callTypeOptions, getFieldValue("typeOfCall"))}
                              placeholder="Select type of call"
                              disabled={masterInputsDisabled}
                              hasError={isAddMode && Boolean(fieldErrors.typeOfCall)}
                            />
                            {isAddMode && fieldErrors.typeOfCall && (
                              <div className="cf-field-error">{fieldErrors.typeOfCall}</div>
                            )}
                          </FormField>
                        )}
                        {shouldShowApiField("main_billing_entity_id") && (
                          <FormField label="Main Billing entity" hasError={isAddMode && Boolean(fieldErrors.mainBillingEntity)}>
                            <FormSelect
                              value={getFieldValue("mainBillingEntity")}
                              onChange={isAddMode ? handleValidatedMainBillingEntityChange : handleMainBillingEntityChange}
                              options={mergeOptionIfMissing(billingEntitySelectOptions, getFieldValue("mainBillingEntity"))}
                              placeholder="Select billing entity"
                              disabled={masterInputsDisabled}
                              hasError={isAddMode && Boolean(fieldErrors.mainBillingEntity)}
                            />
                            {isAddMode && fieldErrors.mainBillingEntity && (
                              <div className="cf-field-error">{fieldErrors.mainBillingEntity}</div>
                            )}
                          </FormField>
                        )}

                        {entityFieldsLoading && (
                          <FormField label="">
                            <div className="cf-input">
                              <input type="text" value="Loading fields..." readOnly />
                            </div>
                          </FormField>
                        )}

                        {!entityFieldsLoading && entityFields.map((field) => (
                          <FormField
                            key={field.field_id}
                            label={field.is_required === 1 ? `${field.field_name} *` : field.field_name}
                          >
                            <FormInput
                              type="text"
                              placeholder={`Enter ${field.field_name}...`}
                              value={entityFieldValues[field.field_id] || ""}
                              onChange={handleEntityFieldValueChange(field.field_id)}
                              disabled={isDisabled}
                            />
                            {entityFieldErrors[field.field_id] && (
                              <span className="error-txt" style={{ display: "block", marginTop: "4px" }}>
                                {entityFieldErrors[field.field_id]}
                              </span>
                            )}
                          </FormField>
                        ))}

                        {!entityFieldsLoading && entityFieldsError && (
                          <FormField label="">
                            <div className="cf-input">
                              <input type="text" value={entityFieldsError} readOnly />
                            </div>
                          </FormField>
                        )}

                        {!entityFieldsLoading &&
                          !entityFieldsError &&
                          selectedEntityId &&
                          entityFields.length === 0 && (
                            <>
                              <FormField label="PO No *" hasError={isAddMode && Boolean(fieldErrors.poNumber)}>
                                <FormInput
                                  type="text"
                                  placeholder="Enter PO No..."
                                  value={getFieldValue("poNumber")}
                                  onChange={isAddMode ? handleValidatedChange("poNumber") : handleChange("poNumber")}
                                  disabled={isDisabled}
                                />
                                {isAddMode && fieldErrors.poNumber && (
                                  <div className="cf-field-error">{fieldErrors.poNumber}</div>
                                )}
                              </FormField>

                              <FormField label="Project *" hasError={isAddMode && Boolean(fieldErrors.project)}>
                                <FormInput
                                  type="text"
                                  placeholder="Enter project..."
                                  value={getFieldValue("project")}
                                  onChange={isAddMode ? handleValidatedChange("project") : handleChange("project")}
                                  disabled={isDisabled}
                                />
                                {isAddMode && fieldErrors.project && (
                                  <div className="cf-field-error">{fieldErrors.project}</div>
                                )}
                              </FormField>
                            </>
                          )}
                      </div>

                      <div className="form-group">
                        <h3 className="form-group-title">Vessel Information</h3>

                        {shouldShowApiField("vessel_type_id") && (
                          <FormField label="Vessel type">
                            <FormSelect
                              value={getFieldValue("vesselType")}
                              onChange={handleChange("vesselType")}
                              options={mergeOptionIfMissing(vesselTypeSelectOptions, getFieldValue("vesselType"))}
                              placeholder="Select vessel type"
                              disabled={masterInputsDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("barge_type_id") && (
                          <FormField label="Barge type">
                            <FormSelect
                              value={getFieldValue("bargeType")}
                              onChange={handleChange("bargeType")}
                              options={mergeOptionIfMissing(bargeTypeSelectOptions, getFieldValue("bargeType"))}
                              placeholder="Select barge type"
                              disabled={masterInputsDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("vessel_id") && (
                          <VesselNameField
                            value={getFieldValue("vesselName")}
                            onChange={handleVesselSelectionChange}
                            options={vesselNameOptions}
                            placeholder="Select vessel name..."
                            onSave={handleVesselSave}
                            disabled={isDisabled || vesselOptionsLoading}
                          />
                        )}

                        {shouldShowApiField("vessel_owner") && (
                          <FormField label="Vessel Owner">
                            <FormInput
                              type="text"
                              placeholder="Enter vessel owner..."
                              value={getFieldValue("vesselOwner")}
                              onChange={handleChange("vesselOwner")}
                              disabled={isDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("vessel_principal") && (
                          <FormField label="Vessel Principal">
                            <FormInput
                              type="text"
                              placeholder="Enter vessel principal..."
                              value={getFieldValue("vesselPrincipal")}
                              onChange={handleChange("vesselPrincipal")}
                              disabled={isDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("vessel_manager") && (
                          <FormField label="Vessel Manager">
                            <FormInput
                              type="text"
                              placeholder="Enter vessel manager..."
                              value={getFieldValue("vesselManager")}
                              onChange={handleChange("vesselManager")}
                              disabled={isDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("other_billing_entity_id") && (
                          <FormField label="Other billing entity">
                            <FormSelect
                              value={getFieldValue("otherBillingEntity")}
                              onChange={handleChange("otherBillingEntity")}
                              options={mergeOptionIfMissing(billingEntitySelectOptions, getFieldValue("otherBillingEntity"))}
                              placeholder="Select billing entity"
                              disabled={masterInputsDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("assigned_operator_id") && (
                          <FormField label="Assigned Operator">
                            <FormSelect
                              value={getFieldValue("assignedOperator")}
                              onChange={handleChange("assignedOperator")}
                              options={mergeOptionIfMissing(operatorOptions, getFieldValue("assignedOperator"))}
                              placeholder="Select operator"
                              disabled={masterInputsDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("service_requestor_name") && (
                          <FormField label="Service Requestor Name">
                            <FormInput
                              type="text"
                              placeholder="Enter service requestor name..."
                              value={getFieldValue("serviceRequestorName")}
                              onChange={handleChange("serviceRequestorName")}
                              disabled={isDisabled}
                            />
                          </FormField>
                        )}

                        {shouldShowApiField("service_requestor_email") && (
                          <FormField
                            label="Service Requestor Email"
                            hasError={isAddMode && Boolean(fieldErrors.serviceRequestorEmail)}
                          >
                            <FormInput
                              type="email"
                              placeholder="Enter service requestor email..."
                              value={getFieldValue("serviceRequestorEmail")}
                              onChange={isAddMode ? handleValidatedChange("serviceRequestorEmail") : handleChange("serviceRequestorEmail")}
                              disabled={isDisabled}
                              hasError={isAddMode && Boolean(fieldErrors.serviceRequestorEmail)}
                            />
                            {isAddMode && fieldErrors.serviceRequestorEmail && (
                              <div className="cf-field-error">{fieldErrors.serviceRequestorEmail}</div>
                            )}
                          </FormField>
                        )}

                        {shouldShowApiField("daily_report_emails") && (
                          <FormField label="Daily Report Emails">
                            <MultiSelectEmail
                              value={Array.isArray(getFieldValue("dailyReportEmail")) ? getFieldValue("dailyReportEmail") : []}
                              onChange={handleChange("dailyReportEmail")}
                              options={dailyReportEmailOptions}
                              placeholder="Select email addresses..."
                              onAddNew={handleAddNewEmail}
                              disabled={isDisabled || dailyReportEmailLoading}
                            />
                          </FormField>
                        )}

                        {(shouldShowApiField("billing_instruction") || shouldShowApiField("billing_instruction_emails")) && (
                          <FormField label="Billing instructions">
                            {billingInstructionType.toLowerCase() === "email" ? (
                              <MultiSelectEmail
                                value={Array.isArray(getFieldValue("billingInstructionEmails")) ? getFieldValue("billingInstructionEmails") : []}
                                onChange={handleChange("billingInstructionEmails")}
                                options={billingInstructionEmailOptions}
                                placeholder="Select billing instruction emails..."
                                onAddNew={handleAddBillingInstructionEmail}
                                disabled={isDisabled || billingInstructionLoading}
                              />
                            ) : (
                              <FormInput
                                type="text"
                                placeholder="Enter billing instructions..."
                                value={getFieldValue("billingInstructions")}
                                onChange={handleChange("billingInstructions")}
                                disabled={isDisabled || billingInstructionLoading}
                              />
                            )}
                          </FormField>
                        )}

                        {isAddMode && (
                          <div className="form-save-button-wrapper">
                            <button
                              type="button"
                              className="form-save-button"
                              onClick={handleSubmit}
                              disabled={isSavingGeneral}
                            >
                              {isSavingGeneral ? "Saving…" : "Save"}
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {isAddMode ? (
                <div className="general-info-right">
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
              ) : (
                <>
                  <div className="general-info-middle">
                    <div className="card-description-wrapper">
                      <FormField label="Card Description">
                        <ReactQuillEditor
                          value={formValues?.cardDescription || card?.cardDescription || ""}
                          onChange={handleChange("cardDescription")}
                          placeholder="Enter card description..."
                        />
                      </FormField>
                    </div>
                  </div>
                  <div className="general-info-right">
                    <div className="daily-task-box-wrapper">
                      <DailyTaskTodo
                        tasks={formValues?.dailyTasks || card?.dailyTasks}
                        onChange={handleChange("dailyTasks")}
                        accentColor={accentColor}
                      />
                    </div>
                  </div>
                </>
              )}
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
  onSave: PropTypes.func,
  isAddMode: PropTypes.bool,
  isSimplifiedMode: PropTypes.bool,
  isSavingGeneral: PropTypes.bool,
  hasSubmitted: PropTypes.bool,
  setHasSubmitted: PropTypes.func,
  setIsSavingGeneral: PropTypes.func,
};

export default General;

