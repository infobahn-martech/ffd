import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import CustomModal from "../../../../../../../components/CustomModal";

const getCrewRowId = (crew, index) => String(crew?.crew_id ?? crew?.id ?? index);
const getCrewRowName = (crew, index) =>
  crew?.crewName || crew?.crew_name || crew?.name || `Crew Member ${index + 1}`;

// Lightweight "assign crew to a service" popup used by the Crew Management
// dashboard cards. Selection-only — the receiving service form is out of scope here.
const CrewServiceSelectModal = ({ show, service, crewList = [], cardColor, onClose, onSubmit }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (show) setSelectedIds([]);
  }, [show, service?.tabName]);

  if (!service) return null;

  const toggleCrew = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === crewList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(crewList.map((crew, index) => getCrewRowId(crew, index)));
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) return;
    onSubmit(selectedIds, service);
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
        crewList.length === 0 ? (
          <p className="crew-service-select-modal__empty">
            No crew available yet. Upload a crew list first.
          </p>
        ) : (
          <>
            <label className="crew-service-select-modal__row crew-service-select-modal__row--all">
              <input
                type="checkbox"
                className="crew-list-checkbox"
                checked={selectedIds.length === crewList.length && crewList.length > 0}
                onChange={toggleSelectAll}
              />
              <span>Select All</span>
            </label>
            <div className="crew-service-select-modal__list">
              {crewList.map((crew, index) => {
                const id = getCrewRowId(crew, index);
                return (
                  <label key={id} className="crew-service-select-modal__row">
                    <input
                      type="checkbox"
                      className="crew-list-checkbox"
                      checked={selectedIds.includes(id)}
                      onChange={() => toggleCrew(id)}
                    />
                    <span className="crew-name-text">{getCrewRowName(crew, index)}</span>
                  </label>
                );
              })}
            </div>
          </>
        )
      }
      footer={
        <div className="crew-service-select-modal__footer">
          <span className="crew-service-select-modal__count">
            {selectedIds.length} crew selected
          </span>
          <div className="crew-service-select-modal__footer-actions">
            <button type="button" className="crew-service-select-modal__cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="crew-service-select-modal__submit-btn"
              style={{ "--card-color": cardColor }}
              onClick={handleSubmit}
              disabled={selectedIds.length === 0}
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
  crewList: PropTypes.array,
  cardColor: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CrewServiceSelectModal;
