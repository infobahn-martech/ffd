import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import moment from "moment";
import "./ViewVessel.scss";

export function ViewVesselModal({ showModal, closeModal }) {
  if (!showModal) return null;

  const renderHeader = () => (
    <>
      <h1 className="modal-title">View Vessel</h1>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={closeModal}
      ></button>
    </>
  );

  const renderBody = () => (
    <div className="modal-body">
      <div className="view-vessel-container">
        {/* ROW 1 — Billing Entity + Vessel Type + Vessel Name */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Billing Entity</div>
            <div className="view-value">{showModal.billingEntity || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Vessel Type</div>
            <div className="view-value">{showModal.vesselType || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Vessel Name</div>
            <div className="view-value">{showModal.vesselName || "-"}</div>
          </div>
        </div>

        {/* ROW 2 — Flag State + Gross Tonnage + Call Sign */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Flag State</div>
            <div className="view-value">{showModal.flagState || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Gross Tonnage</div>
            <div className="view-value">{showModal.grossTonnage || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Call Sign</div>
            <div className="view-value">{showModal.callSign || "-"}</div>
          </div>
        </div>

        {/* ROW 3 — Year Built + Class Society + P&I Club */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Year Built</div>
            <div className="view-value">{showModal.yearBuilt || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Class Society</div>
            <div className="view-value">{showModal.classSociety || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">P&I Club</div>
            <div className="view-value">{showModal.pnIClub || "-"}</div>
          </div>
        </div>

        {/* ROW 4 — Length Overall + Beam + Draft */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Length Overall</div>
            <div className="view-value">{showModal.lengthOverall || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Beam</div>
            <div className="view-value">{showModal.beam || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Draft</div>
            <div className="view-value">{showModal.draft || "-"}</div>
          </div>
        </div>

        {/* ROW 5 — Created At */}
        {showModal.createdAt && (
          <div className="view-row">
            <div className="view-item">
              <div className="view-label">Created At</div>
              <div className="view-value">
                {moment(showModal.createdAt).format('DD MMMM YYYY hh:mm a')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="modal-footer">
      <button type="button" className="btn btn-outline" onClick={closeModal}>
        Close
      </button>
    </div>
  );

  return (
    <CustomModal
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      footer={renderFooter()}
      header={renderHeader()}
    />
  );
}
