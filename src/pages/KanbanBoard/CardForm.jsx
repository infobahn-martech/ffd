import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import callFileService from "../../services/callFileService";
import { buildCreateCallFileFormData } from "../../helpers/createCallFilePayload";
import { notify } from "../../components/Toaster";
import "../../design/css/CardForm.css";
import "../../design/scss/general.scss";
import ColorPickerIcon from "../../assets/images/ColorPicker.png";
import PriorityIcon from "../../assets/images/Priority.png";
import { getItem } from "../../helpers/localStorage";

// Import Tab Components
import General from "./CardFormTabs/General";
import Operation from "./CardFormTabs/Operation";
import Husbandry from "./CardFormTabs/Husbandry";
import Attachments from "./CardFormTabs/Attachments";
import Invoice from "./CardFormTabs/Invoice";
import SalesOrder from "./CardFormTabs/SalesOrder";
import Reports from "./CardFormTabs/Reports";
import KPI from "./CardFormTabs/KPI";
import NavTabButton from "../../components/NavTabButton";

// Constants - All tabs
const ALL_TOP_TABS = [
  "Appointment Details",
  "Operation",
  "Husbandry",
  "Sales Order",
  "Reports",
  "KPI",
  "Attachments",
];

const ALL_ENABLED_TABS = ["Appointment Details", "Operation", "Husbandry", "Sales Order", "Reports", "KPI", "Attachments"];

// Constants - Simplified tabs for kanban-board/{id} routes
const SIMPLIFIED_TOP_TABS = [
  "General",
  "Sales Order",
  "Invoice",
];

const SIMPLIFIED_ENABLED_TABS = ["General", "Invoice", "Sales Order"];

// Constants - DA module tabs (includes Operation and Husbandry)
const DA_TOP_TABS = [
  "General",
  "Operation",
  "Husbandry",
  "Sales Order",
  "Reports",
  "KPI",
  "Invoice",
];

const DA_ENABLED_TABS = ["General", "Operation", "Husbandry", "Sales Order", "Reports", "KPI", "Invoice"];

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

// Helper: get step labels from columns + columnOrder (e.g. from DAdata columnTitles).
// When columnOrder is provided, step labels = column titles in that order; else use STEP_LABELS.
const getStepLabelsFromColumns = (columns, columnOrder) => {
  if (!columnOrder || !columns || !Array.isArray(columnOrder)) return null;
  const labels = columnOrder.map((colId) => columns[colId]?.title).filter(Boolean);
  return labels.length > 0 ? labels : null;
};

// Helper function to map step label to column ID (column.id for moveCardToColumn)
const getColumnIdFromStepLabel = (stepLabel, columns, columnOrder) => {
  if (!columns) return null;

  // When columnOrder is provided (e.g. from DAdata), resolve by title in order
  if (columnOrder && Array.isArray(columnOrder)) {
    const colId = columnOrder.find((id) => columns[id]?.title === stepLabel);
    return colId ? columns[colId]?.id ?? colId : null;
  }

  // Fallback: legacy step-to-title map
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
  for (const colId in columns) {
    if (columns[colId].title === columnTitle) {
      return columns[colId]?.id ?? colId;
    }
  }
  return null;
};

// Helper function to get step number from column title
const getStepNumberFromColumnTitle = (columnTitle, columns, columnOrder) => {
  if (columnOrder && columns && Array.isArray(columnOrder)) {
    const idx = columnOrder.findIndex((colId) => columns[colId]?.title === columnTitle);
    return idx >= 0 ? idx + 1 : null;
  }
  const mapping = COLUMN_TO_STEP_MAP[columnTitle];
  return mapping ? mapping.stepNumber : null;
};

