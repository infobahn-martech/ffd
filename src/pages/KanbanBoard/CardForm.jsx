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
import Reports from "./CardFormTabs/Reports";
import KPI from "./CardFormTabs/KPI";

// Constants
const TOP_TABS = [
  "General",
  "Operation",
  "Husbandry",
  "Attachments",
  "Sales Order",
  "Reports",
  "KPI",
];

const ENABLED_TABS = ["General", "Operation", "Husbandry", "Attachments", "Sales Order", "Reports", "KPI"];
// const ENABLED_TABS = ["General", "Operation", "Husbandry", "Attachments", "Sales Order"];

const DEFAULT_ACCENT_COLOR = "#2A00FF";
const TOTAL_STEPS = 6;

const STEP_LABELS = [
  "Appointment Received",
  "Enroute",
  "Vessel Arrived",
  "Vessel Cleared",
  "Vessel Sailed / Awaiting Documents",
  "Ready to Finalize",
];

// Mapping between column titles and step labels (used for both directions)
const COLUMN_TO_STEP_MAP = {
  "Appointment Received": { stepNumber: 1, stepLabel: "Appointment Received" },
  "Enroute": { stepNumber: 2, stepLabel: "Enroute" },
  "Vessel Arrived": { stepNumber: 3, stepLabel: "Vessel Arrived" },
  "Vessel Cleared": { stepNumber: 4, stepLabel: "Vessel Cleared" },
  "Vessel Sailed": { stepNumber: 5, stepLabel: "Vessel Sailed / Awaiting Documents" },
  "Ready to Fianalize": { stepNumber: 6, stepLabel: "Ready to Finalize" }, // Note: typo in data.js
};

// Helper function to map step label to column ID based on column titles
const getColumnIdFromStepLabel = (stepLabel, columns) => {
  if (!columns) return null;

  // Normalize step labels to match column titles
  const stepToColumnMap = {
    "Appointment Received": "Appointment Received",
    "Enroute": "Enroute",
    "Vessel Arrived": "Vessel Arrived",
    "Vessel Cleared": "Vessel Cleared",
    "Vessel Sailed / Awaiting Documents": "Vessel Sailed",
    "Ready to Finalize": "Ready to Fianalize", // Note: typo in data.js
  };

  const columnTitle = stepToColumnMap[stepLabel];
  if (!columnTitle) return null;

  // Find column with matching title
  for (const colId in columns) {
    if (columns[colId].title === columnTitle) {
      return colId;
    }
  }

  return null;
};

// Helper function to get step number from column title
const getStepNumberFromColumnTitle = (columnTitle) => {
  const mapping = COLUMN_TO_STEP_MAP[columnTitle];
  return mapping ? mapping.stepNumber : null;
};

// Helper function to get step number from column ID
const getStepNumberFromColumnId = (columnId, columns) => {
  if (!columns || !columnId) return null;
  const column = columns[columnId];
  if (!column) return null;
  return getStepNumberFromColumnTitle(column.title);
};

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


