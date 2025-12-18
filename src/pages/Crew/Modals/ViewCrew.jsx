import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function ViewCrewModal({ showModal, closeModal }) {
    if (!showModal) return null;

    const renderHeader = () => (
        <>
            <h1 className="modal-title">View Crew Details</h1>
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
                {/* ROW 1 — Crew Name + Nationality + Rank */}
                <div className="view-row">
                    <div className="view-item">
                        <div className="view-label">Crew Name</div>
                        <div className="view-value">{showModal.crewName || "-"}</div>
                    </div>
                    <div className="view-item">
                        <div className="view-label">Nationality</div>
                        <div className="view-value">{showModal.nationality || "-"}</div>
                    </div>
                    <div className="view-item">
                        <div className="view-label">Rank</div>
                        <div className="view-value">{showModal.rank || "-"}</div>
                    </div>
                </div>

                {/* ROW 2 — Passport + Visa + Transport */}
                <div className="view-row">
                    <div className="view-item">
                        <div className="view-label">Passport</div>
                        <div className="view-value">{showModal.passport || "-"}</div>
                    </div>
                    <div className="view-item">
                        <div className="view-label">Visa</div>
                        <div className="view-value">{showModal.visa || "-"}</div>
                    </div>
                    <div className="view-item">
                        <div className="view-label">Transport</div>
                        <div className="view-value">{showModal.transport || "-"}</div>
                    </div>
                </div>

                {/* ROW 3 — CG Pass + Zawil Pass + Hotel */}
                <div className="view-row">
                    <div className="view-item">
                        <div className="view-label">CG Pass</div>
                        <div className="view-value">{showModal.cgPass || "-"}</div>
                    </div>
                    <div className="view-item">
                        <div className="view-label">Zawil Pass</div>
                        <div className="view-value">{showModal.zawilPass || "-"}</div>
                    </div>
                    <div className="view-item">
                        <div className="view-label">Hotel</div>
                        <div className="view-value">{showModal.hotel || "-"}</div>
                    </div>
                </div>

                {/* ROW 4 — Medical Service */}
                <div className="view-row">
                    <div className="view-item">
                        <div className="view-label">Medical Service</div>
                        <div className="view-value">{showModal.medicalService || "-"}</div>
                    </div>
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

