import { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import "../../design/css/CardForm.css";
import ColorPickerIcon from "../../assets/images/ColorPicker.png";
import PriorityIcon from "../../assets/images/Priority.png";

// Import Tab Components
import General from "./CardFormTabs/General";
import Operation from "./CardFormTabs/Operation";
import Husbandry from "./CardFormTabs/Husbandry";
import Attachments from "./CardFormTabs/Attachments";
import SalesOrder from "./CardFormTabs/SalesOrder";
import Tasks from "./CardFormTabs/Tasks";
import Reports from "./CardFormTabs/Reports";
import KPI from "./CardFormTabs/KPI";

// Constants
const TOP_TABS = [
  "General",
  "Operation",
  "Husbandry",
  "Attachments",
  "Sales Order",
  "Tasks",
  "Reports",
  "KPI",
];

// const ENABLED_TABS = ["General", "Operation", "Husbandry", "Attachments", "Sales Order", "Reports"];
const ENABLED_TABS = ["General", "Operation", "Husbandry", "Attachments",];

const DEFAULT_ACCENT_COLOR = "#2A00FF";
const TOTAL_STEPS = 5;

// Sub-components
const TopBar = ({ card, accentColor, onClose }) => {
  const cardId = card?.code || card?.id;
  const cardTitle = card?.title || "";

  return (
    <div className="cardform-topbar" style={{ backgroundColor: accentColor }}>
      <div>
        <span className="cardform-id">ID : {cardId}</span>
        <span className="cardform-title">{cardTitle}</span>
      </div>
      <div className="cardform-topbar-right">
        <button className="topbar-icon-btn" type="button" aria-label="Color Picker">
          <img src={ColorPickerIcon} alt="Color Picker" />
        </button>
        <button className="topbar-icon-btn" type="button" aria-label="Priority">
          <img src={PriorityIcon} alt="Priority" />
        </button>
        <button className="cardform-close-btn" onClick={onClose} type="button" aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  card: PropTypes.object,
  accentColor: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

const TopTabs = ({ tabs, activeTab, onTabChange, enabledTabs }) => {
  return (
    <div className="cardform-tabs">
      {tabs.map((tab) => {
        const isEnabled = enabledTabs.includes(tab);
        return (
          <button
            key={tab}
            className={`tab ${tab === activeTab ? "active" : ""} ${!isEnabled ? "disabled" : ""}`}
            onClick={() => isEnabled && onTabChange(tab)}
            type="button"
            disabled={!isEnabled}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

TopTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  enabledTabs: PropTypes.arrayOf(PropTypes.string).isRequired,
};


const StepsProgress = ({ totalSteps = TOTAL_STEPS, activeStep = 2, completedSteps = 1, accentColor = DEFAULT_ACCENT_COLOR }) => {
  // Create a lighter version of the accent color for inactive steps
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  };

  const rgb = hexToRgb(accentColor);
  const lightColor = rgb
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
    : accentColor;

  return (
    <div className="cardform-steps-wrapper">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber <= completedSteps;
        const isActive = stepNumber === activeStep;
        // Treat active step as completed for styling
        const isStepCompletedOrActive = isCompleted || isActive;
        const stepClass = isStepCompletedOrActive ? "completed" : "";

        // Check if next step is also completed or active (for line styling)
        const nextStepNumber = stepNumber + 1;
        const isNextStepCompleted = nextStepNumber <= completedSteps;
        const isNextStepActive = nextStepNumber === activeStep;
        const isNextStepCompletedOrActive = isNextStepCompleted || isNextStepActive;
        const lineClass = isStepCompletedOrActive && isNextStepCompletedOrActive ? "completed-line" : "";

        const circleStyle = isStepCompletedOrActive
          ? {
            background: accentColor,
            color: "#ffffff",
            borderColor: accentColor,
          }
          : {
            borderColor: lightColor,
            color: lightColor,
          };

        const lineStyle = isStepCompletedOrActive && isNextStepCompletedOrActive
          ? { background: accentColor }
          : { background: lightColor };

        return (
          <div key={stepNumber} className={`step-item ${stepClass}`}>
            <div className="step-circle" style={circleStyle}>
              {stepNumber}
            </div>
            {index < totalSteps - 1 && (
              <span className={`step-line ${lineClass}`} style={lineStyle}></span>
            )}
          </div>
        );
      })}
    </div>
  );
};

StepsProgress.propTypes = {
  totalSteps: PropTypes.number,
  activeStep: PropTypes.number,
  completedSteps: PropTypes.number,
  accentColor: PropTypes.string,
};

const CardFormFooter = ({ accentColor, onUpdate, activeStep = 2, completedSteps = 1, activeTab }) => {
  const showProgressBar = activeTab !== "General";

  return (
    <div className="cardform-footer">
      {showProgressBar && (
        <StepsProgress
          totalSteps={TOTAL_STEPS}
          activeStep={activeStep}
          completedSteps={completedSteps}
          accentColor={accentColor}
        />
      )}
      {!showProgressBar && <div />}
      <button
        className="cardform-update-btn"
        style={{ backgroundColor: accentColor }}
        onClick={onUpdate}
        type="button"
      >
        Update Card
      </button>
    </div>
  );
};

CardFormFooter.propTypes = {
  accentColor: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  activeStep: PropTypes.number,
  completedSteps: PropTypes.number,
  activeTab: PropTypes.string,
};

// Tab Content Renderer
const renderTabContent = (activeTab, card, formValues, handleChange, ownerInitial) => {
  const commonProps = {
    card,
    formValues,
    handleChange,
  };

  switch (activeTab) {
    case "General":
      return <General {...commonProps} />;
    case "Operation":
      return <Operation {...commonProps} ownerInitial={ownerInitial} />;
    case "Husbandry":
      return <Husbandry {...commonProps} />;
    case "Attachments":
      return <Attachments {...commonProps} />;
    case "Sales Order":
      return <SalesOrder {...commonProps} />;
    case "Tasks":
      return <Tasks {...commonProps} />;
    case "Reports":
      return <Reports {...commonProps} />;
    case "KPI":
      return <KPI {...commonProps} />;
    default:
      return <General {...commonProps} />;
  }
};

// Main Component
function CardForm({ show, close, card }) {
  const [activeTopTab, setActiveTopTab] = useState("Operation");

  const initialFormValues = useMemo(
    () => ({
      owner: card?.user || "None",
      // Service Information
      typeOfCall: card?.typeOfCall || "",
      mainBillingEntity: card?.mainBillingEntity || "",
      // Appointment Details
      appointmentReceivedDate: card?.appointmentReceivedDate || "",
      appointmentAcceptanceDate: card?.appointmentAcceptanceDate || "",
      // Vessel Information
      port: card?.port || "",
      vesselType: card?.vesselType || "",
      bargeType: card?.bargeType || "",
      vesselName: card?.vesselName || "",
      vesselOwner: card?.vesselOwner || "",
      vesselPrincipal: card?.vesselPrincipal || "",
      vesselManager: card?.vesselManager || "",
      otherBillingEntity: card?.otherBillingEntity || "",
      assignedOperator: card?.assignedOperator || "",
      serviceRequestorName: card?.serviceRequestorName || "",
      serviceRequestorEmail: card?.serviceRequestorEmail || "",
      dailyReportEmail: card?.dailyReportEmail || "",
      billingInstructions: card?.billingInstructions || "",
      // Pre-Arrival Information
      expectedArrivalDate: card?.expectedArrivalDate || "",
      expectedArrivalTime: card?.expectedArrivalTime || "",
      customsInspectionDate: card?.customsInspectionDate || "",
      customsInspectionTime: card?.customsInspectionTime || "",
      immigrationClearanceDate: card?.immigrationClearanceDate || "",
      immigrationClearanceTime: card?.immigrationClearanceTime || "",
      inwardClearanceDate: card?.inwardClearanceDate || "",
      inwardClearanceTime: card?.inwardClearanceTime || "",
      // Legacy fields (keeping for backward compatibility)
      lastPort: card?.lastPort || "",
      etaDate: card?.etaDate || "",
      etaTime: card?.etaTime || "",
      customsStart: card?.customsStart || "",
      clearanceCompletion: card?.clearanceCompletion || "",
      lastMovedDate: card?.lastMovedDate || "",
      lastMovedTime: card?.lastMovedTime || "",
      // Attachments and Links
      attachments: card?.attachments || [],
      links: card?.links || [],
    }),
    [card]
  );

  const [formValues, setFormValues] = useState(initialFormValues);

  const handleChange = useCallback(
    (field) => (e) => {
      setFormValues((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleUpdate = useCallback(() => {
    // TODO: Add API call to update card
    close();
  }, [close]);

  const handleTopTabChange = useCallback((tab) => {
    setActiveTopTab(tab);
  }, []);

  const accentColor = useMemo(() => card?.color || DEFAULT_ACCENT_COLOR, [card?.color]);
  const ownerInitial = useMemo(
    () => formValues.owner?.[0]?.toUpperCase() || "N",
    [formValues.owner]
  );

  if (!show) return null;

  return (
    <div className="cardform-overlay" onClick={close}>
      <div className="cardform-panel" onClick={(e) => e.stopPropagation()}>
        <TopBar card={card} accentColor={accentColor} onClose={close} />
        <TopTabs
          tabs={TOP_TABS}
          activeTab={activeTopTab}
          onTabChange={handleTopTabChange}
          enabledTabs={ENABLED_TABS}
        />
        {renderTabContent(activeTopTab, card, formValues, handleChange, ownerInitial)}
        <CardFormFooter
          accentColor={accentColor}
          onUpdate={handleUpdate}
          activeStep={2}
          completedSteps={1}
          activeTab={activeTopTab}
        />
      </div>
    </div>
  );
}

CardForm.propTypes = {
  show: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  card: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    user: PropTypes.string,
    color: PropTypes.string,
    appointmentReceivedDate: PropTypes.string,
    appointmentAcceptanceDate: PropTypes.string,
    lastPort: PropTypes.string,
    etaDate: PropTypes.string,
    etaTime: PropTypes.string,
    customsStart: PropTypes.string,
    clearanceCompletion: PropTypes.string,
    lastMovedDate: PropTypes.string,
    lastMovedTime: PropTypes.string,
  }),
};

export default CardForm;
