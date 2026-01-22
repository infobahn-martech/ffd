import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useRef } from "react";
import { SendReportPreviewModal } from "./Operation";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/checklist.scss";

// Checklist Type Options
const CHECKLIST_TYPES = {
  BOAT_ARRIVING_ONBOARD: "BOAT ARRIVING ONBOARD",
  ACCOMMODATION_CONSTRUCTION_BARGE: "ACCOMODATION/CONSTRUCITON BARGE",
};

// Checklist Data for ACCOMODATION/CONSTRUCITON BARGE
const accommodationBargeChecklist = [
  {
    id: "documents_vessel_owners",
    title: "A) DOCUMENTS REQUIRED FROM VESSEL OWNERS / PRINCIPAL VESSEL",
    items: [
      {
        id: "commercial_invoice_vessel",
        label: "Commercial invoice for vessel ORIGINAL REQUIRED",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "bill_of_lading_vessel",
        label: "Bill of lading REQUIRE COPY ONLY",
        requirement: "Noncompliance with the enclosed flyer could lead to failure to pass pre-berthing, which leads to berthing delays, and in some cases — aborted operations"
      },
      {
        id: "charter_party_agreement",
        label: "Charter Party Agreement REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
    ],
  },
  {
    id: "documents_towing_tug",
    title: "B) DOCUMENTS REQUIRED FROM VESSEL TOWING TUG MASTER",
    items: [
      {
        id: "equipment_material_declaration",
        label: "Equipment/Material Deck declaration letter REQUIRE COPY ONLY FORMAT ATTACHED",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "bill_of_lading_tug",
        label: "Bill of lading REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
    ],
  },
  {
    id: "marine_work_permit",
    title: "1. MARINE WORK PERMIT",
    items: [
      {
        id: "vessel_registry_certificate",
        label: "Vessel Registry certificate REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "international_tonnage_certificate",
        label: "International Tonnage certificate REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
    ],
  },
  {
    id: "authorisation_letter",
    title: "C) AUTHORISATION LETTER FOR AGENCY & UNDERTAKING LETTER (DOCUMENT REQUIRED FROM CONSIGNEE)",
    items: [
      {
        id: "commercial_registration",
        label: "Commercial Registration REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
    ],
  },
];

// Dummy Checklist Data for BOAT ARRIVING ONBOARD
const boatArrivingOnboardChecklist = [
  {
    id: "pre_arrival_documents",
    title: "A) PRE-ARRIVAL DOCUMENTS",
    items: [
      {
        id: "arrival_notice",
        label: "Arrival Notice REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "crew_declaration",
        label: "Crew Declaration REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "cargo_declaration",
        label: "Cargo Declaration REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
    ],
  },
  {
    id: "clearance_documents",
    title: "B) CLEARANCE DOCUMENTS",
    items: [
      {
        id: "port_entry_permit",
        label: "Port Entry Permit REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "health_certificate",
        label: "Health Certificate REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "customs_declaration",
        label: "Customs Declaration REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
    ],
  },
  {
    id: "safety_documents",
    title: "C) SAFETY DOCUMENTS",
    items: [
      {
        id: "safety_equipment_list",
        label: "Safety Equipment List REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
      {
        id: "emergency_contact_list",
        label: "Emergency Contact List REQUIRE COPY ONLY",
        requirement: "COPY OF INVENTORY LIST TO BE SIGNED AND STAMPED BY MASTER (Require minimum 3 days prior arrival to arrange if Arabic translation done from our end)"
      },
    ],
  },
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

const FormInput = ({ type = "text", value, onChange, placeholder, className = "" }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
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
};

const FormTextarea = ({ value, onChange, placeholder, className = "", rows = 3, disabled = false }) => {
  return (
    <div className={`cf-textarea ${className}`}>
      <textarea
        value={value || ""}
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

// Multi-select component for Checklist Type with tags/chips
const MultiSelect = ({ value = [], onChange, options = [], placeholder, className = "", cardColor = "#2A00FF", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange({ target: { value: newValue } });
  };

  const handleRemoveTag = (e, optionValue) => {
    e.stopPropagation();
    const newValue = value.filter((v) => v !== optionValue);
    onChange({ target: { value: newValue } });
  };

  const getOptionLabel = (optionValue) => {
    const option = options.find((opt) => opt.value === optionValue);
    return option ? option.label : optionValue;
  };

  return (
    <div className={`cf-multiselect ${className} ${disabled ? "disabled" : ""}`} ref={dropdownRef} style={{ "--card-color": cardColor }}>
      <div
        className="cf-multiselect-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1 }}
      >
        <div className="cf-multiselect-tags">
          {value.length === 0 ? (
            <span className="cf-multiselect-placeholder">{placeholder || "Select options..."}</span>
          ) : (
            value.map((val) => (
              <span key={val} className="cf-multiselect-tag" style={{ "--card-color": cardColor }}>
                <span className="cf-multiselect-tag-text">{getOptionLabel(val)}</span>
                {!disabled && (
                  <button
                    type="button"
                    className="cf-multiselect-tag-remove"
                    onClick={(e) => handleRemoveTag(e, val)}
                    aria-label={`Remove ${getOptionLabel(val)}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
        <span className="cf-multiselect-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="cf-multiselect-dropdown" style={{ "--card-color": cardColor }}>
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                className={`cf-multiselect-option ${isSelected ? "selected" : ""}`}
                onClick={() => handleToggle(option.value)}
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

MultiSelect.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  cardColor: PropTypes.string,
};

// File Preview Component
const FilePreview = ({ file, onRemove }) => {
  if (!file) return null;

  const getFileType = (fileName) => {
    if (!fileName) return '';
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext || '';
  };

  // Handle both File objects and stored file data objects
  const fileName = file?.name || file?.fileName || 'Untitled';
  const fileType = getFileType(fileName);
  const isPDF = fileType === 'pdf';
  const isWord = ['doc', 'docx'].includes(fileType);

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <div className="checklist-file-preview">
      <button
        type="button"
        className="checklist-file-preview-close"
        onClick={handleRemoveClick}
        title="Remove file"
      >
        ×
      </button>
      <div className="checklist-file-preview-icon">
        {isPDF && (
          <div className="checklist-file-icon-pdf">
            <div className="checklist-file-icon-pdf-inner">
              <div className="checklist-file-icon-pdf-graphic">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4 L22 4 L26 8 L26 28 L6 28 Z" fill="white" stroke="#DC143C" strokeWidth="1.5" />
                  <path d="M22 4 L22 8 L26 8" stroke="#DC143C" strokeWidth="1.5" fill="none" />
                  <path d="M10 12 L20 12 L20 13.5 L10 13.5 Z" fill="#DC143C" />
                  <path d="M10 16 L18 16 L18 17.5 L10 17.5 Z" fill="#DC143C" />
                </svg>
              </div>
              <div className="checklist-file-icon-pdf-text">PDF</div>
            </div>
          </div>
        )}
        {isWord && (
          <div className="checklist-file-icon-word">
            <div className="checklist-file-icon-word-inner">
              <div className="checklist-file-icon-word-logo">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="8" y="8" width="24" height="24" rx="2" fill="#2B579A" />
                  <text x="20" y="27" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">W</text>
                </svg>
              </div>
              <div className="checklist-file-icon-word-lines">
                <div className="checklist-file-icon-word-line"></div>
                <div className="checklist-file-icon-word-line"></div>
                <div className="checklist-file-icon-word-line short"></div>
              </div>
            </div>
          </div>
        )}
        {!isPDF && !isWord && (
          <div className="checklist-file-icon-generic">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 5 L45 5 L50 10 L50 55 L10 55 Z" fill="white" stroke="#D0D0D0" strokeWidth="2" />
              <path d="M45 5 L45 10 L50 10" stroke="#D0D0D0" strokeWidth="2" fill="none" />
              <path d="M15 20 L40 20" stroke="#D0D0D0" strokeWidth="2" />
              <path d="M15 27 L35 27" stroke="#D0D0D0" strokeWidth="2" />
              <path d="M15 34 L38 34" stroke="#D0D0D0" strokeWidth="2" />
            </svg>
          </div>
        )}
      </div>
      <div className="checklist-file-preview-name">{fileName}</div>
    </div>
  );
};

FilePreview.propTypes = {
  file: PropTypes.object,
  onRemove: PropTypes.func,
};

// Item Detail Modal Component
const ItemDetailModal = ({ item, isOpen, onClose, itemData, onUpdate, cardColor = "#2A00FF" }) => {
  const [remarks, setRemarks] = useState(itemData?.remarks || "");
  const [checked, setChecked] = useState(itemData?.checked || false);
  const [uploadedFile, setUploadedFile] = useState(itemData?.uploadedFile || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSampleDocumentClick = () => {
    // Create a minimal valid PDF document
    const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 65>>stream
BT
/F1 24 Tf
100 700 Td
(Sample Document) Tj
0 -30 Td
(${item.label}) Tj
ET
endstream
endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000254 00000 n 
0000000330 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
420
%%EOF`;

    // Create a blob from the PDF content
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.label.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_sample.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up after a delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const handleSave = () => {
    onUpdate({
      remarks,
      checked,
      uploadedFile,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="checklist-item-modal-overlay" onClick={onClose}>
      <div className="checklist-item-modal" onClick={(e) => e.stopPropagation()} style={{ "--card-color": cardColor }}>
        <div className="checklist-item-modal-header">
          <h3>{item.label}</h3>
          <button type="button" className="checklist-item-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="checklist-item-modal-body">
          <FormField label="Remarks">
            <FormTextarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks..."
              rows={4}
            />
          </FormField>

          <div className="cf-field">
            <div className="checklist-document-upload-header">
              <label>Document Upload</label>
              <div
                className="checklist-file-icon-pdf checklist-sample-pdf"
                onClick={handleSampleDocumentClick}
                title="Click to view sample document"
              >
                <div className="checklist-file-icon-pdf-inner">
                  <div className="checklist-file-icon-pdf-graphic">
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 4 L22 4 L26 8 L26 28 L6 28 Z" fill="white" stroke="#DC143C" strokeWidth="1.5" />
                      <path d="M22 4 L22 8 L26 8" stroke="#DC143C" strokeWidth="1.5" fill="none" />
                      <path d="M10 12 L20 12 L20 13.5 L10 13.5 Z" fill="#DC143C" />
                      <path d="M10 16 L18 16 L18 17.5 L10 17.5 Z" fill="#DC143C" />
                    </svg>
                  </div>
                  <div className="checklist-file-icon-pdf-text">PDF</div>
                </div>
              </div>
            </div>
            <div className="checklist-file-upload-wrapper">
              {uploadedFile ? (
                <div className="checklist-file-preview-container">
                  <input
                    type="file"
                    id={`file-upload-replace-${item.id}`}
                    onChange={handleFileChange}
                    className="checklist-file-input"
                  />
                  <label htmlFor={`file-upload-replace-${item.id}`} className="checklist-file-preview-clickable">
                    <FilePreview file={uploadedFile} onRemove={handleRemoveFile} />
                  </label>
                </div>
              ) : (
                <div className="checklist-file-upload-empty">
                  <div className="checklist-file-upload-placeholder">
                    <input
                      type="file"
                      id={`file-upload-${item.id}`}
                      onChange={handleFileChange}
                      className="checklist-file-input"
                    />
                    <label htmlFor={`file-upload-${item.id}`} className="checklist-file-upload-label" style={{ "--card-color": cardColor }}>
                      <div className="checklist-file-upload-icon-placeholder">
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 10 L55 10 L65 20 L65 70 L20 70 Z" fill="white" stroke="#D0D0D0" strokeWidth="2" strokeLinejoin="round" />
                          <path d="M55 10 L55 20 L65 20" stroke="#D0D0D0" strokeWidth="2" fill="none" strokeLinejoin="round" />
                          <path d="M25 30 L50 30" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" />
                          <path d="M25 40 L45 40" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" />
                          <path d="M25 50 L52 50" stroke="#D0D0D0" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="checklist-file-upload-text">
                        <span className="checklist-file-upload-title">Drop your file here, or</span>
                        <span className="checklist-file-upload-button">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
                            <path d="M8 3V13M8 13L4 9M8 13L12 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12V14C2 14.5523 2.44772 15 3 15H13C13.5523 15 14 14.5523 14 14V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          Choose File
                        </span>
                      </div>
                      <span className="checklist-file-upload-hint">Supports: PDF, DOC, DOCX and more</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="checklist-item-modal-footer">
          <button type="button" className="checklist-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="checklist-btn-primary" onClick={handleSave} style={{ "--card-color": cardColor }}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

ItemDetailModal.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  itemData: PropTypes.object,
  onUpdate: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

// Checklist Item Component - Table Row Format
const ChecklistItem = ({ id, label, requirement, itemData, onChange, cardColor = "#2A00FF", isViewOnly = false }) => {
  const [remarks, setRemarks] = useState(itemData?.remarks || "");
  const [uploadedFile, setUploadedFile] = useState(itemData?.uploadedFile || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Sync state with itemData when it changes
  useEffect(() => {
    setRemarks(itemData?.remarks || "");
    setUploadedFile(itemData?.uploadedFile || null);
  }, [itemData]);

  // Checkbox is checked only if document is uploaded
  const checked = uploadedFile !== null && uploadedFile !== undefined;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      onChange(id, { ...itemData, uploadedFile: file, remarks, checked: true });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onChange(id, { ...itemData, uploadedFile: null, remarks, checked: false });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setUploadedFile(files[0]);
      onChange(id, { ...itemData, uploadedFile: files[0], remarks, checked: true });
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemarksChange = (e) => {
    const newRemarks = e.target.value;
    setRemarks(newRemarks);
    // Auto-save remarks when changed
    onChange(id, { ...itemData, uploadedFile, remarks: newRemarks, checked });
  };

  return (
    <tr className={`checklist-table-row ${checked ? "checked" : ""}`} style={{ "--card-color": cardColor }}>
      <td className="checklist-table-checkbox">
        <div className="checklist-checkbox-wrapper">
          <input
            type="checkbox"
            checked={checked}
            disabled
            className="checklist-checkbox"
            readOnly
          />
          <span className="checklist-checkbox-custom">
            {checked && <span className="checkmark">✓</span>}
          </span>
        </div>
      </td>
      <td className="checklist-table-label">
        <span className="checklist-item-text">{label}</span>
      </td>
      <td className="checklist-table-requirement">
        <span className="checklist-item-requirement">{requirement || ""}</span>
      </td>
      <td className="checklist-table-upload">
        {isViewOnly && uploadedFile ? (
          // View-only mode: Show file with view icon
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #e2e2ea"
          }}>
            <div style={{ color: "#666", display: "flex", alignItems: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div style={{ flex: 1, fontSize: "13px", color: "#1a1a1a" }}>
              {uploadedFile?.name || uploadedFile?.fileName || "Document.pdf"}
            </div>
            <button
              type="button"
              onClick={() => {
                console.log("View document:", uploadedFile?.name || uploadedFile?.fileName);
              }}
              style={{
                padding: "6px",
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
          </div>
        ) : !isViewOnly ? (
          <div
            className={`checklist-table-upload-zone ${isDragging ? "dragging" : ""} ${uploadedFile ? "has-file" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!uploadedFile ? handleBrowseClick : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              id={`file-upload-${id}`}
              onChange={handleFileChange}
              className="checklist-file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {uploadedFile ? (
              <div className="checklist-table-file-preview">
                <FilePreview file={uploadedFile} onRemove={handleRemoveFile} />
              </div>
            ) : (
              <div className="checklist-table-upload-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M12 5L7 10M12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>Drop file or click to browse</span>
              </div>
            )}
          </div>
        ) : null}
      </td>
      <td className="checklist-table-remarks">
        <FormTextarea
          value={remarks}
          onChange={handleRemarksChange}
          placeholder="Enter remarks..."
          rows={2}
          className="checklist-table-textarea"
          disabled={isViewOnly}
        />
      </td>
    </tr>
  );
};

ChecklistItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  requirement: PropTypes.string,
  itemData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
};

// Checklist Section Component
const ChecklistSection = ({
  id,
  title,
  items,
  itemsData,
  onItemChange,
  isOpen,
  onToggle,
  onSelectAll,
  cardColor = "#2A00FF",
  isViewOnly = false,
}) => {
  // All selected means all items have files uploaded (checked is based on file upload)
  const allSelected = items.length > 0 && items.every((item) => {
    const itemData = itemsData[item.id] || {};
    return itemData.uploadedFile !== null && itemData.uploadedFile !== undefined;
  });
  const someSelected = items.some((item) => {
    const itemData = itemsData[item.id] || {};
    return itemData.uploadedFile !== null && itemData.uploadedFile !== undefined;
  }) && !allSelected;
  const checkboxRef = useRef(null);

  const checkedCount = items.filter((item) => {
    const itemData = itemsData[item.id] || {};
    return itemData.uploadedFile !== null && itemData.uploadedFile !== undefined;
  }).length;
  const progressPercentage = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAllClick = (e) => {
    e.stopPropagation();
    onSelectAll(id, !allSelected);
  };

  return (
    <div className="checklist-section" style={{ "--card-color": cardColor }}>
      <div className="checklist-section-header-wrapper">
        <button
          type="button"
          className="checklist-section-header"
          onClick={onToggle}
          aria-expanded={isOpen}
        >
          <div className="checklist-section-title-wrapper">
            <h3 className="checklist-section-title">{title}</h3>
            <div className="checklist-section-progress">
              <span className="checklist-progress-text">
                {checkedCount} / {items.length}
              </span>
              <div className="checklist-progress-bar">
                <div
                  className="checklist-progress-fill"
                  style={{ width: `${progressPercentage}%`, backgroundColor: cardColor }}
                ></div>
              </div>
            </div>
          </div>
          <span className="checklist-accordion-icon">{isOpen ? "▼" : "▶"}</span>
        </button>
        <div className="checklist-section-actions">
          <button
            type="button"
            className="checklist-select-all-btn"
            onClick={handleSelectAllClick}
            title={allSelected ? "Deselect All" : "Select All"}
            style={{ "--card-color": cardColor }}
          >
            <input
              type="checkbox"
              ref={checkboxRef}
              checked={allSelected}
              onChange={() => { }}
              className="checklist-select-all-checkbox"
            />
            <span className="checklist-select-all-label">
              {allSelected ? "Deselect All" : "Select All"}
            </span>
          </button>
          {allSelected && (
            <span className="checklist-section-status-text">Completed</span>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="checklist-items-table-wrapper">
          <table className="checklist-items-table">
            <thead>
              <tr>
                <th className="checklist-table-checkbox-header">
                  <input
                    type="checkbox"
                    ref={checkboxRef}
                    checked={allSelected}
                    onChange={handleSelectAllClick}
                    className="checklist-select-all-checkbox"
                  />
                </th>
                <th className="checklist-table-label-header">CheckList</th>
                <th className="checklist-table-requirement-header">Requirement</th>
                <th className="checklist-table-upload-header">Document Upload</th>
                <th className="checklist-table-remarks-header">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <ChecklistItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  requirement={item.requirement}
                  itemData={itemsData[item.id] || {}}
                  onChange={onItemChange}
                  cardColor={cardColor}
                  isViewOnly={isViewOnly}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

ChecklistSection.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  itemsData: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
};

// Checklist Type Group Component (Accordion for type titles)
const ChecklistTypeGroup = ({
  typeTitle,
  sections,
  itemsData,
  onItemChange,
  openSections,
  onSectionToggle,
  onSelectAll,
  isOpen,
  onToggle,
  cardColor = "#2A00FF",
  isViewOnly = false,
}) => {
  return (
    <div className="checklist-type-group" style={{ "--card-color": cardColor }}>
      <button
        type="button"
        className="checklist-type-title-accordion"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="checklist-type-title-text">{typeTitle}</span>
        <span className="checklist-type-accordion-icon">{isOpen ? "▼" : "▶"}</span>
      </button>
      {isOpen && (
        <div className="checklist-type-sections">
          {sections.map((section) => (
            <ChecklistSection
              key={section.id}
              id={section.id}
              title={section.title}
              items={section.items}
              itemsData={itemsData}
              onItemChange={onItemChange}
              isOpen={openSections[section.id] || false}
              onToggle={() => onSectionToggle(section.id)}
              onSelectAll={onSelectAll}
              cardColor={cardColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ChecklistTypeGroup.propTypes = {
  typeTitle: PropTypes.string.isRequired,
  sections: PropTypes.array.isRequired,
  itemsData: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  openSections: PropTypes.object.isRequired,
  onSectionToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
};

// Helper function to generate dummy file for checklist items
const getDummyFileForItem = (itemId, itemLabel) => {
  const fileName = `${itemLabel.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_document.pdf`;
  return {
    name: fileName,
    fileName: fileName,
    size: Math.floor(Math.random() * 500000) + 100000, // Random size between 100KB and 600KB
    type: "application/pdf"
  };
};

// Helper function to generate dummy remarks for checklist items
const getDummyRemarksForItem = (itemId, itemLabel) => {
  const remarksTemplates = [
    "Document has been reviewed and verified. All requirements are met.",
    "Submitted on time. No discrepancies found. Ready for processing.",
    "All necessary information is complete. Document is in order.",
    "Verified and approved. All conditions satisfied.",
    "Documentation is complete and accurate. No issues identified.",
  ];
  return remarksTemplates[itemId.charCodeAt(itemId.length - 1) % remarksTemplates.length];
};

// Main Checklist Component
function Checklist({ card, formValues, handleChange, onSendReport, cardColor: propCardColor, isViewOnly = false }) {
  const cardColor = propCardColor || card?.color || "#2A00FF";

  // Form state - Initialize with both checklist types selected by default
  const [checklistType, setChecklistType] = useState(
    formValues?.checklistType || [
      CHECKLIST_TYPES.BOAT_ARRIVING_ONBOARD,
      CHECKLIST_TYPES.ACCOMMODATION_CONSTRUCTION_BARGE,
    ]
  );

  // Get checklist data based on selected type - group by checklist type
  const currentChecklistData = useMemo(() => {
    const groupedData = [];

    if (checklistType.includes(CHECKLIST_TYPES.ACCOMMODATION_CONSTRUCTION_BARGE)) {
      // Add prefix to section titles and item IDs for ACCOMMODATION/CONSTRUCITON BARGE
      const bargeData = accommodationBargeChecklist.map((section) => ({
        ...section,
        id: `accommodation_${section.id}`,
        checklistType: CHECKLIST_TYPES.ACCOMMODATION_CONSTRUCTION_BARGE,
        checklistTypeTitle: "ACCOMODATION/CONSTRUCITON BARGE IMPORT CHECKLIST",
        title: section.title,
        items: section.items.map((item) => ({
          ...item,
          id: `accommodation_${item.id}`,
        })),
      }));
      groupedData.push(...bargeData);
    }

    if (checklistType.includes(CHECKLIST_TYPES.BOAT_ARRIVING_ONBOARD)) {
      // Add prefix to section titles and item IDs for BOAT ARRIVING ONBOARD
      const boatData = boatArrivingOnboardChecklist.map((section) => ({
        ...section,
        id: `boat_${section.id}`,
        checklistType: CHECKLIST_TYPES.BOAT_ARRIVING_ONBOARD,
        checklistTypeTitle: "BOAT ARRIVING ONBOARD IMPORT CHECKLIST",
        title: section.title,
        items: section.items.map((item) => ({
          ...item,
          id: `boat_${item.id}`,
        })),
      }));
      groupedData.push(...boatData);
    }

    return groupedData;
  }, [checklistType]);

  // State for checklist items data (remarks, files, checked status)
  const [itemsData, setItemsData] = useState(() => {
    const initial = {};
    currentChecklistData.forEach((section) => {
      section.items.forEach((item) => {
        if (isViewOnly) {
          // For view-only mode, populate with dummy data
          initial[item.id] = {
            checked: true,
            remarks: getDummyRemarksForItem(item.id, item.label),
            uploadedFile: getDummyFileForItem(item.id, item.label),
          };
        } else {
          initial[item.id] = card?.checklistItemsData?.[item.id] || {
            checked: false,
            remarks: "",
            uploadedFile: null,
          };
        }
      });
    });
    return initial;
  });


  // State for accordion (which sections are open)
  const [openSections, setOpenSections] = useState(() => {
    const initial = {};
    currentChecklistData.forEach((section) => {
      initial[section.id] = true;
    });
    return initial;
  });

  // State for checklist type group accordions (which type groups are open)
  const [openTypeGroups, setOpenTypeGroups] = useState(() => {
    const initial = {};
    const groupedByType = {};
    currentChecklistData.forEach((section) => {
      const type = section.checklistTypeTitle || section.checklistType;
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(section);
    });
    Object.keys(groupedByType).forEach((typeTitle) => {
      initial[typeTitle] = true; // Start with all type groups open
    });
    return initial;
  });


  // Initialize checklistType in formValues if not present
  useEffect(() => {
    if (!formValues?.checklistType || formValues.checklistType.length === 0) {
      const defaultChecklistTypes = [
        CHECKLIST_TYPES.BOAT_ARRIVING_ONBOARD,
        CHECKLIST_TYPES.ACCOMMODATION_CONSTRUCTION_BARGE,
      ];
      if (handleChange) {
        const syntheticEvent = {
          target: { value: defaultChecklistTypes, name: "checklistType" },
        };
        handleChange("checklistType")(syntheticEvent);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update itemsData when checklist data changes
  useEffect(() => {
    const newItemsData = {};
    currentChecklistData.forEach((section) => {
      section.items.forEach((item) => {
        if (!itemsData[item.id]) {
          if (isViewOnly) {
            // For view-only mode, populate with dummy data
            newItemsData[item.id] = {
              checked: true,
              remarks: getDummyRemarksForItem(item.id, item.label),
              uploadedFile: getDummyFileForItem(item.id, item.label),
            };
          } else {
            newItemsData[item.id] = {
              checked: false,
              remarks: "",
              uploadedFile: null,
            };
          }
        } else {
          // If item already exists, preserve it unless we're in view-only mode and it needs dummy data
          if (isViewOnly && (!itemsData[item.id].uploadedFile || !itemsData[item.id].remarks)) {
            newItemsData[item.id] = {
              checked: true,
              remarks: itemsData[item.id].remarks || getDummyRemarksForItem(item.id, item.label),
              uploadedFile: itemsData[item.id].uploadedFile || getDummyFileForItem(item.id, item.label),
            };
          } else {
            newItemsData[item.id] = itemsData[item.id];
          }
        }
      });
    });
    setItemsData(newItemsData);

    // Update openTypeGroups when checklist data changes
    const groupedByType = {};
    currentChecklistData.forEach((section) => {
      const type = section.checklistTypeTitle || section.checklistType;
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(section);
    });
    setOpenTypeGroups((prev) => {
      const updated = { ...prev };
      Object.keys(groupedByType).forEach((typeTitle) => {
        if (updated[typeTitle] === undefined) {
          updated[typeTitle] = true; // Default to open for new types
        }
      });
      return updated;
    });
  }, [currentChecklistData, isViewOnly]);

  const handleChecklistTypeChange = (e) => {
    const newValue = e.target.value; // This is already an array from MultiSelect
    setChecklistType(newValue);
    // Create a synthetic event for handleChange if needed
    if (handleChange) {
      const syntheticEvent = {
        target: { value: newValue, name: "checklistType" },
      };
      handleChange("checklistType")(syntheticEvent);
    }
  };

  const handleItemChange = (id, newData) => {
    setItemsData((prev) => ({
      ...prev,
      [id]: newData,
    }));
  };

  const handleSectionToggle = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSelectAll = (sectionId, selectAll) => {
    // Note: Select All functionality is disabled since checkbox is now controlled by file upload
    // This function is kept for compatibility but doesn't modify checked state
    // The checked state is automatically set when a file is uploaded
  };

  const handleTypeGroupToggle = (typeTitle) => {
    setOpenTypeGroups((prev) => ({
      ...prev,
      [typeTitle]: !prev[typeTitle],
    }));
  };

  const checklistTypeOptions = [
    { value: CHECKLIST_TYPES.BOAT_ARRIVING_ONBOARD, label: CHECKLIST_TYPES.BOAT_ARRIVING_ONBOARD },
    {
      value: CHECKLIST_TYPES.ACCOMMODATION_CONSTRUCTION_BARGE,
      label: CHECKLIST_TYPES.ACCOMMODATION_CONSTRUCTION_BARGE,
    },
  ];

  // Send Report Button Component
  const SendReportButton = ({ onClick, cardColor }) => {
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
          style={{ backgroundColor: "rgb(244 242 255)" }}
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
          tabName="Check List"
        />
      </>
    );
  };

  return (
    <>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Checklist Information</h3>
        {onSendReport && !isViewOnly && <SendReportButton onClick={onSendReport} cardColor={cardColor} />}
      </div>
      {/* Form Section */}
      <>
        <div className="cf-section-body">
          <div className="checklist-form">
            <div className="form-group">
              <div className="cf-grid two">
                <FormField label="Checklist Type">
                  <MultiSelect
                    value={checklistType}
                    onChange={handleChecklistTypeChange}
                    options={checklistTypeOptions}
                    placeholder="Select checklist type..."
                    disabled={isViewOnly}
                  />
                </FormField>
              </div>
            </div>
            {/* Checklist Items Section */}
            {currentChecklistData.length > 0 && (
              <div className="cf-section">
                <div className="cf-section-header">
                  <div className="cf-section-title">Checklist Items</div>
                </div>
                <div className="cf-section-body">
                  {/* Group sections by checklist type */}
                  {(() => {
                    const groupedByType = {};
                    currentChecklistData.forEach((section) => {
                      const type = section.checklistTypeTitle || section.checklistType;
                      if (!groupedByType[type]) {
                        groupedByType[type] = [];
                      }
                      groupedByType[type].push(section);
                    });

                    return Object.entries(groupedByType).map(([typeTitle, sections]) => (
                      <ChecklistTypeGroup
                        key={typeTitle}
                        typeTitle={typeTitle}
                        sections={sections}
                        itemsData={itemsData}
                        onItemChange={handleItemChange}
                        openSections={openSections}
                        onSectionToggle={handleSectionToggle}
                        onSelectAll={handleSelectAll}
                        isOpen={openTypeGroups[typeTitle] || false}
                        onToggle={() => handleTypeGroupToggle(typeTitle)}
                        cardColor={cardColor}
                        isViewOnly={isViewOnly}
                      />
                    ));
                  })()}
                </div>
              </div>
            )}
            {!isViewOnly && (
              <div className="form-group" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="checklist-btn-primary"
                  onClick={() => {
                    console.log("Saving Checklist data:", {
                      checklistType,
                      itemsData,
                    });
                    // Add your save logic here
                  }}
                >
                  Save and Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    </ >
  );
}

Checklist.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
  onSendReport: PropTypes.func,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
};

export default Checklist;
