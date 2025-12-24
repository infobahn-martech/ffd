import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { YesIcon, NoIcon } from "./Husbandry.components";
import "../../../../design/scss/operations.scss";

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
        transport: false,
        cgPass: false,
        zawilPass: false,
        hotel: false,
        launchHire: false,
        medicalService: false,
        visa: false,
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
  const hasPassportFiles = formValues.crewPassportFiles && formValues.crewPassportFiles.length > 0;
  const hasVisaFiles = formValues.crewVisaFiles && formValues.crewVisaFiles.length > 0;
  
  const [isFileUploaded, setIsFileUploaded] = useState(hasCrewList);
  const [isPassportBulkUploaded, setIsPassportBulkUploaded] = useState(hasPassportFiles);
  const [isVisaBulkUploaded, setIsVisaBulkUploaded] = useState(hasVisaFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingPassport, setIsDraggingPassport] = useState(false);
  const [isDraggingVisa, setIsDraggingVisa] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(formValues.crewUploadedFileName || "");
  const [passportBulkFiles, setPassportBulkFiles] = useState(formValues.crewPassportFiles || []);
  const [visaBulkFiles, setVisaBulkFiles] = useState(formValues.crewVisaFiles || []);
  const fileInputRef = useRef(null);
  const passportBulkFileInputRef = useRef(null);
  const visaBulkFileInputRef = useRef(null);
  const [passportDocuments, setPassportDocuments] = useState({});
  const [visaDocuments, setVisaDocuments] = useState({});
  const passportFileInputRefs = useRef({});
  const visaFileInputRefs = useRef({});

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

  // Handle passport bulk upload
  const handlePassportBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setPassportBulkFiles(fileArray);
    setIsPassportBulkUploaded(true);
    // Save passport files to formValues
    const syntheticEvent = { target: { value: fileArray.map(f => ({ name: f.name, file: f, size: f.size, type: f.type })) } };
    handleChange("crewPassportFiles")(syntheticEvent);

    // Map files to crew members (assuming file names match passport numbers or crew names)
    // For now, we'll just store the files
    const passportFilesMap = {};
    fileArray.forEach((file) => {
      // Try to match file to crew member by name or passport number
      const fileName = file.name.toLowerCase();
      const matchedCrew = crewList.find((crew) => {
        const crewName = (crew.crewName || "").toLowerCase();
        const passportNo = (crew.passportNo || "").toLowerCase();
        return fileName.includes(crewName) || fileName.includes(passportNo);
      });

      if (matchedCrew) {
        passportFilesMap[matchedCrew.id] = {
          file,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
        };
      }
    });

    setPassportDocuments((prev) => ({ ...prev, ...passportFilesMap }));
  };

  // Handle visa bulk upload
  const handleVisaBulkUpload = (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    setVisaBulkFiles(fileArray);
    setIsVisaBulkUploaded(true);
    // Save visa files to formValues
    const syntheticEvent = { target: { value: fileArray.map(f => ({ name: f.name, file: f, size: f.size, type: f.type })) } };
    handleChange("crewVisaFiles")(syntheticEvent);

    // Map files to crew members
    const visaFilesMap = {};
    fileArray.forEach((file) => {
      const fileName = file.name.toLowerCase();
      const matchedCrew = crewList.find((crew) => {
        const crewName = (crew.crewName || "").toLowerCase();
        const passportNo = (crew.passportNo || "").toLowerCase();
        return fileName.includes(crewName) || fileName.includes(passportNo);
      });

      if (matchedCrew) {
        visaFilesMap[matchedCrew.id] = {
          file,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
        };
      }
    });

    setVisaDocuments((prev) => ({ ...prev, ...visaFilesMap }));
  };

  // Handle Excel file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle passport bulk file input change
  const handlePassportBulkFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handlePassportBulkUpload(files);
    }
    if (passportBulkFileInputRef.current) {
      passportBulkFileInputRef.current.value = "";
    }
  };

  // Handle visa bulk file input change
  const handleVisaBulkFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleVisaBulkUpload(files);
    }
    if (visaBulkFileInputRef.current) {
      visaBulkFileInputRef.current.value = "";
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

  // Handle drag and drop for Passport bulk upload
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

  // Handle drag and drop for Visa bulk upload
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

  // Handle upload zone click
  const handleUploadZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handlePassportBulkUploadZoneClick = () => {
    passportBulkFileInputRef.current?.click();
  };

  const handleVisaBulkUploadZoneClick = () => {
    visaBulkFileInputRef.current?.click();
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

  // Handle passport document upload
  const handlePassportUpload = (crewId, file) => {
    if (!file) return;
    setPassportDocuments((prev) => ({
      ...prev,
      [crewId]: {
        file,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      },
    }));
  };

  // Handle visa document upload
  const handleVisaUpload = (crewId, file) => {
    if (!file) return;
    setVisaDocuments((prev) => ({
      ...prev,
      [crewId]: {
        file,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
      },
    }));
  };

  // Upload icon component
  const UploadIcon = ({ size = 20, color = "#00368c" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
    >
      <path
        d="M12 15V3M12 3L8 7M12 3L16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Determine what to show based on upload progress
  const showCrewList = isFileUploaded && isPassportBulkUploaded && isVisaBulkUploaded;

  // Shared upload icon component
  const UploadIconSVG = () => (
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "#00368c" }}
    >
      <path
        d="M12 15V3M12 3L8 7M12 3L16 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L2 18C2 19.1046 2.89543 20 4 20L20 20C21.1046 20 22 19.1046 22 18L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 11L12 6L17 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="cardform-left-full crew-content-wrapper" style={{ "--card-color": cardColor }}>
      {!showCrewList ? (
        // All three upload sections in triangular layout
        <div className="crew-upload-sections-container" style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "24px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {/* Crew Excel Upload - Top (Full Width) */}
          <div className="crew-upload-section" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
            <div
              className={`document-upload-zone ${isDragging ? "dragging" : ""} ${isFileUploaded ? "uploaded" : ""}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadZoneClick}
              style={{
                "--card-color": cardColor,
                opacity: isFileUploaded ? 0.7 : 1,
                border: isFileUploaded ? "2px solid #28a745" : undefined
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="file-input-hidden"
                accept="*/*"
                onChange={handleFileInputChange}
              />
              <div className="upload-zone-content">
                <div className="upload-icon-wrapper">
                  <UploadIconSVG />
                </div>
                <div className="upload-text-content">
                  <p className="upload-main-text">
                    {isFileUploaded ? (
                      <>
                        <span style={{ color: "#28a745" }}>✓ {uploadedFileName}</span>
                        <br />
                        <span style={{ fontSize: "12px", color: "#666" }}>Click to upload a different file</span>
                      </>
                    ) : (
                      <>
                        Drag and drop your crew Excel file here, or{" "}
                        <span className="upload-link">click to browse</span>
                      </>
                    )}
                  </p>
                  {!isFileUploaded && <p className="upload-sub-text">Supports all file formats</p>}
                </div>
              </div>
            </div>
            {/* Header outside upload zone, centered */}
            <div style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#1a1a1a"
            }}>
              Crew Excel File {isFileUploaded && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓</span>}
            </div>
          </div>

          {/* Bottom Row - Passport and Visa Side by Side */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            width: "100%"
          }}>
            {/* Passport Bulk Upload */}
            <div className="crew-upload-section" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
              <div
                className={`document-upload-zone ${isDraggingPassport ? "dragging" : ""} ${isPassportBulkUploaded ? "uploaded" : ""}`}
                onDragEnter={handlePassportDragEnter}
                onDragOver={handlePassportDragOver}
                onDragLeave={handlePassportDragLeave}
                onDrop={handlePassportDrop}
                onClick={handlePassportBulkUploadZoneClick}
                style={{
                  "--card-color": cardColor,
                  opacity: isPassportBulkUploaded ? 0.7 : 1,
                  border: isPassportBulkUploaded ? "2px solid #28a745" : undefined
                }}
              >
                <input
                  ref={passportBulkFileInputRef}
                  type="file"
                  className="file-input-hidden"
                  accept="*/*"
                  multiple
                  onChange={handlePassportBulkFileInputChange}
                />
                <div className="upload-zone-content">
                  <div className="upload-icon-wrapper">
                    <UploadIconSVG />
                  </div>
                  <div className="upload-text-content">
                    <p className="upload-main-text">
                      {isPassportBulkUploaded ? (
                        <>
                          <span style={{ color: "#28a745" }}>✓ {passportBulkFiles.length} file(s) uploaded</span>
                          <br />
                          <span style={{ fontSize: "12px", color: "#666" }}>Click to upload different files</span>
                        </>
                      ) : (
                        <>
                          Drag and drop your Passport files here, or{" "}
                          <span className="upload-link">click to browse</span>
                        </>
                      )}
                    </p>
                    {!isPassportBulkUploaded && <p className="upload-sub-text">Supports all file formats</p>}
                  </div>
                </div>
              </div>
              {/* Header outside upload zone, centered */}
              <div style={{
                textAlign: "center",
                marginTop: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a1a1a"
              }}>
                Passport Files {isPassportBulkUploaded && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓</span>}
              </div>
            </div>

            {/* Visa Bulk Upload */}
            <div className="crew-upload-section" style={{ width: "100%", display: "flex", flexDirection: "column" }}>
              <div
                className={`document-upload-zone ${isDraggingVisa ? "dragging" : ""} ${isVisaBulkUploaded ? "uploaded" : ""}`}
                onDragEnter={handleVisaDragEnter}
                onDragOver={handleVisaDragOver}
                onDragLeave={handleVisaDragLeave}
                onDrop={handleVisaDrop}
                onClick={handleVisaBulkUploadZoneClick}
                style={{
                  "--card-color": cardColor,
                  opacity: isVisaBulkUploaded ? 0.7 : 1,
                  border: isVisaBulkUploaded ? "2px solid #28a745" : undefined
                }}
              >
                <input
                  ref={visaBulkFileInputRef}
                  type="file"
                  className="file-input-hidden"
                  accept="*/*"
                  multiple
                  onChange={handleVisaBulkFileInputChange}
                />
                <div className="upload-zone-content">
                  <div className="upload-icon-wrapper">
                    <UploadIconSVG />
                  </div>
                  <div className="upload-text-content">
                    <p className="upload-main-text">
                      {isVisaBulkUploaded ? (
                        <>
                          <span style={{ color: "#28a745" }}>✓ {visaBulkFiles.length} file(s) uploaded</span>
                          <br />
                          <span style={{ fontSize: "12px", color: "#666" }}>Click to upload different files</span>
                        </>
                      ) : (
                        <>
                          Drag and drop your Visa files here, or{" "}
                          <span className="upload-link">click to browse</span>
                        </>
                      )}
                    </p>
                    {!isVisaBulkUploaded && <p className="upload-sub-text">Supports all file formats</p>}
                  </div>
                </div>
              </div>
              {/* Header outside upload zone, centered */}
              <div style={{
                textAlign: "center",
                marginTop: "12px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#1a1a1a"
              }}>
                Visa Files {isVisaBulkUploaded && <span style={{ color: "#28a745", marginLeft: "8px" }}>✓</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Crew List
        <>
          <div className="crew-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <h3 className="crew-list-title">
                <span className="crew-list-title-bar"></span>
                CREW LIST
              </h3>
              {uploadedFileName && (
                <span style={{ fontSize: "12px", color: "#666", fontStyle: "italic" }}>
                  ({uploadedFileName})
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsFileUploaded(false);
                  setIsPassportBulkUploaded(false);
                  setIsVisaBulkUploaded(false);
                  setUploadedFileName("");
                  setPassportBulkFiles([]);
                  setVisaBulkFiles([]);
                  const syntheticEvent = { target: { value: [] } };
                  handleChange("crewList")(syntheticEvent);
                  handleChange("crewUploadedFileName")({ target: { value: "" } });
                  handleChange("crewPassportFiles")({ target: { value: [] } });
                  handleChange("crewVisaFiles")({ target: { value: [] } });
                  setSelectedCrewIds([]);
                  setPassportDocuments({});
                  setVisaDocuments({});
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  if (passportBulkFileInputRef.current) {
                    passportBulkFileInputRef.current.value = "";
                  }
                  if (visaBulkFileInputRef.current) {
                    visaBulkFileInputRef.current.value = "";
                  }
                }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: `1px solid #e2e6ff`,
                  backgroundColor: "transparent",
                  color: "#000000",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#e2e6ff";
                  e.target.style.color = "#000000";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#000000";
                }}
              >
                Upload New File
              </button>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                  borderRadius: "6px",
                  border: `2px solid #e2e6ff`,
                  backgroundColor: selectedCrewIds.length === displayCrewList.length ? "#e2e6ff" : "#ffffff",
                  color: selectedCrewIds.length === displayCrewList.length ? "#000000" : "#000000",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedCrewIds.length !== displayCrewList.length) {
                    e.target.style.backgroundColor = "#e2e6ff";
                    e.target.style.color = "#000000";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCrewIds.length !== displayCrewList.length) {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.color = "#000000";
                  }
                }}
              >
                {selectedCrewIds.length === displayCrewList.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
          <div className="table-wrapper table-responsive crew-table-container">
            <table className="table table-striped crew-table" style={{ "--card-color": "#e2e6ff" }}>
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
                  <th>Crew Name</th>
                  <th>Nationality</th>
                  <th>Rank</th>
                  <th>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      Passport
                    </div>
                  </th>
                  <th>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                      Visa
                    </div>
                  </th>
                  <th>Transport</th>
                  <th>CG Pass</th>
                  <th>Zawil Pass</th>
                  <th>Hotel</th>
                  <th>Medical Service</th>
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
                      <td>
                        <div className="crew-table-cell">{crew.crewName || ""}</div>
                      </td>
                      <td>
                        <div className="crew-table-cell">{crew.nationality || ""}</div>
                      </td>
                      <td>
                        <div className="crew-table-cell">{crew.rank || ""}</div>
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
                              color: passportDocuments[crew.id] ? "#28a745" : "#00368c",
                            }}
                            title={passportDocuments[crew.id] ? `Uploaded: ${passportDocuments[crew.id].fileName}` : "Upload Passport Document"}
                          >
                            <UploadIcon size={18} color={passportDocuments[crew.id] ? "#28a745" : "#00368c"} />
                          </button>
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
                              color: visaDocuments[crew.id] ? "#28a745" : "#00368c",
                            }}
                            title={visaDocuments[crew.id] ? `Uploaded: ${visaDocuments[crew.id].fileName}` : "Upload Visa Document"}
                          >
                            <UploadIcon size={18} color={visaDocuments[crew.id] ? "#28a745" : "#00368c"} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.transport ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.cgPass ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.zawilPass ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.hotel ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.medicalService ? <YesIcon /> : <NoIcon />}
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
    </div>
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

