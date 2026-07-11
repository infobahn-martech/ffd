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

// Read-only table of the crew already selected for one service — shown
// right after "Select Crew" submit, before the existing service form opens.
// crewRows is the real call/vessel crew list (crew/get_crew_list, fetched in
// CrewManagementDashboard) already filtered by the caller (Husbandry.jsx) to
// only the ids assigned to this specific service — e.g. Transport only shows
// crew selected for Transport.
const CrewServiceListing = ({ service, crewRows, cardColor, onRequest }) => {
  const [page, setPage] = useState(1);

  const isCrewChange = service.tabName === "crewChange";

  const totalItems = crewRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const effectivePage = Math.min(Math.max(page, 1), totalPages);
  const startItem = totalItems === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(effectivePage * PAGE_SIZE, totalItems);

  const paginatedRows = useMemo(
    () => crewRows.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE),
    [crewRows, effectivePage]
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
      <div className="husbandry-service-selection-content crew-listing-page-content">
        <div className="crew-listing-header">
          <div>
            <h2 className="crew-listing-title">{service.label} Crew</h2>
            <p className="crew-listing-subtitle">Selected crew members for this service.</p>
          </div>
        </div>

        <div className="crew-listing-table-wrapper">
          <div className="crew-listing-table-scroll">
            <table className="table crew-listing-table">
              <thead>
                <tr>
                  <th>Crew Name</th>
                  {isCrewChange && <th>Movement Type</th>}
                  <th>Rank</th>
                  <th>Nationality</th>
                  <th>Passport / Iqama</th>
                  <th>Visa Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {crewRows.length === 0 ? (
                  <tr>
                    <td colSpan={isCrewChange ? 7 : 6} className="crew-table-empty">
                      No crew assigned to {service.label} yet.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map(({ id, crew }) => (
                    <tr key={id}>
                      <td>{getField(crew, "crew_name", "crewName", "name")}</td>
                      {isCrewChange && <td>{getField(crew, "movement_type", "movementType", "signOnOff")}</td>}
                      <td>{getField(crew, "rank")}</td>
                      <td>{getField(crew, "nationality")}</td>
                      <td>{`${getField(crew, "passport_no", "passportNo")} / ${getField(crew, "iqama_no", "iqamaNumber")}`}</td>
                      <td>{getField(crew, "visa_no", "visaNumber")}</td>
                      <td>
                        <span className="crew-listing-status-badge booked-status-pending">Pending</span>
                      </td>
                    </tr>
                  ))
                )}
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
