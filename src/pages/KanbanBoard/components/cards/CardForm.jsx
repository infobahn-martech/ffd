import { useState, useMemo, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import salesOrderService from "../../../../services/salesOrderService";
import { mapSalesOrderResponse } from "../../../../helpers/mapSalesOrderResponse";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { notify } from "../../../../components/Toaster";
import groService from "../../../../services/groService";
import "../../styles/cardForm.scss";
import "../../../../design/scss/general.scss";
import ColorPickerIcon from "../../../../assets/images/ColorPicker.png";
import SedresColorPicker from "../../../../components/SedresColorPicker/SedresColorPicker";
import { normalizeHexColor } from "../../../../components/SedresColorPicker/sedresColorPickerConstants";
import PriorityIcon from "../../../../assets/images/Priority.png";
import { getItem } from "../../../../helpers/localStorage";

// Import Tab Components
import { General, Operation, Husbandry, Attachments, Invoice, SalesOrder, Reports, KPI, Comments, Subtasks, Notes } from "../../CardFormTabs";
import { DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING } from "../../CardFormTabs/tabs/operation/preArrivalDocumentHandling";
import NavTabButton from "../../../../components/NavTabButton";
import DateTimePickerField from "../../CardFormTabs/components/DateTimePickerField";

// Constants - All tabs
const ALL_TOP_TABS = [
  "Appointment Details",
  "Operation",
  "Husbandry",
  "Sales Order",
  "Reports",
  "KPI",
  "Attachments",
  "Comments",
  "Subtasks",
  "Notes",
];

const ALL_ENABLED_TABS = ["Appointment Details", "Operation", "Husbandry", "Sales Order", "Reports", "KPI", "Attachments", "Comments", "Subtasks", "Notes"];

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
  "Comments",
  "Subtasks",
  "Notes",
];

const DA_ENABLED_TABS = ["General", "Operation", "Husbandry", "Sales Order", "Reports", "KPI", "Invoice", "Comments", "Subtasks", "Notes"];

const DEFAULT_ACCENT_COLOR = "#2A00FF";
const ADD_CARD_TOPBAR_DEFAULT_HEX = "#2e7d32";

/** Map header CSS color (hex or rgb/rgba) to normalized hex for SedresColorPicker. */
const appearanceColorToPickerHex = (value, fallbackHex = ADD_CARD_TOPBAR_DEFAULT_HEX) => {
  if (value === undefined || value === null) return fallbackHex;
  const s = String(value).trim();
  if (!s) return fallbackHex;
  if (s.startsWith("#")) {
    return normalizeHexColor(s);
  }
  const rgbMatch = s.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (!rgbMatch) return fallbackHex;
  const clampByte = (n) => Math.min(255, Math.max(0, parseInt(String(n), 10) || 0));
  const hexByte = (n) => clampByte(n).toString(16).padStart(2, "0");
  const hex = `#${hexByte(rgbMatch[1])}${hexByte(rgbMatch[2])}${hexByte(rgbMatch[3])}`;
  return normalizeHexColor(hex);
};
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

// Sub-components
const TopBar = ({ card, topbarColor, onClose, isAddMode = false, onColorChange, formValues, handleChange }) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [pickerFloaterStyle, setPickerFloaterStyle] = useState({});
  const colorPickerTriggerRef = useRef(null);
  const pickerFloaterWrapRef = useRef(null);

  const cardId = card?.code || card?.id || "";
  const cardTitle = card?.title || "";

  useLayoutEffect(() => {
    if (!isColorPickerOpen) return;
    const anchor = colorPickerTriggerRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const width = 308;
    const left = Math.max(16, Math.min(r.right - width, window.innerWidth - width - 16));
    const top = Math.min(r.bottom + 8, window.innerHeight - 16);
    setPickerFloaterStyle({
      position: "fixed",
      top,
      left,
      zIndex: 13040,
    });
  }, [isColorPickerOpen]);

  useEffect(() => {
    if (!isColorPickerOpen) return;
    const onMouseDown = (event) => {
      if (colorPickerTriggerRef.current?.contains(event.target)) return;
      if (pickerFloaterWrapRef.current?.contains(event.target)) return;
      setIsColorPickerOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isColorPickerOpen]);

  const handleToggleColorPicker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsColorPickerOpen((open) => !open);
  };

  const handleTitleChange = (e) => {
    if (handleChange) {
      handleChange("cardTitle")(e);
    }
  };

  const handleApplySedresColor = (hex) => {
    const next = normalizeHexColor(hex);
    if (onColorChange) {
      onColorChange(next);
    }
    setIsColorPickerOpen(false);
  };

  const handleCancelSedresColor = () => {
    setIsColorPickerOpen(false);
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
            ref={colorPickerTriggerRef}
            type="button"
            className="topbar-color-picker-label"
            onClick={handleToggleColorPicker}
            title="Change header color"
            aria-label="Color Picker"
            aria-expanded={isColorPickerOpen}
          >
            <img src={ColorPickerIcon} alt="Color Picker" className="topbar-color-picker-icon" />
          </button>
          {isColorPickerOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <div ref={pickerFloaterWrapRef} style={pickerFloaterStyle}>
                <SedresColorPicker
                  ariaLabel="Pick card header color"
                  initialHex={appearanceColorToPickerHex(topbarColor)}
                  className="kanban-dashboard-color-picker-popover--floating"
                  onApply={handleApplySedresColor}
                  onCancel={handleCancelSedresColor}
                />
              </div>,
              document.body
            )}
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

const splitInwardDateTimeString = (value) => {
  if (value == null || String(value).trim() === "") return { date: "", time: "" };
  const normalized = String(value).trim().includes("T") ? String(value).trim().replace("T", " ") : String(value).trim();
  const [datePart = "", timeRaw = ""] = normalized.split(/\s+/);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return { date: "", time: "" };
  const timeMatch = String(timeRaw).match(/^(\d{1,2}):(\d{2})/);
  const timePart = timeMatch ? `${String(timeMatch[1]).padStart(2, "0")}:${timeMatch[2]}` : "00:00";
  return { date: datePart, time: timePart };
};

