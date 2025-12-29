import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { YesIcon, NoIcon } from "./Husbandry.components";
import CustomModal from "../../../../components/CustomModal";
import "../../../../design/scss/operations.scss";

// Status colors
const STATUS_COLORS = {
  done: "#28a745", // Green
  inProgress: "#ffc107", // Yellow
  rejected: "#dc3545", // Red
  pending: "#6c757d" // Gray (default)
};

// Icon components for column headers
const PassportIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VisaIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const CGPassIcon = ({ size = 20, color = "#666" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color }}>
    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
        transport: "pending", // "done", "inProgress", "rejected", "pending"
        cgPass: "pending",
        zawilPass: "pending",
        hotel: "pending",
        launchHire: "pending",
        medicalService: "pending",
        visa: "pending",
        passport: "pending",
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
  const [isDraggingPassport, setIsDraggingPassport] = useState(false);
  const [isDraggingVisa, setIsDraggingVisa] = useState(false);
  const [passportFiles, setPassportFiles] = useState(formValues.crewPassportFiles || []);
  const [visaFiles, setVisaFiles] = useState(formValues.crewVisaFiles || []);
  const passportFileInputRef = useRef(null);
  const visaFileInputRef = useRef(null);

  // Individual passport and visa documents per crew member
  const [passportDocuments, setPassportDocuments] = useState(formValues.crewPassportDocuments || {});
  const [visaDocuments, setVisaDocuments] = useState(formValues.crewVisaDocuments || {});
  const [cgPassDocuments, setCgPassDocuments] = useState(formValues.crewCgPassDocuments || {});
  const [zawilPassDocuments, setZawilPassDocuments] = useState(formValues.crewZawilPassDocuments || {});
  const passportFileInputRefs = useRef({});
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
            {/* Header above upload zone */}
            <div style={{
              textAlign: "center",
              marginBottom: "24px",
              width: "100%"
            }}>
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
                gap: "12px"
              }}>
                <span className="crew-list-title-bar" style={{
                  width: "4px",
                  height: "24px",
                  backgroundColor: "var(--card-color, #2A00FF)",
                  borderRadius: "2px",
                  display: "inline-block"
                }}></span>
                CREW LIST
              </h3>
              {uploadedFileName && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  backgroundColor: "#f8f9ff",
                  borderRadius: "8px",
                  border: "1px solid #e2e6ff"
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V8H20" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{
                    fontSize: "13px",
                    color: "#666",
                    fontWeight: "500",
                    fontFamily: "Inter, sans-serif",
                    maxWidth: "300px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {uploadedFileName}
                  </span>
                </div>
              )}
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
                  gap: "8px"
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Upload New File
              </button>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => setShowPassportModal(true)}
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
                  gap: "8px"
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Bulk Passport
              </button>
              <button
                type="button"
                onClick={() => setShowVisaModal(true)}
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
                  gap: "8px"
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Bulk Visa
              </button>
              {showActionDropdown && (
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
              <button
                type="button"
                onClick={handleSelectAll}
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
                  fontFamily: "Inter, sans-serif"
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
                {selectedCrewIds.length === displayCrewList.length ? "Deselect All" : "Select All"}
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
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Crew Name">
                    Crew Name
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Nationality">
                    Nationality
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Rank">
                    Rank
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Passport">
                    Passport
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Visa">
                    Visa
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="CG Pass">
                    CG Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Zawil Pass">
                    Zawil Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Transport">
                    Transport
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Hotel">
                    Hotel
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 10)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Medical Service">
                    Medical Service
                  </th>
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {displayCrewList.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
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
                            <button
                              type="button"
                              onClick={() => passportFileInputRefs.current[crew.id]?.click()}
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
                              title={passportDocuments[crew.id] ? `Uploaded: ${passportDocuments[crew.id].fileName}` : "Upload Passport Document"}
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
                            {crew.passport && (
                              <StatusIcon status={crew.passport} IconComponent={PassportIcon} size={14} />
                            )}
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
                            <button
                              type="button"
                              onClick={() => visaFileInputRefs.current[crew.id]?.click()}
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
                              title={visaDocuments[crew.id] ? `Uploaded: ${visaDocuments[crew.id].fileName}` : "Upload Visa Document"}
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
                            {crew.visa && (
                              <StatusIcon status={crew.visa} IconComponent={VisaIcon} size={14} />
                            )}
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
                            <button
                              type="button"
                              onClick={() => cgPassFileInputRefs.current[crew.id]?.click()}
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
                              title={cgPassDocuments[crew.id] ? `Uploaded: ${cgPassDocuments[crew.id].fileName}` : "Upload CG Pass Document"}
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
                            {crew.cgPass && (
                              <StatusIcon status={crew.cgPass} IconComponent={CGPassIcon} size={14} />
                            )}
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
                            <button
                              type="button"
                              onClick={() => zawilPassFileInputRefs.current[crew.id]?.click()}
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
                              title={zawilPassDocuments[crew.id] ? `Uploaded: ${zawilPassDocuments[crew.id].fileName}` : "Upload Zawil Pass Document"}
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
                            {crew.zawilPass && (
                              <StatusIcon status={crew.zawilPass} IconComponent={CGPassIcon} size={14} />
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell crew-status-icon" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <StatusIcon status={crew.transport} IconComponent={CarIcon} size={20} />
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell crew-status-icon" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <StatusIcon status={crew.hotel} IconComponent={HotelIcon} size={20} />
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell crew-status-icon" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <StatusIcon status={crew.medicalService} IconComponent={MedicalIcon} size={20} />
                        </div>
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

