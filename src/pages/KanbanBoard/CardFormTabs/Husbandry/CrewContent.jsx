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
      };
    });

  return crewData;
};

const CrewContent = ({ formValues, handleChange, cardColor, onNavigateToTab }) => {
  const crewList = formValues.crewList || [];
  const [selectedCrewIds, setSelectedCrewIds] = useState([]);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [isFileUploaded, setIsFileUploaded] = useState(!!(formValues.crewList && formValues.crewList.length > 0));
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
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
  const actionOptions = [
    { value: "transport", label: "Transport", tab: "transport", field: "selectedCrew" },
    { value: "cgPass", label: "CG Pass", tab: "cgPass", field: "cgPassSelectedCrew" },
    { value: "zawilPass", label: "Zawil Pass", tab: "zawilPass", field: "zawilPassSelectedCrew" },
    { value: "launchHire", label: "Launch Hire", tab: "launchHire", field: "launchHireSelectedCrew" },
    { value: "hotel", label: "Hotel", tab: "hotel", field: "hotelSelectedCrew" },
    { value: "medicalService", label: "Medical Service", tab: "medicalService", field: "medicalServiceSelectedCrew" },
  ];

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

  // Handle file upload
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

        if (crewData.length > 0) {
          const syntheticEvent = { target: { value: crewData } };
          handleChange("crewList")(syntheticEvent);
          setIsFileUploaded(true);
          setUploadedFileName(file.name);
        } else {
          alert("No valid crew data found in the uploaded file.");
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Error reading file. Please ensure it's a valid Excel file (.xlsx or .xls).");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel" || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      handleFileUpload(file);
    } else {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
    }
  };

  // Handle drag and drop
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
    if (file && (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel" || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      handleFileUpload(file);
    } else {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
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

  return (
    <div className="cardform-left-full crew-content-wrapper" style={{ "--card-color": cardColor }}>
      {!isFileUploaded ? (
        // Upload Area
        <div className="crew-upload-section">
          <div
            className={`document-upload-zone ${isDragging ? "dragging" : ""}`}
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
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
            />
            <div className="upload-zone-content">
              <div className="upload-icon-wrapper">
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
              </div>
              <div className="upload-text-content">
                <p className="upload-main-text">
                  Drag and drop your crew Excel file here, or{" "}
                  <span className="upload-link">click to browse</span>
                </p>
                <p className="upload-sub-text">Supports .xlsx and .xls file formats</p>
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
                  setUploadedFileName("");
                  const syntheticEvent = { target: { value: [] } };
                  handleChange("crewList")(syntheticEvent);
                  setSelectedCrewIds([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: `1px solid {"#00368c"}`,
                  backgroundColor: "transparent",
                  color: "#00368c",
                  fontSize: "12px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#00368c";
                  e.target.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#00368c";
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
                      border: `2px solid {"#00368c"}`,
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
                  border: `2px solid {"#00368c"}`,
                  backgroundColor: selectedCrewIds.length === displayCrewList.length ? "#00368c" : "#ffffff",
                  color: selectedCrewIds.length === displayCrewList.length ? "#ffffff" : "#00368c",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (selectedCrewIds.length !== displayCrewList.length) {
                    e.target.style.backgroundColor = "#00368c";
                    e.target.style.color = "#ffffff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCrewIds.length !== displayCrewList.length) {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.color = "#00368c";
                  }
                }}
              >
                {selectedCrewIds.length === displayCrewList.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
          <div className="table-wrapper table-responsive crew-table-container">
            <table className="table table-striped crew-table" style={{ "--card-color": cardColor }}>
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
                        accentColor: "#00368c",
                      }}
                    />
                  </th>
                  <th>Crew Name</th>
                  <th>Nationality</th>
                  <th>Rank</th>
                  <th>Passport No</th>
                  <th>Transport</th>
                  <th>CG Pass</th>
                  <th>Zawil Pass</th>
                  <th>Hotel</th>
                  <th>Launch Hire</th>
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
                          ? hexToRgba('#00368c', 0.1)
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
                        <div className="crew-table-cell">{crew.passportNo || ""}</div>
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
                          {crew.launchHire ? <YesIcon /> : <NoIcon />}
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
};

export default CrewContent;