// GRO Board card view: 4 info sections + document list + inward clearance
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

const resolveGroCallId = (card) => {
  const raw = card?.call_id ?? card?.callId ?? card?.id;
  if (raw == null || raw === "") return null;
  return raw;
};

const buildGroFallbackDocuments = () =>
  GRO_DOCUMENT_TYPES.map((document_name) => ({
    document_name,
    document_id: null,
    call_task_document_id: null,
    is_uploaded: false,
    status: 0,
    file_name: null,
    file_url: null,
    uploaded_by: null,
    uploaded_by_name: null,
    uploaded_at: null,
  }));

const enrichGroDocWithRowKey = (doc, index) => ({
  ...doc,
  __rowKey:
    doc.call_task_document_id != null
      ? `ctd-${doc.call_task_document_id}`
      : doc.document_id != null
        ? `did-${doc.document_id}-${index}`
        : `fb-${index}`,
});

/** GET task_card/get_gro_custom_docs — documents live on first group: response.data.data[0].documents */
const parseGroDocumentsResponse = (res) => {
  const body = res?.data;
  const group = Array.isArray(body?.data) ? body.data[0] : body?.data;
  const docs = Array.isArray(group?.documents) ? group.documents : [];
  return docs;
};

const groApiErrorMessage = (err, fallback) =>
  err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? fallback;

/** @returns {"pdf"|"excel"|"word"|"image"|"default"} */
const getGroFileType = (fileNameOrUrl) => {
  if (fileNameOrUrl == null || typeof fileNameOrUrl !== "string") return "default";
  const trimmed = fileNameOrUrl.trim();
  if (!trimmed) return "default";
  const noQuery = trimmed.split("?")[0].split("#")[0];
  const segment = noQuery.includes("/") ? noQuery.slice(noQuery.lastIndexOf("/") + 1) : noQuery;
  const dot = segment.lastIndexOf(".");
  const ext = dot >= 0 ? segment.slice(dot + 1).toLowerCase() : "";
  if (ext === "pdf") return "pdf";
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return "excel";
  if (ext === "doc" || ext === "docx") return "word";
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") return "image";
  return "default";
};

const GRO_FILE_BADGE = { pdf: "PDF", excel: "XLS", word: "DOC", image: "IMG", default: "" };

const GroDocumentFilePreview = ({ fileName, fileUrl }) => {
  const kind = getGroFileType(fileName || fileUrl || "");
  const badge = GRO_FILE_BADGE[kind] || "";

  const SheetBase = ({ children }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      {children}
    </svg>
  );

  let inner = (
    <SheetBase>
      <path d="M16 13H8M16 17H8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </SheetBase>
  );

  if (kind === "pdf") {
    inner = (
      <SheetBase>
        <path d="M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </SheetBase>
    );
  } else if (kind === "excel") {
    inner = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.35" />
        <path d="M4 9h16M4 14h16M10 4v16M15 4v16" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  } else if (kind === "word") {
    inner = (
      <SheetBase>
        <path d="M10 11l2 6 2-6 2 6 2-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </SheetBase>
    );
  } else if (kind === "image") {
    inner = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.35" />
        <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
        <path d="M21 17l-5-5-4 4-2.5-2.5L4 17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <div className={`gro-document-preview-icon gro-document-preview-icon--${kind}`} title={fileName || fileUrl || ""}>
      <span className="gro-document-preview-icon-graphic">{inner}</span>
      {badge ? (
        <span className="gro-document-preview-icon-badge" aria-hidden>
          {badge}
        </span>
      ) : null}
    </div>
  );
};

GroDocumentFilePreview.propTypes = {
  fileName: PropTypes.string,
  fileUrl: PropTypes.string,
};

const firstNonEmptyGroDisplay = (...candidates) => {
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    const s = String(c).trim();
    if (s !== "") return s;
  }
  return "-";
};

const GroSummaryCard = ({ label, value }) => (
  <div className="gro-summary-card">
    <div className="gro-summary-label">{label}</div>
    <div className="gro-summary-value">{value}</div>
  </div>
);

GroSummaryCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

const GRO_MAIN_VIEWS = {
  inward: "inward",
  cg: "cg",
  zawil: "zawil",
};

const parseGroPassRequestsResponse = (res) => {
  const data = res?.data?.data ?? res?.data ?? {};
  return {
    cg: Array.isArray(data.cg) ? data.cg : [],
    zawil: Array.isArray(data.zawil) ? data.zawil : [],
  };
};

const groPassCrewRowFields = (crew) => ({
  crewName: firstNonEmptyGroDisplay(crew.crew_name, crew.name, crew.full_name, crew.crewName),
  passport: firstNonEmptyGroDisplay(
    crew.passport_no,
    crew.passport_number,
    crew.passport,
    crew.passportNo
  ),
  nationality: firstNonEmptyGroDisplay(crew.nationality, crew.nationality_name),
  rank: firstNonEmptyGroDisplay(crew.rank, crew.rank_name, crew.crew_rank),
  movementType: firstNonEmptyGroDisplay(crew.movement_type, crew.movement, crew.movementType),
  status: firstNonEmptyGroDisplay(crew.status, crew.pass_status, crew.request_status, crew.state),
  requestedDate: firstNonEmptyGroDisplay(
    crew.requested_date,
    crew.request_date,
    crew.created_at,
    crew.date_requested
  ),
  remarks: firstNonEmptyGroDisplay(crew.remarks, crew.remark, crew.note),
  documentUrl:
    crew.document_url != null && String(crew.document_url).trim() !== ""
      ? String(crew.document_url).trim()
      : "",
});

const groPassStatusBadgeTone = (raw) => {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s || s === "-") return "neutral";
  const n = Number(s);
  if (n === 1) return "success";
  if (n === 2) return "danger";
  if (/reject|denied|failed|fail|cancel/.test(s)) return "danger";
  if (/approv|accept|verified|complete|done|clear|issued|pass/.test(s)) return "success";
  if (/pend|wait|submitted|progress|open|draft|review/.test(s)) return "warning";
  return "neutral";
};

