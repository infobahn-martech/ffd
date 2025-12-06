import PropTypes from "prop-types";
import { useState, useMemo, useEffect, useRef } from "react";
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
      { id: "commercial_invoice_vessel", label: "Commercial invoice for vessel ORIGINAL REQUIRED" },
      { id: "bill_of_lading_vessel", label: "Bill of lading REQUIRE COPY ONLY" },
      { id: "charter_party_agreement", label: "Charter Party Agreement REQUIRE COPY ONLY" },
    ],
  },
  {
    id: "documents_towing_tug",
    title: "B) DOCUMENTS REQUIRED FROM VESSEL TOWING TUG MASTER",
    items: [
      { id: "equipment_material_declaration", label: "Equipment/Material Deck declaration letter REQUIRE COPY ONLY FORMAT ATTACHED" },
      { id: "bill_of_lading_tug", label: "Bill of lading REQUIRE COPY ONLY" },
    ],
  },
  {
    id: "marine_work_permit",
    title: "1. MARINE WORK PERMIT",
    items: [
      { id: "vessel_registry_certificate", label: "Vessel Registry certificate REQUIRE COPY ONLY" },
      { id: "international_tonnage_certificate", label: "International Tonnage certificate REQUIRE COPY ONLY" },
    ],
  },
  {
    id: "authorisation_letter",
    title: "C) AUTHORISATION LETTER FOR AGENCY & UNDERTAKING LETTER (DOCUMENT REQUIRED FROM CONSIGNEE)",
    items: [
      { id: "commercial_registration", label: "Commercial Registration REQUIRE COPY ONLY" },
    ],
  },
];

