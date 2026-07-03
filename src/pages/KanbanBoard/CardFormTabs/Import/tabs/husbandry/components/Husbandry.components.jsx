import { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";
import { MAIN_TABS, CREW_MANAGEMENT_SUBTABS, MATERIAL_MANAGEMENT_SUBTABS } from "./Husbandry.constants";
import NavTabButton from "../../../../../../../components/NavTabButton";

// Sub-components
const CREW_DIRECT_NAV_SUBTABS = [
  { id: CREW_MANAGEMENT_SUBTABS.TRANSPORT, label: "Transport" },
  { id: CREW_MANAGEMENT_SUBTABS.CG_PASS, label: "CG Pass" },
  { id: CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS, label: "Zawil Pass" },
  { id: CREW_MANAGEMENT_SUBTABS.HOTEL, label: "Hotel" },
  { id: CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE, label: "Medical" },
];

// Left-nav service icons — one small stroke icon per tab id, matching the
// simple inline-SVG convention already used across this codebase (no new
// icon library/dependency introduced).
const TAB_ICON_PATHS = {
  [MAIN_TABS.CREW_MANAGEMENT]: "M12 21V19C12 17.9391 11.5786 16.9217 10.8284 16.1716C10.0783 15.4214 9.06087 15 8 15H4C2.93913 15 1.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21M16 21V19C15.9993 18.1137 15.7044 17.2528 15.1614 16.5523C14.6184 15.8519 13.8581 15.3516 13 15.13M11 3.13C11.8604 3.35031 12.623 3.85071 13.1676 4.55232C13.7122 5.25392 14.0078 6.11683 14.0078 7.005C14.0078 7.89317 13.7122 8.75608 13.1676 9.45768C12.623 10.1593 11.8604 10.6597 11 10.88M9 7C9 9.20914 7.20914 11 5 11C2.79086 11 1 9.20914 1 7C1 4.79086 2.79086 3 5 3C7.20914 3 9 4.79086 9 7Z",
  [CREW_MANAGEMENT_SUBTABS.CREW]: "M12 21V19C12 17.9391 11.5786 16.9217 10.8284 16.1716C10.0783 15.4214 9.06087 15 8 15H4C2.93913 15 1.92172 15.4214 1.17157 16.1716C0.421427 16.9217 0 17.9391 0 19V21M16 21V19C15.9993 18.1137 15.7044 17.2528 15.1614 16.5523C14.6184 15.8519 13.8581 15.3516 13 15.13M11 3.13C11.8604 3.35031 12.623 3.85071 13.1676 4.55232C13.7122 5.25392 14.0078 6.11683 14.0078 7.005C14.0078 7.89317 13.7122 8.75608 13.1676 9.45768C12.623 10.1593 11.8604 10.6597 11 10.88M9 7C9 9.20914 7.20914 11 5 11C2.79086 11 1 9.20914 1 7C1 4.79086 2.79086 3 5 3C7.20914 3 9 4.79086 9 7Z",
  [CREW_MANAGEMENT_SUBTABS.TRANSPORT]: "M2 15H1C0.44772 15 0 14.5523 0 14V10C0 9.44772 0.447715 9 1 9H1.5M2 15H14M2 15V17M14 15H15C15.5523 15 16 14.5523 16 14V10C16 9.44772 15.5523 9 15 9H14.5M14 15V17M2 9L3.5 5H12.5L14 9M2 9H14",
  [CREW_MANAGEMENT_SUBTABS.CG_PASS]: "M8 1L14 3.5V8C14 12 11.5 14.8 8 16C4.5 14.8 2 12 2 8V3.5L8 1Z",
  [CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS]: "M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3ZM4 6H12M4 9H8",
  [CREW_MANAGEMENT_SUBTABS.HOTEL]: "M1 15H15M2 15V5L8 1L14 5V15M6 15V9H10V15",
  [CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE]: "M8 5V11M5 8H11M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z",
  [MAIN_TABS.WAREHOUSE]: "M1 6L8 2L15 6V14H1V6ZM1 6L8 10L15 6",
  [MAIN_TABS.ON_OFF_HIRE_SURVEY]: "M3 2H13V15L8 12.5L3 15V2ZM5 6H11M5 9H11",
  [MAIN_TABS.ON_STATION]: "M8 1C5 1 3 3.3 3 6.2C3 9.6 8 15 8 15C8 15 13 9.6 13 6.2C13 3.3 11 1 8 1ZM8 8.2C6.9 8.2 6 7.3 6 6.2C6 5.1 6.9 4.2 8 4.2C9.1 4.2 10 5.1 10 6.2C10 7.3 9.1 8.2 8 8.2Z",
  [MAIN_TABS.MATERIAL_MANAGEMENT]: "M1 6L8 2L15 6V14H1V6ZM8 2V14M1 6L8 10L15 6",
  [MAIN_TABS.WASTE_DISPOSAL]: "M3 4H13M6 4V2.5C6 2.22386 6.22386 2 6.5 2H9.5C9.77614 2 10 2.22386 10 2.5V4M4 4L4.7 13.3C4.73 13.7 5.07 14 5.47 14H10.53C10.93 14 11.27 13.7 11.3 13.3L12 4",
  [MAIN_TABS.MWP_RENEWAL]: "M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C10 2 11.5 2.8 12.5 4M12.5 4V1.5M12.5 4H10",
  [MAIN_TABS.THIRD_PARTY_SERVICES]: "M2 5H14V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V5ZM4 5V3.5C4 2.67157 4.67157 2 5.5 2H10.5C11.3284 2 12 2.67157 12 3.5V5",
  LAUNCH_HIRE: "M2 10H14L12.5 13H3.5L2 10ZM8 2V10M6 4L8 2L10 4M1 10C3 8.5 5 8 8 8C11 8 13 8.5 15 10",
};

const TAB_ICON_COLORS = {
  [MAIN_TABS.CREW_MANAGEMENT]: "#7C3AED",
  [CREW_MANAGEMENT_SUBTABS.CREW]: "#7C3AED",
  [CREW_MANAGEMENT_SUBTABS.TRANSPORT]: "#0D9488",
  [CREW_MANAGEMENT_SUBTABS.CG_PASS]: "#2563EB",
  [CREW_MANAGEMENT_SUBTABS.ZAWIL_PASS]: "#D97706",
  [CREW_MANAGEMENT_SUBTABS.HOTEL]: "#DB2777",
  [CREW_MANAGEMENT_SUBTABS.MEDICAL_SERVICE]: "#16A34A",
  [MAIN_TABS.WAREHOUSE]: "#0D9488",
  [MAIN_TABS.ON_OFF_HIRE_SURVEY]: "#2563EB",
  [MAIN_TABS.ON_STATION]: "#DB2777",
  [MAIN_TABS.MATERIAL_MANAGEMENT]: "#0D9488",
  [MAIN_TABS.WASTE_DISPOSAL]: "#D97706",
  [MAIN_TABS.MWP_RENEWAL]: "#16A34A",
  [MAIN_TABS.THIRD_PARTY_SERVICES]: "#2563EB",
  LAUNCH_HIRE: "#0D9488",
};

const TabIcon = ({ id }) => {
  const path = TAB_ICON_PATHS[id];
  if (!path) return null;
  const color = TAB_ICON_COLORS[id] || "#64748b";
  return (
    <span className="op-tab-icon" style={{ "--tab-icon-color": color }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={path} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
};

TabIcon.propTypes = {
  id: PropTypes.string.isRequired,
};

export const HusbandryTabs = ({ activeMainTab, activeSubTab, onMainTabChange, onSubTabChange, onNavigateToTab, selectedActionTab = null, selectedServices = [], onBackToServiceSelection, cardColor = "#00368c", crewCount }) => {
  const hasCrewCount = typeof crewCount === "number";

  // Filter main tabs based on selected services
  const allMainTabs = [
    { id: MAIN_TABS.CREW_MANAGEMENT, label: "Crew Management" },
    { id: "LAUNCH_HIRE", label: "Launch Hire" },
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
    subTabs = [
      { id: CREW_MANAGEMENT_SUBTABS.CREW, label: "Crew" },
      ...CREW_DIRECT_NAV_SUBTABS,
    ];
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
      {
        id: MATERIAL_MANAGEMENT_SUBTABS.ORDER_HISTORY,
        label: "Order History"
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
    <div className="operation-left" style={{ "--card-color": cardColor }}>
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
            <NavTabButton
              className="op-tab op-tab-main"
              active={isActive}
              onClick={() => onMainTabChange(tab.id)}
            >
              <TabIcon id={tab.id} />
              <span className="op-tab-label">{tab.label}</span>
              {hasCrewCount && <span className="op-tab-count">{crewCount}</span>}
            </NavTabButton>
            {isActive && currentSubTabs.length > 0 && (
              <div className="op-submenu">
                {currentSubTabs.map((subTab) => {
                  const isDirectCrewNav = CREW_DIRECT_NAV_SUBTABS.some((tab) => tab.id === subTab.id);
                  const handleSubTabClick = () => {
                    if (isDirectCrewNav && onNavigateToTab) {
                      onNavigateToTab(subTab.id);
                      return;
                    }
                    onSubTabChange(subTab.id);
                  };

                  return (
                    <NavTabButton
                      key={subTab.id}
                      className="op-tab op-tab-sub"
                      active={activeSubTab === subTab.id}
                      onClick={handleSubTabClick}
                    >
                      <TabIcon id={subTab.id} />
                      <span className="op-tab-label">{subTab.label}</span>
                      {hasCrewCount && <span className="op-tab-count">{crewCount}</span>}
                    </NavTabButton>
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
  activeSubTab: PropTypes.string,
  onMainTabChange: PropTypes.func.isRequired,
  onSubTabChange: PropTypes.func.isRequired,
  onNavigateToTab: PropTypes.func,
  selectedActionTab: PropTypes.string,
  selectedServices: PropTypes.array,
  onBackToServiceSelection: PropTypes.func,
  cardColor: PropTypes.string,
  crewCount: PropTypes.number,
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
  const renderLabel = (text) => {
    const parts = text.split("*");
    if (parts.length === 1) return <label>{text}</label>;
    return (
      <label>
        {parts[0]}<span className="text-danger">*</span>{parts.slice(1).join("*")}
      </label>
    );
  };

  return (
    <div className={`cf-field ${className}`}>
      {label && renderLabel(label)}
      {children}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const FormInput = ({ type = "text", value, onChange, placeholder, className = "", readOnly = false, disabled = false }) => {
  const hasError = className.includes("is-invalid");
  return (
    <div className={`cf-input ${className}`} style={hasError ? { borderColor: "#dc3545" } : {}}>
      <input
        type={type}
        value={value}
        onChange={disabled ? undefined : onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
      />
    </div>
  );
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

// Custom Select Component (similar to MultiSelectEmail UI)
const CustomSelect = ({ value, onChange, options = [], placeholder, className = "", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : "";

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const hasError = className.includes("is-invalid");
  return (
    <div ref={wrapperRef} className={`cf-multi-select-email ${disabled ? "disabled" : ""} ${className}`}>
      <div
        ref={triggerRef}
        className={`cf-multi-select-email-input ${disabled ? "disabled" : ""}`}
        onClick={disabled ? undefined : () => setIsOpen(!isOpen)}
        style={{ pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.6 : 1, ...(hasError ? { borderColor: "#dc3545" } : {}) }}
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
        <div
          className="cf-select-portal"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            maxWidth: dropdownPos.width,
            minWidth: dropdownPos.width,
          }}
        >
          <div className="cf-multi-select-search">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="cf-multi-select-search-input"
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`cf-multi-select-option ${value === option.value ? "selected" : ""}`}
                onMouseDown={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
              </div>
            ))
          ) : (
            <div className="cf-multi-select-no-results">No results found</div>
          )}
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

export const FormSelect = ({ value, onChange, options = [], placeholder, className = "", disabled = false }) => {
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

const crewMenuStyles = (cardColor) => ({
  menu: (base) => ({
    ...base,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e2e2ea",
    marginTop: "4px",
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 12000,
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: "200px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? cardColor
      : state.isFocused
        ? "rgba(0, 54, 140, 0.1)"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#1a1a1a",
    fontSize: "13px",
    padding: "10px 12px",
    borderRadius: "6px",
    margin: "2px 0",
    cursor: "pointer",
    "&:active": {
      backgroundColor: cardColor,
      color: "#ffffff",
    },
  }),
});

/** `options.transportCompact` — used by Transport husbandry only; other screens use default styles. */
export const getCrewMultiSelectStyles = (cardColor = "#00368c", options = {}) => {
  if (options.transportCompact) {
    return {
      ...crewMenuStyles(cardColor),
      container: (base) => ({
        ...base,
        width: "100%",
      }),
      control: (base, state) => ({
        ...base,
        minHeight: 40,
        height:
          state.hasValue && state.selectProps?.isMulti ? "auto" : 40,
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #ddd",
        borderRadius: "6px",
        boxShadow: state.isFocused ? "0 0 0 1px #3e5cb6" : "none",
        backgroundColor: "#ffffff",
        padding: 0,
        cursor: "default",
        alignItems: "center",
        overflow: "hidden",
        "&:hover": {
          borderColor: state.isFocused ? "#3e5cb6" : "#999",
        },
      }),
      valueContainer: (base) => ({
        ...base,
        padding: "0 12px",
        minHeight: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        minWidth: 0,
        flex: "1 1 auto",
        alignItems: "center",
        alignContent: "center",
        overflow: "hidden",
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: cardColor,
        borderRadius: "4px",
        margin: "0 4px 0 0",
        minHeight: 22,
        maxWidth: "100%",
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 4px 2px 6px",
        lineHeight: 1.25,
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: "#ffffff",
        borderRadius: "2px",
        padding: "2px 4px",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          color: "#ffffff",
        },
      }),
      placeholder: (base) => ({
        ...base,
        color: "#999",
        fontSize: "13px",
        margin: 0,
        marginLeft: 0,
      }),
      input: (base) => ({
        ...base,
        color: "#1a1a1a",
        fontSize: "13px",
        margin: 0,
        padding: 0,
        minWidth: "2px",
      }),
      indicatorsContainer: (base) => ({
        ...base,
        minHeight: 40,
        alignSelf: "stretch",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        padding: 0,
      }),
      indicatorSeparator: () => ({
        display: "none",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "#666",
        padding: "0 10px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
          color: cardColor,
        },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "#999",
        padding: "0 6px",
        height: "100%",
        display: "flex",
        alignItems: "center",
        "&:hover": {
          color: "#ff0000",
        },
      }),
    };
  }

  return {
    ...crewMenuStyles(cardColor),
    control: (base) => ({
      ...base,
      minHeight: "42px",
      border: "none",
      boxShadow: "none",
      backgroundColor: "transparent",
      borderRadius: "8px",
      padding: "0",
      width: "100%",
      overflow: "hidden",
    }),
    valueContainer: (base) => ({
      ...base,
      minHeight: "34px",
      padding: "0",
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      minWidth: 0,
      overflow: "hidden",
      flex: 1,
      alignContent: "center",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: cardColor,
      borderRadius: "6px",
      margin: "0",
      minHeight: "26px",
      maxWidth: "100%",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#ffffff",
      fontSize: "12px",
      fontWeight: "500",
      padding: "4px 6px",
      paddingRight: "4px",
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#ffffff",
      borderRadius: "4px",
      padding: "2px 4px",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        color: "#ffffff",
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: "#999",
      fontSize: "13px",
      marginLeft: 0,
    }),
    input: (base) => ({
      ...base,
      color: "#1a1a1a",
      fontSize: "13px",
      margin: 0,
      padding: 0,
      minWidth: "60px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      paddingRight: "4px",
      flexShrink: 0,
      alignSelf: "stretch",
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#666",
      padding: "4px",
      "&:hover": {
        color: cardColor,
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: "#999",
      padding: "4px",
      "&:hover": {
        color: "#ff0000",
      },
    }),
  };
};

export const truncateCrewLabel = (text = "") => {
  if (typeof text !== "string") return "";
  return text.length > 9 ? `${text.slice(0, 9)}...` : text;
};

export const formatCrewOptionLabel = (option, { context }) => {
  const fullLabel = option?.label || "";
  if (context !== "value") {
    return fullLabel;
  }

  return (
    <span title={fullLabel}>
      {truncateCrewLabel(fullLabel)}
    </span>
  );
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

