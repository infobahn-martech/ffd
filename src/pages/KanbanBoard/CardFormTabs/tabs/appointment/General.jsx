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
import kpiTasksService from "../../../../../services/kpiTasksService";
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
import SearchableSelect, { deriveSearchPlaceholder } from "../../../../../components/form/SearchableSelect";
import DateTimePickerField from "../../components/DateTimePickerField";

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
    ? detail.daily_report_emails
      .map((item) => String(item?.id ?? item?.email_id ?? item?.reference ?? "").trim())
      .filter(Boolean)
    : [];
  const billingInstructionEmails = Array.isArray(detail?.billing_instruction_emails)
    ? detail.billing_instruction_emails
      .map((item) => String(item?.id ?? item?.email_id ?? item?.reference ?? "").trim())
      .filter(Boolean)
    : [];

  return {
    callId: detail?.call_id ? String(detail.call_id) : "",
    call_id: detail?.call_id ? String(detail.call_id) : "",
    owner: detail?.owner_id ? String(detail.owner_id) : "",
    assignedOperator: detail?.assigned_operator_id ? String(detail.assigned_operator_id) : "",
    appointmentReceivedDate: appointmentParts.date,
    appointmentReceivedTime: appointmentParts.time,
    port: detail?.port_id ? String(detail.port_id) : "",
    call_type_id: detail?.call_type_id != null ? String(detail.call_type_id) : "",
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
    poNumber: detail?.po_number ? String(detail.po_number) : "",
    srtNo: detail?.srt_number ? String(detail.srt_number) : "",
    srtPoWbs: detail?.srt_number ? String(detail.srt_number) : "",
    project: detail?.project_name ? String(detail.project_name) : "",
    dailyReportEmail,
    billingInstructionEmails,
    billingInstructions: detail?.billing_instruction ? String(detail.billing_instruction) : "",
    cardDescription: detail?.card_description ? String(detail.card_description) : "",
  };
};

const hasMeaningfulDynamicValue = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const getDynamicFieldFallbackMap = (callDetailData, mappedCallDetail) => ({
  po_number: callDetailData?.po_number ?? mappedCallDetail?.poNumber,
  project_name: callDetailData?.project_name ?? mappedCallDetail?.project,
  project_code: callDetailData?.project_code,
  srt_number: callDetailData?.srt_number ?? mappedCallDetail?.srtNo ?? mappedCallDetail?.srtPoWbs,
});

