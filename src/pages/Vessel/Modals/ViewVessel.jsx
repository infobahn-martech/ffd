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
        {/* ROW 1 — Billing Entity + Vessel Type + Barge Type */}
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
            <div className="view-label">Barge Type</div>
            <div className="view-value">{showModal.bargeType || "-"}</div>
          </div>
        </div>

        {/* ROW 2 — Vessel Name + Flag State + Gross Tonnage */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Vessel Name</div>
            <div className="view-value">{showModal.vesselName || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Flag State</div>
            <div className="view-value">{showModal.flagState || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Gross Tonnage</div>
            <div className="view-value">{showModal.grossTonnage || "-"}</div>
          </div>
        </div>

        {/* ROW 3 — Call Sign + Year Built + Class Society */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Call Sign</div>
            <div className="view-value">{showModal.callSign || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Year Built</div>
            <div className="view-value">{showModal.yearBuilt || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Class Society</div>
            <div className="view-value">{showModal.classSociety || "-"}</div>
          </div>
        </div>

        {/* ROW 4 — P&I Club + Length Overall + Beam */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">P&I Club</div>
            <div className="view-value">{showModal.pnIClub || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Length Overall</div>
            <div className="view-value">{showModal.lengthOverall || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Beam</div>
            <div className="view-value">{showModal.beam || "-"}</div>
          </div>
        </div>

        {/* ROW 5 — Draft + Created At */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Draft</div>
            <div className="view-value">{showModal.draft || "-"}</div>
          </div>
          {showModal.createdAt && (
            <div className="view-item">
              <div className="view-label">Created At</div>
              <div className="view-value">
                {moment(showModal.createdAt).format('DD MMMM YYYY hh:mm a')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <CustomModal
      dialgName="modal-dialog modal-dialog-centered"
      show={!!showModal}
      closeModal={() => closeModal(null)}
      body={renderBody()}
      header={renderHeader()}
    />
  );
}
