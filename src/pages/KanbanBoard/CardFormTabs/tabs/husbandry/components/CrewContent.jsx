import { useEffect, useState, useRef, useMemo, useCallback, forwardRef } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiDownload } from "react-icons/fi";
import { YesIcon, NoIcon } from "./Husbandry.components";
import CustomModal from "../../../../../../components/CustomModal";
import useCrewReducer from "../../../../../../store/CrewReducer";
import callFileService from "../../../../../../services/callFileService";
import "../../../../../../design/scss/operations.scss";

// Status colors
const STATUS_COLORS = {
  done: "#28a745", // Green - Completed
  inProgress: "#ffc107", // Yellow - In Progress
  rejected: "#dc3545", // Red - Rejected
  pending: "#6c757d" // Gray (default)
};

// Status labels
const STATUS_LABELS = {
  done: "Done",
  inProgress: "In Progress",
  rejected: "Pending",
  pending: "Pending"
};

// Icon components for column headers
const CrewNameIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const NationalityIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const RankIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M6 9L12 3L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M6 15L12 21L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PassportIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IqamaIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6" cy="6" r="1" fill="currentColor" />
    <circle cx="18" cy="6" r="1" fill="currentColor" />
  </svg>
);

const VisaIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
    <path d="M6 6H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CGPassIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M7 9H17M7 13H17M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5V3C12 2.44772 11.5523 2 11 2H13C12.4477 2 12 2.44772 12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5" cy="7" r="0.5" fill="currentColor" />
    <circle cx="19" cy="7" r="0.5" fill="currentColor" />
  </svg>
);

const ZawilPassIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M9 9H15M9 13H15M9 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6" cy="7" r="1" fill="currentColor" />
    <circle cx="18" cy="7" r="1" fill="currentColor" />
    <path d="M6 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CarIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H5M5 17H19M5 17V19C5 19.5304 4.78929 20.0391 4.41421 20.4142C4.03914 20.7893 3.53043 21 3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V17M19 17H20C20.5304 17 21.0391 16.7893 21.4142 16.4142C21.7893 16.0391 22 15.5304 22 15V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H19M19 17V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V17M5 9L7 5H17L19 9M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const HotelIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M3 21H21M5 21V7L12 3L19 7V21M5 21H9M19 21H15M9 21V13H15V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const MedicalIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

// Status icon component
const StatusIcon = ({ status = "pending", IconComponent, size = 20 }) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <IconComponent size={size} color={color} />;
};

const WIZARD_STEP_STATUS = {
  COMPLETED: "completed",
  ACTIVE: "active",
  LOCKED: "locked",
  ERROR: "error"
};

const PREMIUM_DATEPICKER_PROPS = {
  dateFormat: "dd/MM/yyyy",
  placeholderText: "",
  className: "form-control premium-date-input",
  popperClassName: "premium-datepicker-popper",
  calendarClassName: "premium-datepicker-calendar",
  portalId: "datepicker-portal",
  showPopperArrow: false,
  popperPlacement: "bottom-start",
  popperProps: {
    strategy: "fixed",
  },
};

const PREVIEW_TABLE_INPUT_STYLE = {
  width: "100%",
  border: "none",
  outline: "none",
  fontSize: "13px",
  fontFamily: "\"Open Sans\", sans-serif",
  padding: "6px 10px",
  borderRadius: "4px",
  transition: "all 0.2s ease",
  boxSizing: "border-box",
  height: "32px",
};

const PreviewDateInput = forwardRef(({ value, onClick, hasValue, onFocus, onBlur, placeholder }, ref) => (
  <button
    ref={ref}
    type="button"
    className="premium-date-trigger"
    onClick={(e) => {
      onClick?.(e);
    }}
    onFocus={onFocus}
    onBlur={onBlur}
    style={{
      ...PREVIEW_TABLE_INPUT_STYLE,
      backgroundColor: hasValue ? "#f0f7ff" : "transparent",
      color: hasValue ? "#1a1a1a" : "#999",
      fontWeight: hasValue ? "500" : "400",
      cursor: "pointer",
      pointerEvents: "auto",
      textAlign: "left",
    }}
  >
    {value || placeholder || ""}
  </button>
));

