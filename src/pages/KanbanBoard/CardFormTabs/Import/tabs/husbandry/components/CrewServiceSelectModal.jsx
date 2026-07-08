import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../../../../components/CustomModal";

const PAGE_SIZE = 5;

const getField = (crew, ...keys) => {
  for (const key of keys) {
    const value = crew?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "—";
};

// "Select Crew" popup opened from a Crew Management service card. Fully
// controlled — crew rows come from the dashboard's already-uploaded crew
// list, selection state lives in the parent (selectedCrewIds). The table is
// paginated for display only; selection tracks crew ids, not page position,
// so it survives paging.
const CrewServiceSelectModal = ({
  show,
  service,
  crewRows = [],
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
  const hasCrew = crewRows.length > 0;
  const canSubmit = hasCrew && selectedCrewIds.length > 0;
  const totalPages = Math.max(1, Math.ceil(crewRows.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const pagedRows = crewRows.slice((effectivePage - 1) * PAGE_SIZE, effectivePage * PAGE_SIZE);
  const pageIds = pagedRows.map(({ id }) => id);
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
            <div className="crew-select-table-wrapper">
              <table className="table crew-select-table">
                <thead>
                  <tr>
                    <th className="crew-select-table__checkbox-col">
                      <input
                        type="checkbox"
                        className="crew-select-table__checkbox"
                        checked={isPageFullySelected}
                        onChange={togglePage}
                        aria-label="Select all on this page"
                      />
                    </th>
                    <th>Crew Name</th>
                    <th>Rank</th>
                    <th>Nationality</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.map(({ id, crew }) => {
                    const isSelected = selectedCrewIds.includes(id);
                    return (
                      <tr
                        key={id}
                        className={isSelected ? "crew-select-table__row--selected" : ""}
                        onClick={() => toggleOne(id)}
                      >
                        <td className="crew-select-table__checkbox-col">
                          <input
                            type="checkbox"
                            className="crew-select-table__checkbox"
                            checked={isSelected}
                            onChange={() => toggleOne(id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${getField(crew, "crew_name", "crewName", "name")}`}
                          />
                        </td>
                        <td>{getField(crew, "crew_name", "crewName", "name")}</td>
                        <td>{getField(crew, "rank")}</td>
                        <td>{getField(crew, "nationality")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
  crewRows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      crew: PropTypes.object,
    })
  ),
  selectedCrewIds: PropTypes.array,
  onChangeSelected: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CrewServiceSelectModal;
