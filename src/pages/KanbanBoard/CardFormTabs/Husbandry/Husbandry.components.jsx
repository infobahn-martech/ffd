import { useRef } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { MAIN_TABS, CREW_MANAGEMENT_SUBTABS, MATERIAL_MANAGEMENT_SUBTABS } from "./Husbandry.constants";

// Sub-components
export const HusbandryTabs = ({ activeMainTab, activeSubTab, onMainTabChange, onSubTabChange, selectedActionTab = null, selectedServices = [], onBackToServiceSelection, cardColor = "#00368c" }) => {

  // Filter main tabs based on selected services
  const allMainTabs = [
    { id: MAIN_TABS.CREW_MANAGEMENT, label: "Crew Management" },
    { id: MAIN_TABS.WAREHOUSE, label: "Warehouse" },
    { id: MAIN_TABS.ON_OFF_HIRE_SURVEY, label: "On/Off-Hire Survey" },
    { id: MAIN_TABS.ON_STATION, label: "On Station" },
    { id: MAIN_TABS.MATERIAL_MANAGEMENT, label: "Material Management" },
    { id: MAIN_TABS.WASTE_DISPOSAL, label: "Waste Disposal" },
    { id: MAIN_TABS.MWP_RENEWAL, label: "MWP Renewal" },
    { id: MAIN_TABS.THIRD_PARTY_SERVICES, label: "Third-Party Services" },
  ];

  const mainTabs = selectedServices.length > 0
    ? allMainTabs.filter(tab => selectedServices.includes(tab.id))
    : allMainTabs;

  let subTabs = [];
  if (activeMainTab === MAIN_TABS.CREW_MANAGEMENT) {
    // Always show Crew
    subTabs = [
      { id: CREW_MANAGEMENT_SUBTABS.CREW, label: "Crew" },
    ];

    // Only show the selected action tab (e.g., Transport) if one is selected
    if (selectedActionTab) {
      const allSubTabs = [
        { id: CREW_MANAGEMENT_SUBTABS.TRANSPORT, label: "Transport" },
        { id: CREW_MANAGEMENT_SUBTABS.CG_PASS, label: "CG Pass" },
        { id: CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS, label: "Zawil Pass" },
        { id: CREW_MANAGEMENT_SUBTABS.LAUNCH_HIRE, label: "Launch Hire" },
        { id: CREW_MANAGEMENT_SUBTABS.HOTEL, label: "Hotel" },
        { id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE, label: "Medical service" }
      ];

      // Find and add only the selected action tab
      const selectedTab = allSubTabs.find(tab => tab.id === selectedActionTab);
      if (selectedTab) {
        subTabs.push(selectedTab);
      }
    }
  } else if (activeMainTab === MAIN_TABS.MATERIAL_MANAGEMENT) {
    subTabs = [
      {
        id: MATERIAL_MANAGEMENT_SUBTABS.INBOUND_ORDERS,
        label: "Inbound Orders"
      },
      {
        id: MATERIAL_MANAGEMENT_SUBTABS.LANDING_NOTE,
        label: "Landing Note"
      },
      {
        id: MATERIAL_MANAGEMENT_SUBTABS.DISPATCH_NOTE,
        label: "Dispatch Note"
      },
    ];
  } else if (activeMainTab === MAIN_TABS.WAREHOUSE) {
    // Warehouse - no sub-tabs for now
    subTabs = [];
  } else if (activeMainTab === MAIN_TABS.ON_OFF_HIRE_SURVEY) {
    // On/Off-Hire Survey - no sub-tabs for now
    subTabs = [];
  } else if (activeMainTab === MAIN_TABS.ON_STATION) {
    // On Station - no sub-tabs for now
    subTabs = [];
  } else if (activeMainTab === MAIN_TABS.WASTE_DISPOSAL) {
    // Waste Disposal - no sub-tabs for now
    subTabs = [];
  } else if (activeMainTab === MAIN_TABS.MWP_RENEWAL) {
    // MWP Renewal - no sub-tabs for now
    subTabs = [];
  } else if (activeMainTab === MAIN_TABS.THIRD_PARTY_SERVICES) {
    // Third-Party Services - no sub-tabs for now
    subTabs = [];
  }

  return (
    <div className="operation-left">
      {onBackToServiceSelection && (
        <button
          type="button"
          className="husbandry-back-link-small"
          onClick={onBackToServiceSelection}
          style={{ "--card-color": cardColor }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>What services do you need?</span>
        </button>
      )}
      {mainTabs.map((tab) => {
        const isActive = activeMainTab === tab.id;
        const currentSubTabs = isActive ? subTabs : [];

        return (
          <div key={tab.id} className="op-tab-group">
            <button
              className={`op-tab op-tab-main ${isActive ? "active" : ""}`}
              onClick={() => onMainTabChange(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
            {isActive && currentSubTabs.length > 0 && (
              <div className="op-submenu">
                {currentSubTabs.map((subTab) => {
                  return (
                    <button
                      key={subTab.id}
                      className={`op-tab op-tab-sub ${activeSubTab === subTab.id ? "active" : ""}`}
                      onClick={() => onSubTabChange(subTab.id)}
                      type="button"
                    >
                      {subTab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

HusbandryTabs.propTypes = {
  activeMainTab: PropTypes.string.isRequired,
  activeSubTab: PropTypes.string.isRequired,
  onMainTabChange: PropTypes.func.isRequired,
  onSubTabChange: PropTypes.func.isRequired,
  selectedActionTab: PropTypes.string,
  selectedServices: PropTypes.array,
  onBackToServiceSelection: PropTypes.func,
  cardColor: PropTypes.string,
};

export const FormSection = ({ icon, title, children }) => {
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

export const FormField = ({ label, children, className = "" }) => {
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

export const FormInput = ({ type = "text", value, onChange, placeholder, className = "" }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value}
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

export const FormSelect = ({ value, onChange, options = [], placeholder, className = "" }) => {
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

export const FormTextarea = ({ value, onChange, placeholder, className = "", rows = 3 }) => {
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

// Yes/No Icon Components
export const YesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" fill="#00B894" stroke="#00B894" strokeWidth="2" />
    <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const NoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="9" fill="#FF0000" stroke="#FF0000" strokeWidth="2" />
    <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// React Quill Editor Component
export const ReactQuillEditor = ({ value, onChange, placeholder, name = "description", className = "" }) => {
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
        placeholder={placeholder || "Enter remarks..."}
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

