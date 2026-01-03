import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { YesIcon, NoIcon } from "./Husbandry.components";
import CustomModal from "../../../../components/CustomModal";
import "../../../../design/scss/operations.scss";

// Status colors
const STATUS_COLORS = {
  done: "#28a745", // Green - Completed
  inProgress: "#ffc107", // Yellow - In Progress
  rejected: "#dc3545", // Red - Rejected
  pending: "#6c757d" // Gray (default)
};

// Status labels
const STATUS_LABELS = {
  done: "DONE",
  inProgress: "IN PROGRESS",
  rejected: "PENDING/TODO",
  pending: "PENDING"
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
      const nationalityIndex = getColumnIndex(["nationality", "country", "nation"]);
      const rankIndex = getColumnIndex(["rank", "position", "designation", "job"]);
      const passportIndex = getColumnIndex(["passport", "passport no", "passport number", "passportno"]);

      return {
        id: index + 1,
        crewName: crewNameIndex !== -1 ? (row[crewNameIndex] || `Crew Member ${index + 1}`) : `Crew Member ${index + 1}`,
        nationality: nationalityIndex !== -1 ? row[nationalityIndex] || "N/A" : "N/A",
        rank: rankIndex !== -1 ? row[rankIndex] || "N/A" : "N/A",
        passportNo: passportIndex !== -1 ? row[passportIndex] || `P${String(1000000 + index).padStart(7, '0')}` : `P${String(1000000 + index).padStart(7, '0')}`,
        transport: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        cgPass: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        zawilPass: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        hotel: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        launchHire: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        medicalService: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        visa: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        passport: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
        iqama: ["done", "inProgress", "rejected"][Math.floor(Math.random() * 3)],
      };
    });

  return crewData;
};

