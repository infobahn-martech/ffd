import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../../../../components/CustomModal";

const PAGE_SIZE = 5;

// Static placeholder rows — mirrors the Crew Summary table on the Crew
// Management dashboard (same columns/fields) until this modal is wired back
// up to the real uploaded crew list.
const STATIC_CREW_ROWS = [
  { id: "1", crewId: 1, crewName: "Ahmed Al-Rashid", nationality: "Saudi Arabia", rank: "Chief Officer", movementType: "Sign On", passport: true, iqama: true, visa: false, cgPass: true, zawilPass: false, transportCount: 2, hotelCount: 0, medicalCount: 0 },
  { id: "2", crewId: 2, crewName: "John Smith", nationality: "United Kingdom", rank: "Master", movementType: "Sign Off", passport: true, iqama: false, visa: true, cgPass: false, zawilPass: true, transportCount: 0, hotelCount: 1, medicalCount: 0 },
  { id: "3", crewId: 3, crewName: "Maria Santos", nationality: "Philippines", rank: "Chief Cook", movementType: "Sign On", passport: false, iqama: true, visa: true, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 1 },
  { id: "4", crewId: 4, crewName: "Viktor Petrov", nationality: "Ukraine", rank: "Chief Engineer", movementType: "Sign Off", passport: true, iqama: true, visa: true, cgPass: true, zawilPass: true, transportCount: 1, hotelCount: 1, medicalCount: 0 },
  { id: "5", crewId: 5, crewName: "Raj Kumar", nationality: "India", rank: "AB Seaman", movementType: "Sign On", passport: false, iqama: false, visa: false, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 0 },
  { id: "6", crewId: 6, crewName: "Elena Kowalski", nationality: "Poland", rank: "2nd Officer", movementType: "Sign Off", passport: true, iqama: false, visa: true, cgPass: false, zawilPass: false, transportCount: 3, hotelCount: 0, medicalCount: 0 },
  { id: "7", crewId: 7, crewName: "Carlos Mendez", nationality: "Mexico", rank: "Chief Steward", movementType: "Sign On", passport: true, iqama: true, visa: false, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 2, medicalCount: 0 },
  { id: "8", crewId: 8, crewName: "Yuki Tanaka", nationality: "Japan", rank: "3rd Engineer", movementType: "Sign Off", passport: false, iqama: true, visa: true, cgPass: true, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 2 },
  { id: "9", crewId: 9, crewName: "Fatima Al-Sayed", nationality: "Egypt", rank: "Bosun", movementType: "Sign On", passport: true, iqama: true, visa: true, cgPass: false, zawilPass: true, transportCount: 1, hotelCount: 0, medicalCount: 0 },
  { id: "10", crewId: 10, crewName: "Lucas Silva", nationality: "Brazil", rank: "Oiler", movementType: "Sign Off", passport: false, iqama: false, visa: true, cgPass: false, zawilPass: false, transportCount: 0, hotelCount: 0, medicalCount: 0 },
];

// Read-only doc status icon — green preview icon when available, blank cell
// when missing. Same visual language as the Crew Summary table.
const DocStatusIcon = ({ available, label }) => {
  if (!available) {
    return <div className="crew-table-cell crew-table-cell--doc-action" aria-hidden="true" />;
  }
  return (
    <div className="crew-table-cell crew-table-cell--doc-action">
      <div className="crew-doc-cell__inner">
        <span
          className="crew-doc-btn crew-doc-btn--preview"
          aria-label={`${label} available`}
          title={`${label} available`}
        >
          <svg className="crew-doc-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "#00AA00" }} />
            <circle cx="12" cy="12" r="3" strokeWidth="2" style={{ stroke: "#00AA00" }} />
          </svg>
        </span>
      </div>
    </div>
  );
};

