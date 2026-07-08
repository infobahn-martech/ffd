import PropTypes from "prop-types";
import CustomModal from "../../../../../../../components/CustomModal";

const getField = (crew, ...keys) => {
  for (const key of keys) {
    const value = crew?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "—";
};

// "Select Crew" popup opened from a Crew Management service card. Fully
// controlled — crew rows come from the dashboard's already-uploaded crew
// list, selection state lives in the parent (selectedCrewIds).
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
  if (!service) return null;

  const hasCrew = crewRows.length > 0;
  const canSubmit = hasCrew && selectedCrewIds.length > 0;
  const allSelected = hasCrew && selectedCrewIds.length === crewRows.length;

  const toggleAll = () => {
    onChangeSelected(allSelected ? [] : crewRows.map(({ id }) => id));
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
          <div>
            <h5 className="crew-service-select-modal__title">Select Crew</h5>
            <p className="crew-service-select-modal__subtitle">{service.label}</p>
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
          <div className="crew-select-table-wrapper">
            <table className="table crew-select-table">
              <thead>
                <tr>
                  <th className="crew-select-table__checkbox-col">
                    <input
                      type="checkbox"
                      className="crew-select-table__checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all crew"
                    />
                  </th>
                  <th>Crew Name</th>
                  <th>Rank</th>
                  <th>Nationality</th>
                </tr>
              </thead>
              <tbody>
                {crewRows.map(({ id, crew }) => {
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
              onClick={onSubmit}
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