const groPassTaskDocUrl = (td) =>
  firstNonEmptyGroDisplay(td?.file_url, td?.document_url, td?.url, td?.download_url);

const groPassTaskDocLabel = (td, index) =>
  firstNonEmptyGroDisplay(td?.document_name, td?.file_name, td?.name, td?.title, `File ${index + 1}`);

const GroPassRequestsTable = ({
  workOrders,
  loading,
  errorMessage,
  onRetry,
  expandedWoIds,
  onToggleWoExpand,
}) => {
  const hasWorkOrders = Array.isArray(workOrders) && workOrders.length > 0;
  let crewRowCount = 0;
  if (hasWorkOrders) {
    for (const wo of workOrders) {
      const crew = Array.isArray(wo?.crew) ? wo.crew : [];
      crewRowCount += crew.length > 0 ? crew.length : 1;
    }
  }

  if (loading) {
    return (
      <div className="gro-pass-table-panel">
        <div className="gro-pass-table-state">Loading pass requests…</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="gro-pass-table-panel">
        <div className="gro-pass-table-state gro-pass-table-state--error">
          <span>{errorMessage}</span>
          {onRetry ? (
            <button type="button" className="gro-pass-retry-btn" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!hasWorkOrders || crewRowCount === 0) {
    return (
      <div className="gro-pass-table-panel">
        <div className="gro-pass-table-state gro-pass-table-state--empty">No pass requests for this call.</div>
      </div>
    );
  }

  return (
    <div className="gro-pass-table-panel">
      <div className="gro-pass-table-scroll">
        <table className="gro-pass-table">
          <thead>
            <tr>
              <th>WO Number</th>
              <th>Crew Name</th>
              <th>Passport No</th>
              <th>Nationality</th>
              <th>Rank</th>
              <th>Movement Type</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Remarks</th>
              <th>Document</th>
            </tr>
          </thead>
          {workOrders.map((wo, woIdx) => {
            const woKey = String(wo?.wo_id ?? wo?.id ?? wo?.wo_number ?? `idx-${woIdx}`);
            const woNumber = firstNonEmptyGroDisplay(wo?.wo_number, wo?.woNumber, wo?.work_order_number);
            const crew = Array.isArray(wo?.crew) ? wo.crew : [];
            const taskDocs = Array.isArray(wo?.task_documents) ? wo.task_documents : [];
            const expanded = expandedWoIds.has(String(woKey));

            return (
              <tbody key={`${woKey}-${woIdx}`} className="gro-pass-table-wo-group">
                {crew.length === 0 ? (
                  <tr>
                    <td>{woNumber}</td>
                    <td colSpan={9} className="gro-pass-table-muted">
                      No crew listed for this work order.
                    </td>
                  </tr>
                ) : (
                  crew.map((c, idx) => {
                    const f = groPassCrewRowFields(c);
                    const tone = groPassStatusBadgeTone(f.status);
                    return (
                      <tr key={`${woKey}-c-${idx}`}>
                        {idx === 0 ? <td rowSpan={crew.length} className="gro-pass-wo-cell">{woNumber}</td> : null}
                        <td>{f.crewName}</td>
                        <td>{f.passport}</td>
                        <td>{f.nationality}</td>
                        <td>{f.rank}</td>
                        <td>{f.movementType}</td>
                        <td>
                          <span className={`gro-pass-status-badge gro-pass-status-badge--${tone}`}>{f.status}</span>
                        </td>
                        <td>{f.requestedDate}</td>
                        <td className="gro-pass-remarks-cell" title={f.remarks}>
                          {f.remarks}
                        </td>
                        <td>
                          {f.documentUrl ? (
                            <button
                              type="button"
                              className="gro-pass-doc-link-btn"
                              onClick={() => window.open(f.documentUrl, "_blank", "noopener,noreferrer")}
                            >
                              Open
                            </button>
                          ) : (
                            <span className="gro-pass-table-muted">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
                <tr className="gro-pass-taskdocs-row">
                  <td colSpan={10}>
                    <button
                      type="button"
                      className="gro-pass-taskdocs-toggle"
                      aria-expanded={expanded}
                      onClick={() => onToggleWoExpand(String(woKey))}
                    >
                      <span className="gro-pass-taskdocs-toggle-label">
                        Work order files{taskDocs.length ? ` (${taskDocs.length})` : ""}
                      </span>
                      <span className="gro-pass-taskdocs-chevron" aria-hidden>
                        {expanded ? "▾" : "▸"}
                      </span>
                    </button>
                    {expanded && taskDocs.length > 0 ? (
                      <ul className="gro-pass-taskdocs-list">
                        {taskDocs.map((td, i) => {
                          const url = groPassTaskDocUrl(td);
                          const label = groPassTaskDocLabel(td, i);
                          return (
                            <li key={`${woKey}-td-${i}`}>
                              {url && url !== "-" ? (
                                <button
                                  type="button"
                                  className="gro-pass-taskdoc-link"
                                  onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                                >
                                  {label}
                                </button>
                              ) : (
                                <span>{label}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                    {expanded && taskDocs.length === 0 ? (
                      <div className="gro-pass-taskdocs-empty">No task documents for this work order.</div>
                    ) : null}
                  </td>
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>
    </div>
  );
};

GroPassRequestsTable.propTypes = {
  workOrders: PropTypes.array,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
  onRetry: PropTypes.func,
  expandedWoIds: PropTypes.instanceOf(Set).isRequired,
  onToggleWoExpand: PropTypes.func.isRequired,
};

const GROCardView = ({ card }) => {
  const inwardAnchorRef = useRef(null);
  const inwardFileInputRef = useRef(null);
  const [showInwardClearance, setShowInwardClearance] = useState(false);
  const [inwardFile, setInwardFile] = useState(null);
  const [inwardDateTime, setInwardDateTime] = useState("");
  const [documentRemarks, setDocumentRemarks] = useState({});
  const [activeRemarkDoc, setActiveRemarkDoc] = useState(null);
  const [remarkDraft, setRemarkDraft] = useState("");
  const [callDetail, setCallDetail] = useState(null);
  const [documents, setDocuments] = useState(() =>
    buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i))
  );
  const [isGroLoading, setIsGroLoading] = useState(false);
  const [verifyingDocId, setVerifyingDocId] = useState(null);
  const [isSavingInward, setIsSavingInward] = useState(false);
  const [groMainView, setGroMainView] = useState(GRO_MAIN_VIEWS.inward);
  const [passRequestsState, setPassRequestsState] = useState({
    callId: null,
    cg: undefined,
    zawil: undefined,
  });
  const [passRequestsLoading, setPassRequestsLoading] = useState(false);
  const [passRequestsError, setPassRequestsError] = useState(null);
  const [expandedPassWoIds, setExpandedPassWoIds] = useState(() => new Set());

  const callId = resolveGroCallId(card);

  const callTypeSummary = firstNonEmptyGroDisplay(
    callDetail?.call_type,
    callDetail?.call_type_name,
    card?.typeOfCall,
    callDetail?.call_type_id != null && callDetail.call_type_id !== "" ? String(callDetail.call_type_id) : ""
  );
  const billingEntitySummary = firstNonEmptyGroDisplay(callDetail?.billing_entity);
  let portFromDetail = "";
  if (typeof callDetail?.port === "string") {
    portFromDetail = callDetail.port;
  } else if (callDetail?.port && typeof callDetail.port === "object") {
    portFromDetail =
      [callDetail.port.label, callDetail.port.name]
        .map((x) => (x != null ? String(x).trim() : ""))
        .find(Boolean) || "";
  }
  const portSummary = firstNonEmptyGroDisplay(
    callDetail?.port_name,
    portFromDetail,
    callDetail?.port_id != null && callDetail.port_id !== "" ? String(callDetail.port_id) : ""
  );
  const vesselNameSummary = firstNonEmptyGroDisplay(callDetail?.vessel_name, card?.vesselName);
  const assignedOperatorFromDetail =
    typeof callDetail?.assigned_operator === "string" ? callDetail.assigned_operator : "";
  const assignedOperatorSummary = firstNonEmptyGroDisplay(
    callDetail?.requested_operator,
    callDetail?.assigned_operator_name,
    assignedOperatorFromDetail,
    callDetail?.assigned_operator_id != null && callDetail.assigned_operator_id !== ""
      ? String(callDetail.assigned_operator_id)
      : ""
  );

  const resetInwardClearanceFields = () => {
    setInwardFile(null);
    setInwardDateTime("");
    if (inwardFileInputRef.current) {
      inwardFileInputRef.current.value = "";
    }
  };

  const inwardPickerParts = splitInwardDateTimeString(inwardDateTime);

  useEffect(() => {
    setPassRequestsState({ callId: null, cg: undefined, zawil: undefined });
    setPassRequestsError(null);
    setPassRequestsLoading(false);
    setExpandedPassWoIds(new Set());
  }, [callId]);

  useEffect(() => {
    if (groMainView === GRO_MAIN_VIEWS.inward) return;
    if (callId == null || callId === "") {
      setPassRequestsError("Unable to load pass requests: missing call id.");
      return;
    }
    if (passRequestsState.callId === callId && passRequestsState.cg !== undefined) return;

    let cancelled = false;
    setPassRequestsLoading(true);
    setPassRequestsError(null);

    const run = async () => {
      try {
        const res = await groService.getPassRequests(callId);
        if (cancelled) return;
        const parsed = parseGroPassRequestsResponse(res);
        setPassRequestsState({
          callId,
          cg: parsed.cg,
          zawil: parsed.zawil,
        });
      } catch (err) {
        if (!cancelled) {
          setPassRequestsError(groApiErrorMessage(err, "Failed to load pass requests."));
          setPassRequestsState({
            callId,
            cg: [],
            zawil: [],
          });
        }
      } finally {
        if (!cancelled) setPassRequestsLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [groMainView, callId, passRequestsState.callId, passRequestsState.cg]);

  const switchGroMainView = useCallback((next) => {
    setGroMainView(next);
    if (next !== GRO_MAIN_VIEWS.inward) {
      setShowInwardClearance(false);
    }
  }, []);

  const retryPassRequests = useCallback(() => {
    setPassRequestsState({ callId: null, cg: undefined, zawil: undefined });
    setPassRequestsError(null);
  }, []);

  const togglePassWoExpand = useCallback((woKey) => {
    setExpandedPassWoIds((prev) => {
      const next = new Set(prev);
      if (next.has(woKey)) next.delete(woKey);
      else next.add(woKey);
      return next;
    });
  }, []);

  const refreshGroDocuments = useCallback(async (cid) => {
    if (cid == null || cid === "") return;
    try {
      const docsRes = await groService.getGroCustomDocs(cid);
      const rawList = parseGroDocumentsResponse(docsRes);
      if (rawList.length > 0) {
        setDocuments(rawList.map((d, i) => enrichGroDocWithRowKey(d, i)));
      } else {
        setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
      }
    } catch {
      setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
    }
  }, []);

  useEffect(() => {
    if (callId == null || callId === "") {
      notify("Unable to load GRO data: missing call id.", "error");
      setCallDetail(null);
      setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
      return undefined;
    }

    let cancelled = false;
    const load = async () => {
      setIsGroLoading(true);
      try {
        const [detailRes, docsRes] = await Promise.all([
          groService.getCallDetailById(callId),
          groService.getGroCustomDocs(callId),
        ]);
        if (cancelled) return;
        const detail = detailRes?.data?.data ?? detailRes?.data ?? {};
        setCallDetail(detail);
        const rawList = parseGroDocumentsResponse(docsRes);
        if (rawList.length > 0) {
          setDocuments(rawList.map((d, i) => enrichGroDocWithRowKey(d, i)));
        } else {
          setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
        }
      } catch (err) {
        if (cancelled) return;
        notify(groApiErrorMessage(err, "Failed to load GRO card data."), "error");
        setCallDetail(null);
        setDocuments(buildGroFallbackDocuments().map((d, i) => enrichGroDocWithRowKey(d, i)));
      } finally {
        if (!cancelled) setIsGroLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [callId]);

  const handleInwardDateTimePickerChange = useCallback(({ date, time }) => {
    if (!date) {
      setInwardDateTime("");
      return;
    }
    const formattedTime = time ? String(time).slice(0, 5) : "00:00";
    setInwardDateTime(`${date} ${formattedTime}:00`);
  }, []);

  const handleInwardCancel = () => {
    setShowInwardClearance(false);
    resetInwardClearanceFields();
  };

  const handleInwardSubmit = async () => {
    if (callId == null || callId === "") {
      notify("Call id is missing.", "error");
      return;
    }
    if (!inwardFile) {
      notify("Please select a document.", "warn");
      return;
    }
    if (!String(inwardDateTime ?? "").trim()) {
      notify("Please select document date and time.", "warn");
      return;
    }
    const formData = new FormData();
    formData.append("call_id", callId);
    formData.append("document", inwardFile);
    formData.append("document_date", inwardDateTime);
    setIsSavingInward(true);
    try {
      await groService.saveArrivalDocument(formData);
      notify("Inward clearance saved successfully.", "success");
      setShowInwardClearance(false);
      resetInwardClearanceFields();
      await refreshGroDocuments(callId);
      try {
        const detailRes = await groService.getCallDetailById(callId);
        setCallDetail(detailRes?.data?.data ?? detailRes?.data ?? {});
      } catch {
        /* optional refresh */
      }
    } catch (err) {
      notify(groApiErrorMessage(err, "Failed to save inward clearance."), "error");
    } finally {
      setIsSavingInward(false);
    }
  };

  useEffect(() => {
    if (!showInwardClearance) return undefined;
    const inwardClickIgnoresOutsideClose = [
      ".gro-inward-popover",
      ".MuiPopover-root",
      ".MuiPickersPopper-root",
      ".MuiDialog-root",
      ".MuiModal-root",
      ".MuiDateCalendar-root",
    ];
    const onPointerDown = (e) => {
      const path = typeof e.composedPath === "function" ? e.composedPath() : [e.target];
      for (const node of path) {
        if (!(node instanceof Element)) continue;
        if (inwardClickIgnoresOutsideClose.some((sel) => node.closest(sel))) {
          return;
        }
      }
      if (inwardAnchorRef.current && !inwardAnchorRef.current.contains(e.target)) {
        setShowInwardClearance(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [showInwardClearance]);

  const canVerifyDocument = (doc) =>
    doc.document_id != null &&
    doc.call_task_document_id != null &&
    callId != null &&
    callId !== "";

  const handleCrossClick = (rowKey, doc) => {
    if (verifyingDocId) return;
    if (activeRemarkDoc === rowKey) {
      setActiveRemarkDoc(null);
      setRemarkDraft("");
      return;
    }
    setActiveRemarkDoc(rowKey);
    setRemarkDraft(documentRemarks[rowKey] ?? doc?.remarks ?? "");
  };

  const handleRemarkCancel = () => {
    setActiveRemarkDoc(null);
    setRemarkDraft("");
  };

  const handleRemarkSubmit = async () => {
    if (!activeRemarkDoc) return;
    const doc = documents.find((d) => d.__rowKey === activeRemarkDoc);
    if (!doc || !canVerifyDocument(doc)) {
      notify("This document cannot be rejected (missing reference).", "error");
      return;
    }
    setVerifyingDocId(activeRemarkDoc);
    try {
      await groService.verifyGroDocs({
        call_id: Number(callId),
        document_id: Number(doc.document_id),
        call_task_document_id: Number(doc.call_task_document_id),
        status: 2,
        remarks: remarkDraft,
      });
      setDocumentRemarks((prev) => ({ ...prev, [activeRemarkDoc]: remarkDraft }));
      setDocuments((prev) =>
        prev.map((d) =>
          d.__rowKey === activeRemarkDoc ? { ...d, status: 2, remarks: remarkDraft } : d
        )
      );
      notify("Document marked for reupload.", "success");
      setActiveRemarkDoc(null);
      setRemarkDraft("");
    } catch (err) {
      notify(groApiErrorMessage(err, "Failed to update document."), "error");
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleTickClick = async (doc, rowKey) => {
    if (!canVerifyDocument(doc)) {
      notify("This document cannot be verified (missing reference).", "error");
      return;
    }
    setVerifyingDocId(rowKey);
    try {
      await groService.verifyGroDocs({
        call_id: Number(callId),
        document_id: Number(doc.document_id),
        call_task_document_id: Number(doc.call_task_document_id),
        status: 1,
        remarks: "",
      });
      setDocuments((prev) => prev.map((d) => (d.__rowKey === rowKey ? { ...d, status: 1 } : d)));
      notify("Document verified.", "success");
      if (activeRemarkDoc === rowKey) {
        setActiveRemarkDoc(null);
        setRemarkDraft("");
      }
    } catch (err) {
      notify(groApiErrorMessage(err, "Failed to verify document."), "error");
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleDocumentDownload = (doc) => {
    const url = doc?.file_url;
    if (!url || String(url).trim() === "") {
      notify("File not available.", "error");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const passTableWorkOrders =
    groMainView === GRO_MAIN_VIEWS.cg
      ? passRequestsState.cg
      : groMainView === GRO_MAIN_VIEWS.zawil
        ? passRequestsState.zawil
        : null;

  const documentsSectionTitle =
    groMainView === GRO_MAIN_VIEWS.cg
      ? "CG Pass"
      : groMainView === GRO_MAIN_VIEWS.zawil
        ? "Zawil Pass"
        : "Documents";

  const IconCross = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );

  const IconTick = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );

  const IconDownload = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  return (
    <div className="gro-card-view">
      <div className="gro-summary-grid">
        <GroSummaryCard label="Call Type" value={callTypeSummary} />
        <GroSummaryCard label="Billing Entity" value={billingEntitySummary} />
        <GroSummaryCard label="Port" value={portSummary} />
        <GroSummaryCard label="Vessel Name" value={vesselNameSummary} />
        <GroSummaryCard label="Assigned Operator" value={assignedOperatorSummary} />
      </div>

      <div className="gro-document-section">
        <div className="gro-document-header">
          <h3 className="gro-documents-heading">{documentsSectionTitle}</h3>
          <div className="gro-document-header-actions gro-document-header-actions--with-segments">
            <div className="gro-pass-segments" role="tablist" aria-label="Pass and clearance views">
              <button
                type="button"
                role="tab"
                aria-selected={groMainView === GRO_MAIN_VIEWS.cg}
                className={`gro-pass-segment${groMainView === GRO_MAIN_VIEWS.cg ? " gro-pass-segment--active" : ""}`}
                onClick={() => switchGroMainView(GRO_MAIN_VIEWS.cg)}
              >
                CG Pass
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={groMainView === GRO_MAIN_VIEWS.zawil}
                className={`gro-pass-segment${groMainView === GRO_MAIN_VIEWS.zawil ? " gro-pass-segment--active" : ""}`}
                onClick={() => switchGroMainView(GRO_MAIN_VIEWS.zawil)}
              >
                Zawil Pass
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={groMainView === GRO_MAIN_VIEWS.inward}
                className={`gro-pass-segment${groMainView === GRO_MAIN_VIEWS.inward ? " gro-pass-segment--active" : ""}`}
                onClick={() => switchGroMainView(GRO_MAIN_VIEWS.inward)}
              >
                Inward Clearance
              </button>
            </div>
            {groMainView === GRO_MAIN_VIEWS.inward ? (
              <div className="gro-inward-anchor" ref={inwardAnchorRef}>
                <button
                  type="button"
                  className="gro-inward-clearance-btn"
                  aria-expanded={showInwardClearance}
                  disabled={isGroLoading || isSavingInward || callId == null || callId === ""}
                  onClick={() => setShowInwardClearance(!showInwardClearance)}
                >
                  Inward clearance
                </button>
                {showInwardClearance ? (
                  <div className="gro-inward-popover" role="dialog" aria-label="Inward clearance">
                    <div className="gro-inward-popover-header">Inward Clearance</div>
                    <div className="gro-inward-popover-body">
                      <div className="gro-inward-popover-field">
                        <span className="gro-inward-popover-label">File upload</span>
                        <div className="gro-premium-upload">
                          <input
                            ref={inwardFileInputRef}
                            id="gro-inward-file-input"
                            type="file"
                            className="gro-premium-upload-input-hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={isSavingInward}
                            onChange={(e) => setInwardFile(e.target.files?.[0] ?? null)}
                          />
                          <button
                            type="button"
                            className="gro-premium-upload-btn"
                            disabled={isSavingInward}
                            onClick={() => inwardFileInputRef.current?.click()}
                          >
                            Choose file
                          </button>
                          <span className="gro-premium-upload-filename" title={inwardFile?.name || ""}>
                            {inwardFile?.name || "No file chosen"}
                          </span>
                        </div>
                      </div>
                      <div className="gro-inward-popover-field gro-inward-popover-datetime-full">
                        <span className="gro-inward-popover-label">Date & Time</span>
                        <DateTimePickerField
                          dateValue={inwardPickerParts.date}
                          timeValue={inwardPickerParts.time}
                          onDateTimeChange={handleInwardDateTimePickerChange}
                          placeholder="YYYY-MM-DD hh:mm"
                          popperClassName="gro-inward-datetime-popper"
                        />
                      </div>
                    </div>
                    <div className="gro-inward-popover-footer">
                      <button type="button" className="gro-inward-popover-btn-cancel" disabled={isSavingInward} onClick={handleInwardCancel}>
                        Cancel
                      </button>
                      <button type="button" className="gro-inward-popover-btn-submit" disabled={isSavingInward} onClick={handleInwardSubmit}>
                        {isSavingInward ? "Saving..." : "Submit"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {groMainView === GRO_MAIN_VIEWS.inward ? (
        <div className="gro-document-list">
          {isGroLoading ? (
            <div className="gro-document-loading">Loading documents…</div>
          ) : (
            documents.map((doc) => {
              const rowKey = doc.__rowKey;
              const label = doc.document_name ?? "";
              const isApproved = Number(doc.status) === 1;
              const isRejected = Number(doc.status) === 2;
              const remarkOpen = activeRemarkDoc === rowKey;
              const rowBusy = verifyingDocId === rowKey;
              const verifyDisabled = isGroLoading || rowBusy || !canVerifyDocument(doc);
              const showCross = !isRejected;
              const showTick = !isApproved;
              const remarksTextRaw = doc?.remarks != null && String(doc.remarks).trim() !== "" ? String(doc.remarks).trim() : "";
              const remarksForPill = remarksTextRaw;

              return (
                <div
                  key={rowKey}
                  className={`gro-document-row ${isApproved ? "gro-document-row-approved" : ""} ${isRejected ? "gro-document-row-rejected" : ""} ${remarkOpen ? "gro-document-row-editing" : ""}`}
                >
                  <GroDocumentFilePreview fileName={doc.file_name} fileUrl={doc.file_url} />
                  <div className="gro-document-main">
                    <div className="gro-document-main-top">
                      <span className="gro-document-title">{label}</span>
                      {remarksForPill ? (
                        <span className="gro-document-remarks-pill" title={remarksForPill}>
                          Remarks: {remarksForPill}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {remarkOpen ? (
                    <div className="gro-inline-remark">
                      <input
                        type="text"
                        className="gro-inline-remark-input"
                        placeholder="Enter remarks..."
                        value={remarkDraft}
                        disabled={Boolean(verifyingDocId)}
                        onChange={(e) => setRemarkDraft(e.target.value)}
                        aria-label="Document remarks"
                      />
                      <div className="gro-inline-remark-actions">
                        <button type="button" className="gro-inline-remark-btn gro-inline-remark-btn-cancel" disabled={Boolean(verifyingDocId)} onClick={handleRemarkCancel}>
                          Cancel
                        </button>
                        <button type="button" className="gro-inline-remark-btn gro-inline-remark-btn-submit" disabled={Boolean(verifyingDocId)} onClick={handleRemarkSubmit}>
                          {rowBusy ? "Saving..." : "Submit"}
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="gro-document-actions">
                    {showCross ? (
                      <button
                        type="button"
                        className={`gro-icon-btn cross${remarkOpen ? " active" : ""}`}
                        title="Remarks"
                        aria-label="Toggle remarks"
                        aria-pressed={remarkOpen}
                        disabled={isGroLoading || Boolean(verifyingDocId)}
                        onClick={() => handleCrossClick(rowKey, doc)}
                      >
                        <IconCross />
                      </button>
                    ) : null}
                    {showTick ? (
                      <button
                        type="button"
                        className={`gro-icon-btn tick${isApproved ? " selected" : ""}`}
                        title={isApproved ? "Approved" : "Mark approved"}
                        aria-label={isApproved ? "Approved" : "Mark approved"}
                        aria-pressed={isApproved}
                        disabled={verifyDisabled}
                        onClick={() => handleTickClick(doc, rowKey)}
                      >
                        <IconTick />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="gro-icon-btn download"
                      title="Download"
                      aria-label="Download document"
                      disabled={isGroLoading}
                      onClick={() => handleDocumentDownload(doc)}
                    >
                      <IconDownload />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        ) : (
          <GroPassRequestsTable
            workOrders={Array.isArray(passTableWorkOrders) ? passTableWorkOrders : []}
            loading={passRequestsLoading}
            errorMessage={
              groMainView !== GRO_MAIN_VIEWS.inward && passRequestsError
                ? passRequestsError
                : groMainView !== GRO_MAIN_VIEWS.inward &&
                    (callId == null || callId === "") &&
                    !passRequestsLoading
                  ? "Unable to load pass requests: missing call id."
                  : null
            }
            onRetry={retryPassRequests}
            expandedWoIds={expandedPassWoIds}
            onToggleWoExpand={(key) => togglePassWoExpand(key)}
          />
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
  addModeSave = {},
  salesOrderApiLoading = false,
  salesOrderApiError = null
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
    hasSubmitted: addModeSave.hasSubmitted,
    setHasSubmitted: addModeSave.setHasSubmitted,
    setIsSavingGeneral: addModeSave.setIsSavingGeneral,
    salesOrderApiLoading,
    salesOrderApiError,
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
      case "Comments":
        return <Comments {...commonProps} />;
      case "Subtasks":
        return <Subtasks {...commonProps} />;
      case "Notes":
        return <Notes {...commonProps} />;
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
      case "Comments":
        return <Comments {...commonProps} />;
      case "Subtasks":
        return <Subtasks {...commonProps} />;
      case "Notes":
        return <Notes {...commonProps} />;
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
      case "Comments":
        return <Comments {...commonProps} />;
      case "Subtasks":
        return <Subtasks {...commonProps} />;
      case "Notes":
        return <Notes {...commonProps} />;
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
  onBoardRefresh,
}) {
  const location = useLocation();
  const isDriverVariant = variant === "driver";
  const isHotelVariant = variant === "hotel";
  const isMWPVariant = variant === "mwp";
  const isGROVariant = variant === "gro";
  const isEmptyVariant = variant === "empty";
  const isDriverStyleView = isDriverVariant || isHotelVariant;

  // Step labels from columns + columnOrder (e.g. DAdata columnTitles); fallback to STEP_LABELS
  const { stepLabels, totalSteps } = useMemo(() => {
    const fromColumns = getStepLabelsFromColumns(columns, columnOrder);
    if (fromColumns) {
      return { stepLabels: fromColumns, totalSteps: fromColumns.length };
    }
    return { stepLabels: STEP_LABELS, totalSteps: TOTAL_STEPS };
  }, [columns, columnOrder]);

  const isSimplifiedMode = false;

  // Enable DA mode only for explicit DA routes, not generic /kanban-board/:boardId.
  const isDAModule = /^\/kanban-board\/(centralized-da-desk|jubail-operations|rastanura-dammam-operations|coordinator-transport|ras-tanura-operations)$/.test(location.pathname);


  const TOP_TABS = isDAModule ? DA_TOP_TABS : (isSimplifiedMode ? SIMPLIFIED_TOP_TABS : ALL_TOP_TABS);
  const ENABLED_TABS = isDAModule ? DA_ENABLED_TABS : (isSimplifiedMode ? SIMPLIFIED_ENABLED_TABS : ALL_ENABLED_TABS);
  const defaultTab = isDAModule ? "General" : (isSimplifiedMode ? "General" : "Appointment Details");

  const [activeTopTab, setActiveTopTab] = useState(defaultTab)

  // Reset active tab when mode changes
  useEffect(() => {
    setActiveTopTab(defaultTab);
  }, [isSimplifiedMode, defaultTab]);

  // State for topbar color - visual only, never affects card.color
  // Always initialize from card.color (the fixed card color)
  const [topbarColor, setTopbarColor] = useState(() => {
    if (isAddMode) {
      return ADD_CARD_TOPBAR_DEFAULT_HEX;
    }
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
      preArrivalDocumentHandling: (() => {
        const base = JSON.parse(JSON.stringify(DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING));
        const c = card?.preArrivalDocumentHandling;
        if (!c || typeof c !== "object") return base;
        const normalizeRows = (rows, fallbackRows) =>
          Array.isArray(rows) && rows.length
            ? rows.map((row) => ({
              ...row,
              files: Array.isArray(row?.files)
                ? row.files
                : row?.file
                  ? [row.file]
                  : [],
            }))
            : fallbackRows;
        return {
          selectedProcesses: { ...base.selectedProcesses, ...c.selectedProcesses },
          documents: {
            gro: normalizeRows(c.documents?.gro, base.documents.gro),
            customClearance: normalizeRows(c.documents?.customClearance, base.documents.customClearance),
          },
        };
      })(),
      // Legacy fields (keeping for backward compatibility)
      lastPort: card?.lastPort ?? card?.last_port ?? "",
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
      // Sales Order (API: sales_order/get_so_items_by_call/{call_id})
      call_id: String(card?.call_id ?? card?.callId ?? ""),
      salesOrderList: Array.isArray(card?.salesOrderList) ? card.salesOrderList : [],
      billingEntity: card?.billingEntity || "",
      email: card?.email || "",
      branch: card?.branch || "",
      srtNumber: card?.srtNumber || "",
      lineItemTotal: card?.lineItemTotal ?? 0,
      soStatus: card?.soStatus || "",
      salesOrderId: card?.salesOrderId || "",
      soCustomerCode: card?.soCustomerCode || "",
      soCustomerName: card?.soCustomerName || card?.name || "",
      soContactPerson: card?.soContactPerson || card?.user || "",
      soBpCurrency: card?.soBpCurrency || "",
      soEuroRate: card?.soEuroRate || "",
      soPoNo: card?.soPoNo || "",
      soPort: card?.soPort || card?.port || "",
      soSoNo: card?.soSoNo || "",
      soPostingDate: card?.soPostingDate || "",
      soDeliveryDate: card?.soDeliveryDate || "",
      soDocumentDate: card?.soDocumentDate || "",
      soShipName: card?.soShipName || card?.vesselName || "",
      soProjectName: card?.soProjectName || "",
      soOwner: card?.soOwner || "",
      soSubtotal: card?.soSubtotal ?? "",
      soTotalDiscount: card?.soTotalDiscount ?? "",
      soDiscountPercentage: card?.soDiscountPercentage ?? "",
      soTotalTax: card?.soTotalTax ?? "",
      soGrandTotal: card?.soGrandTotal ?? "",
      soRemarks: card?.soRemarks || "",
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

  const [salesOrderApiLoading, setSalesOrderApiLoading] = useState(false);
  const [salesOrderApiError, setSalesOrderApiError] = useState(null);
  const lastSalesOrderFetchKeyRef = useRef(null);

  useEffect(() => {
    if (!show) {
      lastSalesOrderFetchKeyRef.current = null;
      return;
    }
    if (activeTopTab !== "Sales Order") return;

    const callIdRaw = card?.call_id ?? card?.callId;
    const callId = callIdRaw === undefined || callIdRaw === null ? "" : String(callIdRaw).trim();
    if (!callId) {
      setSalesOrderApiError("No call identifier available for this card.");
      setSalesOrderApiLoading(false);
      return;
    }

    const key = `${card?.id ?? ""}:${callId}`;
    if (lastSalesOrderFetchKeyRef.current === key) return;

    let cancelled = false;
    setSalesOrderApiLoading(true);
    setSalesOrderApiError(null);

    salesOrderService
      .getSoItemsByCall(callId)
      .then((response) => {
        if (cancelled) return;
        const body = response?.data;
        if (body?.status !== "success" || !body?.data) {
          setSalesOrderApiError(
            typeof body?.message === "string" && body.message.trim()
              ? body.message
              : "Unable to load sales order data."
          );
          setFormValues((prev) => ({
            ...prev,
            salesOrderList: [],
          }));
          return;
        }
        lastSalesOrderFetchKeyRef.current = key;
        const mapped = mapSalesOrderResponse(body.data);
        setFormValues((prev) => ({ ...prev, ...mapped }));
      })
      .catch((err) => {
        if (cancelled) return;
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load sales order.";
        setSalesOrderApiError(typeof msg === "string" ? msg : "Failed to load sales order.");
        setFormValues((prev) => ({
          ...prev,
          salesOrderList: [],
        }));
      })
      .finally(() => {
        if (!cancelled) setSalesOrderApiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [show, activeTopTab, card?.call_id, card?.callId, card?.id]);

  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (show && isAddMode) setHasSubmitted(false);
  }, [show, isAddMode]);

  const handleCallFileCreatedSuccess = useCallback(
    async () => {
      notify("Call file created successfully.", "success");
      await onBoardRefresh?.();
      close();
    },
    [close, onBoardRefresh]
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
        ? {
          onSave: handleCallFileCreatedSuccess,
          isSavingGeneral,
          hasSubmitted,
          setHasSubmitted,
          setIsSavingGeneral,
        }
        : {
          onSave: undefined,
          isSavingGeneral: false,
          hasSubmitted: false,
          setHasSubmitted: () => { },
          setIsSavingGeneral: () => { },
        },
    [isAddMode, handleCallFileCreatedSuccess, isSavingGeneral, hasSubmitted]
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
        ) : isEmptyVariant ? null : (
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
              !isEmptyVariant &&
              renderTabContent(
                activeTopTab,
                card,
                formValues,
                handleChange,
                ownerInitial,
                isAddMode,
                isSimplifiedMode,
                isDAModule,
                addModeSaveProps,
                salesOrderApiLoading,
                salesOrderApiError
              )}
          </>
        )}
        {!isAddMode && !isMWPVariant && !isEmptyVariant && (
          <CardFormFooter
            accentColor={accentColor}
            onUpdate={handleUpdate}
            activeStep={currentStep || 1}
            completedSteps={currentStep && currentStep > 1 ? currentStep - 1 : 0}
            activeTab={activeTopTab}
            onStepClick={handleStepClick}
            currentStep={currentStep}
            isSimplifiedMode={isSimplifiedMode}
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
  variant: PropTypes.oneOf(["default", "driver", "hotel", "mwp", "gro", "empty"]),
};

export default CardForm;
