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

  const [isFileUploaded, setIsFileUploaded] = useState(hasCrewList);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(formValues.crewUploadedFileName || "");
  const fileInputRef = useRef(null);

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
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Crew Name">
                    Crew Name
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Nationality">
                    Nationality
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Rank">
                    Rank
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Transport">
                    Transport
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="CG Pass">
                    CG Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Zawil Pass">
                    Zawil Pass
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Hotel">
                    Hotel
                  </th>
                  <th style={{ width: "calc((100% - 40px) / 8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title="Medical Service">
                    Medical Service
                  </th>
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {displayCrewList.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
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
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.transport ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.cgPass ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.zawilPass ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div className="crew-table-cell crew-status-icon">
                          {crew.hotel ? <YesIcon /> : <NoIcon />}
                        </div>
                      </td>
                      <td style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
    </ >
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