// Dummy Checklist Data for BOAT ARRIVING ONBOARD
const boatArrivingOnboardChecklist = [
  {
    id: "pre_arrival_documents",
    title: "A) PRE-ARRIVAL DOCUMENTS",
    items: [
      { id: "arrival_notice", label: "Arrival Notice REQUIRE COPY ONLY" },
      { id: "crew_declaration", label: "Crew Declaration REQUIRE COPY ONLY" },
      { id: "cargo_declaration", label: "Cargo Declaration REQUIRE COPY ONLY" },
    ],
  },
  {
    id: "clearance_documents",
    title: "B) CLEARANCE DOCUMENTS",
    items: [
      { id: "port_entry_permit", label: "Port Entry Permit REQUIRE COPY ONLY" },
      { id: "health_certificate", label: "Health Certificate REQUIRE COPY ONLY" },
      { id: "customs_declaration", label: "Customs Declaration REQUIRE COPY ONLY" },
    ],
  },
  {
    id: "safety_documents",
    title: "C) SAFETY DOCUMENTS",
    items: [
      { id: "safety_equipment_list", label: "Safety Equipment List REQUIRE COPY ONLY" },
      { id: "emergency_contact_list", label: "Emergency Contact List REQUIRE COPY ONLY" },
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

const FormTextarea = ({ value, onChange, placeholder, className = "", rows = 3 }) => {
  return (
    <div className={`cf-textarea ${className}`}>
      <textarea
        value={value || ""}
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

// Multi-select component for Checklist Type with tags/chips
const MultiSelect = ({ value = [], onChange, options = [], placeholder, className = "", cardColor = "#2A00FF" }) => {
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
    <div className={`cf-multiselect ${className}`} ref={dropdownRef} style={{ "--card-color": cardColor }}>
      <div
        className="cf-multiselect-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="cf-multiselect-tags">
          {value.length === 0 ? (
            <span className="cf-multiselect-placeholder">{placeholder || "Select options..."}</span>
          ) : (
            value.map((val) => (
              <span key={val} className="cf-multiselect-tag" style={{ "--card-color": cardColor }}>
                <span className="cf-multiselect-tag-text">{getOptionLabel(val)}</span>
                <button
                  type="button"
                  className="cf-multiselect-tag-remove"
                  onClick={(e) => handleRemoveTag(e, val)}
                  aria-label={`Remove ${getOptionLabel(val)}`}
                >
                  ×
                </button>
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

// Checklist Item Component
const ChecklistItem = ({ id, label, itemData, onChange, onItemClick, cardColor = "#2A00FF" }) => {
  const checked = itemData?.checked || false;
  const hasFile = itemData?.uploadedFile !== null;
  const hasRemarks = itemData?.remarks && itemData.remarks.trim() !== "";

  return (
    <div className={`checklist-item ${checked ? "checked" : ""}`} style={{ "--card-color": cardColor }}>
      <div className="checklist-item-content">
        <label className="checklist-item-label">
          <div className="checklist-checkbox-wrapper">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onChange(id, { ...itemData, checked: e.target.checked })}
              className="checklist-checkbox"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="checklist-checkbox-custom">
              {checked && <span className="checkmark">✓</span>}
            </span>
          </div>
          <span className="checklist-item-text">
            {label}
          </span>
          {checked && <span className="checklist-item-status">Completed</span>}
        </label>
        <div className="checklist-item-actions">
          <div className="checklist-item-indicators">
            {hasFile && <span className="checklist-item-file-icon">📎</span>}
            {hasRemarks && <span className="checklist-item-remarks-icon">💬</span>}
          </div>
          <button
            type="button"
            className="checklist-item-detail-btn"
            onClick={() => onItemClick(id)}
            title="View/Edit Details"
            style={{ "--card-color": cardColor }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

ChecklistItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  itemData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  onItemClick: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

// Checklist Section Component
const ChecklistSection = ({
  id,
  title,
  items,
  itemsData,
  onItemChange,
  onItemClick,
  isOpen,
  onToggle,
  onSelectAll,
  cardColor = "#2A00FF",
}) => {
  const allSelected = items.length > 0 && items.every((item) => itemsData[item.id]?.checked || false);
  const someSelected = items.some((item) => itemsData[item.id]?.checked || false) && !allSelected;
  const checkboxRef = useRef(null);

  const checkedCount = items.filter((item) => itemsData[item.id]?.checked || false).length;
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
        <div className="checklist-items">
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              id={item.id}
              label={item.label}
              itemData={itemsData[item.id] || {}}
              onChange={onItemChange}
              onItemClick={onItemClick}
              cardColor={cardColor}
            />
          ))}
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
  onItemClick: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

// Checklist Type Group Component (Accordion for type titles)
const ChecklistTypeGroup = ({
  typeTitle,
  sections,
  itemsData,
  onItemChange,
  onItemClick,
  openSections,
  onSectionToggle,
  onSelectAll,
  isOpen,
  onToggle,
  cardColor = "#2A00FF",
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
              onItemClick={onItemClick}
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
  onItemClick: PropTypes.func.isRequired,
  openSections: PropTypes.object.isRequired,
  onSectionToggle: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

// Main Checklist Component
function Checklist({ card, formValues, handleChange }) {
  const cardColor = card?.color || "#2A00FF";

  // Form state
  const [checklistType, setChecklistType] = useState(
    formValues?.checklistType || []
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
        initial[item.id] = card?.checklistItemsData?.[item.id] || {
          checked: false,
          remarks: "",
          uploadedFile: null,
        };
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

  // State for item detail modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update itemsData when checklist data changes
  useEffect(() => {
    const newItemsData = {};
    currentChecklistData.forEach((section) => {
      section.items.forEach((item) => {
        if (!itemsData[item.id]) {
          newItemsData[item.id] = {
            checked: false,
            remarks: "",
            uploadedFile: null,
          };
        } else {
          newItemsData[item.id] = itemsData[item.id];
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
  }, [currentChecklistData]);

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

  const handleItemClick = (itemId) => {
    const item = currentChecklistData
      .flatMap((section) => section.items)
      .find((i) => i.id === itemId);
    if (item) {
      setSelectedItem({ ...item, data: itemsData[itemId] });
      setIsModalOpen(true);
    }
  };

  const handleItemUpdate = (updatedData) => {
    if (selectedItem) {
      handleItemChange(selectedItem.id, updatedData);
    }
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSectionToggle = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSelectAll = (sectionId, selectAll) => {
    const section = currentChecklistData.find((s) => s.id === sectionId);
    if (!section) return;

    setItemsData((prev) => {
      const updated = { ...prev };
      section.items.forEach((item) => {
        updated[item.id] = {
          ...updated[item.id],
          checked: selectAll,
        };
      });
      return updated;
    });
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

  return (
    <>
      {/* Form Section */}
      <div className="cf-section">
        <div className="cf-section-body">
          <div className="checklist-form">
            <div className="form-group">
              <h3 className="form-group-title">Checklist Information</h3>
              <div className="cf-grid two">
                <FormField label="Checklist Type">
                  <MultiSelect
                    value={checklistType}
                    onChange={handleChecklistTypeChange}
                    options={checklistTypeOptions}
                    placeholder="Select checklist type..."
                  />
                </FormField>
              </div>
            </div>
            {/* Checklist Items Section */}
            {currentChecklistData.length > 0 && (
              <div className="cf-section">
                <div className="cf-section-header">
                  <div className="cf-section-icon">
                    <span>✅</span>
                  </div>
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
                        onItemClick={handleItemClick}
                        openSections={openSections}
                        onSectionToggle={handleSectionToggle}
                        onSelectAll={handleSelectAll}
                        isOpen={openTypeGroups[typeTitle] || false}
                        onToggle={() => handleTypeGroupToggle(typeTitle)}
                        cardColor={cardColor}
                      />
                    ));
                  })()}
                </div>
              </div>
            )}
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
                style={{ "--card-color": cardColor }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          itemData={selectedItem.data}
          onUpdate={handleItemUpdate}
          cardColor={cardColor}
        />
      )}
    </ >
  );
}

Checklist.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Checklist;