DocStatusIcon.propTypes = {
  available: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

const CarIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 17H4C3.46957 17 2.96086 16.7893 2.58579 16.4142C2.21071 16.0391 2 15.5304 2 15V11C2 10.4696 2.21071 9.96086 2.58579 9.58579C2.96086 9.21071 3.46957 9 4 9H5M5 17H19M5 17V19C5 19.5304 4.78929 20.0391 4.41421 20.4142C4.03914 20.7893 3.53043 21 3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V17M19 17H20C20.5304 17 21.0391 16.7893 21.4142 16.4142C21.7893 16.0391 22 15.5304 22 15V11C22 10.4696 21.7893 9.96086 21.4142 9.58579C21.0391 9.21071 20.5304 9 20 9H19M19 17V19C19 19.5304 19.2107 20.0391 19.5858 20.4142C19.9609 20.7893 20.4696 21 21 21C21.5304 21 22.0391 20.7893 22.4142 20.4142C22.7893 20.0391 23 19.5304 23 19V17M5 9L7 5H17L19 9M5 9H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

CarIcon.propTypes = { size: PropTypes.number };

const HotelIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21M5 21V7L12 3L19 7V21M5 21H9M19 21H15M9 21V13H15V21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

HotelIcon.propTypes = { size: PropTypes.number };

const MedicalIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V16M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

MedicalIcon.propTypes = { size: PropTypes.number };

const SERVICE_ICONS = { transport: CarIcon, hotel: HotelIcon, medical: MedicalIcon };

// Transport / Hotel / Medical column cell — green service icon when active,
// blank otherwise. Same visual language as the Crew Summary table.
const ServiceStatusIcon = ({ type, active, label }) => {
  if (!active) {
    return <div className="crew-table-cell crew-service-cell crew-service-cell--empty" aria-hidden="true" />;
  }
  const Icon = SERVICE_ICONS[type];
  return (
    <div className="crew-table-cell crew-service-cell" aria-label={`${label} assigned`}>
      <div className="crew-status-icon crew-status-icon--done">
        <Icon size={14} />
      </div>
    </div>
  );
};

ServiceStatusIcon.propTypes = {
  type: PropTypes.oneOf(["transport", "hotel", "medical"]).isRequired,
  active: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

// "Select Crew" popup opened from a Crew Management service card. Selection
// state lives in the parent (selectedCrewIds); the crew rows shown are
// static placeholder data for now (see STATIC_CREW_ROWS). The table is
// paginated for display only; selection tracks crew ids, not page position,
// so it survives paging.
const CrewServiceSelectModal = ({
  show,
  service,
  selectedCrewIds = [],
  onChangeSelected,
  cardColor,
  onClose,
  onSubmit,
}) => {
  const [page, setPage] = useState(1);
  const [signOnCount, setSignOnCount] = useState("");
  const [signOffCount, setSignOffCount] = useState("");

  useEffect(() => {
    if (show) {
      setPage(1);
      setSignOnCount("");
      setSignOffCount("");
    }
  }, [show, service?.tabName]);

  if (!service) return null;

  const isCrewChange = service.tabName === "crewChange";
  const hasCrew = STATIC_CREW_ROWS.length > 0;
  const canSubmit = hasCrew && selectedCrewIds.length > 0;
  const totalPages = Math.max(1, Math.ceil(STATIC_CREW_ROWS.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const pagedRows = STATIC_CREW_ROWS.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE);
  const pageIds = pagedRows.map((row) => row.id);
  const isPageFullySelected = pageIds.length > 0 && pageIds.every((id) => selectedCrewIds.includes(id));

  // Header checkbox selects/clears only the crew shown on the current page —
  // total selection count (all pages) is shown in the footer.
  const togglePage = () => {
    onChangeSelected(
      isPageFullySelected
        ? selectedCrewIds.filter((id) => !pageIds.includes(id))
        : [...new Set([...selectedCrewIds, ...pageIds])]
    );
  };

  const toggleOne = (id) => {
    onChangeSelected(
      selectedCrewIds.includes(id)
        ? selectedCrewIds.filter((existing) => existing !== id)
        : [...selectedCrewIds, id]
    );
  };

  return (
    <CustomModal
      show={show}
      closeModal={onClose}
      createModal
      className="modal fade crew-service-select-modal"
      dialgName="modal-dialog modal-dialog-centered crew-service-select-modal-dialog"
      bodyClassname="crew-service-select-modal__body"
      header={
        <div className="crew-service-select-modal__header" style={{ "--card-color": cardColor }}>
          <div className="crew-service-select-modal__header-main">
            <h5 className="crew-service-select-modal__title">Select Crew</h5>
            <span className="crew-service-select-modal__service-badge">{service.label}</span>
          </div>
          <button
            type="button"
            className="crew-service-select-modal__close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <span>&times;</span>
          </button>
        </div>
      }
      body={
        hasCrew ? (
          <>
            {isCrewChange && (
              <div className="crew-select-signcount-row">
                <label className="crew-select-signcount-field">
                  <span className="crew-select-signcount-label">No. of Sign On</span>
                  <input
                    type="number"
                    min="0"
                    className="crew-select-signcount-input"
                    value={signOnCount}
                    onChange={(e) => setSignOnCount(e.target.value)}
                    placeholder="0"
                  />
                </label>
                <label className="crew-select-signcount-field">
                  <span className="crew-select-signcount-label">No. of Sign Off</span>
                  <input
                    type="number"
                    min="0"
                    className="crew-select-signcount-input"
                    value={signOffCount}
                    onChange={(e) => setSignOffCount(e.target.value)}
                    placeholder="0"
                  />
                </label>
              </div>
            )}
            <div className="crew-table-wrapper">
              <div className="table-wrapper table-responsive crew-table-container crew-table-scroll">
                <table
                  className="table table-striped crew-table crew-list-table"
                  style={{ "--card-color": cardColor, tableLayout: "fixed", width: "100%" }}
                >
                  <thead>
                    <tr>
                      <th className="crew-checkbox-cell-header">
                        <input
                          type="checkbox"
                          className="crew-list-checkbox crew-list-checkbox--header"
                          checked={isPageFullySelected}
                          onChange={togglePage}
                          aria-label="Select all on this page"
                        />
                      </th>
                      <th><span className="crew-th">Crew name</span></th>
                      <th><span className="crew-th">Nationality</span></th>
                      <th><span className="crew-th">Rank</span></th>
                      <th><span className="crew-th">Movement type</span></th>
                      <th><span className="crew-th">Passport / Iqama</span></th>
                      <th><span className="crew-th">Visa</span></th>
                      <th><span className="crew-th">CG Pass</span></th>
                      <th><span className="crew-th">Zawil Pass</span></th>
                      <th><span className="crew-th">Transport</span></th>
                      <th><span className="crew-th">Hotel</span></th>
                      <th><span className="crew-th">Medical</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row) => {
                      const isSelected = selectedCrewIds.includes(row.id);
                      return (
                        <tr
                          key={row.id}
                          className={isSelected ? "crew-row-selected" : ""}
                          onClick={() => toggleOne(row.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="crew-checkbox-cell">
                            <input
                              type="checkbox"
                              className="crew-list-checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(row.id)}
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`Select ${row.crewName}`}
                            />
                          </td>
                          <td>
                            <div className="crew-table-cell crew-name-cell" title={row.crewName}>
                              <span className="crew-name-info">
                                <span className="crew-name-text">{row.crewName}</span>
                                <span className="crew-name-id">{`ID · ${String(row.crewId).padStart(5, "0")}`}</span>
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="crew-table-cell" title={row.nationality}>{row.nationality}</div>
                          </td>
                          <td>
                            <div className="crew-table-cell" title={row.rank}>{row.rank}</div>
                          </td>
                          <td>
                            <span className="crew-movement-pill" title={row.movementType}>{row.movementType}</span>
                          </td>
                          <td><DocStatusIcon available={row.passport || row.iqama} label="Passport / Iqama" /></td>
                          <td><DocStatusIcon available={row.visa} label="Visa" /></td>
                          <td><DocStatusIcon available={row.cgPass} label="CG Pass" /></td>
                          <td><DocStatusIcon available={row.zawilPass} label="Zawil Pass" /></td>
                          <td><ServiceStatusIcon type="transport" active={row.transportCount > 0} label="Transport" /></td>
                          <td><ServiceStatusIcon type="hotel" active={row.hotelCount > 0} label="Hotel" /></td>
                          <td><ServiceStatusIcon type="medical" active={row.medicalCount > 0} label="Medical" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="crew-select-pagination">
              <button
                type="button"
                className="crew-select-pagination__btn"
                disabled={effectivePage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <span className="crew-select-pagination__info">
                Page {effectivePage} of {totalPages}
              </span>
              <button
                type="button"
                className="crew-select-pagination__btn"
                disabled={effectivePage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="crew-service-select-modal__empty">
            No crew available yet. Upload a crew list first.
          </p>
        )
      }
      footer={
        <div className="crew-service-select-modal__footer">
          <span className="crew-service-select-modal__count">
            {selectedCrewIds.length} crew selected
          </span>
          <div className="crew-service-select-modal__footer-actions">
            <button type="button" className="crew-service-select-modal__cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="crew-service-select-modal__submit-btn"
              style={{ "--card-color": cardColor }}
              onClick={() => onSubmit({ signOnCount, signOffCount })}
              disabled={!canSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      }
    />
  );
};

CrewServiceSelectModal.propTypes = {
  show: PropTypes.bool.isRequired,
  service: PropTypes.shape({
    tabName: PropTypes.string,
    label: PropTypes.string,
  }),
  selectedCrewIds: PropTypes.array,
  onChangeSelected: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CrewServiceSelectModal;