const parseISODate = (value) => {
  if (!value) return null;
  const raw = String(value);
  const normalized = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : raw;
  const [year, month, day] = normalized.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const toISODate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultBulkStepConfig = (includeIqama = false) => {
  const base = [
    { key: "crewList", label: "Crew List", title: "Crew List Uploaded", description: "Crew list upload is completed.", storageField: "crewUploadedFileName", accepts: ".xls,.xlsx,.csv", allowMultiple: false },
    { key: "passport", label: "Passport", title: "Upload Passport File", description: "Upload passport documents in bulk for crew members.", storageField: "crewPassportFiles", accepts: "*/*", allowMultiple: true },
    { key: "visa", label: "Visa", title: "Upload Visa File", description: "Upload visa documents in bulk for crew members.", storageField: "crewVisaFiles", accepts: "*/*", allowMultiple: true }
  ];

  if (includeIqama) {
    base.push({ key: "iqama", label: "Iqama", title: "Upload Iqama File", description: "Upload iqama documents in bulk for crew members.", storageField: "crewIqamaFiles", accepts: "*/*", allowMultiple: true });
  }

  base.push(
    {
      key: "cgPass",
      label: "CG Pass",
      title: "Upload CG Pass File (optional)",
      description: "Optional — upload CG pass documents in bulk, or skip if not needed.",
      storageField: "crewCgPassFiles",
      accepts: "*/*",
      allowMultiple: true,
      optional: true
    },
    {
      key: "zawilPass",
      label: "Zawil Pass",
      title: "Upload Zawil Pass File (optional)",
      description: "Optional — upload zawil pass documents in bulk, or skip if not needed.",
      storageField: "crewZawilPassFiles",
      accepts: "*/*",
      allowMultiple: true,
      optional: true
    }
  );

  return base;
};

const buildWizardSteps = ({ includeIqama, uploadedFileName, formValues }) => {
  const config = getDefaultBulkStepConfig(includeIqama);
  return config.map((step, index) => {
    if (step.key === "crewList") {
      return {
        ...step,
        status: WIZARD_STEP_STATUS[index === 0 ? "ACTIVE" : "LOCKED"],
        uploadedFile: uploadedFileName ? [{ name: uploadedFileName }] : null,
        uploadedAt: uploadedFileName ? new Date().toISOString() : null,
        serverResponse: null,
        errorMessage: null,
        skipped: false
      };
    }

    const existingFiles = formValues[step.storageField] || null;
    const hasExistingFiles = Array.isArray(existingFiles) ? existingFiles.length > 0 : Boolean(existingFiles);
    return {
      ...step,
      status: WIZARD_STEP_STATUS.LOCKED,
      uploadedFile: hasExistingFiles ? existingFiles : null,
      uploadedAt: hasExistingFiles ? new Date().toISOString() : null,
      serverResponse: null,
      errorMessage: null,
      skipped: false
    };
  });
};

const createEmptyPreviewRows = () => ([
  { name: "", movementType: "", rank: "", nationality: "", passportNumber: "", passportExpiry: "", visaNumber: "", visaExpiry: "", iqama: "", iqamaExpiry: "", sbNo: "", borderNo: "", dateOfBirth: "" },
  { name: "", movementType: "", rank: "", nationality: "", passportNumber: "", passportExpiry: "", visaNumber: "", visaExpiry: "", iqama: "", iqamaExpiry: "", sbNo: "", borderNo: "", dateOfBirth: "" },
  { name: "", movementType: "", rank: "", nationality: "", passportNumber: "", passportExpiry: "", visaNumber: "", visaExpiry: "", iqama: "", iqamaExpiry: "", sbNo: "", borderNo: "", dateOfBirth: "" },
  { name: "", movementType: "", rank: "", nationality: "", passportNumber: "", passportExpiry: "", visaNumber: "", visaExpiry: "", iqama: "", iqamaExpiry: "", sbNo: "", borderNo: "", dateOfBirth: "" },
  { name: "", movementType: "", rank: "", nationality: "", passportNumber: "", passportExpiry: "", visaNumber: "", visaExpiry: "", iqama: "", iqamaExpiry: "", sbNo: "", borderNo: "", dateOfBirth: "" },
]);

const PREVIEW_FIELD_PLACEHOLDERS = {
  name: "Name",
  movementType: "Sign On / Sign Off",
  rank: "Rank",
  nationality: "Nationality",
  passportNumber: "Passport Number",
  passportExpiry: "Passport Expiry",
  visaNumber: "KSA Visa Number",
  iqama: "IQAMA",
  sbNo: "Sb No",
  borderNo: "Border No",
};

// Generate crew data from Excel file
const generateCrewFromExcel = (excelData) => {
  if (!excelData || excelData.length === 0) return [];

  const headers = excelData[0];
  const dataRows = excelData.slice(1);

  // Map common column names to our data structure
  const getColumnIndex = (possibleNames) => {
    const headerLower = headers.map((h) => (h || "").toString().toLowerCase().trim());
    for (const name of possibleNames) {
      const index = headerLower.findIndex((h) => h.includes(name.toLowerCase()));
      if (index !== -1) return index;
    }
    return -1;
  };

  const crewData = dataRows
    .filter((row) => row && row.some((cell) => cell !== null && cell !== undefined && cell !== ""))
    .map((row, index) => {
      const crewNameIndex = getColumnIndex(["name", "crew name", "crewname", "full name"]);
      const movementTypeIndex = getColumnIndex(["movement type", "sign on / sign off", "sign on", "sign off", "sign on off", "signonoff"]);
      const nationalityIndex = getColumnIndex(["nationality", "country", "nation"]);
      const rankIndex = getColumnIndex(["rank", "position", "designation", "job"]);
      const passportIndex = getColumnIndex(["passport", "passport no", "passport number", "passportno"]);
      const passportExpiryIndex = getColumnIndex(["passport expiry", "passport exp", "passport expiration"]);
      const visaNumberIndex = getColumnIndex(["visa no", "visa number", "ksa visa number", "ksa visa"]);
      const visaExpiryIndex = getColumnIndex(["visa expiry", "visa exp", "visa expiration"]);
      const iqamaIndex = getColumnIndex(["iqama", "iqama no", "iqama number"]);
      const iqamaExpiryIndex = getColumnIndex(["iqama expiry", "iqama exp", "iqama expiration"]);
      const sbNoIndex = getColumnIndex(["sb no", "sb number", "s/b no"]);
      const borderNoIndex = getColumnIndex(["border no", "border number"]);
      const dobIndex = getColumnIndex(["date of birth", "dob", "birth date"]);

      return {
        id: index + 1,
        crewName: crewNameIndex !== -1 ? (row[crewNameIndex] || `Crew Member ${index + 1}`) : `Crew Member ${index + 1}`,
        movementType: movementTypeIndex !== -1 ? (row[movementTypeIndex] || "") : "",
        signOnOff: movementTypeIndex !== -1 ? (row[movementTypeIndex] || "") : "",
        dateOfBirth: dobIndex !== -1 ? row[dobIndex] || "" : "",
        nationality: nationalityIndex !== -1 ? row[nationalityIndex] || "N/A" : "N/A",
        rank: rankIndex !== -1 ? row[rankIndex] || "N/A" : "N/A",
        passportNo: passportIndex !== -1 ? row[passportIndex] || `P${String(1000000 + index).padStart(7, '0')}` : `P${String(1000000 + index).padStart(7, '0')}`,
        passportExpiry: passportExpiryIndex !== -1 ? row[passportExpiryIndex] || "" : "",
        visaNumber: visaNumberIndex !== -1 ? row[visaNumberIndex] || "" : "",
        ksaVisaNumber: visaNumberIndex !== -1 ? row[visaNumberIndex] || "" : "",
        visaExpiry: visaExpiryIndex !== -1 ? row[visaExpiryIndex] || "" : "",
        iqamaNumber: iqamaIndex !== -1 ? row[iqamaIndex] || "" : "",
        iqamaExpiry: iqamaExpiryIndex !== -1 ? row[iqamaExpiryIndex] || "" : "",
        sbNo: sbNoIndex !== -1 ? row[sbNoIndex] || "" : "",
        borderNo: borderNoIndex !== -1 ? row[borderNoIndex] || "" : "",
        // Payload-ready keys for crew/save_crew API compatibility
        crew_name: crewNameIndex !== -1 ? (row[crewNameIndex] || `Crew Member ${index + 1}`) : `Crew Member ${index + 1}`,
        date_of_birth: dobIndex !== -1 ? row[dobIndex] || "" : "",
        passport_no: passportIndex !== -1 ? row[passportIndex] || `P${String(1000000 + index).padStart(7, "0")}` : `P${String(1000000 + index).padStart(7, "0")}`,
        passport_expiry: passportExpiryIndex !== -1 ? row[passportExpiryIndex] || "" : "",
        visa_no: visaNumberIndex !== -1 ? row[visaNumberIndex] || "" : "",
        visa_expiry: visaExpiryIndex !== -1 ? row[visaExpiryIndex] || "" : "",
        iqama_no: iqamaIndex !== -1 ? row[iqamaIndex] || "" : "",
        iqama_expiry: iqamaExpiryIndex !== -1 ? row[iqamaExpiryIndex] || "" : "",
        movement_type: movementTypeIndex !== -1 ? (row[movementTypeIndex] || "") : "",
        sb_no: sbNoIndex !== -1 ? row[sbNoIndex] || "" : "",
        border_no: borderNoIndex !== -1 ? row[borderNoIndex] || "" : "",
        transport: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        transportCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
        cgPass: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        zawilPass: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        hotel: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        hotelCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
        launchHire: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        medicalService: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        medicalServiceCount: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
        visa: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        passport: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        iqama: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
      };
    });

  return crewData;
};

const hasDocCopy = (value) => {
  if (value == null) return false;
  if (typeof value === "boolean") return value;
  const s = String(value).trim();
  if (!s || s.toLowerCase() === "null") return false;
  return true;
};

const mapWorkflowStatus = (value, fallback = "pending") => {
  if (value == null || value === "") return fallback;
  const v = String(value).toLowerCase().replace(/[\s_-]+/g, "");
  if (v === "done" || v === "completed" || v === "complete") return "done";
  if (v === "inprogress" || v === "processing" || v === "active") return "inProgress";
  if (v === "rejected" || v === "failed") return "rejected";
  if (v === "pending") return "rejected";
  return fallback;
};

/** Maps crew/get_crew_list row + API extras into table row shape */
const normalizeCrewListItem = (apiRow, index) => {
  const crewIdRaw = apiRow.crew_id ?? apiRow.id;
  const id = crewIdRaw != null && String(crewIdRaw).trim() !== ""
    ? (Number.isNaN(Number(crewIdRaw)) ? crewIdRaw : Number(crewIdRaw))
    : index + 1;

  return {
    ...apiRow,
    id,
    crew_id: apiRow.crew_id,
    crewName: apiRow.crew_name ?? apiRow.crewName ?? "",
    nationality: apiRow.nationality ?? "",
    rank: apiRow.rank ?? "",
    passportNo: apiRow.passport_no ?? apiRow.passportNo ?? "",
    passportExpiry: apiRow.passport_expiry ?? "",
    visaNumber: apiRow.visa_no ?? "",
    visaExpiry: apiRow.visa_expiry ?? "",
    iqamaNumber: apiRow.iqama_no ?? "",
    iqamaExpiry: apiRow.iqama_expiry ?? "",
    movementType: apiRow.movement_type ?? "",
    dateOfBirth: apiRow.date_of_birth ?? "",
    sbNo: apiRow.sb_no ?? "",
    borderNo: apiRow.border_no ?? "",
    passport: hasDocCopy(apiRow.passport_copy) ? "done" : "rejected",
    iqama: hasDocCopy(apiRow.iqama_copy) ? "done" : "rejected",
    visa: hasDocCopy(apiRow.visa_copy) ? "done" : "rejected",
    cgPass: hasDocCopy(apiRow.cg_pass_copy ?? apiRow.cg_pass) ? "done" : "rejected",
    zawilPass: hasDocCopy(apiRow.zawil_pass_copy ?? apiRow.zawil_pass) ? "done" : "rejected",
    transport: mapWorkflowStatus(apiRow.transport_status ?? apiRow.transport),
    transportCount: Number(apiRow.transport_count ?? apiRow.transportCount ?? 0) || 0,
    hotel: mapWorkflowStatus(apiRow.hotel_status ?? apiRow.hotel),
    hotelCount: Number(apiRow.hotel_count ?? apiRow.hotelCount ?? 0) || 0,
    launchHire: mapWorkflowStatus(apiRow.launch_hire_status ?? apiRow.launchHire),
    medicalService: mapWorkflowStatus(apiRow.medical_status ?? apiRow.medical_service_status ?? apiRow.medicalService),
    medicalServiceCount: Number(apiRow.medical_count ?? apiRow.medical_service_count ?? apiRow.medicalServiceCount ?? 0) || 0,
  };
};

const CrewContent = ({ formValues, handleChange, cardColor, onNavigateToTab, launchHireOnly = false }) => {
  const crewList = formValues.crewList || [];
  const saveCrewData = useCrewReducer((state) => state.saveCrewData);
  const isBeingUpdated = useCrewReducer((state) => state.isBeingUpdated);
  const getCrewTemplate = useCrewReducer((state) => state.getCrewTemplate);
  const importCrewFile = useCrewReducer((state) => state.importCrewFile);
  const callCrewList = useCrewReducer((state) => state.callCrewList);
  const callCrewListPagination = useCrewReducer((state) => state.callCrewListPagination);
  const isCallCrewListLoading = useCrewReducer((state) => state.isCallCrewListLoading);
  const fetchCallCrewList = useCrewReducer((state) => state.fetchCallCrewList);
  const [crewPage, setCrewPage] = useState(1);
  const [crewLimit] = useState(10);
  const [selectedCrewIds, setSelectedCrewIds] = useState([]);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // Check if documents are already uploaded from formValues
  const hasCrewList = formValues.crewList && formValues.crewList.length > 0;
  const includeIqamaInBulkFlow = Boolean(formValues?.includeIqamaInBulkFlow);

  const [isFileUploaded, setIsFileUploaded] = useState(hasCrewList);
  /** Until false, show centered loader while resolving crew from API for this call/vessel */
  const [crewAvailabilityChecked, setCrewAvailabilityChecked] = useState(false);
  /** User chose "Upload New File" — show upload UI even if API still has crew */
  const [preferLocalUploadView, setPreferLocalUploadView] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardSlideDirection, setWizardSlideDirection] = useState("forward");
  const [wizardWarning, setWizardWarning] = useState("");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [steps, setSteps] = useState(() => buildWizardSteps({ includeIqama: includeIqamaInBulkFlow, uploadedFileName: formValues.crewUploadedFileName || "", formValues }));
  const [isUploadingStep, setIsUploadingStep] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(formValues.crewUploadedFileName || "");
  const fileInputRef = useRef(null);

  const [isDraggingWizardUpload, setIsDraggingWizardUpload] = useState(false);
  const [passportFiles, setPassportFiles] = useState(formValues.crewPassportFiles || []);
  const [visaFiles, setVisaFiles] = useState(formValues.crewVisaFiles || []);
  const [iqamaFiles, setIqamaFiles] = useState(formValues.crewIqamaFiles || []);
  const [cgPassFiles, setCgPassFiles] = useState(formValues.crewCgPassFiles || []);
  const [zawilPassFiles, setZawilPassFiles] = useState(formValues.crewZawilPassFiles || []);
  const wizardStepFileInputRef = useRef(null);

  // Individual passport and visa documents per crew member
  const [passportDocuments, setPassportDocuments] = useState(formValues.crewPassportDocuments || {});
  const [iqamaDocuments, setIqamaDocuments] = useState(formValues.crewIqamaDocuments || {});
  const [visaDocuments, setVisaDocuments] = useState(formValues.crewVisaDocuments || {});
  const [cgPassDocuments, setCgPassDocuments] = useState(formValues.crewCgPassDocuments || {});
  const [zawilPassDocuments, setZawilPassDocuments] = useState(formValues.crewZawilPassDocuments || {});
  const passportFileInputRefs = useRef({});
  const iqamaFileInputRefs = useRef({});
  const visaFileInputRefs = useRef({});
  const cgPassFileInputRefs = useRef({});
  const zawilPassFileInputRefs = useRef({});

  const normalizedApiCrewList = useMemo(() => {
    if (callCrewList === null) return null;
    return callCrewList.map(normalizeCrewListItem);
  }, [callCrewList]);

  const displayCrewList = useMemo(() => {
    if (normalizedApiCrewList && normalizedApiCrewList.length > 0) {
      return normalizedApiCrewList;
    }
    if (crewList.length > 0) return crewList;
    return [];
  }, [crewList, normalizedApiCrewList]);

  const totalCrewItems = Number(callCrewListPagination?.total ?? displayCrewList.length ?? 0) || 0;
  const totalCrewPages = Math.max(1, Number(callCrewListPagination?.total_pages ?? 1) || 1);
  const effectiveCrewPage = Math.min(Math.max(crewPage, 1), totalCrewPages);
  const startCrewItem = totalCrewItems === 0 ? 0 : ((effectiveCrewPage - 1) * crewLimit) + 1;
  const endCrewItem = totalCrewItems === 0 ? 0 : Math.min(effectiveCrewPage * crewLimit, totalCrewItems);
  const paginationPages = useMemo(() => {
    const pages = [];
    const windowSize = 5;
    const start = Math.max(1, effectiveCrewPage - 2);
    const end = Math.min(totalCrewPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [effectiveCrewPage, totalCrewPages]);

  const resolveCallAndVesselIds = useCallback(async () => {
    let resolvedCallId = Number(formValues?.call_id ?? formValues?.callId);
    let resolvedVesselId = Number(formValues?.vessel_id ?? formValues?.vesselId);

    if ((!resolvedCallId || !resolvedVesselId) && resolvedCallId) {
      try {
        const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
        const callDetailData =
          callDetailResponse?.data?.[0] ||
          callDetailResponse?.data ||
          callDetailResponse?.detail ||
          callDetailResponse;
        if (!resolvedCallId) {
          resolvedCallId = Number(callDetailData?.call_id ?? callDetailData?.id);
        }
        if (!resolvedVesselId) {
          resolvedVesselId = Number(callDetailData?.vessel_id);
        }
      } catch (e) {
        console.error("Crew list: failed to resolve call detail:", e);
      }
    }

    return { resolvedCallId, resolvedVesselId };
  }, [formValues?.call_id, formValues?.callId, formValues?.vessel_id, formValues?.vesselId]);

  const refreshCallCrewListFromApi = useCallback(async () => {
    const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
    if (!resolvedCallId || !resolvedVesselId) return;
    await fetchCallCrewList({
      payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: crewPage, limit: crewLimit },
    });
  }, [resolveCallAndVesselIds, fetchCallCrewList, crewPage, crewLimit]);

  useEffect(() => {
    let cancelled = false;
    setPreferLocalUploadView(false);
    setCrewAvailabilityChecked(false);

    (async () => {
      try {
        const { resolvedCallId, resolvedVesselId } = await resolveCallAndVesselIds();
        if (cancelled) return;

        if (!resolvedCallId || !resolvedVesselId) {
          useCrewReducer.setState({ callCrewList: [], callCrewListPagination: null });
          return;
        }

        useCrewReducer.setState({ callCrewList: null, callCrewListPagination: null });
        await fetchCallCrewList({
          payload: { call_id: resolvedCallId, vessel_id: resolvedVesselId, page: crewPage, limit: crewLimit },
        });
      } finally {
        if (!cancelled) setCrewAvailabilityChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolveCallAndVesselIds, fetchCallCrewList, crewPage, crewLimit]);

  useEffect(() => {
    setSelectedCrewIds([]);
  }, [crewPage, displayCrewList.length]);

  useEffect(() => {
    if (crewPage > totalCrewPages) {
      setCrewPage(totalCrewPages);
    }
  }, [crewPage, totalCrewPages]);

  // Editable preview table data (max 5 rows)
  const [previewTableData, setPreviewTableData] = useState(createEmptyPreviewRows);

  // Handle individual crew selection
  const handleCrewToggle = (crewId) => {
    setSelectedCrewIds((prev) => {
      if (prev.includes(crewId)) {
        return prev.filter((id) => id !== crewId);
      } else {
        return [...prev, crewId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCrewIds.length === displayCrewList.length) {
      setSelectedCrewIds([]);
    } else {
      setSelectedCrewIds(displayCrewList.map((crew) => crew.id));
    }
  };

  // Action dropdown options
  const allActionOptions = [
    { value: "transport", label: "Transport", tab: "transport", field: "selectedCrew" },
    { value: "cgPass", label: "CG Pass", tab: "cgPass", field: "cgPassSelectedCrew" },
    { value: "zawilPass", label: "Zawil Pass", tab: "zawilPass", field: "zawilPassSelectedCrew" },
    { value: "launchHire", label: "Launch Hire", tab: "launchHire", field: "launchHireSelectedCrew" },
    { value: "hotel", label: "Hotel", tab: "hotel", field: "hotelSelectedCrew" },
    { value: "medicalService", label: "Medical", tab: "medicalService", field: "medicalServiceSelectedCrew" },
  ];

  // Filter action options based on launchHireOnly prop
  const actionOptions = launchHireOnly
    ? allActionOptions.filter((option) => option.value === "launchHire")
    : allActionOptions.filter((option) => option.value !== "launchHire");

  // Handle action dropdown selection
  const handleActionSelect = (option) => {
    // Set the selected crew in the corresponding field
    const crewIdStrings = selectedCrewIds.map((id) => id.toString());
    const syntheticEvent = { target: { value: crewIdStrings } };
    handleChange(option.field)(syntheticEvent);

    // Navigate to the corresponding tab
    if (onNavigateToTab) {
      onNavigateToTab(option.tab);
    }

    // Clear selection after navigation
    setSelectedCrewIds([]);
    setShowActionDropdown(false);
  };

  // Show dropdown when at least one crew is selected
  useEffect(() => {
    setShowActionDropdown(selectedCrewIds.length > 0);
  }, [selectedCrewIds]);

  // Handle Excel file upload
  const handleFileUpload = async (file) => {
    if (!file) return;

    try {
      let resolvedCallId = Number(formValues?.call_id ?? formValues?.callId);
      let resolvedVesselId = Number(formValues?.vessel_id ?? formValues?.vesselId);

      if ((!resolvedCallId || !resolvedVesselId) && resolvedCallId) {
        const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
        const callDetailData =
          callDetailResponse?.data?.[0] ||
          callDetailResponse?.data ||
          callDetailResponse?.detail ||
          callDetailResponse;
        if (!resolvedCallId) {
          resolvedCallId = Number(callDetailData?.call_id ?? callDetailData?.id);
        }
        if (!resolvedVesselId) {
          resolvedVesselId = Number(callDetailData?.vessel_id);
        }
      }

      if (resolvedCallId && resolvedVesselId) {
        const formData = new FormData();
        formData.append("call_id", String(resolvedCallId));
        formData.append("vessel_id", String(resolvedVesselId));
        formData.append("file", file);
        try {
          await importCrewFile({ formData });
          await refreshCallCrewListFromApi();
          setPreferLocalUploadView(false);
        } catch (importErr) {
          console.error("Error importing crew file:", importErr);
        }
      }
    } catch (error) {
      console.error("Error importing crew file:", error);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelContent = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

        // Generate crew data from Excel
        const crewData = generateCrewFromExcel(excelContent);

        // Always persist crew list regardless of data validation
        const syntheticEvent = { target: { value: crewData } };
        handleChange("crewList")(syntheticEvent);
        setUploadedFileName(file.name);
        // Save uploaded file name to formValues
        const fileNameEvent = { target: { value: file.name } };
        handleChange("crewUploadedFileName")(fileNameEvent);
        if (crewData.length > 0) {
          setIsFileUploaded(true);
          setIsWizardOpen(false);
        } else {
          setIsFileUploaded(true);
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        // Even on error, show the crew list (empty or with default data)
        const syntheticEvent = { target: { value: [] } };
        handleChange("crewList")(syntheticEvent);
        setIsFileUploaded(true);
        setUploadedFileName(file.name);
        // Save uploaded file name to formValues
        const fileNameEvent = { target: { value: file.name } };
        handleChange("crewUploadedFileName")(fileNameEvent);
        setIsWizardOpen(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };


  // Handle Excel file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };


  // Handle drag and drop for Excel
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };


  // Handle upload zone click
  const handleUploadZoneClick = () => {
    fileInputRef.current?.click();
  };


  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha = 0.1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Handle download preview template from backend
  const handleDownloadPreview = async () => {
    if (isDownloadingTemplate) return;
    setIsDownloadingTemplate(true);
    try {
      let resolvedPortId = Number(formValues?.port_id ?? formValues?.portId);
      let resolvedCallTypeId = Number(formValues?.call_type_id ?? formValues?.callTypeId);
      const resolvedCallId = Number(formValues?.call_id ?? formValues?.callId);

      if (!resolvedPortId || !resolvedCallTypeId) {
        if (resolvedCallId) {
          const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
          const callDetailData =
            callDetailResponse?.data?.[0] ||
            callDetailResponse?.data ||
            callDetailResponse?.detail ||
            callDetailResponse;

          if (!resolvedPortId) {
            resolvedPortId = Number(callDetailData?.port_id);
          }
          if (!resolvedCallTypeId) {
            resolvedCallTypeId = Number(callDetailData?.call_type_id);
          }
        }
      }

      if (!resolvedPortId || !resolvedCallTypeId) {
        alert("Unable to download template: missing port or call type.");
        return;
      }

      const payload = {
        port_id: resolvedPortId,
        call_type_id: resolvedCallTypeId,
      };
      console.log("Crew template payload:", payload);

      const response = await getCrewTemplate({ payload });
      console.log("Crew template response:", response);

      const responseData = response?.data || response;
      const fileUrl = responseData?.file_url;
      const fileName = responseData?.file_name;

      if (!fileUrl) {
        alert("Crew template file not available.");
        return;
      }

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName || "crew_template.xlsx";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download crew template:", error);
      alert("Crew template file not available.");
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleViewCrew = (id) => {
    // Handle view action - can be implemented later
    console.log("View crew:", id);
    // You can add a modal or navigation here
  };

  // Handle updating preview table cell
  const handlePreviewTableCellChange = (rowIndex, field, value) => {
    setPreviewTableData((prev) => {
      const newData = [...prev];
      newData[rowIndex] = { ...newData[rowIndex], [field]: value };
      return newData;
    });
  };

  // Handle paste event in preview table
  const handlePreviewTablePaste = (e, startRowIndex, startColIndex) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const rows = pasteData.split("\n").filter(row => row.trim() !== "");

    // Limit to 5 rows total
    const maxRows = Math.min(rows.length, 5 - startRowIndex);
    const fieldMap = ["name", "movementType", "rank", "nationality", "passportNumber", "passportExpiry", "visaNumber", "iqama", "sbNo", "borderNo"];

    setPreviewTableData((prev) => {
      const newData = [...prev];

      for (let i = 0; i < maxRows; i++) {
        const rowIndex = startRowIndex + i;
        if (rowIndex >= 5) break;

        const cells = rows[i].split("\t");
        const updatedRow = { ...newData[rowIndex] };

        for (let j = 0; j < Math.min(cells.length, fieldMap.length); j++) {
          const colIndex = startColIndex + j;
          if (colIndex < fieldMap.length) {
            updatedRow[fieldMap[colIndex]] = cells[j].trim();
          }
        }

        newData[rowIndex] = updatedRow;
      }

      return newData;
    });
  };

  // Handle use preview data - generates crew data from the editable table
  const handleUsePreviewData = async () => {
    if (isBeingUpdated) return;
    // Filter out empty rows (rows where name is empty)
    const filledRows = previewTableData.filter(row => row.name && row.name.trim() !== "");

    if (filledRows.length === 0) {
      alert("Please enter at least one crew member's name in the table.");
      return;
    }

    let resolvedCallId = Number(formValues?.call_id ?? formValues?.callId);
    let resolvedVesselId = Number(formValues?.vessel_id ?? formValues?.vesselId);

    if (!resolvedVesselId && resolvedCallId) {
      try {
        const { data: callDetailResponse } = await callFileService.getCallDetail(resolvedCallId);
        const callDetailData =
          callDetailResponse?.data?.[0] ||
          callDetailResponse?.data ||
          callDetailResponse?.detail ||
          callDetailResponse;

        if (!resolvedCallId) {
          resolvedCallId = Number(callDetailData?.call_id ?? callDetailData?.id);
        }
        resolvedVesselId = Number(callDetailData?.vessel_id);
      } catch (error) {
        console.error("Failed to resolve call detail for crew save:", error);
      }
    }

    if (!resolvedCallId || !resolvedVesselId) {
      alert("Unable to save crew: missing call_id or vessel_id.");
      return;
    }

    const saveCrewPayload = {
      call_id: Number(resolvedCallId),
      vessel_id: Number(resolvedVesselId),
      crew: filledRows.map((row) => ({
        crew_name: row.name || "",
        date_of_birth: row.dateOfBirth || "",
        rank: row.rank || "",
        nationality: row.nationality || "",
        passport_no: row.passportNumber || "",
        passport_expiry: row.passportExpiry || "",
        visa_no: row.visaNumber || row.ksaVisaNumber || "",
        visa_expiry: row.visaExpiry || "",
        iqama_no: row.iqama || "",
        iqama_expiry: row.iqamaExpiry || "",
        movement_type: row.movementType || row.signOnOff || "",
        sb_no: row.sbNo || "",
        border_no: row.borderNo || ""
      })),
    };
    console.log("Saving crew payload:", saveCrewPayload);

    try {
      await saveCrewData({ payload: saveCrewPayload });
      await refreshCallCrewListFromApi();
      setPreferLocalUploadView(false);
    } catch (error) {
      console.error("Failed to save crew:", error);
      alert("Failed to save crew data. Please try again.");
      return;
    }

    setUploadedFileName(`Preview Data (${filledRows.length} crew member${filledRows.length > 1 ? 's' : ''})`);
    const fileNameEvent = { target: { value: `Preview Data (${filledRows.length} crew member${filledRows.length > 1 ? 's' : ''})` } };
    handleChange("crewUploadedFileName")(fileNameEvent);
    setIsFileUploaded(true);
    setIsWizardOpen(false);
    const stepsAfterCrewUpload = buildWizardSteps({
      includeIqama: includeIqamaInBulkFlow,
      uploadedFileName: `Preview Data (${filledRows.length} crew member${filledRows.length > 1 ? "s" : ""})`,
      formValues
    }).map((step, index) => {
      if (step.key === "crewList") {
        return { ...step, status: WIZARD_STEP_STATUS.COMPLETED };
      }
      if (index === 1) {
        return { ...step, status: WIZARD_STEP_STATUS.ACTIVE };
      }
      return { ...step, status: WIZARD_STEP_STATUS.LOCKED };
    });
    setSteps(stepsAfterCrewUpload);
    setActiveStepIndex(1);
  };

  const apiHasCrew = Array.isArray(callCrewList) && callCrewList.length > 0;
  const formHasCrew = crewList.length > 0;
  const showCrewListTable =
    crewAvailabilityChecked &&
    !preferLocalUploadView &&
    (apiHasCrew || formHasCrew);
  const activeStep = useMemo(() => steps[activeStepIndex] || null, [steps, activeStepIndex]);
  const isWizardCompleted = useMemo(() => steps.length > 0 && steps.every((step) => step.status === WIZARD_STEP_STATUS.COMPLETED), [steps]);

  const getStepStorageField = (stepKey) => {
    const step = steps.find((item) => item.key === stepKey);
    return step?.storageField;
  };

  const persistStepFiles = (stepKey, files) => {
    const fieldName = getStepStorageField(stepKey);
    if (!fieldName) return;
    const value = files.map((f) => ({ name: f.name, file: f, size: f.size, type: f.type }));
    handleChange(fieldName)({ target: { value } });
  };

  // Handle passport bulk upload
  const handlePassportBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setPassportFiles(fileArray);
    // Save passport files to formValues
    const syntheticEvent = { target: { value: fileArray.map(f => ({ name: f.name, file: f, size: f.size, type: f.type })) } };
    handleChange("crewPassportFiles")(syntheticEvent);
  };

  // Handle visa bulk upload
  const handleVisaBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setVisaFiles(fileArray);
    // Save visa files to formValues
    const syntheticEvent = { target: { value: fileArray.map(f => ({ name: f.name, file: f, size: f.size, type: f.type })) } };
    handleChange("crewVisaFiles")(syntheticEvent);
  };

  // Handle iqama bulk upload
  const handleIqamaBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setIqamaFiles(fileArray);
    // Save iqama files to formValues
    const syntheticEvent = { target: { value: fileArray.map(f => ({ name: f.name, file: f, size: f.size, type: f.type })) } };
    handleChange("crewIqamaFiles")(syntheticEvent);
  };
  const handleCgPassBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setCgPassFiles(fileArray);
    handleChange("crewCgPassFiles")({ target: { value: fileArray.map((f) => ({ name: f.name, file: f, size: f.size, type: f.type })) } });
  };

  const handleZawilPassBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setZawilPassFiles(fileArray);
    handleChange("crewZawilPassFiles")({ target: { value: fileArray.map((f) => ({ name: f.name, file: f, size: f.size, type: f.type })) } });
  };

  const markWizardStepSuccess = (stepKey, files, serverResponse = null) => {
    const currentIndex = steps.findIndex((step) => step.key === stepKey);
    if (currentIndex < 0) return;

    const nextIndex = currentIndex + 1;
    const updated = steps.map((step, idx) => {
      if (idx === currentIndex) {
        return {
          ...step,
          status: WIZARD_STEP_STATUS.COMPLETED,
          uploadedFile: files,
          uploadedAt: new Date().toISOString(),
          serverResponse,
          errorMessage: null,
          skipped: false
        };
      }
      if (idx === nextIndex) {
        return { ...step, status: WIZARD_STEP_STATUS.ACTIVE, errorMessage: null };
      }
      return step;
    });

    setWizardSlideDirection("forward");
    setSteps(updated);
    if (nextIndex < updated.length) {
      setActiveStepIndex(nextIndex);
    }
  };

  const skipOptionalWizardStep = () => {
    if (!activeStep?.optional || activeStep.status !== WIZARD_STEP_STATUS.ACTIVE) return;
    const stepKey = activeStep.key;
    const currentIndex = steps.findIndex((s) => s.key === stepKey);
    if (currentIndex < 0) return;

    const fieldName = getStepStorageField(stepKey);
    if (fieldName) {
      handleChange(fieldName)({ target: { value: [] } });
    }
    if (stepKey === "cgPass") {
      setCgPassFiles([]);
    } else if (stepKey === "zawilPass") {
      setZawilPassFiles([]);
    }

    const nextIndex = currentIndex + 1;
    const updated = steps.map((step, idx) => {
      if (idx === currentIndex) {
        return {
          ...step,
          status: WIZARD_STEP_STATUS.COMPLETED,
          uploadedFile: null,
          uploadedAt: null,
          serverResponse: null,
          errorMessage: null,
          skipped: true
        };
      }
      if (idx === nextIndex) {
        return { ...step, status: WIZARD_STEP_STATUS.ACTIVE, errorMessage: null };
      }
      return step;
    });

    setWizardSlideDirection("forward");
    setSteps(updated);
    if (nextIndex < updated.length) {
      setActiveStepIndex(nextIndex);
    }
  };

  const markWizardStepError = (stepKey, message) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.key === stepKey ? { ...step, status: WIZARD_STEP_STATUS.ERROR, errorMessage: message } : step
      )
    );
  };

  const handleWizardStepUpload = async (filesLike) => {
    if (!activeStep || !filesLike || filesLike.length === 0 || activeStep.status === WIZARD_STEP_STATUS.LOCKED) return;
    const files = Array.from(filesLike);
    setIsUploadingStep(true);
    setWizardWarning("");
    try {
      const stepKey = activeStep.key;
      if (stepKey === "passport") {
        handlePassportBulkUpload(files);
      } else if (stepKey === "visa") {
        handleVisaBulkUpload(files);
      } else if (stepKey === "iqama") {
        handleIqamaBulkUpload(files);
      } else if (stepKey === "cgPass") {
        handleCgPassBulkUpload(files);
      } else if (stepKey === "zawilPass") {
        handleZawilPassBulkUpload(files);
      }
      persistStepFiles(stepKey, files);
      markWizardStepSuccess(stepKey, files, { ok: true });
    } catch (error) {
      const msg = error?.message || `Unable to upload ${activeStep.label}. Please retry.`;
      markWizardStepError(activeStep.key, msg);
    } finally {
      setIsUploadingStep(false);
    }
  };

  const handleWizardFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleWizardStepUpload(files);
    }
    if (wizardStepFileInputRef.current) {
      wizardStepFileInputRef.current.value = "";
    }
  };

  const handleWizardDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeStep && activeStep.status !== WIZARD_STEP_STATUS.LOCKED) {
      setIsDraggingWizardUpload(true);
    }
  };

  const handleWizardDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingWizardUpload(false);
  };

  const handleWizardDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWizardDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingWizardUpload(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleWizardStepUpload(files);
    }
  };

  const handleOpenWizardFromCrewUpload = () => {
    // Crew Bulk Upload is temporarily hidden; keep direct flow to crew list.
    setIsWizardOpen(false);
  };

  const handleWizardClose = () => {
    if (isWizardCompleted) {
      setIsWizardOpen(false);
      return;
    }
    const shouldClose = window.confirm("Bulk upload is not complete yet. Are you sure you want to close?");
    if (shouldClose) {
      setIsWizardOpen(false);
    }
  };

  const handleOpenCrewList = () => {
    setIsWizardOpen(false);
  };

  // Handle individual passport document upload
  const handlePassportUpload = (crewId, file) => {
    if (!file) return;
    const updatedDocuments = {
      ...passportDocuments,
      [crewId]: {
        file,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      },
    };
    setPassportDocuments(updatedDocuments);
    // Save to formValues
    const syntheticEvent = { target: { value: updatedDocuments } };
    handleChange("crewPassportDocuments")(syntheticEvent);
  };

  // Handle individual iqama document upload
  const handleIqamaUpload = (crewId, file) => {
    if (!file) return;
    const updatedDocuments = {
      ...iqamaDocuments,
      [crewId]: {
        file,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      },
    };
    setIqamaDocuments(updatedDocuments);
    // Save to formValues
    const syntheticEvent = { target: { value: updatedDocuments } };
    handleChange("crewIqamaDocuments")(syntheticEvent);
  };

  // Handle individual visa document upload
  const handleVisaUpload = (crewId, file) => {
    if (!file) return;
    const updatedDocuments = {
      ...visaDocuments,
      [crewId]: {
        file,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      },
    };
    setVisaDocuments(updatedDocuments);
    // Save to formValues
    const syntheticEvent = { target: { value: updatedDocuments } };
    handleChange("crewVisaDocuments")(syntheticEvent);
  };

  // Handle individual CG Pass document upload
  const handleCgPassUpload = (crewId, file) => {
    if (!file) return;
    const updatedDocuments = {
      ...cgPassDocuments,
      [crewId]: {
        file,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      },
    };
    setCgPassDocuments(updatedDocuments);
    // Save to formValues
    const syntheticEvent = { target: { value: updatedDocuments } };
    handleChange("crewCgPassDocuments")(syntheticEvent);
  };

  // Handle individual Zawil Pass document upload
  const handleZawilPassUpload = (crewId, file) => {
    if (!file) return;
    const updatedDocuments = {
      ...zawilPassDocuments,
      [crewId]: {
        file,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      },
    };
    setZawilPassDocuments(updatedDocuments);
    // Save to formValues
    const syntheticEvent = { target: { value: updatedDocuments } };
    handleChange("crewZawilPassDocuments")(syntheticEvent);
  };

  // Shared upload icon component
  const UploadIconSVG = () => (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "var(--card-color, #2A00FF)" }}
    >
      <path
        d="M12 15V3M12 3L8 7M12 3L16 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11L12 6L17 11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const totalWizardSteps = steps.length;
  const currentWizardStepNumber = Math.min(activeStepIndex + 1, totalWizardSteps);
  const wizardTransitionClass = wizardSlideDirection === "forward" ? "wizard-step-panel--forward" : "wizard-step-panel--backward";
  const getWizardStepClass = (step, index) => {
    const classes = ["crew-wizard-step-chip"];
    if (index === activeStepIndex) classes.push("is-active");
    if (step.status === WIZARD_STEP_STATUS.COMPLETED) classes.push("is-completed");
    if (step.status === WIZARD_STEP_STATUS.LOCKED) classes.push("is-locked");
    if (step.status === WIZARD_STEP_STATUS.ERROR) classes.push("is-error");
    return classes.join(" ");
  };
  const activeStepFileNames = activeStep?.uploadedFile?.map((item) => item.name).filter(Boolean) || [];

  if (!crewAvailabilityChecked) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "360px",
          width: "100%",
          padding: "48px 24px",
        }}
      >
        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
          <span className="visually-hidden">Loading crew list...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="datepicker-portal" />
      {!showCrewListTable ? (
        // Crew Excel Upload Section
        <div
          className="crew-upload-sections-container"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: "32px",
            minHeight: "auto",
            padding: "16px 24px 24px",
            maxWidth: "1600px",
            margin: "0 auto",
            width: "100%",
            flexWrap: "wrap",
            maxHeight: "calc(100vh - 190px)",
            overflowY: "auto",
            "--card-color": cardColor,
          }}
        >
          {/* Crew Excel Upload - Left Side */}
          <div
            className="crew-upload-section crew-upload-section--excel-inline"
            style={{
              flex: "0 0 850px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              minWidth: "400px",
              paddingRight: "16px",
            }}
          >
            <div className="crew-upload-excel-panel" style={{ "--card-color": cardColor }}>
              <div className="crew-husbandry-section-heading">
                <div className="crew-husbandry-section-heading__accent" aria-hidden="true" />
                <h4 className="crew-husbandry-section-heading__title">Upload Crew Excel File</h4>
              </div>
              <div className="crew-upload-actions">
                <div className="crew-upload-actions__field">
                  <div
                    className={`document-upload-zone crew-excel-upload-zone crew-excel-upload-zone--compact ${isDragging ? "dragging" : ""} ${isFileUploaded ? "uploaded" : ""}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadZoneClick}
                    style={{ "--card-color": cardColor }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="file-input-hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileInputChange}
                    />
                    <div className="upload-zone-content crew-excel-upload-zone--compact__content">
                      {isFileUploaded ? (
                        <div className="crew-excel-upload-zone--compact__uploaded">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="crew-excel-upload-zone--compact__check">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="crew-excel-upload-zone--compact__uploaded-title">Uploaded</span>
                          <span className="crew-excel-upload-zone--compact__uploaded-name" title={uploadedFileName}>{uploadedFileName}</span>
                          <span className="crew-excel-upload-zone--compact__uploaded-hint">· Click to replace</span>
                        </div>
                      ) : (
                        <p className="upload-main-text crew-excel-upload-zone--compact__main">
                          Drag and drop your crew file here, or{" "}
                          <span className="upload-link">click to browse</span>
                          <span className="crew-excel-upload-zone--compact__formats"> · .xlsx, .xls, .csv</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPreview}
                  className="crew-upload-actions__download-btn"
                  disabled={isDownloadingTemplate}
                >
                  <FiDownload className="crew-upload-actions__download-btn-icon" size={18} strokeWidth={2.25} aria-hidden />
                  <span>{isDownloadingTemplate ? "Downloading..." : "Download Preview"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Table - Right Side */}
          <div style={{
            flex: "1 1 auto",
            minWidth: "500px",
            display: "flex",
            flexDirection: "column"
          }}>
            <div className="crew-husbandry-section-heading">
              <div className="crew-husbandry-section-heading__accent" aria-hidden="true" />
              <h4 className="crew-husbandry-section-heading__title">Expected Format (Preview - 5 rows)</h4>
            </div>
            <div style={{
              border: "1px solid #e2e6ff",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              overflow: "visible"
            }}>
              <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  minWidth: "1360px",
                  borderCollapse: "collapse",
                  fontFamily: "\"Open Sans\", sans-serif",
                  fontSize: "13px",
                  tableLayout: "fixed"
                }}>
                  <thead>
                    <tr style={{
                      background: '#e0e7ff',
                      color: "rgb(26 26 26)"
                    }}>
                      <th style={{
                        width: "15%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Name</th>
                      <th style={{
                        width: "14%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Sign On / Sign Off</th>
                      <th style={{
                        width: "12%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Rank</th>
                      <th style={{
                        width: "11%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Nationality</th>
                      <th style={{
                        width: "12%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Passport Number</th>
                      <th style={{
                        width: "12%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Passport Expiry</th>
                      <th style={{
                        width: "13%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>KSA Visa Number</th>
                      <th style={{
                        width: "11%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>IQAMA</th>
                      <th style={{
                        width: "8.5%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.2)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Sb No</th>
                      <th style={{
                        width: "8.5%",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontWeight: "600",
                        color: "rgb(26 26 26)",
                        fontSize: "13px",
                        letterSpacing: "0.3px"
                      }}>Border No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewTableData.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        style={{
                          borderBottom: rowIndex < 4 ? "1px solid #f0f0f0" : "none",
                          backgroundColor: rowIndex % 2 === 1 ? "#fafbfc" : "#ffffff",
                          transition: "background-color 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8f9ff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = rowIndex % 2 === 1 ? "#fafbfc" : "#ffffff";
                        }}
                      >
                        {[
                          { field: "name" },
                          { field: "movementType", type: "select" },
                          { field: "rank" },
                          { field: "nationality" },
                          { field: "passportNumber" },
                          { field: "passportExpiry", type: "datepicker" },
                          { field: "visaNumber" },
                          { field: "iqama" },
                          { field: "sbNo" },
                          { field: "borderNo" }
                        ].map((col, colIndex) => {
                          const isLast = colIndex === 9;
                          const hasValue = row[col.field] && row[col.field].trim() !== "";
                          return (
                            <td
                              key={col.field}
                              style={{
                                padding: "10px 16px",
                                borderRight: !isLast ? "1px solid #f0f0f0" : "none",
                                position: "relative",
                                overflow: "visible",
                              }}
                              onClick={(e) => {
                                if (col.type !== "datepicker") return;
                                if (e.target.closest(".react-datepicker")) return;
                                e.currentTarget.querySelector(".premium-date-trigger")?.click();
                              }}
                            >
                              {col.type === "select" ? (
                                <select
                                  value={row[col.field]}
                                  onChange={(e) => handlePreviewTableCellChange(rowIndex, col.field, e.target.value)}
                                  onPaste={(e) => handlePreviewTablePaste(e, rowIndex, colIndex)}
                                  title={PREVIEW_FIELD_PLACEHOLDERS[col.field] || ""}
                                  style={{
                                    backgroundColor: hasValue ? "#f0f7ff" : "transparent",
                                    color: hasValue ? "#1a1a1a" : "#999",
                                    ...PREVIEW_TABLE_INPUT_STYLE,
                                    fontWeight: hasValue ? "500" : "400",
                                    cursor: "pointer"
                                  }}
                                >
                                  <option value="" disabled>
                                    {PREVIEW_FIELD_PLACEHOLDERS[col.field] || ""}
                                  </option>
                                  <option value="Sign On">Sign On</option>
                                  <option value="Sign Off">Sign Off</option>
                                </select>
                              ) : col.type === "datepicker" ? (
                                <div
                                  className="preview-date-cell"
                                  style={{
                                    width: "100%",
                                    backgroundColor: hasValue ? "#f0f7ff" : "transparent",
                                    borderRadius: "4px",
                                    padding: "0",
                                  }}
                                >
                                  <DatePicker
                                    {...PREMIUM_DATEPICKER_PROPS}
                                    wrapperClassName="crew-preview-datepicker-wrapper"
                                    selected={parseISODate(row.passportExpiry)}
                                    onChange={(date) => handlePreviewTableCellChange(rowIndex, "passportExpiry", toISODate(date))}
                                    customInput={
                                      <PreviewDateInput
                                        hasValue={hasValue}
                                        placeholder={PREVIEW_FIELD_PLACEHOLDERS[col.field] || ""}
                                        onFocus={(e) => {
                                          e.target.style.backgroundColor = "#ffffff";
                                          e.target.style.boxShadow = "0 0 0 2px rgba(42, 0, 255, 0.1)";
                                        }}
                                        onBlur={(e) => {
                                          e.target.style.backgroundColor = hasValue ? "#f0f7ff" : "transparent";
                                          e.target.style.boxShadow = "none";
                                        }}
                                      />
                                    }
                                  />
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={row[col.field]}
                                  onChange={(e) => handlePreviewTableCellChange(rowIndex, col.field, e.target.value)}
                                  onPaste={(e) => handlePreviewTablePaste(e, rowIndex, colIndex)}
                                  placeholder={PREVIEW_FIELD_PLACEHOLDERS[col.field] || ""}
                                  onFocus={(e) => {
                                    e.target.style.backgroundColor = "#ffffff";
                                    e.target.style.boxShadow = "0 0 0 2px rgba(42, 0, 255, 0.1)";
                                    e.target.style.borderRadius = "4px";
                                  }}
                                  onBlur={(e) => {
                                    e.target.style.backgroundColor = hasValue ? "#f0f7ff" : "transparent";
                                    e.target.style.boxShadow = "none";
                                  }}
                                  readOnly={col.readOnly}
                                  style={{
                                    backgroundColor: hasValue ? "#f0f7ff" : "transparent",
                                    color: hasValue ? "#1a1a1a" : "#999",
                                    ...PREVIEW_TABLE_INPUT_STYLE,
                                    fontWeight: hasValue ? "500" : "400",
                                  }}
                                />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{
              marginTop: "24px",
              padding: "16px 20px",
              backgroundColor: "#f8f9ff",
              borderRadius: "10px",
              border: "1px solid #e2e6ff",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px"
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="var(--card-color, #2A00FF)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M12 8V12M12 16H12.01" stroke="var(--card-color, #2A00FF)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: "13px",
                  color: "#1a1a1a",
                  margin: "0 0 4px 0",
                  fontFamily: "\"Open Sans\", sans-serif",
                  fontWeight: "600"
                }}>
                  Quick Entry Guide
                </p>
                <p style={{
                  fontSize: "12px",
                  color: "#666",
                  margin: "0",
                  fontFamily: "\"Open Sans\", sans-serif",
                  lineHeight: "1.6"
                }}>
                  You can type directly into the cells or copy and paste data from Excel (tab-separated). Maximum 5 rows. At least one crew member's name is required.
                </p>
              </div>
            </div>
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "28px",
              gap: "12px"
            }}>
              <button
                type="button"
                onClick={() => {
                  setPreviewTableData(createEmptyPreviewRows());
                }}
                disabled={isBeingUpdated}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "1px solid #e2e6ff",
                  backgroundColor: isBeingUpdated ? "#f5f5f5" : "#ffffff",
                  color: isBeingUpdated ? "#b0b0b0" : "#666",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: isBeingUpdated ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "\"Open Sans\", sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
                onMouseEnter={(e) => {
                  if (isBeingUpdated) return;
                  e.currentTarget.style.backgroundColor = "#f8f9ff";
                  e.currentTarget.style.borderColor = "var(--card-color, #2A00FF)";
                  e.currentTarget.style.color = "var(--card-color, #2A00FF)";
                }}
                onMouseLeave={(e) => {
                  if (isBeingUpdated) return;
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e2e6ff";
                  e.currentTarget.style.color = "#666";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleUsePreviewData}
                disabled={isBeingUpdated}
                style={{
                  padding: "12px 32px",
                  borderRadius: "10px",
                  border: "none",
                  background: "rgb(224 231 255)",
                  color: "#rgb(26, 26, 26)",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: isBeingUpdated ? "not-allowed" : "pointer",
                  opacity: isBeingUpdated ? 0.8 : 1,
                  transition: "all 0.3s ease",
                  fontFamily: "\"Open Sans\", sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  letterSpacing: "0.3px"
                }}
                onMouseEnter={(e) => {
                  if (isBeingUpdated) return;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  if (isBeingUpdated) return;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isBeingUpdated ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span>{isBeingUpdated ? "Saving..." : "Use Preview Data"}</span>
              </button>
            </div>
          </div>
        </div >
      ) : (
        // Crew List
        <>
          <div className="crew-list-header" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "2px solid #f0f0f0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
              <h3 className="crew-list-title" style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1a1a1a",
                margin: "0",
                fontFamily: "\"Open Sans\", sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textTransform: "none",
                letterSpacing: "normal",
              }} title="Crew List">
                <span className="crew-list-title-bar" style={{
                  width: "4px",
                  height: "24px",
                  backgroundColor: "var(--card-color, #2A00FF)",
                  borderRadius: "2px",
                  display: "inline-block",
                  flexShrink: 0
                }}></span>
                Crew List
              </h3>
              {/* Status Legend */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginLeft: "20px",
                padding: "8px 16px",
                backgroundColor: "#f8f9ff",
                borderRadius: "8px",
                border: "1px solid #e2e6ff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: STATUS_COLORS.done,
                    flexShrink: 0
                  }}></div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={STATUS_LABELS.done}
                  >
                    {STATUS_LABELS.done}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: STATUS_COLORS.inProgress,
                    flexShrink: 0
                  }}></div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={STATUS_LABELS.inProgress}
                  >
                    {STATUS_LABELS.inProgress}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: STATUS_COLORS.rejected,
                    flexShrink: 0
                  }}></div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#1a1a1a",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                    title={STATUS_LABELS.rejected}
                  >
                    {STATUS_LABELS.rejected}
                  </span>
                </div>
              </div>
              {/* {uploadedFileName && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#f8f9ff",
                  borderRadius: "8px",
                  border: "1px solid #e2e6ff"
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V8H20" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      fontWeight: "500",
                      fontFamily: "\"Open Sans\", sans-serif",
                      whiteSpace: "nowrap"
                    }}
                    title={uploadedFileName}
                  >
                    {uploadedFileName.length > 6 ? `${uploadedFileName.substring(0, 6)}..` : uploadedFileName}
                  </span>
                </div>
              )} */}
              <Tooltip id="upload-new-file-btn" place="top" positionStrategy="fixed" content="Upload New File" />
              <button
                type="button"
                onClick={() => {
                  setPreferLocalUploadView(true);
                  setIsFileUploaded(false);
                  setIsWizardOpen(false);
                  setUploadedFileName("");
                  const syntheticEvent = { target: { value: [] } };
                  handleChange("crewList")(syntheticEvent);
                  handleChange("crewUploadedFileName")({ target: { value: "" } });
                  setSelectedCrewIds([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                data-tooltip-id="upload-new-file-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e6ff",
                  backgroundColor: "#ffffff",
                  color: "#1a1a1a",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "\"Open Sans\", sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9ff";
                  e.currentTarget.style.borderColor = "var(--card-color, #2A00FF)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e2e6ff";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  Upload New File
                </span>
              </button>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <select
                  onChange={(e) => {
                    const selectedKey = e.target.value;
                    if (!selectedKey) return;

                    const selectedIndex = steps.findIndex((step) => step.key === selectedKey);
                    if (selectedIndex >= 0) {
                      const selectedStep = steps[selectedIndex];
                      setIsWizardOpen(true);
                      if (selectedStep.status === WIZARD_STEP_STATUS.COMPLETED) {
                        setWizardSlideDirection(selectedIndex >= activeStepIndex ? "forward" : "backward");
                        setActiveStepIndex(selectedIndex);
                        setWizardWarning("");
                      } else if (selectedStep.status === WIZARD_STEP_STATUS.ACTIVE || selectedStep.status === WIZARD_STEP_STATUS.ERROR) {
                        setActiveStepIndex(selectedIndex);
                        setWizardWarning("");
                      } else {
                        setWizardWarning("Complete the current active step before opening upcoming steps.");
                      }
                    }
                    e.target.value = ""; // Reset dropdown
                  }}
                  style={{
                    padding: "8px 32px 8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #e2e6ff",
                    backgroundColor: "#ffffff",
                    color: "#1a1a1a",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: "\"Open Sans\", sans-serif",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: "32px",
                    minWidth: "140px"
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Bulk Upload
                  </option>
                  <option value="passport">Passport</option>
                  <option value="visa">Visa</option>
                  {includeIqamaInBulkFlow && <option value="iqama">Iqama</option>}
                  <option value="cgPass">CG Pass</option>
                  <option value="zawilPass">Zawil Pass</option>
                </select>
              </div>
              {showActionDropdown && launchHireOnly && (
                <>
                  <Tooltip id="launch-hire-btn" place="top" positionStrategy="fixed" content="Launch Hire" />
                  <button
                    type="button"
                    onClick={() => {
                      const launchHireOption = allActionOptions.find((opt) => opt.value === "launchHire");
                      if (launchHireOption) {
                        handleActionSelect(launchHireOption);
                      }
                    }}
                    data-tooltip-id="launch-hire-btn"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--card-color, #2A00FF)",
                      backgroundColor: "var(--card-color, #2A00FF)",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontFamily: "\"Open Sans\", sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: 0,
                      marginRight: "10px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.9";
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      Launch Hire
                    </span>
                  </button>
                </>
              )}
              {showActionDropdown && !launchHireOnly && (
                <div style={{ position: "relative", marginRight: "10px" }}>
                  <select
                    onChange={(e) => {
                      const selectedOption = actionOptions.find((opt) => opt.value === e.target.value);
                      if (selectedOption) {
                        handleActionSelect(selectedOption);
                      }
                      e.target.value = ""; // Reset dropdown
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: `2px solid #e2e6ff`,
                      backgroundColor: "#ffffff",
                      color: "#1a1a1a",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer",
                      outline: "none",
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Action...
                    </option>
                    {actionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Tooltip id="select-all-btn" place="top" positionStrategy="fixed" content={selectedCrewIds.length === displayCrewList.length ? "Deselect All" : "Select All"} />
              <button
                type="button"
                onClick={handleSelectAll}
                data-tooltip-id="select-all-btn"
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e6ff",
                  backgroundColor: selectedCrewIds.length === displayCrewList.length ? "var(--card-color, #2A00FF)" : "#ffffff",
                  color: selectedCrewIds.length === displayCrewList.length ? "#ffffff" : "#1a1a1a",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "\"Open Sans\", sans-serif",
                  minWidth: 0
                }}
                onMouseEnter={(e) => {
                  if (selectedCrewIds.length !== displayCrewList.length) {
                    e.currentTarget.style.backgroundColor = "#f8f9ff";
                    e.currentTarget.style.borderColor = "var(--card-color, #2A00FF)";
                  } else {
                    e.currentTarget.style.opacity = "0.9";
                  }
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedCrewIds.length === displayCrewList.length ? "var(--card-color, #2A00FF)" : "#ffffff";
                  e.currentTarget.style.borderColor = "#e2e6ff";
                  e.currentTarget.style.color = selectedCrewIds.length === displayCrewList.length ? "#ffffff" : "#1a1a1a";
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {selectedCrewIds.length === displayCrewList.length ? "Deselect All" : "Select All"}
                </span>
              </button>
            </div>
          </div>
          <div className="crew-table-wrapper">
            <div className="table-wrapper table-responsive crew-table-container crew-table-scroll">
              <table className="table table-striped crew-table crew-list-table" style={{ "--card-color": "#e2e6ff", tableLayout: "fixed", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedCrewIds.length === displayCrewList.length && displayCrewList.length > 0}
                      onChange={handleSelectAll}
                      style={{
                        width: "18px",
                        height: "18px",
                        cursor: "pointer",
                        accentColor: "#e2e6ff",
                      }}
                    />
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Crew Name
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Nationality
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Rank
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Movement Type
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Passport
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Iqama
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Visa
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    CG Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Zawil Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Transport
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Hotel
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 12)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Medical
                  </th>
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {isCallCrewListLoading && crewList.length === 0 && callCrewList === null ? (
                  <tr>
                    <td colSpan="13" style={{ textAlign: "center", padding: "40px", color: "#666" }}>
                      Loading crew list…
                    </td>
                  </tr>
                ) : displayCrewList.length === 0 ? (
                  <tr>
                    <td colSpan="13" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                      No crew data found. Upload a crew list file or add crew from preview.
                    </td>
                  </tr>
                ) : (
                  displayCrewList.map((crew) => (
                    <tr
                      key={crew.id}
                      style={{
                        backgroundColor: selectedCrewIds.includes(crew.id)
                          ? hexToRgba('#e2e6ff', 0.3)
                          : "transparent",
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCrewIds.includes(crew.id)}
                          onChange={() => handleCrewToggle(crew.id)}
                          style={{
                            width: "18px",
                            height: "18px",
                            cursor: "pointer",
                            accentColor: "#00368c",
                          }}
                        />
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell" title={crew.crewName || ""}>{crew.crewName || ""}</div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell" title={crew.nationality || ""}>{crew.nationality || ""}</div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell" title={crew.rank || ""}>{crew.rank || ""}</div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell" title={crew.movementType || crew.movement_type || ""}>
                          {crew.movementType || crew.movement_type || ""}
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          <input
                            type="file"
                            ref={(el) => {
                              if (el) passportFileInputRefs.current[crew.id] = el;
                            }}
                            style={{ display: "none" }}
                            accept="*/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handlePassportUpload(crew.id, file);
                              }
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <Tooltip id={`passport-upload-${crew.id}`} place="right" positionStrategy="fixed" content={(passportDocuments[crew.id] || hasDocCopy(crew.passport_copy)) ? "Uploaded" : "Upload"} />
                            <button
                              type="button"
                              onClick={() => passportFileInputRefs.current[crew.id]?.click()}
                              data-tooltip-id={`passport-upload-${crew.id}`}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                color: (passportDocuments[crew.id] || hasDocCopy(crew.passport_copy)) ? STATUS_COLORS.done : STATUS_COLORS.rejected,
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          <input
                            type="file"
                            ref={(el) => {
                              if (el) iqamaFileInputRefs.current[crew.id] = el;
                            }}
                            style={{ display: "none" }}
                            accept="*/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleIqamaUpload(crew.id, file);
                              }
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <Tooltip id={`iqama-upload-${crew.id}`} place="right" positionStrategy="fixed" content={(iqamaDocuments[crew.id] || hasDocCopy(crew.iqama_copy)) ? "Uploaded" : "Upload"} />
                            <button
                              type="button"
                              onClick={() => iqamaFileInputRefs.current[crew.id]?.click()}
                              data-tooltip-id={`iqama-upload-${crew.id}`}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                color: (iqamaDocuments[crew.id] || hasDocCopy(crew.iqama_copy)) ? STATUS_COLORS.done : STATUS_COLORS.rejected,
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          <input
                            type="file"
                            ref={(el) => {
                              if (el) visaFileInputRefs.current[crew.id] = el;
                            }}
                            style={{ display: "none" }}
                            accept="*/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleVisaUpload(crew.id, file);
                              }
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <Tooltip id={`visa-upload-${crew.id}`} place="right" positionStrategy="fixed" content={(visaDocuments[crew.id] || hasDocCopy(crew.visa_copy)) ? "Uploaded" : "Upload"} />
                            <button
                              type="button"
                              onClick={() => visaFileInputRefs.current[crew.id]?.click()}
                              data-tooltip-id={`visa-upload-${crew.id}`}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                color: (visaDocuments[crew.id] || hasDocCopy(crew.visa_copy)) ? STATUS_COLORS.done : STATUS_COLORS.rejected,
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          <input
                            type="file"
                            ref={(el) => {
                              if (el) cgPassFileInputRefs.current[crew.id] = el;
                            }}
                            style={{ display: "none" }}
                            accept="*/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleCgPassUpload(crew.id, file);
                              }
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <Tooltip id={`cg-pass-upload-${crew.id}`} place="right" positionStrategy="fixed" content={(cgPassDocuments[crew.id] || hasDocCopy(crew.cg_pass_copy ?? crew.cg_pass)) ? "Uploaded" : "Upload"} />
                            <button
                              type="button"
                              onClick={() => cgPassFileInputRefs.current[crew.id]?.click()}
                              data-tooltip-id={`cg-pass-upload-${crew.id}`}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                color: (cgPassDocuments[crew.id] || hasDocCopy(crew.cg_pass_copy ?? crew.cg_pass)) ? STATUS_COLORS.done : STATUS_COLORS.rejected,
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                          <input
                            type="file"
                            ref={(el) => {
                              if (el) zawilPassFileInputRefs.current[crew.id] = el;
                            }}
                            style={{ display: "none" }}
                            accept="*/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleZawilPassUpload(crew.id, file);
                              }
                            }}
                          />
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <Tooltip id={`zawil-pass-upload-${crew.id}`} place="left" positionStrategy="fixed" content={(zawilPassDocuments[crew.id] || hasDocCopy(crew.zawil_pass_copy ?? crew.zawil_pass)) ? "Uploaded" : "Upload"} />
                            <button
                              type="button"
                              onClick={() => zawilPassFileInputRefs.current[crew.id]?.click()}
                              data-tooltip-id={`zawil-pass-upload-${crew.id}`}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                color: (zawilPassDocuments[crew.id] || hasDocCopy(crew.zawil_pass_copy ?? crew.zawil_pass)) ? STATUS_COLORS.done : STATUS_COLORS.rejected,
                                transition: "all 0.2s ease"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div
                          className="crew-table-cell crew-status-icon"
                          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}
                          data-tooltip-id={`transport-status-${crew.id}`}
                          data-tooltip-content={STATUS_LABELS[crew.transport] || STATUS_LABELS.pending}
                        >
                          <StatusIcon status={crew.transport} IconComponent={CarIcon} size={20} />
                          <span style={{
                            position: "absolute",
                            top: "-4px",
                            right: "18px",
                            backgroundColor: STATUS_COLORS.done,
                            color: "#ffffff",
                            borderRadius: "10px",
                            minWidth: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "0 5px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            border: "2px solid #ffffff"
                          }}>
                            {crew.transportCount || 0}
                          </span>
                        </div>
                        <Tooltip id={`transport-status-${crew.id}`} place="left" positionStrategy="fixed" offset={0} />
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div
                          className="crew-table-cell crew-status-icon"
                          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}
                          data-tooltip-id={`hotel-status-${crew.id}`}
                          data-tooltip-content={STATUS_LABELS[crew.hotel] || STATUS_LABELS.pending}
                        >
                          <StatusIcon status={crew.hotel} IconComponent={HotelIcon} size={20} />
                          <span style={{
                            position: "absolute",
                            top: "-4px",
                            right: "18px",
                            backgroundColor: STATUS_COLORS.done,
                            color: "#ffffff",
                            borderRadius: "10px",
                            minWidth: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "0 5px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            border: "2px solid #ffffff"
                          }}>
                            {crew.hotelCount || 0}
                          </span>
                        </div>
                        <Tooltip id={`hotel-status-${crew.id}`} place="left" positionStrategy="fixed" offset={0} />
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div
                          className="crew-table-cell crew-status-icon"
                          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}
                          data-tooltip-id={`medical-status-${crew.id}`}
                          data-tooltip-content={STATUS_LABELS[crew.medicalService] || STATUS_LABELS.pending}
                        >
                          <StatusIcon status={crew.medicalService} IconComponent={MedicalIcon} size={20} />
                          <span style={{
                            position: "absolute",
                            top: "-4px",
                            right: "18px",
                            backgroundColor: STATUS_COLORS.done,
                            color: "#ffffff",
                            borderRadius: "10px",
                            minWidth: "18px",
                            height: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "0 5px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                            border: "2px solid #ffffff"
                          }}>
                            {crew.medicalServiceCount || 0}
                          </span>
                        </div>
                        <Tooltip id={`medical-status-${crew.id}`} place="left" positionStrategy="fixed" offset={0} />
                      </td>
                      {/* <td>
                  <button
                    type="button"
                    className="crew-view-btn"
                    onClick={() => handleViewCrew(crew.id)}
                    title="View"
                  >
                    View
                  </button>
                </td> */}
                    </tr>
                  ))
                )}
              </tbody>
              </table>
            </div>
            <div className="crew-pagination">
              <div className="crew-pagination-info">
                Showing {startCrewItem}-{endCrewItem} of {totalCrewItems}
              </div>
              <div className="crew-pagination-actions">
                <button
                  type="button"
                  className="crew-pagination-btn"
                  disabled={effectiveCrewPage <= 1}
                  onClick={() => setCrewPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </button>
                {paginationPages.map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`crew-pagination-btn${pageNum === effectiveCrewPage ? " active" : ""}`}
                    onClick={() => setCrewPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  className="crew-pagination-btn"
                  disabled={effectiveCrewPage >= totalCrewPages}
                  onClick={() => setCrewPage((prev) => Math.min(totalCrewPages, prev + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <CustomModal
        show={isWizardOpen}
        closeModal={handleWizardClose}
        createModal
        className="modal fade crew-bulk-upload-modal"
        dialgName="modal-dialog modal-dialog-centered crew-bulk-upload-modal-dialog"
        header={
          <div className="crew-bulk-upload-wizard__header" style={{ "--card-color": cardColor }}>
            <div className="crew-bulk-upload-wizard__title-group">
              <div className="crew-bulk-upload-wizard__icon-badge" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L19 7V12C19 17 15.5 20.8 12 22C8.5 20.8 5 17 5 12V7L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h5 className="crew-bulk-upload-wizard__title">Crew Bulk Upload</h5>
                <p className="crew-bulk-upload-wizard__subtitle">Upload crew documents step by step — CG Pass and Zawil Pass are optional</p>
              </div>
            </div>
            <div className="crew-bulk-upload-wizard__header-meta">
              <span className="crew-bulk-upload-wizard__step-counter">Step {currentWizardStepNumber} of {totalWizardSteps}</span>
              <button
                type="button"
                onClick={handleWizardClose}
                aria-label="Close"
                className="crew-bulk-upload-wizard__close-btn"
              >
                <span>×</span>
              </button>
            </div>
          </div>
        }
        body={
          <div className="crew-bulk-upload-wizard__body" style={{ "--card-color": cardColor }}>
            {/* <p className="crew-bulk-upload-wizard__helper">
              Complete each step in order. Upcoming steps are locked until the current step is uploaded successfully.
            </p> */}
            {wizardWarning && (
              <div className="crew-bulk-upload-wizard__warning">
                {wizardWarning}
              </div>
            )}
            {activeStep && (
              <div className={`wizard-step-panel ${wizardTransitionClass}`}>
                <h4 className="wizard-step-panel__title">{activeStep.title}</h4>
                <p className="wizard-step-panel__description">{activeStep.description}</p>
                <div
                  className={`document-upload-zone crew-excel-upload-zone crew-wizard-upload-card ${isDraggingWizardUpload ? "dragging" : ""} ${activeStep.uploadedFile?.length ? "uploaded" : ""} ${activeStep.status === WIZARD_STEP_STATUS.ERROR ? "has-error" : ""}`}
                  onDragEnter={handleWizardDragEnter}
                  onDragOver={handleWizardDragOver}
                  onDragLeave={handleWizardDragLeave}
                  onDrop={handleWizardDrop}
                  onClick={() => {
                    if (activeStep.status === WIZARD_STEP_STATUS.ACTIVE || activeStep.status === WIZARD_STEP_STATUS.ERROR || activeStep.status === WIZARD_STEP_STATUS.COMPLETED) {
                      wizardStepFileInputRef.current?.click();
                    }
                  }}
                  style={{ "--card-color": cardColor }}
                >
                  <input
                    ref={wizardStepFileInputRef}
                    type="file"
                    className="file-input-hidden"
                    accept={activeStep.accepts}
                    multiple={activeStep.allowMultiple}
                    onChange={handleWizardFileInputChange}
                    disabled={activeStep.status === WIZARD_STEP_STATUS.LOCKED || isUploadingStep}
                  />
                  <div className="upload-zone-content">
                    {isUploadingStep ? (
                      <div className="crew-wizard-upload-state">
                        <span className="crew-wizard-upload-spinner" />
                        <p className="crew-wizard-upload-state__title">Uploading {activeStep.label} files...</p>
                        <p className="crew-wizard-upload-state__desc">Please keep this modal open while we process your upload.</p>
                      </div>
                    ) : activeStep.uploadedFile?.length ? (
                      <div className="crew-wizard-upload-state crew-wizard-upload-state--success">
                        <div className="crew-wizard-upload-state__icon" aria-hidden="true">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 7L10 17L5 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="crew-wizard-upload-state__title">{activeStep.uploadedFile.length} file(s) uploaded successfully</p>
                        <p className="crew-wizard-upload-state__desc">{activeStepFileNames.slice(0, 2).join(", ")}</p>
                        <span className="crew-wizard-upload-state__link">Replace file</span>
                      </div>
                    ) : (
                      <div className="crew-wizard-upload-state">
                        <div className="upload-icon-wrapper">
                          <UploadIconSVG />
                        </div>
                        <div className="upload-text-content">
                          <p className="upload-main-text crew-wizard-upload-main-text">
                            Drag and drop your {activeStep.label.toLowerCase()} files here, or{" "}
                            <span className="upload-link">click to browse</span>
                          </p>
                          <p className="upload-sub-text crew-wizard-upload-sub-text">Allowed formats: {activeStep.accepts}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {activeStep.optional && activeStep.status === WIZARD_STEP_STATUS.ACTIVE && !isUploadingStep && (
                  <div className="crew-wizard-optional-skip">
                    <button
                      type="button"
                      className="crew-wizard-btn crew-wizard-btn--ghost"
                      onClick={skipOptionalWizardStep}
                    >
                      Skip — no file needed
                    </button>
                  </div>
                )}
                {activeStep.status === WIZARD_STEP_STATUS.ERROR && activeStep.errorMessage && (
                  <div className="crew-wizard-inline-error">{activeStep.errorMessage}</div>
                )}
              </div>
            )}
          </div>
        }
        footer={
          <div className="crew-bulk-upload-wizard__footer">
            <div className="crew-wizard-stepper">
              <button
                type="button"
                onClick={() => {
                  const targetIndex = Math.max(0, activeStepIndex - 1);
                  if (targetIndex !== activeStepIndex) {
                    setWizardSlideDirection("backward");
                    setActiveStepIndex(targetIndex);
                  }
                }}
                disabled={activeStepIndex === 0}
                className="crew-wizard-nav-btn"
              >
                <span aria-hidden="true">←</span>
              </button>
              <div className="crew-wizard-stepper-track">
                {steps.map((step, index) => {
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => {
                        if (step.status === WIZARD_STEP_STATUS.COMPLETED || step.status === WIZARD_STEP_STATUS.ACTIVE || step.status === WIZARD_STEP_STATUS.ERROR) {
                          setWizardSlideDirection(index > activeStepIndex ? "forward" : "backward");
                          setActiveStepIndex(index);
                        }
                      }}
                      disabled={step.status === WIZARD_STEP_STATUS.LOCKED}
                      className={getWizardStepClass(step, index)}
                    >
                      <span className="crew-wizard-step-chip__icon">
                        {step.status === WIZARD_STEP_STATUS.COMPLETED ? "✓" : step.status === WIZARD_STEP_STATUS.ERROR ? "!" : index + 1}
                      </span>
                      <span className="crew-wizard-step-chip__label">{step.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  const targetIndex = Math.min(steps.length - 1, activeStepIndex + 1);
                  if (targetIndex !== activeStepIndex) {
                    const targetStep = steps[targetIndex];
                    if (targetStep.status !== WIZARD_STEP_STATUS.LOCKED) {
                      setWizardSlideDirection("forward");
                      setActiveStepIndex(targetIndex);
                    }
                  }
                }}
                disabled={activeStepIndex === steps.length - 1}
                className="crew-wizard-nav-btn"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <div className="crew-wizard-footer-bar">
              {isWizardCompleted ? (
                <p className="crew-wizard-footer-message is-success">Bulk upload is complete.</p>
              ) : (
                <p className="crew-wizard-footer-message">Current step: {activeStep?.label || "-"}</p>
              )}
              <div className="crew-wizard-footer-actions">
                <button
                  type="button"
                  onClick={handleWizardClose}
                  className="crew-wizard-btn crew-wizard-btn--ghost"
                >
                  Close
                </button>
                {isWizardCompleted && (
                  <button
                    type="button"
                    onClick={handleOpenCrewList}
                    className="crew-wizard-btn crew-wizard-btn--primary"
                  >
                    View Crew List
                  </button>
                )}
              </div>
            </div>
          </div>
        }
      />
    </>
  );
};

CrewContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onNavigateToTab: PropTypes.func,
  launchHireOnly: PropTypes.bool,
};

export default CrewContent;

