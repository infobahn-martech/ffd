import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { YesIcon, NoIcon } from "./Husbandry.components";

// Generate dummy crew data
const generateDummyCrew = () => {
  const nationalities = ["USA", "UK", "India", "Philippines", "Indonesia", "Bangladesh", "Pakistan", "Sri Lanka"];
  const ranks = ["Captain", "Chief Engineer", "Chief Officer", "Second Engineer", "Third Engineer", "AB Seaman", "OS Seaman", "Cook"];

  const dummyCrew = [];
  for (let i = 1; i <= 30; i++) {
    dummyCrew.push({
      id: i,
      crewName: `Crew Member ${i}`,
      nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
      rank: ranks[Math.floor(Math.random() * ranks.length)],
      passportNo: `P${String(1000000 + i).padStart(7, '0')}`,
      transport: Math.random() > 0.5, // Boolean
      cgPass: Math.random() > 0.5, // Boolean
      zawilPass: Math.random() > 0.5, // Boolean
      hotel: Math.random() > 0.5, // Boolean
      launchHire: Math.random() > 0.5, // Boolean
      medicalService: Math.random() > 0.5, // Boolean
    });
  }
  return dummyCrew;
};

const CrewContent = ({ formValues, handleChange, cardColor, onNavigateToTab }) => {
  const crewList = formValues.crewList || [];
  const [selectedCrewIds, setSelectedCrewIds] = useState([]);
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  // Initialize with dummy data on mount if empty
  useEffect(() => {
    if (!formValues.crewList || formValues.crewList.length === 0) {
      const dummyData = generateDummyCrew();
      const syntheticEvent = { target: { value: dummyData } };
      handleChange("crewList")(syntheticEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const displayCrewList = crewList.length > 0 ? crewList : generateDummyCrew();

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
      <div className="crew-list-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 className="crew-list-title">
          <span className="crew-list-title-bar"></span>
          CREW LIST
        </h3>
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
                  border: `2px solid ${cardColor || "#2A00FF"}`,
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
              border: `2px solid ${cardColor || "#2A00FF"}`,
              backgroundColor: selectedCrewIds.length === displayCrewList.length ? cardColor || "#2A00FF" : "#ffffff",
              color: selectedCrewIds.length === displayCrewList.length ? "#ffffff" : cardColor || "#2A00FF",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (selectedCrewIds.length !== displayCrewList.length) {
                e.target.style.backgroundColor = cardColor || "#2A00FF";
                e.target.style.color = "#ffffff";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCrewIds.length !== displayCrewList.length) {
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.color = cardColor || "#2A00FF";
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
                    accentColor: cardColor || "#2A00FF",
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
            {displayCrewList.map((crew) => (
              <tr
                key={crew.id}
                style={{
                  backgroundColor: selectedCrewIds.includes(crew.id)
                    ? hexToRgba(cardColor || "#2A00FF", 0.1)
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
                      accentColor: cardColor || "#2A00FF",
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
            ))}
          </tbody>
        </table>
      </div>
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