const CrewContent = ({ formValues, handleChange, cardColor, onNavigateToTab, launchHireOnly = false }) => {
  const crewList = formValues.crewList || [];
  const [selectedCrewIds, setSelectedCrewIds] = useState([]);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  // Check if documents are already uploaded from formValues
  const hasCrewList = formValues.crewList && formValues.crewList.length > 0;

  const [isFileUploaded, setIsFileUploaded] = useState(hasCrewList);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(formValues.crewUploadedFileName || "");
  const fileInputRef = useRef(null);

  // Bulk Passport and Visa modal states
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [showIqamaModal, setShowIqamaModal] = useState(false);
  const [isDraggingPassport, setIsDraggingPassport] = useState(false);
  const [isDraggingVisa, setIsDraggingVisa] = useState(false);
  const [isDraggingIqama, setIsDraggingIqama] = useState(false);
  const [passportFiles, setPassportFiles] = useState(formValues.crewPassportFiles || []);
  const [visaFiles, setVisaFiles] = useState(formValues.crewVisaFiles || []);
  const [iqamaFiles, setIqamaFiles] = useState(formValues.crewIqamaFiles || []);
  const passportFileInputRef = useRef(null);
  const visaFileInputRef = useRef(null);
  const iqamaFileInputRef = useRef(null);

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

  const displayCrewList = crewList.length > 0 ? crewList : [];

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
    { value: "medicalService", label: "Medical Service", tab: "medicalService", field: "medicalServiceSelectedCrew" },
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
  const handleFileUpload = (file) => {
    if (!file) return;

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

        // Always show crew list regardless of data validation
        const syntheticEvent = { target: { value: crewData } };
        handleChange("crewList")(syntheticEvent);
        setIsFileUploaded(true);
        setUploadedFileName(file.name);
        // Save uploaded file name to formValues
        const fileNameEvent = { target: { value: file.name } };
        handleChange("crewUploadedFileName")(fileNameEvent);
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

  // Handle download preview Excel
  const handleDownloadPreview = () => {
    // Create worksheet data with headers
    const headers = ["No", "Name", "Company", "Rank", "Nationality", "Passport Number", "Passport Expiry", "KSA Visa Number", "IQAMA"];

    // Create data rows from crew list or dummy data template
    let dataRows = [];

    if (displayCrewList.length > 0) {
      // Use actual crew data
      dataRows = displayCrewList.map((crew, index) => [
        index + 1, // No
        crew.crewName || "", // Name
        crew.company || "", // Company (if exists in data)
        crew.rank || "", // Rank
        crew.nationality || "", // Nationality
        crew.passportNo || "", // Passport Number
        crew.passportExpiry || "", // Passport Expiry (if exists in data)
        crew.ksaVisaNumber || "", // KSA Visa Number (if exists in data)
        crew.iqamaNumber || "", // IQAMA (if exists in data)
      ]);
    } else {
      // Add dummy data for preview
      const dummyData = [
        [1, "John Smith", "ABC Shipping Co.", "Captain", "British", "P1234567", "2025-12-31", "V123456789", "IQ123456"],
        [2, "Ahmed Al-Mansouri", "XYZ Maritime", "Chief Engineer", "Saudi", "P2345678", "2026-06-30", "V234567890", "IQ234567"],
        [3, "Maria Garcia", "Global Vessels Ltd", "First Officer", "Spanish", "P3456789", "2025-09-15", "V345678901", "IQ345678"],
        [4, "David Chen", "Pacific Shipping", "Second Engineer", "Chinese", "P4567890", "2026-03-20", "V456789012", "IQ456789"],
        [5, "Fatima Hassan", "Middle East Marine", "Deck Officer", "Egyptian", "P5678901", "2025-11-10", "V567890123", "IQ567890"],
      ];
      dataRows = dummyData;
    }

    // Combine headers and data
    const worksheetData = [headers, ...dataRows];

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 20 }, // Name
      { wch: 20 }, // Company
      { wch: 15 }, // Rank
      { wch: 15 }, // Nationality
      { wch: 18 }, // Passport Number
      { wch: 18 }, // Passport Expiry
      { wch: 18 }, // KSA Visa Number
      { wch: 15 }, // IQAMA
    ];
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Crew Preview");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `Crew_Preview_${timestamp}.xlsx`;

    // Download the file
    XLSX.writeFile(wb, filename);
  };

  const handleViewCrew = (id) => {
    // Handle view action - can be implemented later
    console.log("View crew:", id);
    // You can add a modal or navigation here
  };



  // Determine what to show based on upload progress
  const showCrewList = isFileUploaded;

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

  // Handle passport drag and drop
  const handlePassportDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPassport(true);
  };

  const handlePassportDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPassport(false);
  };

  const handlePassportDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePassportDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPassport(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handlePassportBulkUpload(files);
    }
  };

  // Handle visa drag and drop
  const handleVisaDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVisa(true);
  };

  const handleVisaDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVisa(false);
  };

  const handleVisaDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleVisaDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingVisa(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleVisaBulkUpload(files);
    }
  };

  // Handle iqama drag and drop

  const handleIqamaDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIqama(true);
  };

  const handleIqamaDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIqama(false);
  };

  const handleIqamaDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleIqamaDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingIqama(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleIqamaBulkUpload(files);
    }
  };

  // Handle passport file input change
  const handlePassportFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handlePassportBulkUpload(files);
    }
    if (passportFileInputRef.current) {
      passportFileInputRef.current.value = "";
    }
  };

  // Handle visa file input change
  const handleVisaFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleVisaBulkUpload(files);
    }
    if (visaFileInputRef.current) {
      visaFileInputRef.current.value = "";
    }
  };

  // Handle iqama file input change
  const handleIqamaFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleIqamaBulkUpload(files);
    }
    if (iqamaFileInputRef.current) {
      iqamaFileInputRef.current.value = "";
    }
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

  return (
    <>
      {!showCrewList ? (
        // Crew Excel Upload Section
        <div className="crew-upload-sections-container" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          padding: "40px 24px",
          maxWidth: "800px",
          margin: "0 auto",
          width: "100%"
        }}>
          {/* Crew Excel Upload */}
          <div className="crew-upload-section" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Header above upload zone with Download Preview button */}
            <div style={{
              textAlign: "center",
              marginBottom: "24px",
              width: "100%",
              position: "relative"
            }}>
              {/* Download Preview Button - Positioned at top right of header */}
              <button
                type="button"
                onClick={handleDownloadPreview}
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid #e2e6ff",
                  backgroundColor: "#ffffff",
                  color: "#1a1a1a",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9ff";
                  e.currentTarget.style.borderColor = "var(--card-color, #2A00FF)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.borderColor = "#e2e6ff";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Download Preview</span>
              </button>

              <h3 style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1a1a1a",
                margin: "0 0 8px 0",
                fontFamily: "Inter, sans-serif"
              }}>
                Upload Crew Excel File
              </h3>
              <p style={{
                fontSize: "14px",
                color: "#666",
                margin: "0",
                fontFamily: "Inter, sans-serif"
              }}>
                Please upload your crew data in Excel format
              </p>
            </div>

            <div
              className={`document-upload-zone crew-excel-upload-zone ${isDragging ? "dragging" : ""} ${isFileUploaded ? "uploaded" : ""}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadZoneClick}
              style={{
                "--card-color": cardColor,
                maxWidth: "600px",
                width: "100%",
                height: "240px",
                margin: "0 auto"
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="file-input-hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
              />
              <div className="upload-zone-content">
                {isFileUploaded ? (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#28a745",
                        margin: "0 0 8px 0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        ✓ File Uploaded Successfully
                      </p>
                      <p style={{
                        fontSize: "14px",
                        color: "#666",
                        margin: "0 0 4px 0",
                        fontFamily: "Inter, sans-serif",
                        wordBreak: "break-word"
                      }}>
                        {uploadedFileName}
                      </p>
                      <p style={{
                        fontSize: "12px",
                        color: "#999",
                        margin: "0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        Click to upload a different file
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon-wrapper">
                      <UploadIconSVG />
                    </div>
                    <div className="upload-text-content">
                      <p className="upload-main-text">
                        Drag and drop your crew Excel file here, or{" "}
                        <span className="upload-link">click to browse</span>
                      </p>
                      <p className="upload-sub-text">Supports .xlsx, .xls, and .csv file formats</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
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
                fontFamily: "Inter, sans-serif",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }} title="CREW LIST">
                <span className="crew-list-title-bar" style={{
                  width: "4px",
                  height: "24px",
                  backgroundColor: "var(--card-color, #2A00FF)",
                  borderRadius: "2px",
                  display: "inline-block",
                  flexShrink: 0
                }}></span>
                CREW LIST
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
                      fontFamily: "Inter, sans-serif",
                      whiteSpace: "nowrap"
                    }}
                    title={uploadedFileName}
                  >
                    {uploadedFileName.length > 6 ? `${uploadedFileName.substring(0, 6)}..` : uploadedFileName}
                  </span>
                </div>
              )} */}
              <Tooltip id="upload-new-file-btn" place="top" content="Upload New File" />
              <button
                type="button"
                onClick={() => {
                  setIsFileUploaded(false);
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
                  fontFamily: "Inter, sans-serif",
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
                    if (e.target.value === "passport") {
                      setShowPassportModal(true);
                    } else if (e.target.value === "visa") {
                      setShowVisaModal(true);
                    } else if (e.target.value === "iqama") {
                      setShowIqamaModal(true);
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
                    fontFamily: "Inter, sans-serif",
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
                  <option value="iqama">Iqama</option>
                </select>
              </div>
              {showActionDropdown && launchHireOnly && (
                <>
                  <Tooltip id="launch-hire-btn" place="top" content="Launch Hire" />
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
                      fontFamily: "Inter, sans-serif",
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
              <Tooltip id="select-all-btn" place="top" content={selectedCrewIds.length === displayCrewList.length ? "Deselect All" : "Select All"} />
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
                  fontFamily: "Inter, sans-serif",
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
          <div className="table-wrapper table-responsive crew-table-container">
            <table className="table table-striped crew-table" style={{ "--card-color": "#e2e6ff", tableLayout: "fixed", width: "100%" }}>
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
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Crew Name
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Nationality
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Rank
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Passport
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Iqama
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Visa
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    CG Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Zawil Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Transport
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Hotel
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 11)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>
                    Medical Service
                  </th>
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {displayCrewList.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                      No crew data found. Please upload a valid Excel file.
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
                            <Tooltip id={`passport-upload-${crew.id}`} place="right" content={passportDocuments[crew.id] ? `Uploaded: ${passportDocuments[crew.id].fileName}` : "Upload Passport Document"} />
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
                                color: passportDocuments[crew.id] ? STATUS_COLORS.done : STATUS_COLORS.rejected,
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
                            <Tooltip id={`iqama-upload-${crew.id}`} place="right" content={iqamaDocuments[crew.id] ? `Uploaded: ${iqamaDocuments[crew.id].fileName}` : "Upload Iqama Document"} />
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
                                color: iqamaDocuments[crew.id] ? STATUS_COLORS.done : STATUS_COLORS.rejected,
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
                            <Tooltip id={`visa-upload-${crew.id}`} place="right" content={visaDocuments[crew.id] ? `Uploaded: ${visaDocuments[crew.id].fileName}` : "Upload Visa Document"} />
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
                                color: visaDocuments[crew.id] ? STATUS_COLORS.done : STATUS_COLORS.rejected,
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
                            <Tooltip id={`cg-pass-upload-${crew.id}`} place="right" content={cgPassDocuments[crew.id] ? `Uploaded: ${cgPassDocuments[crew.id].fileName}` : "Upload CG Pass Document"} />
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
                                color: cgPassDocuments[crew.id] ? STATUS_COLORS.done : STATUS_COLORS.rejected,
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
                            <Tooltip id={`zawil-pass-upload-${crew.id}`} place="right" content={zawilPassDocuments[crew.id] ? `Uploaded: ${zawilPassDocuments[crew.id].fileName}` : "Upload Zawil Pass Document"} />
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
                                color: zawilPassDocuments[crew.id] ? STATUS_COLORS.done : STATUS_COLORS.rejected,
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
                          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                          data-tooltip-id={`transport-status-${crew.id}`}
                          data-tooltip-content={`Transport: ${STATUS_LABELS[crew.transport] || STATUS_LABELS.pending}`}
                        >
                          <StatusIcon status={crew.transport} IconComponent={CarIcon} size={20} />
                        </div>
                        <Tooltip id={`transport-status-${crew.id}`} place="right" />
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div
                          className="crew-table-cell crew-status-icon"
                          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                          data-tooltip-id={`hotel-status-${crew.id}`}
                          data-tooltip-content={`Hotel: ${STATUS_LABELS[crew.hotel] || STATUS_LABELS.pending}`}
                        >
                          <StatusIcon status={crew.hotel} IconComponent={HotelIcon} size={20} />
                        </div>
                        <Tooltip id={`hotel-status-${crew.id}`} place="right" />
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div
                          className="crew-table-cell crew-status-icon"
                          style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                          data-tooltip-id={`medical-status-${crew.id}`}
                          data-tooltip-content={`Medical Service: ${STATUS_LABELS[crew.medicalService] || STATUS_LABELS.pending}`}
                        >
                          <StatusIcon status={crew.medicalService} IconComponent={MedicalIcon} size={20} />
                        </div>
                        <Tooltip id={`medical-status-${crew.id}`} place="right" />
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
        </>
      )}

      {/* Bulk Passport Upload Modal */}
      <CustomModal
        show={showPassportModal}
        closeModal={() => setShowPassportModal(false)}
        createModal
        className="modal fade"
        dialgName="modal-dialog modal-dialog-centered"
        header={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "16px 24px", borderBottom: "1px solid #e2e2ea" }}>
            <h5 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a1a1a", fontFamily: "Inter, sans-serif" }}>
              Bulk Passport Upload
            </h5>
            <button
              onClick={() => setShowPassportModal(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#999",
                cursor: "pointer",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
                e.currentTarget.style.color = "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#999";
              }}
            >
              ×
            </button>
          </div>
        }
        body={
          <div style={{ padding: "32px", "--card-color": cardColor }}>
            <div
              className={`document-upload-zone crew-excel-upload-zone ${isDraggingPassport ? "dragging" : ""} ${passportFiles.length > 0 ? "uploaded" : ""}`}
              onDragEnter={handlePassportDragEnter}
              onDragOver={handlePassportDragOver}
              onDragLeave={handlePassportDragLeave}
              onDrop={handlePassportDrop}
              onClick={() => passportFileInputRef.current?.click()}
              style={{
                "--card-color": cardColor,
                maxWidth: "600px",
                width: "100%",
                height: "240px",
                margin: "0 auto"
              }}
            >
              <input
                ref={passportFileInputRef}
                type="file"
                className="file-input-hidden"
                accept="*/*"
                multiple
                onChange={handlePassportFileInputChange}
              />
              <div className="upload-zone-content">
                {passportFiles.length > 0 ? (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#28a745",
                        margin: "0 0 8px 0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        ✓ {passportFiles.length} file(s) uploaded successfully
                      </p>
                      <p style={{
                        fontSize: "12px",
                        color: "#999",
                        margin: "0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        Click to upload different files
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon-wrapper">
                      <UploadIconSVG />
                    </div>
                    <div className="upload-text-content">
                      <p className="upload-main-text">
                        Drag and drop your passport files here, or{" "}
                        <span className="upload-link">click to browse</span>
                      </p>
                      <p className="upload-sub-text">Supports all file formats</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        }
        footer={
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e2ea", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              onClick={() => setShowPassportModal(false)}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid #e2e2ea",
                backgroundColor: "#ffffff",
                color: "#1a1a1a",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "Inter, sans-serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              Close
            </button>
          </div>
        }
      />

      {/* Bulk Visa Upload Modal */}
      <CustomModal
        show={showVisaModal}
        closeModal={() => setShowVisaModal(false)}
        createModal
        className="modal fade"
        dialgName="modal-dialog modal-dialog-centered"
        header={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "16px 24px", borderBottom: "1px solid #e2e2ea" }}>
            <h5 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a1a1a", fontFamily: "Inter, sans-serif" }}>
              Bulk Visa Upload
            </h5>
            <button
              onClick={() => setShowVisaModal(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#999",
                cursor: "pointer",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
                e.currentTarget.style.color = "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#999";
              }}
            >
              ×
            </button>
          </div>
        }
        body={
          <div style={{ padding: "32px", "--card-color": cardColor }}>
            <div
              className={`document-upload-zone crew-excel-upload-zone ${isDraggingVisa ? "dragging" : ""} ${visaFiles.length > 0 ? "uploaded" : ""}`}
              onDragEnter={handleVisaDragEnter}
              onDragOver={handleVisaDragOver}
              onDragLeave={handleVisaDragLeave}
              onDrop={handleVisaDrop}
              onClick={() => visaFileInputRef.current?.click()}
              style={{
                "--card-color": cardColor,
                maxWidth: "600px",
                width: "100%",
                height: "240px",
                margin: "0 auto"
              }}
            >
              <input
                ref={visaFileInputRef}
                type="file"
                className="file-input-hidden"
                accept="*/*"
                multiple
                onChange={handleVisaFileInputChange}
              />
              <div className="upload-zone-content">
                {visaFiles.length > 0 ? (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#28a745",
                        margin: "0 0 8px 0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        ✓ {visaFiles.length} file(s) uploaded successfully
                      </p>
                      <p style={{
                        fontSize: "12px",
                        color: "#999",
                        margin: "0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        Click to upload different files
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon-wrapper">
                      <UploadIconSVG />
                    </div>
                    <div className="upload-text-content">
                      <p className="upload-main-text">
                        Drag and drop your visa files here, or{" "}
                        <span className="upload-link">click to browse</span>
                      </p>
                      <p className="upload-sub-text">Supports all file formats</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        }
        footer={
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e2ea", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              onClick={() => setShowVisaModal(false)}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid #e2e2ea",
                backgroundColor: "#ffffff",
                color: "#1a1a1a",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "Inter, sans-serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              Close
            </button>
          </div>
        }
      />

      {/* Bulk Iqama Upload Modal */}
      <CustomModal
        show={showIqamaModal}
        closeModal={() => setShowIqamaModal(false)}
        createModal
        className="modal fade"
        dialgName="modal-dialog modal-dialog-centered"
        header={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "16px 24px", borderBottom: "1px solid #e2e2ea" }}>
            <h5 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#1a1a1a", fontFamily: "Inter, sans-serif" }}>
              Bulk Iqama Upload
            </h5>
            <button
              onClick={() => setShowIqamaModal(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#999",
                cursor: "pointer",
                padding: "0",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
                e.currentTarget.style.color = "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#999";
              }}
            >
              ×
            </button>
          </div>
        }
        body={
          <div style={{ padding: "32px", "--card-color": cardColor }}>
            <div
              className={`document-upload-zone crew-excel-upload-zone ${isDraggingIqama ? "dragging" : ""} ${iqamaFiles.length > 0 ? "uploaded" : ""}`}
              onDragEnter={handleIqamaDragEnter}
              onDragOver={handleIqamaDragOver}
              onDragLeave={handleIqamaDragLeave}
              onDrop={handleIqamaDrop}
              onClick={() => iqamaFileInputRef.current?.click()}
              style={{
                "--card-color": cardColor,
                maxWidth: "600px",
                width: "100%",
                height: "240px",
                margin: "0 auto"
              }}
            >
              <input
                ref={iqamaFileInputRef}
                type="file"
                className="file-input-hidden"
                accept="*/*"
                multiple
                onChange={handleIqamaFileInputChange}
              />
              <div className="upload-zone-content">
                {iqamaFiles.length > 0 ? (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px"
                  }}>
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                    }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#28a745",
                        margin: "0 0 8px 0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        ✓ {iqamaFiles.length} file(s) uploaded successfully
                      </p>
                      <p style={{
                        fontSize: "12px",
                        color: "#999",
                        margin: "0",
                        fontFamily: "Inter, sans-serif"
                      }}>
                        Click to upload different files
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon-wrapper">
                      <UploadIconSVG />
                    </div>
                    <div className="upload-text-content">
                      <p className="upload-main-text">
                        Drag and drop your iqama files here, or{" "}
                        <span className="upload-link">click to browse</span>
                      </p>
                      <p className="upload-sub-text">Supports all file formats</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        }
        footer={
          <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e2ea", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button
              onClick={() => setShowIqamaModal(false)}
              style={{
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid #e2e2ea",
                backgroundColor: "#ffffff",
                color: "#1a1a1a",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "Inter, sans-serif"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              Close
            </button>
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

