import PropTypes from "prop-types";

const getField = (crew, ...keys) => {
  for (const key of keys) {
    const value = crew?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "—";
};

// Read-only table of the crew already selected for one service — shown
// right after "Select Crew" submit, before the existing service form opens.
const CrewServiceListing = ({ service, crewRows, cardColor, onBack, onRequest, onRemoveCrew }) => {
  return (
    <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
      <div className="husbandry-service-selection-content">
        <button
          type="button"
          className="husbandry-back-link-small"
          onClick={onBack}
          style={{ "--card-color": cardColor }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Crew Dashboard</span>
        </button>

        <div className="crew-listing-header">
          <div>
            <h2 className="crew-listing-title">{service.label} Crew</h2>
            <p className="crew-listing-subtitle">Selected crew members for this service.</p>
          </div>
          <button
            type="button"
            className="crew-listing-request-btn"
            onClick={onRequest}
            style={{ "--card-color": cardColor }}
          >
            Request
          </button>
        </div>

        {crewRows.length === 0 ? (
          <div className="crew-listing-empty">
            <p>No crew selected for {service.label}.</p>
          </div>
        ) : (
          <div className="crew-listing-table-wrapper">
            <table className="table crew-listing-table">
              <thead>
                <tr>
                  <th>Crew Name</th>
                  <th>Rank</th>
                  <th>Nationality</th>
                  <th>Passport Number</th>
                  <th>Iqama</th>
                  <th>Visa Number</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {crewRows.map(({ id, crew }) => (
                  <tr key={id}>
                    <td>{getField(crew, "crew_name", "crewName", "name")}</td>
                    <td>{getField(crew, "rank")}</td>
                    <td>{getField(crew, "nationality")}</td>
                    <td>{getField(crew, "passport_no", "passportNo")}</td>
                    <td>{getField(crew, "iqama_no", "iqamaNumber")}</td>
                    <td>{getField(crew, "visa_no", "visaNumber")}</td>
                    <td>{service.label}</td>
                    <td>
                      <span className="crew-listing-status-badge booked-status-pending">Pending</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="crew-listing-remove-btn"
                        onClick={() => onRemoveCrew(id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

CrewServiceListing.propTypes = {
  service: PropTypes.shape({
    label: PropTypes.string,
    tabName: PropTypes.string,
  }).isRequired,
  crewRows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      crew: PropTypes.object,
    })
  ).isRequired,
  cardColor: PropTypes.string,
  onBack: PropTypes.func.isRequired,
  onRequest: PropTypes.func.isRequired,
  onRemoveCrew: PropTypes.func.isRequired,
};

export default CrewServiceListing;
