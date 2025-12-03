import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { MAIN_TABS, CREW_MANAGEMENT_SUBTABS, MATERIAL_MANAGEMENT_SUBTABS } from "./Husbandry.constants";

// Sub-components
export const HusbandryTabs = ({ activeMainTab, activeSubTab, onMainTabChange, onSubTabChange }) => {

  const mainTabs = [
    { id: MAIN_TABS.CREW_MANAGEMENT, label: "Crew Management" },
    { id: MAIN_TABS.MATERIAL_MANAGEMENT, label: "Material Management" },
  ];

  let subTabs = [];
  if (activeMainTab === MAIN_TABS.CREW_MANAGEMENT) {
    subTabs = [
      { id: CREW_MANAGEMENT_SUBTABS.CREW, label: "Crew" },
      { id: CREW_MANAGEMENT_SUBTABS.TRANSPORT, label: "Transport" },
      { id: CREW_MANAGEMENT_SUBTABS.CG_PASS, label: "CG Pass" },
      { id: CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS, label: "Zawil Pass" },
      { id: CREW_MANAGEMENT_SUBTABS.HOTEL, label: "Hotel" },
      { id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE, label: "Medical service" },
    ];
  } else if (activeMainTab === MAIN_TABS.MATERIAL_MANAGEMENT) {
    subTabs = [
      { id: MATERIAL_MANAGEMENT_SUBTABS.MATERIAL_LIST, label: "Material Management" },
      { id: MATERIAL_MANAGEMENT_SUBTABS.WASTE_DISPOSAL, label: "Waste Disposal" },
    ];
  }

  return (
    <div className="operation-left">
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
};

export const FormSection = ({ icon, title, children }) => {
  return (
    <div className="cf-section">
      {title && (
        <div className="cf-section-header">
          <span className="cf-section-icon">
            <img src={icon} alt={title} />
          </span>
          <span className="cf-section-title">{title}</span>
        </div>
      )}
      <div className="cf-section-body">{children}</div>
    </div>
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