const hasRenderableEntityFieldValue = (field, callDetailData, entityFieldValues, mappedCallDetail) => {
  const fieldId = field?.field_id;
  const fieldKey = field?.field_key ? String(field.field_key).trim() : "";

  if (hasMeaningfulDynamicValue(entityFieldValues?.[fieldId])) return true;

  if (!fieldKey) return false;

  if (hasMeaningfulDynamicValue(callDetailData?.[fieldKey])) return true;

  const fallbackMap = getDynamicFieldFallbackMap(callDetailData, mappedCallDetail);
  if (hasMeaningfulDynamicValue(fallbackMap[fieldKey])) return true;

  return false;
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

const FormSelect = ({
  value,
  onChange,
  options = [],
  placeholder,
  searchPlaceholder,
  className = "",
  disabled = false,
  hasError = false,
}) => {
  const normalizedValue = value === undefined || value === null ? "" : String(value);
  return (
    <SearchableSelect
      value={normalizedValue}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      className={className}
      disabled={disabled}
      hasError={hasError}
    />
  );
};

FormSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
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
        <SearchableSelect
          value={value === undefined || value === null ? "" : String(value)}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          searchPlaceholder={deriveSearchPlaceholder(placeholder)}
          disabled={disabled}
          hasError={showErr}
          className="cf-owner-searchable-select"
        />
      </div>
      {error ? <div className="cf-field-error">{error}</div> : null}
    </FormField>
  );
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
                {/* {file.size && (
                  <span className="document-file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                )} */}
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
const MultiSelectEmail = ({ value = [], onChange, options = [], placeholder, onAddNew, disabled = false, name = "dailyReportEmail" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [isAddingNewEmail, setIsAddingNewEmail] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const dropdownRef = useRef(null);

  const valuesEqual = (a, b) => String(a) === String(b);
  const valueToLabel = (val) => {
    const opt = options.find((o) => valuesEqual(o.value, val));
    return opt?.label ?? String(val);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAddingNewEmail) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddInput(false);
        setFilterQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAddingNewEmail]);

  useEffect(() => {
    if (!isOpen) setFilterQuery("");
  }, [isOpen]);

  const filterPlaceholder = useMemo(() => deriveSearchPlaceholder(placeholder), [placeholder]);

  const filteredOptions = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => String(o.label).toLowerCase().includes(q));
  }, [options, filterQuery]);

  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const pushSelectedValue = (optionValue) => {
    if (selectedValues.some((v) => valuesEqual(v, optionValue))) return;
    const syntheticEvent = {
      target: { value: [...selectedValues, optionValue], name }
    };
    onChange(syntheticEvent);
  };

  const handleToggle = (optionValue) => {
    const newValue = selectedValues.some((v) => valuesEqual(v, optionValue))
      ? selectedValues.filter((e) => !valuesEqual(e, optionValue))
      : [...selectedValues, optionValue];

    const syntheticEvent = {
      target: { value: newValue, name }
    };
    onChange(syntheticEvent);
  };

  const handleAddNewEmail = async () => {
    const email = newEmail.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !isValid || isAddingNewEmail) return;

    const selectedAlready = selectedValues.some((entry) => String(entry).trim().toLowerCase() === email.toLowerCase());
    if (selectedAlready) {
      setNewEmail("");
      setShowAddInput(false);
      return;
    }

    const existingOption = options.find((opt) => {
      const label = String(opt?.label ?? "").trim().toLowerCase();
      const rawValue = String(opt?.value ?? "").trim().toLowerCase();
      return label === email.toLowerCase() || rawValue === email.toLowerCase();
    });

    if (existingOption) {
      pushSelectedValue(existingOption.value);
      setNewEmail("");
      setShowAddInput(false);
      return;
    }

    try {
      setIsAddingNewEmail(true);
      pushSelectedValue(email);
      if (onAddNew) {
        await Promise.resolve(onAddNew(email));
      }
      setNewEmail("");
      setShowAddInput(false);
      setIsOpen(true);
    } finally {
      setIsAddingNewEmail(false);
    }
  };

  const handleRemoveEmail = (rawVal, e) => {
    e.stopPropagation();
    const newValue = selectedValues.filter((entry) => !valuesEqual(entry, rawVal));
    const syntheticEvent = {
      target: { value: newValue, name }
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
        <div className="cf-multi-select-dropdown cf-multi-select-dropdown--filterable">
          <div className="cf-multi-select-filter" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              className="cf-multi-select-filter-input"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={filterPlaceholder}
              autoComplete="off"
            />
          </div>
          <div className="cf-multi-select-results">
            <div className="cf-multi-select-options-scroll">
              {filteredOptions.length === 0 ? (
                <div className="cf-multi-select-no-results">No results found</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.some((v) => valuesEqual(v, option.value));
                  return (
                    <div
                      key={String(option.value)}
                      className={`cf-multi-select-option ${isSelected ? "selected" : ""}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleToggle(option.value);
                      }}
                    >
                      <span className="cf-multi-select-checkbox">
                        {isSelected && "✓"}
                      </span>
                      <span>{option.label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="cf-multi-select-footer" onMouseDown={(e) => e.stopPropagation()}>
            {!showAddInput ? (
              <div
                className="cf-multi-select-option add-new"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setShowAddInput(true);
                  setNewEmail("");
                }}
              >
                <span>+ Add New Email</span>
              </div>
            ) : (
              <div className="cf-multi-select-add-input" onMouseDown={(e) => e.stopPropagation()}>
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
                  disabled={isAddingNewEmail || !newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())}
                >
                  {isAddingNewEmail ? "..." : "✓"}
                </button>
                <button
                  type="button"
                  className="cf-cancel-email-btn"
                  disabled={isAddingNewEmail}
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
  name: PropTypes.string,
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
const DailyTaskTodo = ({ tasks = [], accentColor, isLoading = false, error = "" }) => {
  const normalizedTasks = Array.isArray(tasks) ? tasks : [];
  const completedCount = normalizedTasks.filter((t) => String(t?.status || "").toUpperCase() === "COMPLETED").length;
  const totalCount = normalizedTasks.length;

  const formatTaskDateTime = (value) => {
    if (!value) return "";
    const normalized = String(value).trim().replace(" ", "T");
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="daily-task-todo-wrapper">
      <FormField label="Daily Tasks / Todo">
        <div className="daily-task-container">
          <div className="daily-task-list-scroll" aria-label="Task list">
            <div className="daily-task-list">
              {isLoading ? (
                <div className="daily-task-empty">
                  <p>Loading tasks...</p>
                </div>
              ) : error ? (
                <div className="daily-task-empty">
                  <p>{error}</p>
                </div>
              ) : normalizedTasks.length === 0 ? (
                <div className="daily-task-empty">
                  <p>No KPI tasks available.</p>
                </div>
              ) : (
                normalizedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="daily-task-item"
                  >
                    <div className="daily-task-checkbox-display">
                      <div
                        className="daily-task-checkbox-icon checked"
                        style={{ backgroundColor: task.statusColor || accentColor || "#1f7aec" }}
                      >
                        <span style={{ color: "#fff", fontSize: "10px", lineHeight: 1 }}>•</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
                      <span className="daily-task-text">{task.text}</span>
                      <div style={{ fontSize: "11px", color: "#666" }}>
                        {task.startTime && <span>Start: {formatTaskDateTime(task.startTime)}</span>}
                        {task.dueTime && <span> | Due: {formatTaskDateTime(task.dueTime)}</span>}
                        {task.completedTime && <span> | Completed: {formatTaskDateTime(task.completedTime)}</span>}
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: task.statusColor || "#666" }}>
                        {task.status || "PENDING"}
                        {task.delayText ? ` - ${task.delayText}` : ""}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {normalizedTasks.length > 0 && (
            <div className="daily-task-summary">
              <span className="daily-task-summary-text">
                {completedCount} of {totalCount} completed
              </span>
              <div className="daily-task-progress-bar">
                <div
                  className="daily-task-progress-fill"
                  style={{
                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
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
      status: PropTypes.string,
      statusColor: PropTypes.string,
      startTime: PropTypes.string,
      dueTime: PropTypes.string,
      completedTime: PropTypes.string,
      delayText: PropTypes.string,
    })
  ),
  accentColor: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

const GeneralViewSectionShimmer = () => (
  <div className="general-info-three-column general-tab-form-layout general-view-section-shimmer" aria-live="polite">
    <div className="general-info-left">
      <div className="general-view-form-scroll">
        <div className="general-shimmer-section">
          <div className="general-shimmer-line general-shimmer-line--heading" />
          <div className="general-shimmer-line general-shimmer-line--input" />
          <div className="general-shimmer-line general-shimmer-line--label" />
          <div className="general-shimmer-line general-shimmer-line--input" />
          <div className="general-shimmer-line general-shimmer-line--label" />
          <div className="general-shimmer-line general-shimmer-line--input" />
        </div>
        <div className="general-shimmer-section">
          <div className="general-shimmer-line general-shimmer-line--heading" />
          <div className="general-shimmer-line general-shimmer-line--label" />
          <div className="general-shimmer-line general-shimmer-line--input" />
          <div className="general-shimmer-line general-shimmer-line--label" />
          <div className="general-shimmer-line general-shimmer-line--input" />
          <div className="general-shimmer-line general-shimmer-line--label" />
          <div className="general-shimmer-line general-shimmer-line--input" />
        </div>
      </div>
    </div>
    <div className="general-info-middle">
      <div className="general-shimmer-panel">
        <div className="general-shimmer-line general-shimmer-line--heading" />
        <div className="general-shimmer-line general-shimmer-line--editor" />
      </div>
    </div>
    {/* <div className="general-info-right">
      <div className="general-shimmer-panel">
        <div className="general-shimmer-line general-shimmer-line--heading" />
        <div className="general-shimmer-line general-shimmer-line--card" />
        <div className="general-shimmer-line general-shimmer-line--card" />
      </div>
    </div> */}
  </div>
);


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

const normalizePreviewValue = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const getOptionLabel = (options = [], value = "") => {
  const normalizedValue = normalizePreviewValue(value);
  if (!normalizedValue || !Array.isArray(options)) return "";
  const match = options.find((item) => normalizePreviewValue(item?.value) === normalizedValue);
  return match?.label ? String(match.label).trim() : "";
};

const mapMultiValuesToLabels = (options = [], values = []) => {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => {
      const normalized = normalizePreviewValue(value);
      if (!normalized) return "";
      return getOptionLabel(options, normalized) || normalized;
    })
    .filter(Boolean);
};

const getPreviewRecipients = ({ dailyReportEmailOptions = [], billingInstructionEmailOptions = [], dailyValues = [], billingValues = [] }) => {
  const daily = mapMultiValuesToLabels(dailyReportEmailOptions, dailyValues);
  const billing = mapMultiValuesToLabels(billingInstructionEmailOptions, billingValues);
  const merged = [...daily, ...billing];
  return merged.length ? merged.join(", ") : "—";
};

const getPreviewSubject = ({ cardTitle = "", typeOfCall = "", vesselName = "", port = "" }) => {
  const normalizedTitle = normalizePreviewValue(cardTitle);
  if (normalizedTitle) return normalizedTitle;
  const parts = [typeOfCall, vesselName, port].map((item) => normalizePreviewValue(item)).filter(Boolean);
  if (parts.length) return parts.join(" - ");
  return "Appointment Update";
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

const firstNonEmptyString = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
};

const normalizeEmailFieldValue = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return firstNonEmptyString(item.email, item.value, item.label);
        }
        return "";
      })
      .filter(Boolean)
      .join(", ");
  }
  return firstNonEmptyString(value);
};

const resolveEmailPreviewPayload = (payload) => {
  const root = payload?.data?.data ?? payload?.data ?? payload ?? {};
  const data = Array.isArray(root) ? (root[0] ?? {}) : root;
  if (!data || typeof data !== "object") return null;
  const appointmentAcceptance =
    (data?.appointment_acceptance && typeof data.appointment_acceptance === "object")
      ? data.appointment_acceptance
      : null;
  const source = appointmentAcceptance ?? data;
  return {
    from: firstNonEmptyString(source.from, source.from_email, source.sender_email, source.sender),
    to: normalizeEmailFieldValue(source.to ?? source.to_email ?? source.service_requestor_email),
    cc: normalizeEmailFieldValue(source.cc ?? source.cc_email ?? source.cc_emails),
    subject: htmlToPlainText(firstNonEmptyString(source.subject, source.email_subject)),
    messageHtml: firstNonEmptyString(source.message, source.body, source.email_body, source.email_content),
    message: htmlToPlainText(firstNonEmptyString(source.message, source.body, source.email_body, source.email_content)),
  };
};

const formatPreviewDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

const EmailPreviewPanel = ({
  ownerOptions,
  formValues,
  dailyReportEmailOptions,
  billingInstructionEmailOptions,
  callTypeOptions,
  vesselNameOptions,
  portSelectOptions,
  getFieldValue,
  previewData,
  editableFields,
  onEditableFieldChange,
  messageValue,
  onMessageChange,
}) => {
  const previewFromApi = previewData && typeof previewData === "object" ? previewData : {};
  const ownerLabel = getOptionLabel(ownerOptions, getFieldValue("owner"));
  const fallbackFromValue = ownerLabel ? `${ownerLabel} <noreply@sedres.com>` : "operations@shipping.com";
  const fromValue = firstNonEmptyString(editableFields?.from_email, previewFromApi.from, fallbackFromValue) || "operations@shipping.com";
  const fallbackToValue = normalizePreviewValue(getFieldValue("serviceRequestorEmail")) || "—";
  const toValue = firstNonEmptyString(editableFields?.to_email, previewFromApi.to, fallbackToValue) || "";
  const fallbackCcValue = getPreviewRecipients({
    dailyReportEmailOptions,
    billingInstructionEmailOptions,
    dailyValues: getFieldValue("dailyReportEmail"),
    billingValues: getFieldValue("billingInstructionEmails"),
  });
  const subjectFallback = getPreviewSubject({
    cardTitle: formValues?.cardTitle || "",
    typeOfCall: getOptionLabel(callTypeOptions, getFieldValue("typeOfCall")) || getFieldValue("typeOfCall"),
    vesselName: getOptionLabel(vesselNameOptions, getFieldValue("vesselName")) || getFieldValue("vesselName"),
    port: getOptionLabel(portSelectOptions, getFieldValue("port")) || getFieldValue("port"),
  });
  const ccValue = firstNonEmptyString(editableFields?.cc_emails, previewFromApi.cc, fallbackCcValue) || "";
  const subjectValue = firstNonEmptyString(editableFields?.subject, previewFromApi.subject, subjectFallback) || "Appointment Update";
  return (
    <div className="general-add-preview-panel">
      <div className="email-preview-topbar">
        <div className="email-preview-topbar-title">Email Preview</div>
        <div className="email-preview-topbar-status">
          <span className="email-preview-status-dot" />
          <span>Preview generated</span>
          <span>{formatPreviewDate()}</span>
          <button type="button" className="email-preview-topbar-action" aria-label="Copy preview">⧉</button>
          <button type="button" className="email-preview-topbar-action" aria-label="Expand preview">⛶</button>
        </div>
      </div>
      <div className="email-preview-card">
        <div className="email-preview-content">
          <div className="email-preview-meta">
            <div className="email-preview-row">
              <div className="email-preview-row-label">From</div>
              <div className="email-preview-row-value">
                <input
                  type="text"
                  className="email-preview-inline-input"
                  value={fromValue}
                  onChange={onEditableFieldChange("from_email")}
                  placeholder="From email"
                />
              </div>
            </div>
            <div className="email-preview-row">
              <div className="email-preview-row-label">To</div>
              <div className="email-preview-row-value">
                <input
                  type="text"
                  className="email-preview-inline-input"
                  value={toValue}
                  onChange={onEditableFieldChange("to_email")}
                  placeholder="—"
                />
              </div>
            </div>
            <div className="email-preview-row">
              <div className="email-preview-row-label">Cc</div>
              <div className="email-preview-row-value">
                <input
                  type="text"
                  className="email-preview-inline-input"
                  value={ccValue}
                  onChange={onEditableFieldChange("cc_emails")}
                  placeholder="—"
                />
              </div>
            </div>
            <div className="email-preview-row">
              <div className="email-preview-row-label">Subject</div>
              <div className="email-preview-row-value">
                <input
                  type="text"
                  className="email-preview-inline-input"
                  value={subjectValue}
                  onChange={onEditableFieldChange("subject")}
                  placeholder="Email subject"
                />
              </div>
            </div>
          </div>
          <div className="email-preview-message-section">
            <div className="email-preview-message-title">Message</div>
            <textarea
              className="email-preview-message-input"
              value={messageValue}
              onChange={onMessageChange}
              placeholder="Type email content here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EmailPreviewPanel.propTypes = {
  ownerOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  formValues: PropTypes.object,
  dailyReportEmailOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  billingInstructionEmailOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  callTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  vesselNameOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  portSelectOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
    })
  ),
  getFieldValue: PropTypes.func.isRequired,
  previewData: PropTypes.shape({
    from: PropTypes.string,
    to: PropTypes.string,
    cc: PropTypes.string,
    subject: PropTypes.string,
    messageHtml: PropTypes.string,
    message: PropTypes.string,
  }),
  editableFields: PropTypes.shape({
    from_email: PropTypes.string,
    to_email: PropTypes.string,
    cc_emails: PropTypes.string,
    subject: PropTypes.string,
  }),
  onEditableFieldChange: PropTypes.func.isRequired,
  messageValue: PropTypes.string,
  onMessageChange: PropTypes.func.isRequired,
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
  const [previewMessageText, setPreviewMessageText] = useState("");
  const [emailPreviewData, setEmailPreviewData] = useState(null);
  const [isPreviewMessageDirty, setIsPreviewMessageDirty] = useState(false);
  const [editablePreviewFields, setEditablePreviewFields] = useState({
    from_email: "",
    to_email: "",
    cc_emails: "",
    subject: "",
  });
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
  const lastHydratedEntityFieldCallIdRef = useRef(null);
  const [operatorKpiTasks, setOperatorKpiTasks] = useState([]);
  const [operatorKpiLoading, setOperatorKpiLoading] = useState(false);
  const [operatorKpiError, setOperatorKpiError] = useState("");

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

  useEffect(() => {
    if (isAddMode) {
      lastHydratedEntityFieldCallIdRef.current = null;
      return;
    }
    if (!callDetailData) return;
    const detailCallIdRaw = callDetailData?.call_id ?? currentCallId;
    if (detailCallIdRaw === undefined || detailCallIdRaw === null || String(detailCallIdRaw).trim() === "") {
      return;
    }
    const detailCallId = String(detailCallIdRaw);
    if (!Array.isArray(entityFields) || entityFields.length === 0) return;

    const fallbackMap = {
      po_number: callDetailData?.po_number ?? mappedCallDetail?.poNumber ?? "",
      project_name: callDetailData?.project_name ?? mappedCallDetail?.project ?? "",
      project_code: callDetailData?.project_code ?? "",
    };

    setEntityFieldValues((prev) => {
      const hasExistingUserInput = Object.values(prev || {}).some(
        (value) => value !== undefined && value !== null && String(value).trim() !== ""
      );
      const sameCallAsLastHydration = lastHydratedEntityFieldCallIdRef.current === detailCallId;
      if (hasExistingUserInput && sameCallAsLastHydration) return prev;

      const nextValues = {};
      entityFields.forEach((field) => {
        const fieldId = field?.field_id;
        if (!fieldId) return;
        const key = field?.field_key ? String(field.field_key).trim() : "";
        if (!key) {
          nextValues[fieldId] = "";
          return;
        }
        const direct = callDetailData?.[key];
        const resolved = direct !== undefined && direct !== null && String(direct).trim() !== ""
          ? String(direct)
          : fallbackMap[key] !== undefined && fallbackMap[key] !== null
            ? String(fallbackMap[key])
            : "";
        nextValues[fieldId] = resolved;
      });

      lastHydratedEntityFieldCallIdRef.current = detailCallId;
      return nextValues;
    });
  }, [isAddMode, callDetailData, entityFields, mappedCallDetail, currentCallId]);

  const visibleDynamicEntityFields = useMemo(() => {
    if (isAddMode) return entityFields;
    return entityFields.filter((field) =>
      hasRenderableEntityFieldValue(field, callDetailData, entityFieldValues, mappedCallDetail)
    );
  }, [isAddMode, entityFields, callDetailData, entityFieldValues, mappedCallDetail]);

  const mappedOperatorKpiTasks = useMemo(() => {
    const rows = Array.isArray(operatorKpiTasks) ? operatorKpiTasks : [];
    return rows.map((row) => ({
      id: String(row?.operator_kpi_id ?? row?.id ?? `${row?.task_name ?? "task"}-${row?.due_time ?? ""}`),
      text: row?.task_name ? String(row.task_name) : "Untitled task",
      startTime: row?.start_time ? String(row.start_time) : "",
      dueTime: row?.due_time ? String(row.due_time) : "",
      completedTime: row?.completed_time ? String(row.completed_time) : "",
      status: row?.status ? String(row.status) : "",
      statusColor: row?.status_color ? String(row.status_color) : "",
      delayText: row?.delay_text ? String(row.delay_text) : "",
    }));
  }, [operatorKpiTasks]);

  useEffect(() => {
    if (isAddMode) {
      setOperatorKpiTasks([]);
      setOperatorKpiError("");
      setOperatorKpiLoading(false);
      return;
    }

    const operatorIdRaw = callDetailData?.assigned_operator_id ?? mappedCallDetail?.assignedOperator;
    const callIdRaw = callDetailData?.call_id ?? mappedCallDetail?.callId;
    const operatorId = operatorIdRaw === undefined || operatorIdRaw === null ? "" : String(operatorIdRaw).trim();
    const callId = callIdRaw === undefined || callIdRaw === null ? "" : String(callIdRaw).trim();

    if (!operatorId || !callId) {
      setOperatorKpiTasks([]);
      setOperatorKpiError("");
      setOperatorKpiLoading(false);
      return;
    }

    let cancelled = false;
    const loadOperatorKpi = async () => {
      setOperatorKpiLoading(true);
      setOperatorKpiError("");
      try {
        const { data } = await kpiTasksService.getOperatorKpi(operatorId, callId);
        const rows = Array.isArray(data?.data) ? data.data : [];
        if (!cancelled) {
          setOperatorKpiTasks(rows);
        }
      } catch (error) {
        console.error("[General] operator KPI fetch failed", error);
        if (!cancelled) {
          setOperatorKpiTasks([]);
          setOperatorKpiError("Unable to load KPI tasks.");
        }
      } finally {
        if (!cancelled) {
          setOperatorKpiLoading(false);
        }
      }
    };

    void loadOperatorKpi();
    return () => {
      cancelled = true;
    };
  }, [isAddMode, callDetailData, mappedCallDetail]);

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

  const hasMeaningfulValue = (value) => {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  };

  // Helper function to get field value - prioritize formValues, then fetched call detail, then card.
  const getFieldValue = (fieldName) => {
    const apiAliasByField = {
      poNumber: "po_number",
      srtNo: "srt_number",
      srtPoWbs: "srt_number",
      project: "project_name",
      mainBillingEntity: "main_billing_entity_id",
      vesselName: "vessel_id",
    };

    if (hasMeaningfulValue(formValues?.[fieldName])) {
      return formValues[fieldName];
    }
    if (!isAddMode && hasMeaningfulValue(mappedCallDetail?.[fieldName])) {
      return mappedCallDetail[fieldName];
    }
    if (!isAddMode && hasMeaningfulValue(card?.[fieldName])) {
      return card[fieldName];
    }
    const apiAlias = apiAliasByField[fieldName];
    if (
      !isAddMode &&
      apiAlias &&
      callDetailData?.[apiAlias] !== undefined &&
      callDetailData[apiAlias] !== null &&
      String(callDetailData[apiAlias]).trim() !== ""
    ) {
      return String(callDetailData[apiAlias]);
    }
    if (
      !isAddMode &&
      apiAlias &&
      card?.[apiAlias] !== undefined &&
      card[apiAlias] !== null &&
      String(card[apiAlias]).trim() !== ""
    ) {
      return String(card[apiAlias]);
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

  useEffect(() => {
    if (!isAddMode) return;
    const initialFromDescription = htmlToPlainText(formValues?.cardDescription || "");
    setPreviewMessageText((prev) => (prev.trim() ? prev : initialFromDescription));
  }, [isAddMode, formValues?.cardDescription]);

  useEffect(() => {
    if (isAddMode) return;
    setEmailPreviewData(null);
    setIsPreviewMessageDirty(false);
    setEditablePreviewFields({
      from_email: "",
      to_email: "",
      cc_emails: "",
      subject: "",
    });
  }, [isAddMode]);

  const populateEditablePreviewFields = useCallback((resolvedPreview) => {
    setEditablePreviewFields({
      from_email: firstNonEmptyString(resolvedPreview?.from),
      to_email: firstNonEmptyString(resolvedPreview?.to),
      cc_emails: firstNonEmptyString(resolvedPreview?.cc),
      subject: firstNonEmptyString(resolvedPreview?.subject),
    });
  }, []);

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

    const requiredErrors = validateRequiredEntityFields(visibleDynamicEntityFields, entityFieldValues);
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
      appointment_acceptance: {
        body: firstNonEmptyString(previewMessageText),
        cc_emails: firstNonEmptyString(editablePreviewFields.cc_emails),
        from_email: firstNonEmptyString(editablePreviewFields.from_email),
        subject: firstNonEmptyString(editablePreviewFields.subject),
        to_email: firstNonEmptyString(editablePreviewFields.to_email),
      },
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
        const idRaw = item?.id ?? item?.email_id ?? item?.reference;
        const id = idRaw === undefined || idRaw === null ? "" : String(idRaw).trim();
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
        const idRaw = item?.id ?? item?.email_id ?? item?.reference;
        const id = idRaw === undefined || idRaw === null ? "" : String(idRaw).trim();
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

  const previewVesselId = firstNonEmptyString(getFieldValue("vesselName"));
  const previewPortId = firstNonEmptyString(getFieldValue("port"));
  const previewCallType = firstNonEmptyString(getFieldValue("typeOfCall"));
  const previewServiceRequestorEmail = firstNonEmptyString(getFieldValue("serviceRequestorEmail"));

  useEffect(() => {
    if (!isAddMode) return;
    const hasAllRequiredPreviewFields =
      Boolean(previewVesselId) &&
      Boolean(previewPortId) &&
      Boolean(previewCallType) &&
      Boolean(previewServiceRequestorEmail);

    if (!hasAllRequiredPreviewFields) {
      setEmailPreviewData(null);
      setEditablePreviewFields({
        from_email: "",
        to_email: "",
        cc_emails: "",
        subject: "",
      });
      return;
    }

    let cancelled = false;
    const fetchEmailPreview = async () => {
      try {
        const { data } = await callFileService.getAllDetailByVesselId({
          vessel_id: previewVesselId,
          port_id: previewPortId,
          call_type: previewCallType,
          service_requestor_email: previewServiceRequestorEmail,
        });
        if (cancelled) return;
        const resolved = resolveEmailPreviewPayload(data);
        setEmailPreviewData(resolved);
        populateEditablePreviewFields(resolved);
        if (!isPreviewMessageDirty) {
          const apiMessage = firstNonEmptyString(
            htmlToEditableText(resolved?.messageHtml),
            resolved?.message
          );
          if (apiMessage) {
            setPreviewMessageText(apiMessage);
          }
        }
      } catch (error) {
        console.error("[General] email preview fetch failed", error);
        if (!cancelled) {
          setEmailPreviewData(null);
          setEditablePreviewFields({
            from_email: "",
            to_email: "",
            cc_emails: "",
            subject: "",
          });
        }
      }
    };
    void fetchEmailPreview();
    return () => {
      cancelled = true;
    };
  }, [
    isAddMode,
    previewVesselId,
    previewPortId,
    previewCallType,
    previewServiceRequestorEmail,
    isPreviewMessageDirty,
    populateEditablePreviewFields,
  ]);

  // Determine if fields should be disabled
  // In simplified mode: always enabled
  // In full mode: disabled when not in add mode (same as before)
  const isDisabled = isSimplifiedMode ? false : !isAddMode;
  const isViewMode = !isAddMode;
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
        const field_key =
          row?.field_key === undefined || row?.field_key === null ? "" : String(row.field_key).trim();
        return { field_id, field_name, field_type, is_required, sequence_order, field_key };
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

  const optionalOtherBillingEntityOptions = useMemo(() => {
    const current = getFieldValue("otherBillingEntity");
    const base = mergeOptionIfMissing(billingEntitySelectOptions, current);
    return [{ value: "", label: "No Other Billing Entity" }, ...base];
  }, [billingEntitySelectOptions, getFieldValue]);

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
    <div className={`cardform-body general-tab-body ${isViewMode ? "general-tab-body--view-mode" : ""}`}>
      <div className="general-sections-wrapper">
        <div className={`cf-section general-info-section ${isAddMode ? "general-info-section--add-mode" : ""}`}>
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
            {!isAddMode && callDetailLoading ? (
              <GeneralViewSectionShimmer />
            ) : (
              <div className={isAddMode ? "general-add-mode-wrapper" : ""}>
                <div className={`${!isAddMode ? "general-info-three-column" : "general-info-two-column general-add-3col-layout"} general-tab-form-layout`}>
                  <div className={`general-info-left ${isAddMode ? "general-add-form-panel" : ""}`}>
                    <div className={isAddMode ? "general-add-form-scroll" : "general-view-form-scroll"}>
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
                              <DateTimePickerField
                                dateValue={getFieldValue("lastMovedDate")}
                                timeValue={getFieldValue("lastMovedTime")}
                                onDateChange={handleChange("lastMovedDate")}
                                onTimeChange={handleChange("lastMovedTime")}
                                dateFieldName="lastMovedDate"
                                timeFieldName="lastMovedTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
                              />
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
                              <DateTimePickerField
                                dateValue={getFieldValue("lastMovedDate")}
                                timeValue={getFieldValue("lastMovedTime")}
                                onDateChange={handleChange("lastMovedDate")}
                                onTimeChange={handleChange("lastMovedTime")}
                                dateFieldName="lastMovedDate"
                                timeFieldName="lastMovedTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
                              />
                            </FormField>

                            <FormField label="Inward Clearance Date">
                              <DateTimePickerField
                                dateValue={getFieldValue("inwardClearanceDate")}
                                timeValue={getFieldValue("inwardClearanceTime")}
                                onDateChange={handleChange("inwardClearanceDate")}
                                onTimeChange={handleChange("inwardClearanceTime")}
                                dateFieldName="inwardClearanceDate"
                                timeFieldName="inwardClearanceTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
                              />
                            </FormField>

                            <FormField label="Outward Clearance Date">
                              <DateTimePickerField
                                dateValue={getFieldValue("outwardClearanceDate")}
                                timeValue={getFieldValue("outwardClearanceTime")}
                                onDateChange={handleChange("outwardClearanceDate")}
                                onTimeChange={handleChange("outwardClearanceTime")}
                                dateFieldName="outwardClearanceDate"
                                timeFieldName="outwardClearanceTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
                              />
                            </FormField>

                            <FormField label="Operations completion date">
                              <DateTimePickerField
                                dateValue={getFieldValue("operationsCompletionDate")}
                                timeValue={getFieldValue("operationsCompletionTime")}
                                onDateChange={handleChange("operationsCompletionDate")}
                                onTimeChange={handleChange("operationsCompletionTime")}
                                dateFieldName="operationsCompletionDate"
                                timeFieldName="operationsCompletionTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
                              />
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
                              <DateTimePickerField
                                dateValue={getFieldValue("operationsCompletionDate")}
                                timeValue={getFieldValue("operationsCompletionTime")}
                                onDateChange={handleChange("operationsCompletionDate")}
                                onTimeChange={handleChange("operationsCompletionTime")}
                                dateFieldName="operationsCompletionDate"
                                timeFieldName="operationsCompletionTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
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
                              <DateTimePickerField
                                dateValue={getFieldValue("lastMovedDate")}
                                timeValue={getFieldValue("lastMovedTime")}
                                onDateChange={handleChange("lastMovedDate")}
                                onTimeChange={handleChange("lastMovedTime")}
                                dateFieldName="lastMovedDate"
                                timeFieldName="lastMovedTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
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
                              <DateTimePickerField
                                dateValue={getFieldValue("lastMovedDate")}
                                timeValue={getFieldValue("lastMovedTime")}
                                onDateChange={handleChange("lastMovedDate")}
                                onTimeChange={handleChange("lastMovedTime")}
                                dateFieldName="lastMovedDate"
                                timeFieldName="lastMovedTime"
                                disabled={isDisabled}
                                placeholder="Select date and time"
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
                                    <DateTimePickerField
                                      dateValue={getFieldValue("appointmentReceivedDate")}
                                      timeValue={getFieldValue("appointmentReceivedTime")}
                                      onDateChange={isAddMode ? handleValidatedChange("appointmentReceivedDate") : handleChange("appointmentReceivedDate")}
                                      onTimeChange={handleChange("appointmentReceivedTime")}
                                      dateFieldName="appointmentReceivedDate"
                                      timeFieldName="appointmentReceivedTime"
                                      disabled={isDisabled}
                                      hasError={isAddMode && Boolean(fieldErrors.appointmentReceivedDate)}
                                      placeholder="Select date and time"
                                    />
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

                              {!entityFieldsLoading &&
                                visibleDynamicEntityFields.map((field) => (
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
                                <FormField label="Vessel Name">
                                  <FormSelect
                                    value={getFieldValue("vesselName")}
                                    onChange={handleVesselSelectionChange}
                                    options={mergeOptionIfMissing(vesselNameOptions, getFieldValue("vesselName"))}
                                    placeholder="Select vessel name"
                                    disabled={isDisabled || vesselOptionsLoading}
                                  />
                                </FormField>
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
                                <FormField label="Other billing entity" className="cf-other-billing-field">
                                  <FormSelect
                                    value={getFieldValue("otherBillingEntity")}
                                    onChange={(event) => {
                                      const raw = event?.target?.value;
                                      const next = raw === undefined || raw === null ? "" : String(raw).trim();
                                      handleChange("otherBillingEntity")({
                                        target: {
                                          value: next,
                                          name: "otherBillingEntity",
                                        },
                                      });
                                    }}
                                    options={optionalOtherBillingEntityOptions}
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
                                <FormField label="Daily Report Emails" className="cf-daily-report-emails-field">
                                  <MultiSelectEmail
                                    name="dailyReportEmail"
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
                                <FormField label="Billing instructions" className="cf-billing-instruction-field">
                                  {billingInstructionType.toLowerCase() === "email" ? (
                                    <MultiSelectEmail
                                      name="billingInstructionEmails"
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

                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isAddMode ? (
                    <>
                      <div className="general-add-description-panel">
                        <div className="general-add-description-content">
                          <FormField label="Card Description">
                            <div className="general-card-description-editor">
                              <ReactQuillEditor
                                value={formValues?.cardDescription || ""}
                                onChange={handleChange("cardDescription")}
                                placeholder="Enter card description..."
                              />
                            </div>
                          </FormField>
                        </div>
                      </div>
                      <div className="general-info-right">
                        <EmailPreviewPanel
                          ownerOptions={operatorOptions}
                          formValues={formValues}
                          dailyReportEmailOptions={dailyReportEmailOptions}
                          billingInstructionEmailOptions={billingInstructionEmailOptions}
                          callTypeOptions={callTypeOptions}
                          vesselNameOptions={vesselNameOptions}
                          portSelectOptions={portSelectOptions}
                          getFieldValue={getFieldValue}
                          previewData={emailPreviewData}
                          editableFields={editablePreviewFields}
                          onEditableFieldChange={(fieldName) => (event) => {
                            const nextVal = event?.target?.value ?? "";
                            setEditablePreviewFields((prev) => ({
                              ...prev,
                              [fieldName]: nextVal,
                            }));
                          }}
                          messageValue={previewMessageText}
                          onMessageChange={(event) => {
                            setIsPreviewMessageDirty(true);
                            setPreviewMessageText(event?.target?.value ?? "");
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {shouldShowApiField("card_description") && (
                        <div className="general-info-middle">
                          <div className="card-description-wrapper">
                            <FormField label="Card Description">
                              <ReactQuillEditor
                                value={getFieldValue("cardDescription")}
                                onChange={handleChange("cardDescription")}
                                placeholder="Enter card description..."
                              />
                            </FormField>
                          </div>
                        </div>
                      )}
                      <div className="general-info-right">
                        <div className="daily-task-box-wrapper">
                          <DailyTaskTodo
                            tasks={mappedOperatorKpiTasks}
                            accentColor={accentColor}
                            isLoading={operatorKpiLoading}
                            error={operatorKpiError}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {isAddMode && (
                  <div className="general-add-page-actions">
                    <button
                      type="button"
                      className="form-save-button"
                      onClick={handleSubmit}
                      disabled={isSavingGeneral}
                    >
                      {isSavingGeneral ? "Saving..." : "Add Card"}
                    </button>
                  </div>
                )}
              </div>
            )}
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

