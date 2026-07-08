import PropTypes from "prop-types";
import CustomModal from "../../../../../../../components/CustomModal";
import ChecklistMultiSelect from "../../appointment/checklistTab/ChecklistMultiSelect";
import "../../../../../../../design/scss/checklist.scss";

// "Select Crew" popup opened from a Crew Management service card. Fully
// controlled — crew options come from the dashboard's already-uploaded crew
// list, selection state lives in the parent (selectedCrewIds).
const CrewServiceSelectModal = ({
  show,
  service,
  crewOptions = [],
  selectedCrewIds = [],
  onChangeSelected,
  cardColor,
  onClose,
  onSubmit,
}) => {
  if (!service) return null;

  const hasCrew = crewOptions.length > 0;
  const canSubmit = hasCrew && selectedCrewIds.length > 0;

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
          <>
            <label className="crew-service-select-modal__field-label">Crew Members</label>
            <ChecklistMultiSelect
              className="husb-crew-multiselect"
              value={selectedCrewIds}
              onChange={(e) => onChangeSelected(e.target.value)}
              options={crewOptions}
              placeholder="Select crew..."
              cardColor={cardColor}
            />
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
  crewOptions: PropTypes.array,
  selectedCrewIds: PropTypes.array,
  onChangeSelected: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CrewServiceSelectModal;
