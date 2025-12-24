import { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  "Appointment Details",
  "Operation",
  "Husbandry",
  "Sales Order",
  "Reports",
  "KPI",
  "Attachments",
];

const ENABLED_TABS = ["Appointment Details", "Operation", "Husbandry", "Sales Order", "Reports", "KPI", "Attachments"];
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

// Predefined color palette (matching the image: 2 rows x 6 columns)
const COLOR_PALETTE = [
  // Row 1
  { hex: '#FF00FF', rgb: 'rgb(255, 0, 255)', name: 'Fuchsia' },
  { hex: '#800080', rgb: 'rgb(128, 0, 128)', name: 'Purple' },
  { hex: '#4169E1', rgb: 'rgb(65, 105, 225)', name: 'Royal Blue' },
  { hex: '#008000', rgb: 'rgb(0, 128, 0)', name: 'Green' },
  { hex: '#FFFF00', rgb: 'rgb(255, 255, 0)', name: 'Yellow' },
  { hex: '#FFA500', rgb: 'rgb(255, 165, 0)', name: 'Orange' },
  // Row 2
  { hex: '#8B0000', rgb: 'rgb(139, 0, 0)', name: 'Dark Red' },
  { hex: '#775649', rgb: 'rgb(119, 86, 73)', name: 'Brown' },
  { hex: '#D3D3D3', rgb: 'rgb(211, 211, 211)', name: 'Light Gray' },
  { hex: '#708090', rgb: 'rgb(112, 128, 144)', name: 'Slate Blue' },
  { hex: '#000000', rgb: 'rgb(0, 0, 0)', name: 'Black' },
  { hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', name: 'White' },
];

// Helper functions
const rgbToHex = (rgb) => {
  if (!rgb) return '#775649';
  if (rgb.startsWith('#')) return rgb.toUpperCase();
  // Handle both "rgb(119, 86, 73)" and "rgb(119 86 73)" formats
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '#775649';
  return '#' + match.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
};

const normalizeRgb = (rgb) => {
  if (!rgb) return '';
  if (rgb.startsWith('#')) return rgb;
  // Normalize RGB format: remove spaces, ensure consistent format
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return '';
  return `rgb(${match[0]}, ${match[1]}, ${match[2]})`;
};

const hexToRgb = (hex) => {
  if (!hex) return 'rgb(119, 86, 73)';
  if (hex.startsWith('rgb')) return hex;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return 'rgb(119, 86, 73)';
  return `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`;
};

// Custom Color Picker Component
const ColorPickerDropdown = ({ isOpen, onClose, selectedColor, onColorSelect }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleColorClick = (color) => {
    onColorSelect(color.rgb);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="color-picker-dropdown" ref={dropdownRef}>
      <div className="color-picker-grid">
        {COLOR_PALETTE.map((color, index) => {
          const selectedHex = rgbToHex(selectedColor);
          const isSelected = selectedHex === color.hex || normalizeRgb(selectedColor) === normalizeRgb(color.rgb);
          return (
            <button
              key={index}
              type="button"
              className={`color-swatch ${isSelected ? 'selected' : ''} ${color.hex === '#FFFFFF' ? 'white-swatch' : ''}`}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorClick(color)}
              title={color.name}
              aria-label={`Select ${color.name} color`}
            >
              {isSelected && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="color-checkmark"
                >
                  <path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke={color.hex === '#000000' ? '#ffffff' : color.hex === '#FFFFFF' ? '#000000' : '#ffffff'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {color.hex === '#FFFFFF' && !isSelected && (
                <div className="color-swatch-outline"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

ColorPickerDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedColor: PropTypes.string.isRequired,
  onColorSelect: PropTypes.func.isRequired,
};

// Sub-components
const TopBar = ({ card, topbarColor, onClose, isAddMode = false, onColorChange, formValues, handleChange }) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const cardId = card?.code || card?.id || '';
  const cardTitle = card?.title || '';

  const handleColorSelect = (rgbColor) => {
    if (onColorChange) {
      onColorChange(rgbColor);
    }
    setIsColorPickerOpen(false);
  };

  const handleToggleColorPicker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsColorPickerOpen(!isColorPickerOpen);
  };

  const handleTitleChange = (e) => {
    if (handleChange) {
      handleChange("cardTitle")(e);
    }
  };

  return (
    <div className="cardform-topbar" style={{ backgroundColor: topbarColor }}>
      <div>
        {!isAddMode && <span className="cardform-id">ID : {cardId}</span>}
        {isAddMode ? (
          <input
            type="text"
            className="cardform-title-input"
            placeholder="Enter card title"
            value={formValues?.cardTitle || ""}
            onChange={handleTitleChange}
            autoFocus
          />
        ) : (
          <span className="cardform-title">{cardTitle}</span>
        )}
      </div>
      <div className="cardform-topbar-right">
        <div className="topbar-color-picker-wrapper">
          <button
            type="button"
            className="topbar-color-picker-label"
            onClick={handleToggleColorPicker}
            title="Change header color"
            aria-label="Color Picker"
          >
            <img src={ColorPickerIcon} alt="Color Picker" className="topbar-color-picker-icon" />
          </button>
          <ColorPickerDropdown
            isOpen={isColorPickerOpen}
            onClose={() => setIsColorPickerOpen(false)}
            selectedColor={topbarColor}
            onColorSelect={handleColorSelect}
          />
        </div>
        <button className="cardform-close-btn" onClick={onClose} type="button" aria-label="Close">
          ✕
        </button>
      </div>
    </div>
  );
};

TopBar.propTypes = {
  card: PropTypes.object,
  topbarColor: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  isAddMode: PropTypes.bool,
  onColorChange: PropTypes.func,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
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
  // Use green colors for all progress bars (ignoring accentColor)
  const GREEN_COMPLETED = "#2e7d32"; // Dark green for completed/active steps
  const GREEN_INACTIVE = "#8bc48a"; // Light green for inactive steps

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

        // Always use green colors
        const circleStyle = isStepCompletedOrCurrent
          ? {
            background: GREEN_COMPLETED,
            color: "#ffffff",
            borderColor: GREEN_COMPLETED,
          }
          : {
            borderColor: GREEN_INACTIVE,
            color: GREEN_INACTIVE,
          };

        const lineStyle = isStepCompletedOrCurrent && isNextStepCompletedOrCurrent
          ? { background: GREEN_COMPLETED }
          : { background: GREEN_INACTIVE };

        const labelStyle = isStepCompletedOrCurrent
          ? { color: GREEN_COMPLETED }
          : { color: GREEN_INACTIVE };

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
  return (
    <div className="cardform-footer">
      {activeTab !== "Appointment Details" && (
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
const renderTabContent = (activeTab, card, formValues, handleChange, ownerInitial, isAddMode = false) => {
  const commonProps = {
    card,
    formValues,
    handleChange,
    isAddMode,
  };

  switch (activeTab) {
    case "Appointment Details":
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
      return <General {...commonProps} ownerInitial={ownerInitial} cardUser={card?.user} />;
  }
};

// Main Component
function CardForm({ show, close, card, moveCardToColumn, columns, currentColumn, isAddMode = false }) {
  const [activeTopTab, setActiveTopTab] = useState("Appointment Details");

  // State for topbar color - visual only, never affects card.color
  // Always initialize from card.color (the fixed card color)
  const [topbarColor, setTopbarColor] = useState(() => {
    if (isAddMode) {
      return 'rgb(119, 86, 73)';
    }
    // Always use card's fixed color, never column color
    return card?.color || DEFAULT_ACCENT_COLOR;
  });

  const initialFormValues = useMemo(
    () => ({
      cardTitle: card?.title || "",
      owner: card?.user || "None",
      // Service Information
      typeOfCall: card?.typeOfCall || "",
      mainBillingEntity: card?.mainBillingEntity || "SS7",
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
    // NOTE: topbarColor is visual only - never save it to card.color
    // card.color must remain fixed and unchanged
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

  // Reset topbar color to card's fixed color when card changes
  // This ensures topbar always reflects the card's actual color when form opens
  useEffect(() => {
    if (!isAddMode && card?.color) {
      // Reset to card's fixed color (visual only, doesn't change card.color)
      setTopbarColor(card.color);
    }
  }, [card?.id, card?.color, isAddMode]); // Use card.id to detect card changes

  // Everything else uses card's unique color
  const accentColor = useMemo(() => card?.color || DEFAULT_ACCENT_COLOR, [card?.color]);

  // Handle topbar color change - visual only, never modifies card.color
  const handleTopbarColorChange = useCallback((newColor) => {
    // Only update the visual topbar color, card.color remains fixed
    setTopbarColor(newColor);
  }, []);
  const ownerInitial = useMemo(
    () => formValues.owner?.[0]?.toUpperCase() || "N",
    [formValues.owner]
  );

  if (!show) return null;

  return (
    <div className="cardform-overlay" onClick={close}>
      <div className={`cardform-panel ${isAddMode ? 'add-mode' : ''}`} onClick={(e) => e.stopPropagation()}>
        <TopBar
          card={card}
          topbarColor={topbarColor}
          onClose={close}
          isAddMode={isAddMode}
          onColorChange={handleTopbarColorChange}
          formValues={formValues}
          handleChange={handleChange}
        />
        {!isAddMode && (
          <TopTabs
            tabs={TOP_TABS}
            activeTab={activeTopTab}
            onTabChange={handleTopTabChange}
            enabledTabs={ENABLED_TABS}
          />
        )}
        {renderTabContent(activeTopTab, card, formValues, handleChange, ownerInitial, isAddMode)}
        {!isAddMode && (
          <CardFormFooter
            accentColor={accentColor}
            onUpdate={handleUpdate}
            activeStep={currentStep || 1}
            completedSteps={currentStep && currentStep > 1 ? currentStep - 1 : 0}
            activeTab={activeTopTab}
            onStepClick={handleStepClick}
            currentStep={currentStep}
          />
        )}
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
  isAddMode: PropTypes.bool,
};

export default CardForm;
