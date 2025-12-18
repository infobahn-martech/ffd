import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import moment from "moment";

export function ViewActivityLogModal({ showModal, closeModal }) {
  if (!showModal) return null;

  const renderHeader = () => (
    <>
      <h1 className="modal-title">View Activity Log Details</h1>
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
        {/* ROW 1 — Date/Time + User Name + Activity Type */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Date/Time</div>
            <div className="view-value">
              {showModal.dateTime
                ? moment(showModal.dateTime).format('DD MMMM YYYY hh:mm a')
                : "-"}
            </div>
          </div>
          <div className="view-item">
            <div className="view-label">User Name</div>
            <div className="view-value">{showModal.userName || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Activity Type</div>
            <div className="view-value">{showModal.activityType || "-"}</div>
          </div>
        </div>

        {/* ROW 2 — Module + Status + IP Address */}
        <div className="view-row">
          <div className="view-item">
            <div className="view-label">Module</div>
            <div className="view-value">{showModal.module || "-"}</div>
          </div>
          <div className="view-item">
            <div className="view-label">Status</div>
            <div className="view-value">
              <span className={`status-badge status-${showModal.status?.toLowerCase() || 'default'}`}>
                {showModal.status || "-"}
              </span>
            </div>
          </div>
          <div className="view-item">
            <div className="view-label">IP Address</div>
            <div className="view-value">{showModal.ipAddress || "-"}</div>
          </div>
        </div>

        {/* ROW 3 — Description */}
        <div className="view-row">
          <div className="view-item" style={{ width: '100%' }}>
            <div className="view-label">Description</div>
            <div className="view-value">{showModal.description || "-"}</div>
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

