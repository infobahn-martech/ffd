import { useEffect } from "react";
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

const CrewContent = ({ formValues, handleChange, cardColor }) => {
  const crewList = formValues.crewList || [];

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

  const handleViewCrew = (id) => {
    // Handle view action - can be implemented later
    console.log("View crew:", id);
    // You can add a modal or navigation here
  };

  return (
    <div className="cardform-left-full crew-content-wrapper" style={{ "--card-color": cardColor }}>
      <div className="crew-list-header">
        <h3 className="crew-list-title">
          <span className="crew-list-title-bar"></span>
          CREW LIST
        </h3>
      </div>
      <div className="table-wrapper table-responsive crew-table-container">
        <table className="table table-striped crew-table" style={{ "--card-color": cardColor }}>
          <thead>
            <tr>
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
              <tr key={crew.id}>
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
};

export default CrewContent;

