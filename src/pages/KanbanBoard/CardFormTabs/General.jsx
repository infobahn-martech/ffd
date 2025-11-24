import PropTypes from "prop-types";
import { useMemo } from "react";
import "../../../design/scss/general.scss";

// Job statuses in order
const JOB_STATUSES = [
  { id: 1, title: "Pre-Arrival", key: "preArrival" },
  { id: 2, title: "Customs Inspection", key: "customsInspection" },
  { id: 3, title: "Crew Immigration", key: "crewImmigration" },
  { id: 4, title: "Vessel Inward Formalities", key: "vesselInwardFormalities" },
  { id: 5, title: "Marine Work Permit", key: "marineWorkPermit" },
  { id: 6, title: "SABER UT", key: "saberUt" },
  { id: 7, title: "Outward Clearance", key: "outwardClearance" },
  { id: 8, title: "Vessel Sailed", key: "vesselSailed" },
  { id: 9, title: "Operations Completed", key: "operationsCompleted" },
  { id: 10, title: "SO Approval", key: "soApproval" },
  { id: 11, title: "Invoice Issued", key: "invoiceIssued" },
  { id: 12, title: "Submitted", key: "submitted" },
  { id: 13, title: "Confirmation Received", key: "confirmationReceived" },
  { id: 14, title: "Closed", key: "closed" },
];

function LineProgress({ jobStatuses, currentStatus, accentColor }) {
  const getStatusState = (statusId) => {
    const currentIndex = jobStatuses.findIndex((s) => s.key === currentStatus);
    const statusIndex = jobStatuses.findIndex((s) => s.id === statusId);

    if (statusIndex < currentIndex) return "completed";
    if (statusIndex === currentIndex) return "active";
    return "pending";
  };

  const completedCount = jobStatuses.findIndex((s) => s.key === currentStatus) + 1;
  const progressPercentage = (completedCount / jobStatuses.length) * 100;

  return (
    <div className="line-progress-container">
      <div className="line-progress-bar">
        <div
          className="line-progress-fill"
          style={{
            width: `${progressPercentage}%`,
            backgroundColor: accentColor
          }}
        />
      </div>
      <div className="line-progress-steps">
        {jobStatuses.map((status, index) => {
          const state = getStatusState(status.id);
          const isLast = index === jobStatuses.length - 1;
          const nextState = !isLast ? getStatusState(jobStatuses[index + 1].id) : null;
          const isConnectorCompleted = !isLast && (state === "completed" || state === "active" || nextState === "completed" || nextState === "active");

          return (
            <div key={status.id} className="line-progress-step-wrapper">
              <div className={`line-progress-step ${state}`} style={{ '--accent-color': accentColor }}>
                <div className="step-circle">
                  {state === "completed" && <span className="step-check">✓</span>}
                  {state === "active" && <span className="step-dot"></span>}
                  {state === "pending" && <span className="step-number">{status.id}</span>}
                </div>
                <div className="step-title">{status.title}</div>
              </div>
              {!isLast && (
                <div
                  className={`step-connector ${isConnectorCompleted ? "completed" : ""}`}
                  style={{
                    backgroundColor: isConnectorCompleted ? accentColor : "#e0e0e0"
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function General({ card, formValues, handleChange }) {
  const accentColor = useMemo(() => card?.color || "#2A00FF", [card?.color]);

  // Determine current job status from card data
  const currentStatus = useMemo(() => {
    // Map card properties to status keys
    if (card?.closed) return "closed";
    if (card?.confirmationReceived) return "confirmationReceived";
    if (card?.submitted) return "submitted";
    if (card?.invoiceIssued) return "invoiceIssued";
    if (card?.soApproval) return "soApproval";
    if (card?.operationsCompleted) return "operationsCompleted";
    if (card?.vesselSailed) return "vesselSailed";
    if (card?.outwardClearance) return "outwardClearance";
    if (card?.saberUt) return "saberUt";
    if (card?.marineWorkPermit) return "marineWorkPermit";
    if (card?.vesselInwardFormalities) return "vesselInwardFormalities";
    if (card?.crewImmigration) return "crewImmigration";
    if (card?.customsInspection) return "customsInspection";
    return "preArrival";
  }, [card]);

  // Summary datas
  const summaryData = useMemo(() => [
    { label: "Card ID", value: card?.code || card?.id || "N/A" },
    { label: "Title", value: card?.title || "N/A" },
    { label: "Owner", value: card?.user || formValues?.owner || "None" },
    { label: "Current Status", value: JOB_STATUSES.find(s => s.key === currentStatus)?.title || "Pre-Arrival" },
    { label: "ETA Date", value: card?.etaDate || formValues?.etaDate || "N/A" },
    { label: "ETA Time", value: card?.etaTime || formValues?.etaTime || "N/A" },
  ], [card, formValues, currentStatus]);

  return (
    <div className="cardform-body general-tab-body">
      <div className="cf-section">
        <div className="cf-section-header">
          <div className="cf-section-icon">
            <span>📊</span>
          </div>
          <div className="cf-section-title">Job Status</div>
        </div>
        <div className="cf-section-body">
          <LineProgress
            jobStatuses={JOB_STATUSES}
            currentStatus={currentStatus}
            accentColor={accentColor}
          />
        </div>
      </div>

      <div className="cf-section">
        <div className="cf-section-header">
          <div className="cf-section-icon">
            <span>📋</span>
          </div>
          <div className="cf-section-title">Summary</div>
        </div>
        <div className="cf-section-body">
          <div className="summary-grid">
            {summaryData.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="summary-label">{item.label}</div>
                <div className="summary-value">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

General.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default General;