// Helper function to get step number from column (resolves parent for sub-columns)
const getStepNumberFromColumnId = (columnId, columns, columnOrder) => {
  if (!columns || !columnId) return null;
  const colKey = Object.keys(columns).find((k) => columns[k]?.id === columnId);
  if (!colKey) return null;
  const col = columns[colKey];
  const keyForOrder = col.parentColumnId
    ? Object.keys(columns).find((k) => columns[k]?.id === col.parentColumnId) || colKey
    : colKey;
  if (columnOrder && Array.isArray(columnOrder)) {
    const idx = columnOrder.indexOf(keyForOrder);
    return idx >= 0 ? idx + 1 : null;
  }
  const colForTitle = keyForOrder !== colKey ? columns[keyForOrder] : col;
  return getStepNumberFromColumnTitle(colForTitle?.title, columns, columnOrder);
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
          <NavTabButton
            key={tab}
            className={`tab ${!isEnabled ? "disabled" : ""}`}
            active={tab === activeTab}
            locked={isEnabled && tab === activeTab}
            onClick={() => onTabChange(tab)}
            disabled={!isEnabled}
          >
            {tab}
          </NavTabButton>
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

const CardFormFooter = ({ accentColor, onUpdate, activeStep = 2, completedSteps = 1, activeTab, onStepClick, currentStep, isSimplifiedMode = false, isDriverMode = false, isGROMode = false, stepLabels = STEP_LABELS, totalSteps = TOTAL_STEPS }) => {
  const showSteps = isGROMode || isDriverMode || (!isSimplifiedMode && activeTab !== "Appointment Details") || (isSimplifiedMode && activeTab !== "General");
  return (
    <div className="cardform-footer">
      {showSteps && (
        <StepsProgress
          totalSteps={totalSteps}
          activeStep={activeStep}
          completedSteps={completedSteps}
          accentColor={accentColor}
          stepLabels={stepLabels}
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
  isSimplifiedMode: PropTypes.bool,
  isDriverMode: PropTypes.bool,
  isGROMode: PropTypes.bool,
  stepLabels: PropTypes.arrayOf(PropTypes.string),
  totalSteps: PropTypes.number,
};

// Format date from YYYY-MM-DD to DD/MM/YYYY
const formatDisplayDate = (isoDate) => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return d && m && y ? `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}` : isoDate;
};

// Format time from HH:mm to 12-hour (e.g. 10:30 -> 10:30 AM)
const formatDisplayTime = (time) => {
  if (!time) return "";
  const [h, min] = (time || "").split(":");
  if (!h) return time;
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${(min || "00").padStart(2, "0")} ${ampm}`;
};

// MWP Board card view: Application No, Application Submitted, SADAD No, Approved, Issued, MWP copy, Expiry
const MWPCardView = ({ card }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const applicationNo = card?.applicationNo ?? "MWP-2025-0001";
  const applicationSubmittedDate = card?.applicationSubmittedDate ?? "2024-01-15";
  const applicationSubmittedTime = card?.applicationSubmittedTime ?? "10:30";
  const sadadNo = card?.sadadNo ?? "SADAD-123456";
  const approvedDate = card?.approvedDate ?? "2024-01-18";
  const approvedTime = card?.approvedTime ?? "14:00";
  const issuedDate = card?.issuedDate ?? "2024-01-20";
  const issuedTime = card?.issuedTime ?? "09:15";
  const mwpCopyFiles =
    Array.isArray(card?.mwpCopy) && card.mwpCopy.length > 0
      ? card.mwpCopy
      : [{ name: "mwp_copy.pdf", size: 1024000 }];
  const expiryDate = card?.expiryDate ?? "2025-01-20";
  const expiryTime = card?.expiryTime ?? "23:59";

  const FormField = ({ label, children }) => (
    <div className="mwp-field">
      {label && <label className="mwp-field-label">{label}</label>}
      {children}
    </div>
  );

  const DateTimeDisplay = ({ dateValue, timeValue }) => (
    <div className="mwp-datetime">
      <span className="mwp-datetime-date">{formatDisplayDate(dateValue)}</span>
      <span className="mwp-datetime-time">{formatDisplayTime(timeValue)}</span>
    </div>
  );

  const CounterCard = ({ label, value }) => (
    <div className="driver-card-counter">
      <div className="driver-card-counter-label">{label}</div>
      <div className="driver-card-counter-value">{value}</div>
    </div>
  );

  const billingEntity = card?.user ?? "—";
  const expiryDisplay = `${formatDisplayDate(expiryDate)} ${formatDisplayTime(expiryTime)}`;

  return (
    <div className="mwp-card-view">
      <div className="driver-card-counters">
        <CounterCard label="Billing Entity" value={billingEntity} />
        <CounterCard label="Application No" value={applicationNo} />
        <CounterCard label="SADAD No" value={sadadNo} />
        <CounterCard label="Expiry" value={expiryDisplay} />
      </div>
      <div className="mwp-card-view-grid">
        <div className="mwp-section">
          <h3 className="mwp-section-title">Application</h3>
          <FormField label="Application No.">
            <div className="mwp-value">{applicationNo}</div>
          </FormField>
          <FormField label="Application Submitted">
            <DateTimeDisplay dateValue={applicationSubmittedDate} timeValue={applicationSubmittedTime} />
          </FormField>
          <FormField label="SADAD No.">
            <div className="mwp-value">{sadadNo}</div>
          </FormField>
        </div>
        <div className="mwp-section">
          <h3 className="mwp-section-title">Status & Dates</h3>
          <FormField label="Approved">
            <DateTimeDisplay dateValue={approvedDate} timeValue={approvedTime} />
          </FormField>
          <FormField label="Issued">
            <DateTimeDisplay dateValue={issuedDate} timeValue={issuedTime} />
          </FormField>
          <FormField label="Expiry">
            <DateTimeDisplay dateValue={expiryDate} timeValue={expiryTime} />
          </FormField>
        </div>
      </div>
      <div className="mwp-section mwp-section-full">
        <h3 className="mwp-section-title">Document</h3>
        <FormField label="MWP copy">
          <div className="mwp-file-preview">
            {mwpCopyFiles.map((file, index) => (
              <div key={index} className="mwp-file-preview-item">
                <div className="mwp-file-preview-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 13H8M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mwp-file-preview-info">
                  <span className="mwp-file-preview-name">{file.name || file}</span>
                  <span className="mwp-file-preview-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  );
};

MWPCardView.propTypes = {
  card: PropTypes.object,
};

// Stable random index (0 or 1) from row id for Status label
const getStatusIndex = (row) => {
  const id = String(row?.id ?? row?.crewName ?? Math.random());
  const hash = id.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
  return Math.abs(hash) % 2;
};

// Dummy PickUp/DropOff values corresponding to status (Pickup vs Drop off)
const DUMMY_PICKUP = [
  { date: "15 Jul 2026", time: "09:00", location: "Port Terminal A" },
  { date: "14 Jul 2026", time: "08:30", location: "Airport Arrival Hall" },
  { date: "16 Jul 2026", time: "10:15", location: "Marina Bay Pier" },
];
const DUMMY_DROPOFF = [
  { date: "15 Jul 2026", time: "14:30", location: "Vessel MV Indian Ocean" },
  { date: "14 Jul 2026", time: "16:00", location: "Port Terminal B" },
  { date: "16 Jul 2026", time: "11:45", location: "Harbor Gate 2" },
];
const getDummyPickup = (row) => {
  const id = String(row?.id ?? row?.crewName ?? "");
  const i = Math.abs(id.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % DUMMY_PICKUP.length;
  return DUMMY_PICKUP[i];
};
const getDummyDropoff = (row) => {
  const id = String(row?.id ?? row?.crewName ?? "");
  const i = Math.abs(id.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % DUMMY_DROPOFF.length;
  return DUMMY_DROPOFF[i];
};

// Dummy Check In / Check Out date and time for Hotel (corresponding to CheckIn vs CheckOut status)
const DUMMY_CHECK_IN = [
  { date: "14 Jul 2026", time: "14:00" },
  { date: "15 Jul 2026", time: "15:30" },
  { date: "16 Jul 2026", time: "10:00" },
];
const DUMMY_CHECK_OUT = [
  { date: "17 Jul 2026", time: "11:00" },
  { date: "18 Jul 2026", time: "09:30" },
  { date: "19 Jul 2026", time: "12:00" },
];
const getDummyCheckIn = (row) => {
  const id = String(row?.id ?? row?.crewName ?? "");
  const i = Math.abs(id.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % DUMMY_CHECK_IN.length;
  return DUMMY_CHECK_IN[i];
};
const getDummyCheckOut = (row) => {
  const id = String(row?.id ?? row?.crewName ?? "");
  const i = Math.abs(id.split("").reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % DUMMY_CHECK_OUT.length;
  return DUMMY_CHECK_OUT[i];
};

// Driver Board card view: 4 counters + crew table
// variant: "driver" => Status = Pickup (green) / Drop off (orange) | "hotel" => Status = CheckIn (green) / CheckOut (orange)
const DriverCardView = ({ card, variant = "driver" }) => {
  const owner = card?.user ?? "—";
  const callType = card?.typeOfCall ?? "—";
  const vesselName = card?.vesselName ?? "—";
  const vesselType = card?.vesselType ?? "—";
  const crew = Array.isArray(card?.crew) ? card.crew : [];

  const isHotel = variant === "hotel";
  const statusOptions = isHotel ? ["CheckIn", "CheckOut"] : ["Pickup", "Drop off"];

  const CounterCard = ({ label, value }) => (
    <div className="driver-card-counter">
      <div className="driver-card-counter-label">{label}</div>
      <div className="driver-card-counter-value">{value}</div>
    </div>
  );

  const StatusBadge = ({ row }) => {
    const index = getStatusIndex(row);
    const label = statusOptions[index];
    const isGreen = index === 0;
    return (
      <span
        className={`driver-crew-status-btn driver-crew-status-badge ${isGreen ? "status-green-border" : "status-orange-border"}`}
        title={label}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="driver-card-view">
      <div className="driver-card-counters">
        <CounterCard label="Billing Entity" value={owner} />
        <CounterCard label="CALL TYPE" value={callType} />
        <CounterCard label="VESSEL NAME" value={vesselName} />
        <CounterCard label="VESSEL TYPE" value={vesselType} />
      </div>
      <div className="driver-crew-table-wrap">
        <table className="driver-crew-table">
          <thead>
            <tr>
              <th>Crew Name</th>
              <th>Nationality</th>
              <th>Passport No</th>
              {isHotel ? (
                <>
                  <th>Check In Date and Time</th>
                  <th>Check Out Date and Time</th>
                </>
              ) : (
                <>
                  <th>PickUp Date, Time and Location</th>
                  <th>DropOff Date, Time and Location</th>
                </>
              )}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {crew.length === 0 ? (
              <tr>
                <td colSpan={6} className="driver-crew-empty">No crew data</td>
              </tr>
            ) : (
              crew.map((row) => {
                const statusIndex = getStatusIndex(row);
                const isFirstStatus = statusIndex === 0; // Pickup / CheckIn
                if (isHotel) {
                  const checkInData = row.checkInDate || row.checkInTime
                    ? { date: row.checkInDate, time: row.checkInTime }
                    : (isFirstStatus ? getDummyCheckIn(row) : getDummyCheckIn(row));
                  const checkOutData = row.checkOutDate || row.checkOutTime
                    ? { date: row.checkOutDate, time: row.checkOutTime }
                    : (!isFirstStatus ? getDummyCheckOut(row) : null);
                  return (
                    <tr key={row.id || row.crewName + row.passportNo}>
                      <td>{row.crewName ?? "—"}</td>
                      <td>{row.nationality ?? "—"}</td>
                      <td>{row.passportNo ?? "—"}</td>
                      <td className="driver-crew-datetime-loc">
                        {checkInData ? (
                          <>
                            {checkInData.date && <span>{checkInData.date}</span>}
                            {checkInData.time && <span>{checkInData.time}</span>}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="driver-crew-datetime-loc">
                        {checkOutData ? (
                          <>
                            {checkOutData.date && <span>{checkOutData.date}</span>}
                            {checkOutData.time && <span>{checkOutData.time}</span>}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <StatusBadge row={row} />
                      </td>
                    </tr>
                  );
                }
                const pickupData = row.pickupDate || row.pickupTime || row.pickupLocation
                  ? { date: row.pickupDate, time: row.pickupTime, location: row.pickupLocation }
                  : getDummyPickup(row);
                const dropoffData = row.dropoffDate || row.dropoffTime || row.dropoffLocation
                  ? { date: row.dropoffDate, time: row.dropoffTime, location: row.dropoffLocation }
                  : (!isFirstStatus ? getDummyDropoff(row) : null);
                return (
                  <tr key={row.id || row.crewName + row.passportNo}>
                    <td>{row.crewName ?? "—"}</td>
                    <td>{row.nationality ?? "—"}</td>
                    <td>{row.passportNo ?? "—"}</td>
                    <td className="driver-crew-datetime-loc">
                      {pickupData ? (
                        <>
                          {pickupData.date && <span>{pickupData.date}</span>}
                          {pickupData.time && <span>{pickupData.time}</span>}
                          {pickupData.location && <span>{pickupData.location}</span>}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="driver-crew-datetime-loc">
                      {dropoffData ? (
                        <>
                          {dropoffData.date && <span>{dropoffData.date}</span>}
                          {dropoffData.time && <span>{dropoffData.time}</span>}
                          {dropoffData.location && <span>{dropoffData.location}</span>}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <StatusBadge row={row} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DriverCardView.propTypes = {
  card: PropTypes.object,
  variant: PropTypes.oneOf(["driver", "hotel"]),
};

// GRO Board card view: 4 info sections + document list + require document
const GRO_DOCUMENT_TYPES = [
  "Registry",
  "Tonnage",
  "Ship Radio Station License",
  "Maritime Health Declaration",
  "Sanitation Certificate",
  "Last Port clearance",
  "Crew List",
  "Immigration Batches",
];

const GROCardView = ({ card }) => {
  const [showRequireDocument, setShowRequireDocument] = useState(false);
  const [requireRemark, setRequireRemark] = useState("");
  const [showInwardClearance, setShowInwardClearance] = useState(false);
  const [inwardDate, setInwardDate] = useState("2024-01-15");
  const [inwardTime, setInwardTime] = useState("10:30");

  const owner = card?.user ?? "Richard Wilson";
  const callType = card?.typeOfCall ?? "Domestic";
  const vesselName = card?.vesselName ?? "MV Atlantic Star";
  const vesselType = card?.vesselType ?? "Container";

  const CounterCard = ({ label, value }) => (
    <div className="driver-card-counter">
      <div className="driver-card-counter-label">{label}</div>
      <div className="driver-card-counter-value">{value}</div>
    </div>
  );

  const handleRequireSubmit = () => {
    // TODO: API call to submit require document request with requireRemark
    setRequireRemark("");
    setShowRequireDocument(false);
  };

  const handleInwardSubmit = () => {
    // TODO: API call to submit inward clearance with file, inwardDate, inwardTime
    setShowInwardClearance(false);
  };

  const DocIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 13H8M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="gro-card-view">
      <div className="driver-card-counters">
        <CounterCard label="Billing Entity" value={owner} />
        <CounterCard label="CALL TYPE" value={callType} />
        <CounterCard label="VESSEL NAME" value={vesselName} />
        <CounterCard label="VESSEL TYPE" value={vesselType} />
      </div>

      <div className="gro-document-section">
        <div className="gro-document-header">
          <h3 className="gro-section-title">Documents</h3>
          <div className="gro-document-header-actions">
            <button
              type="button"
              className="gro-inward-clearance-btn"
              onClick={() => setShowInwardClearance(!showInwardClearance)}
            >
              Inward clearance
            </button>
            <button
              type="button"
              className="gro-require-doc-btn"
              onClick={() => setShowRequireDocument(!showRequireDocument)}
            >
              Require Document
            </button>
          </div>
        </div>
        <div className="gro-document-list">
          {GRO_DOCUMENT_TYPES.map((docName) => (
            <div key={docName} className="gro-document-row">
              <div className="gro-document-preview">
                <div className="gro-document-preview-icon">
                  <DocIcon />
                </div>
                <span className="gro-document-preview-label">{docName}</span>
              </div>
              <button type="button" className="gro-document-download-btn" title="Download">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>

        {showRequireDocument && (
          <div className="gro-require-form">
            <label className="gro-require-label">Remarks</label>
            <textarea
              className="gro-require-remark"
              placeholder="Enter remarks for document request..."
              value={requireRemark}
              onChange={(e) => setRequireRemark(e.target.value)}
              rows={3}
            />
            <div className="gro-require-actions">
              <button type="button" className="gro-require-cancel" onClick={() => { setShowRequireDocument(false); setRequireRemark(""); }}>
                Cancel
              </button>
              <button type="button" className="gro-require-submit" onClick={handleRequireSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}

        {showInwardClearance && (
          <div className="gro-inward-form">
            <label className="gro-require-label">File upload</label>
            <input
              type="file"
              className="gro-inward-file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            <div className="gro-inward-datetime">
              <div className="gro-inward-field">
                <label className="gro-require-label">Date</label>
                <input
                  type="date"
                  className="gro-inward-input"
                  value={inwardDate}
                  onChange={(e) => setInwardDate(e.target.value)}
                />
              </div>
              <div className="gro-inward-field">
                <label className="gro-require-label">Time</label>
                <input
                  type="time"
                  className="gro-inward-input"
                  value={inwardTime}
                  onChange={(e) => setInwardTime(e.target.value)}
                />
              </div>
            </div>
            <div className="gro-require-actions">
              <button type="button" className="gro-require-cancel" onClick={() => setShowInwardClearance(false)}>
                Cancel
              </button>
              <button type="button" className="gro-require-submit" onClick={handleInwardSubmit}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

GROCardView.propTypes = {
  card: PropTypes.object,
};

// Tab Content Renderer
const renderTabContent = (
  activeTab,
  card,
  formValues,
  handleChange,
  ownerInitial,
  isAddMode = false,
  isSimplifiedMode = false,
  isDAModule = false,
  addModeSave = {}
) => {
  const commonProps = {
    card,
    formValues,
    handleChange,
    isAddMode,
    isSimplifiedMode,
    isDAModule,
    onSave: addModeSave.onSave,
    isSavingGeneral: addModeSave.isSavingGeneral,
  };

  if (isDAModule) {
    // DA mode - General, Operation, Husbandry, Sales Order, Reports, KPI, Invoice
    switch (activeTab) {
      case "General":
        return <General {...commonProps} />;
      case "Operation":
        return <Operation {...commonProps} ownerInitial={ownerInitial} />;
      case "Husbandry":
        return <Husbandry {...commonProps} />;
      case "Sales Order":
        return <SalesOrder {...commonProps} />;
      case "Invoice":
        return <Invoice {...commonProps} />;
      case "Reports":
        return <Reports {...commonProps} />;
      case "KPI":
        return <KPI {...commonProps} />;
      default:
        return <General {...commonProps} />;
    }
  } else if (isSimplifiedMode) {
    // Simplified mode - General, Invoice, and Sales Order
    switch (activeTab) {
      case "General":
        return <General {...commonProps} />;
      case "Invoice":
        return <Invoice {...commonProps} />;
      case "Sales Order":
        return <SalesOrder {...commonProps} />;
      default:
        return <General {...commonProps} />;
    }
  } else {
    // Full mode - all tabs
    switch (activeTab) {
      case "Appointment Details":
        return <General {...commonProps} />;
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
  }
};

// Main Component
function CardForm({
  show,
  close,
  card,
  moveCardToColumn,
  columns,
  columnOrder,
  currentColumn,
  isAddMode = false,
  variant = "default",
  boardId: boardIdProp,
}) {
  const location = useLocation();
  const isDriverVariant = variant === "driver";
  const isHotelVariant = variant === "hotel";
  const isMWPVariant = variant === "mwp";
  const isGROVariant = variant === "gro";
  const isDriverStyleView = isDriverVariant || isHotelVariant;

  // Step labels from columns + columnOrder (e.g. DAdata columnTitles); fallback to STEP_LABELS
  const { stepLabels, totalSteps } = useMemo(() => {
    const fromColumns = getStepLabelsFromColumns(columns, columnOrder);
    if (fromColumns) {
      return { stepLabels: fromColumns, totalSteps: fromColumns.length };
    }
    return { stepLabels: STEP_LABELS, totalSteps: TOTAL_STEPS };
  }, [columns, columnOrder]);

  // Check if we're on a kanban-board/{id} route
  const isKanbanBoardWithId = /^\/kanban-board\/\d+$/.test(location.pathname);

  // Check if we're on DA module route
  const isDAModule =
    location.pathname.startsWith('/kanban-board/') &&
    location.pathname !== '/kanban-board/';


  // Determine which tabs to use
  // For DA routes, use DA tabs (includes Operation and Husbandry)
  // For other kanban-board/{id} routes, use simplified tabs
  // Otherwise, use all tabs
  const TOP_TABS = isDAModule ? DA_TOP_TABS : (isKanbanBoardWithId ? SIMPLIFIED_TOP_TABS : ALL_TOP_TABS);
  const ENABLED_TABS = isDAModule ? DA_ENABLED_TABS : (isKanbanBoardWithId ? SIMPLIFIED_ENABLED_TABS : ALL_ENABLED_TABS);
  const defaultTab = (isDAModule || isKanbanBoardWithId) ? "General" : "Appointment Details";

  const [activeTopTab, setActiveTopTab] = useState(defaultTab)

  // Reset active tab when route changes
  useEffect(() => {
    setActiveTopTab(defaultTab);
  }, [isKanbanBoardWithId, defaultTab]);

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
      owner: isAddMode
        ? String(getItem("userid") ?? "")
        : String(card?.owner_user_id ?? card?.owner ?? ""),
      // FLEEyt (for simplified mode)
      type: card?.type || "Type",
      // Service Information (ids for API payloads)
      typeOfCall: String(card?.call_type_id ?? card?.typeOfCall ?? ""),
      mainBillingEntity: String(card?.main_billing_entity_id ?? card?.mainBillingEntity ?? ""),
      // Appointment Details
      appointmentReceivedDate: card?.appointmentReceivedDate || "",
      appointmentReceivedTime: card?.appointmentReceivedTime || "",
      appointmentAcceptanceDate: card?.appointmentAcceptanceDate || "",
      // Vessel Information
      port: String(card?.port_id ?? card?.port ?? ""),
      vesselType: String(card?.vessel_type_id ?? card?.vesselType ?? ""),
      bargeType: String(card?.barge_type_id ?? card?.bargeType ?? ""),
      vesselName: card?.vesselName || "",
      vesselOwner: card?.vesselOwner || "",
      vesselPrincipal: card?.vesselPrincipal || "",
      vesselManager: card?.vesselManager || "",
      otherBillingEntity: String(card?.other_billing_entity_id ?? card?.otherBillingEntity ?? ""),
      assignedOperator: String(card?.assigned_operator_id ?? card?.assignedOperator ?? ""),
      serviceRequestorName: card?.serviceRequestorName || "",
      serviceRequestorEmail: card?.serviceRequestorEmail || "",
      dailyReportEmail: card?.dailyReportEmail || "",
      billingInstructionEmails: Array.isArray(card?.billingInstructionEmails) ? card.billingInstructionEmails : [],
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
      departureAttachments: card?.departureAttachments || [],
      links: card?.links || [],
      // Remarks (for simplified mode)
      remarks: card?.remarks || "",
      // MWP RENEWAL specific fields
      taxInvoice: card?.taxInvoice || "",
      invoiceAmount: card?.invoiceAmount || "",
      sapSalesOrderNo: card?.sapSalesOrderNo || "",
      issueDate: card?.issueDate || "",
      expiryDate: card?.expiryDate || "",
      // MWP RENEWAL documents
      appointmentEmailDocuments: card?.appointmentEmailDocuments || [],
      mwpCopyDocuments: card?.mwpCopyDocuments || [],
      supportingDocuments: card?.supportingDocuments || [],
      fdaDispatchProofDocuments: card?.fdaDispatchProofDocuments || [],
      copyOfSalesOrderDocuments: card?.copyOfSalesOrderDocuments || [],
      // Sales Order header fields
      soCustomerCode: card?.soCustomerCode || "CUST-00124",
      soCustomerName: card?.soCustomerName || card?.name || "",
      soContactPerson: card?.soContactPerson || card?.user || "",
      soBpCurrency: card?.soBpCurrency || "SAR",
      soEuroRate: card?.soEuroRate || "",
      soPoNo: card?.soPoNo || "",
      soPort: card?.soPort || card?.port || "",
      soSoNo: card?.soSoNo || "",
      soPostingDate: card?.soPostingDate || new Date().toISOString().slice(0, 10),
      soDeliveryDate: card?.soDeliveryDate || "",
      soDocumentDate: card?.soDocumentDate || "",
      soShipName: card?.soShipName || card?.vesselName || "",
      soProjectName: card?.soProjectName || "",
    }),
    [card, isAddMode]
  );

  const [formValues, setFormValues] = useState(initialFormValues);

  useEffect(() => {
    setFormValues(initialFormValues);
  }, [initialFormValues]);

  const handleChange = useCallback(
    (field) => (e) => {
      // Handle both regular input events and React Quill synthetic events
      // React Quill passes synthetic events with e.target.value
      const value = e?.target?.value !== undefined ? e.target.value : e;
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  const handleCreateCallFile = useCallback(
    async (payload) => {
      const files = payload?.appointment_email_files;
      const { appointment_email_files: _a, ...rest } = payload || {};
      setIsSavingGeneral(true);
      try {
        const formData = buildCreateCallFileFormData(rest, {
          appointmentFiles: Array.isArray(files) ? files : [],
          boardId: boardIdProp ?? card?.board_id,
        });
        await callFileService.createCallFile(formData);
        notify("Call file created successfully.", "success");
        close();
      } catch (error) {
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Could not create call file.";
        notify(typeof msg === "string" ? msg : "Could not create call file.", "error");
      } finally {
        setIsSavingGeneral(false);
      }
    },
    [boardIdProp, card?.board_id, close]
  );

  const handleUpdate = useCallback(() => {
    // TODO: Add API call to update card
    // NOTE: topbarColor is visual only - never save it to card.color
    // card.color must remain fixed and unchanged
    close();
  }, [close]);

  const addModeSaveProps = useMemo(
    () =>
      isAddMode
        ? { onSave: handleCreateCallFile, isSavingGeneral }
        : { onSave: undefined, isSavingGeneral: false },
    [isAddMode, handleCreateCallFile, isSavingGeneral]
  );

  const handleTopTabChange = useCallback((tab) => {
    setActiveTopTab(tab);
  }, []);

  // Calculate current step from current column (supports sub-columns when columnOrder from DAdata)
  const currentStep = useMemo(() => {
    if (!currentColumn) return null;
    return getStepNumberFromColumnId(currentColumn.id, columns, columnOrder);
  }, [currentColumn, columns, columnOrder]);

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

    const targetColumnId = getColumnIdFromStepLabel(stepLabel, columns, columnOrder);
    if (targetColumnId) {
      moveCardToColumn(card.id, targetColumnId);
    }
  }, [moveCardToColumn, card?.id, columns, columnOrder, currentStep]);

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
    <div className="cardform-overlay">
      <div className={`cardform-panel ${isAddMode ? 'add-mode' : ''}`}>
        <TopBar
          card={card}
          topbarColor={topbarColor}
          onClose={close}
          isAddMode={isAddMode}
          onColorChange={handleTopbarColorChange}
          formValues={formValues}
          handleChange={handleChange}
        />
        {isDriverStyleView ? (
          <DriverCardView card={card} variant={variant} />
        ) : isMWPVariant ? (
          <MWPCardView card={card} />
        ) : isGROVariant ? (
          <GROCardView card={card} />
        ) : (
          <>
            {!isAddMode && !isMWPVariant && !isGROVariant && (
              <TopTabs
                tabs={TOP_TABS}
                activeTab={activeTopTab}
                onTabChange={handleTopTabChange}
                enabledTabs={ENABLED_TABS}
              />
            )}
            {!isMWPVariant &&
              !isGROVariant &&
              renderTabContent(
                activeTopTab,
                card,
                formValues,
                handleChange,
                ownerInitial,
                isAddMode,
                isKanbanBoardWithId,
                isDAModule,
                addModeSaveProps
              )}
          </>
        )}
        {!isAddMode && !isMWPVariant && (
          <CardFormFooter
            accentColor={accentColor}
            onUpdate={handleUpdate}
            activeStep={currentStep || 1}
            completedSteps={currentStep && currentStep > 1 ? currentStep - 1 : 0}
            activeTab={activeTopTab}
            onStepClick={handleStepClick}
            currentStep={currentStep}
            isSimplifiedMode={isKanbanBoardWithId}
            isDriverMode={isDriverStyleView}
            isGROMode={isGROVariant}
            stepLabels={stepLabels}
            totalSteps={totalSteps}
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
  columnOrder: PropTypes.arrayOf(PropTypes.string),
  currentColumn: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    color: PropTypes.string,
    cardIds: PropTypes.array,
  }),
  isAddMode: PropTypes.bool,
  variant: PropTypes.oneOf(["default", "driver", "hotel", "mwp", "gro"]),
  boardId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default CardForm;