const StepsProgress = ({ totalSteps = TOTAL_STEPS, activeStep = 2, completedSteps = 1, accentColor = DEFAULT_ACCENT_COLOR, stepLabels = STEP_LABELS, onStepClick, currentStep }) => {
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

  // Use currentStep as the actual current step (from card's column), fallback to activeStep
  const actualCurrentStep = currentStep !== null && currentStep !== undefined ? currentStep : activeStep;

  return (
    <div className="cardform-steps-wrapper">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber <= completedSteps;
        const isCurrentStep = stepNumber === actualCurrentStep;
        // Treat current step as completed for styling
        const isStepCompletedOrCurrent = isCompleted || isCurrentStep;
        const stepClass = isStepCompletedOrCurrent ? "completed" : "";

        // Check if next step is also completed or current (for line styling)
        const nextStepNumber = stepNumber + 1;
        const isNextStepCompleted = nextStepNumber <= completedSteps;
        const isNextStepCurrent = nextStepNumber === actualCurrentStep;
        const isNextStepCompletedOrCurrent = isNextStepCompleted || isNextStepCurrent;
        const lineClass = isStepCompletedOrCurrent && isNextStepCompletedOrCurrent ? "completed-line" : "";

        // Determine if this step is clickable (only adjacent steps, not the current step itself)
        const isAdjacent = currentStep !== null && Math.abs(stepNumber - currentStep) === 1;
        const isClickable = onStepClick && currentStep !== null && isAdjacent && stepNumber !== currentStep;
        const isDisabled = onStepClick && currentStep !== null && !isAdjacent && stepNumber !== currentStep;

        const circleStyle = isStepCompletedOrCurrent
          ? {
            background: accentColor,
            color: "#ffffff",
            borderColor: accentColor,
          }
          : {
            borderColor: lightColor,
            color: lightColor,
          };

        const lineStyle = isStepCompletedOrCurrent && isNextStepCompletedOrCurrent
          ? { background: accentColor }
          : { background: lightColor };

        const labelStyle = isStepCompletedOrCurrent
          ? { color: accentColor }
          : { color: lightColor };

        const stepLabel = stepLabels[index] || `Step ${stepNumber}`;
        const handleStepClick = () => {
          if (onStepClick && isClickable) {
            onStepClick(stepLabel, stepNumber);
          }
        };

        return (
          <div
            key={stepNumber}
            className={`step-item ${stepClass} ${isClickable ? 'clickable' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={handleStepClick}
            style={isClickable ? { cursor: 'pointer' } : isDisabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}}
          >
            <div className="step-content">
              <div className="step-circle" style={circleStyle}>
                {stepNumber}
              </div>
              {index < totalSteps - 1 && (
                <span className={`step-line ${lineClass}`} style={lineStyle}></span>
              )}
            </div>
            <div className="step-label" style={labelStyle}>
              {stepLabel}
            </div>
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
  stepLabels: PropTypes.arrayOf(PropTypes.string),
  onStepClick: PropTypes.func,
  currentStep: PropTypes.number,
};

const CardFormFooter = ({ accentColor, onUpdate, activeStep = 2, completedSteps = 1, activeTab, onStepClick, currentStep }) => {
  const showProgressBar = activeTab !== "General";

  return (
    <div className="cardform-footer">
      {showProgressBar && (
        <StepsProgress
          totalSteps={TOTAL_STEPS}
          activeStep={activeStep}
          completedSteps={completedSteps}
          accentColor={accentColor}
          stepLabels={STEP_LABELS}
          onStepClick={onStepClick}
          currentStep={currentStep}
        />
      )}
      {!showProgressBar && <div />}
    </div>
  );
};

CardFormFooter.propTypes = {
  accentColor: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  activeStep: PropTypes.number,
  completedSteps: PropTypes.number,
  activeTab: PropTypes.string,
  onStepClick: PropTypes.func,
  currentStep: PropTypes.number,
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
      return <General {...commonProps} ownerInitial={ownerInitial} cardUser={card?.user} />;
    case "Operation":
      return <Operation {...commonProps} ownerInitial={ownerInitial} />;
    case "Husbandry":
      return <Husbandry {...commonProps} />;
    case "Attachments":
      return <Attachments {...commonProps} />;
    case "Sales Order":
      return <SalesOrder {...commonProps} />;
    case "Reports":
      return <Reports {...commonProps} />;
    case "KPI":
      return <KPI {...commonProps} />;
    default:
      return <General {...commonProps} />;
  }
};

// Main Component
function CardForm({ show, close, card, moveCardToColumn, columns, currentColumn }) {
  const [activeTopTab, setActiveTopTab] = useState("General");

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

  // Calculate current step from current column
  const currentStep = useMemo(() => {
    if (!currentColumn) return null;
    return getStepNumberFromColumnTitle(currentColumn.title);
  }, [currentColumn]);

  const handleStepClick = useCallback((stepLabel, stepNumber) => {
    if (!moveCardToColumn || !card?.id) return;

    // Step-by-step validation: only allow moving to adjacent steps (forward or backward by 1)
    if (currentStep !== null) {
      const stepDifference = Math.abs(stepNumber - currentStep);
      if (stepDifference !== 1 || stepNumber === currentStep) {
        // Not an adjacent step or trying to click current step, don't allow the move
        return;
      }
    }

    const targetColumnId = getColumnIdFromStepLabel(stepLabel, columns);
    if (targetColumnId) {
      moveCardToColumn(card.id, targetColumnId);
    }
  }, [moveCardToColumn, card?.id, columns, currentStep]);

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
          activeStep={currentStep || 1}
          completedSteps={currentStep && currentStep > 1 ? currentStep - 1 : 0}
          activeTab={activeTopTab}
          onStepClick={handleStepClick}
          currentStep={currentStep}
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
  moveCardToColumn: PropTypes.func,
  columns: PropTypes.object,
  currentColumn: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    color: PropTypes.string,
    cardIds: PropTypes.array,
  }),
};

export default CardForm;
