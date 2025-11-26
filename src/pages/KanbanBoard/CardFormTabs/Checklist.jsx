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

// Multi-select component for Checklist Type
const MultiSelect = ({ value = [], onChange, options = [], placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  return (
    <div className={`cf-multiselect ${className}`} ref={dropdownRef}>
      <div
        className="cf-multiselect-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="cf-multiselect-value">
          {value.length === 0
            ? placeholder || "Select options..."
            : value.join(", ")}
        </span>
        <span className="cf-multiselect-arrow">{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && (
        <div className="cf-multiselect-dropdown">
          {options.map((option) => (
            <label key={option.value} className="cf-multiselect-option">
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => handleToggle(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
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
};

// Item Detail Modal Component
const ItemDetailModal = ({ item, isOpen, onClose, itemData, onUpdate }) => {
  const [remarks, setRemarks] = useState(itemData?.remarks || "");
  const [checked, setChecked] = useState(itemData?.checked || false);
  const [uploadedFile, setUploadedFile] = useState(itemData?.uploadedFile || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
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
      <div className="checklist-item-modal" onClick={(e) => e.stopPropagation()}>
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

          <FormField label="Document Upload">
            <div className="checklist-file-upload">
              <input
                type="file"
                id={`file-upload-${item.id}`}
                onChange={handleFileChange}
                className="checklist-file-input"
              />
              <label htmlFor={`file-upload-${item.id}`} className="checklist-file-label">
                {uploadedFile ? uploadedFile.name : "Choose File"}
              </label>
            </div>
          </FormField>

          <FormField label="Status">
            <label className="checklist-checkbox-label">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
              <span>Completed</span>
            </label>
          </FormField>
        </div>
        <div className="checklist-item-modal-footer">
          <button type="button" className="checklist-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="checklist-btn-primary" onClick={handleSave}>
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
};

// Checklist Item Component
const ChecklistItem = ({ id, label, itemData, onChange, onItemClick }) => {
  const checked = itemData?.checked || false;
  const hasFile = itemData?.uploadedFile !== null;
  const hasRemarks = itemData?.remarks && itemData.remarks.trim() !== "";

  return (
    <div className={`checklist-item ${checked ? "checked" : ""}`}>
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
          <span className="checklist-item-text" onClick={() => onItemClick(id)}>
            {label}
          </span>
          {checked && <span className="checklist-item-status">Completed</span>}
        </label>
        <div className="checklist-item-indicators">
          {hasFile && <span className="checklist-item-file-icon">📎</span>}
          {hasRemarks && <span className="checklist-item-remarks-icon">💬</span>}
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
  sectionStatus,
  onStatusChange,
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
    <div className="checklist-section">
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
                  style={{ width: `${progressPercentage}%` }}
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
          <div className="checklist-section-status">
            <label>Status:</label>
            <select
              value={sectionStatus || ""}
              onChange={(e) => onStatusChange(id, e.target.value)}
              className="checklist-status-select"
            >
              <option value="">Select Status</option>
              <option value="completed">Completed</option>
              <option value="hold">Hold</option>
            </select>
          </div>
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
  sectionStatus: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
};

// Main Checklist Component
function Checklist({ card, formValues, handleChange }) {
  // Form state
  const [checklistType, setChecklistType] = useState(
    formValues?.checklistType || []
  );
  const [vesselName, setVesselName] = useState(
    formValues?.vesselName || card?.vesselName || ""
  );
  const [callNo, setCallNo] = useState(formValues?.callNo || card?.callNo || "");
  const [eta, setEta] = useState(formValues?.eta || card?.eta || "");
  const [arrivedSailedOn, setArrivedSailedOn] = useState(
    formValues?.arrivedSailedOn || card?.arrivedSailedOn || ""
  );
  const [principal, setPrincipal] = useState(
    formValues?.principal || card?.principal || ""
  );
  const [lastPort, setLastPort] = useState(
    formValues?.lastPort || card?.lastPort || ""
  );
  const [nextPort, setNextPort] = useState(
    formValues?.nextPort || card?.nextPort || ""
  );

  // Get checklist data based on selected type
  const currentChecklistData = useMemo(() => {
    if (
      checklistType.includes(CHECKLIST_TYPES.ACCOMMODATION_CONSTRUCTION_BARGE)
    ) {
      return accommodationBargeChecklist;
    } else if (checklistType.includes(CHECKLIST_TYPES.BOAT_ARRIVING_ONBOARD)) {
      return boatArrivingOnboardChecklist;
    }
    return [];
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

  // State for section status
  const [sectionsStatus, setSectionsStatus] = useState(() => {
    const initial = {};
    currentChecklistData.forEach((section) => {
      initial[section.id] = card?.checklistSectionsStatus?.[section.id] || "";
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

  const handleStatusChange = (sectionId, status) => {
    setSectionsStatus((prev) => ({
      ...prev,
      [sectionId]: status,
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
    <div className="cardform-body checklist-body">
      {/* Form Section */}
      <div className="cf-section">
        <div className="cf-section-header">
          <div className="cf-section-icon">
            <span>📋</span>
          </div>
          <div className="cf-section-title">Checklist Information</div>
        </div>
        <div className="cf-section-body">
          <div className="checklist-form">
            <div className="cf-grid two">
              <FormField label="Checklist Type">
                <MultiSelect
                  value={checklistType}
                  onChange={handleChecklistTypeChange}
                  options={checklistTypeOptions}
                  placeholder="Select checklist type..."
                />
              </FormField>

              <FormField label="Vessel Name">
                <FormInput
                  type="text"
                  value={vesselName}
                  onChange={(e) => {
                    setVesselName(e.target.value);
                    if (handleChange) handleChange("vesselName")(e);
                  }}
                  placeholder="Enter vessel name"
                />
              </FormField>

              <FormField label="Call No./PO">
                <FormInput
                  type="text"
                  value={callNo}
                  onChange={(e) => {
                    setCallNo(e.target.value);
                    if (handleChange) handleChange("callNo")(e);
                  }}
                  placeholder="Enter call no./PO"
                />
              </FormField>

              <FormField label="ETA">
                <FormInput
                  type="datetime-local"
                  value={eta}
                  onChange={(e) => {
                    setEta(e.target.value);
                    if (handleChange) handleChange("eta")(e);
                  }}
                />
              </FormField>

              <FormField label="Arrived / Sailed on">
                <FormInput
                  type="datetime-local"
                  value={arrivedSailedOn}
                  onChange={(e) => {
                    setArrivedSailedOn(e.target.value);
                    if (handleChange) handleChange("arrivedSailedOn")(e);
                  }}
                />
              </FormField>

              <FormField label="Principal">
                <FormInput
                  type="text"
                  value={principal}
                  onChange={(e) => {
                    setPrincipal(e.target.value);
                    if (handleChange) handleChange("principal")(e);
                  }}
                  placeholder="Enter principal"
                />
              </FormField>

              <FormField label="Last Port">
                <FormInput
                  type="text"
                  value={lastPort}
                  onChange={(e) => {
                    setLastPort(e.target.value);
                    if (handleChange) handleChange("lastPort")(e);
                  }}
                  placeholder="Enter last port"
                />
              </FormField>

              <FormField label="Next Port">
                <FormInput
                  type="text"
                  value={nextPort}
                  onChange={(e) => {
                    setNextPort(e.target.value);
                    if (handleChange) handleChange("nextPort")(e);
                  }}
                  placeholder="Enter next port"
                />
              </FormField>
            </div>
          </div>
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
            {currentChecklistData.map((section) => (
              <ChecklistSection
                key={section.id}
                id={section.id}
                title={section.title}
                items={section.items}
                itemsData={itemsData}
                onItemChange={handleItemChange}
                onItemClick={handleItemClick}
                isOpen={openSections[section.id] || false}
                onToggle={() => handleSectionToggle(section.id)}
                onSelectAll={handleSelectAll}
                sectionStatus={sectionsStatus[section.id]}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>
      )}

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
        />
      )}
    </div>
  );
}

Checklist.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Checklist;
