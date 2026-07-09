import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PAGE_SIZE = 10;

const getField = (crew, ...keys) => {
  for (const key of keys) {
    const value = crew?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "—";
};

// Static placeholder rows shown for every service (Crew Change, Transport,
// CG Pass, Zawil Pass, Hotel, Medical, Port Pass) until real crew selection
// flows into crewRows — see displayRows below.
const STATIC_CREW_ROWS = [
  { id: "static-1", crew: { crew_name: "Ahmed Al-Rashid", rank: "Chief Officer", nationality: "Saudi Arabia", passport_no: "A12345678", iqama_no: "IQ-987654", visa_no: "V-2024-001" } },
  { id: "static-2", crew: { crew_name: "John Smith", rank: "Master", nationality: "United Kingdom", passport_no: "UK4521987", iqama_no: "IQ-112233", visa_no: "V-2024-002" } },
  { id: "static-3", crew: { crew_name: "Maria Santos", rank: "Chief Cook", nationality: "Philippines", passport_no: "PH7890123", iqama_no: "IQ-445566", visa_no: "V-2024-003" } },
  { id: "static-4", crew: { crew_name: "Viktor Petrov", rank: "Chief Engineer", nationality: "Ukraine", passport_no: "UA3456789", iqama_no: "IQ-778899", visa_no: "V-2024-004" } },
  { id: "static-5", crew: { crew_name: "Raj Kumar", rank: "AB Seaman", nationality: "India", passport_no: "IN5678901", iqama_no: "IQ-223344", visa_no: "V-2024-005" } },
  { id: "static-6", crew: { crew_name: "Elena Kowalski", rank: "2nd Officer", nationality: "Poland", passport_no: "PL2345678", iqama_no: "IQ-556677", visa_no: "V-2024-006" } },
  { id: "static-7", crew: { crew_name: "Carlos Mendez", rank: "Chief Steward", nationality: "Mexico", passport_no: "MX8765432", iqama_no: "IQ-998877", visa_no: "V-2024-007" } },
  { id: "static-8", crew: { crew_name: "Yuki Tanaka", rank: "3rd Engineer", nationality: "Japan", passport_no: "JP1122334", iqama_no: "IQ-334455", visa_no: "V-2024-008" } },
  { id: "static-9", crew: { crew_name: "Fatima Al-Sayed", rank: "Bosun", nationality: "Egypt", passport_no: "EG9988776", iqama_no: "IQ-667788", visa_no: "V-2024-009" } },
  { id: "static-10", crew: { crew_name: "Lucas Silva", rank: "Oiler", nationality: "Brazil", passport_no: "BR6655443", iqama_no: "IQ-889900", visa_no: "V-2024-010" } },
];

// Read-only table of the crew already selected for one service — shown
// right after "Select Crew" submit, before the existing service form opens.
const CrewServiceListing = ({ service, crewRows, cardColor, onRequest }) => {
  const [page, setPage] = useState(1);

  const displayRows = crewRows.length > 0 ? crewRows : STATIC_CREW_ROWS;
  const isCrewChange = service.tabName === "crewChange";

  const totalItems = displayRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const effectivePage = Math.min(Math.max(page, 1), totalPages);
  const startItem = totalItems === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(effectivePage * PAGE_SIZE, totalItems);

  const paginatedRows = useMemo(
    () => displayRows.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE),
    [displayRows, effectivePage]
  );

  const paginationPages = useMemo(() => {
    const pages = [];
    const windowSize = 5;
    const start = Math.max(1, effectivePage - 2);
    const end = Math.min(totalPages, start + windowSize - 1);
    const adjustedStart = Math.max(1, end - windowSize + 1);
    for (let i = adjustedStart; i <= end; i += 1) pages.push(i);
    return pages;
  }, [effectivePage, totalPages]);

  return (
    <div className="husbandry-service-selection" style={{ "--card-color": cardColor }}>
      <div className="husbandry-service-selection-content">
        <div className="crew-listing-header">
          <div>
            <h2 className="crew-listing-title">{service.label} Crew</h2>
            <p className="crew-listing-subtitle">Selected crew members for this service.</p>
          </div>
          {!isCrewChange && (
            <button
              type="button"
              className="crew-listing-request-btn"
              onClick={onRequest}
              style={{ "--card-color": cardColor }}
            >
              Request
            </button>
          )}
        </div>

        <div className="crew-listing-table-wrapper">
          <div className="crew-listing-table-scroll">
            <table className="table crew-listing-table">
              <thead>
                <tr>
                  <th>Crew Name</th>
                  <th>Rank</th>
                  <th>Nationality</th>
                  <th>Passport / Iqama</th>
                  <th>Visa Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map(({ id, crew }) => (
                  <tr key={id}>
                    <td>{getField(crew, "crew_name", "crewName", "name")}</td>
                    <td>{getField(crew, "rank")}</td>
                    <td>{getField(crew, "nationality")}</td>
                    <td>{`${getField(crew, "passport_no", "passportNo")} / ${getField(crew, "iqama_no", "iqamaNumber")}`}</td>
                    <td>{getField(crew, "visa_no", "visaNumber")}</td>
                    <td>
                      <span className="crew-listing-status-badge booked-status-pending">Pending</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="crew-pagination">
            <div className="crew-pagination-info">
              Showing <strong>{startItem}–{endItem}</strong> of {totalItems} crew members
            </div>
            <div className="crew-pagination-actions">
              <button
                type="button"
                className="crew-pagination-btn crew-pagination-btn--icon"
                aria-label="Previous page"
                disabled={effectivePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <FiChevronLeft size={16} />
              </button>
              {paginationPages.map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  className={`crew-pagination-btn${pageNum === effectivePage ? " active" : ""}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                className="crew-pagination-btn crew-pagination-btn--icon"
                aria-label="Next page"
                disabled={effectivePage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
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
  onRequest: PropTypes.func.isRequired,
};

export default CrewServiceListing;
