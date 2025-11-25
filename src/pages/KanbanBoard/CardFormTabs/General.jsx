import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";
import "../../../design/scss/general.scss";

// Job statuses in order with icons and descriptions
const JOB_STATUSES = [
  { id: 1, title: "Pre-Arrival", key: "preArrival", icon: "🚢", description: "Vessel approaching port" },
  { id: 2, title: "Customs Inspection", key: "customsInspection", icon: "🔍", description: "Customs clearance process" },
  { id: 3, title: "Crew Immigration", key: "crewImmigration", icon: "👥", description: "Crew documentation check" },
  { id: 4, title: "Vessel Inward Formalities", key: "vesselInwardFormalities", icon: "📋", description: "Inward documentation" },
  { id: 5, title: "Marine Work Permit", key: "marineWorkPermit", icon: "⚓", description: "Work permit approval" },
  { id: 6, title: "SABER UT", key: "saberUt", icon: "✅", description: "SABER system update" },
  { id: 7, title: "Outward Clearance", key: "outwardClearance", icon: "📤", description: "Outward documentation" },
  { id: 8, title: "Vessel Sailed", key: "vesselSailed", icon: "⛵", description: "Vessel departed port" },
  { id: 9, title: "Operations Completed", key: "operationsCompleted", icon: "✔️", description: "All operations finished" },
  { id: 10, title: "SO Approval", key: "soApproval", icon: "📝", description: "Service order approved" },
  { id: 11, title: "Invoice Issued", key: "invoiceIssued", icon: "🧾", description: "Invoice generated" },
  { id: 12, title: "Submitted", key: "submitted", icon: "📨", description: "Documents submitted" },
  { id: 13, title: "Confirmation Received", key: "confirmationReceived", icon: "✉️", description: "Confirmation obtained" },
  { id: 14, title: "Closed", key: "closed", icon: "🔒", description: "Job completed and closed" },
];

function VerticalTimeline({ jobStatuses, currentStatus, accentColor }) {
  const getStatusState = (statusId) => {
    const currentIndex = jobStatuses.findIndex((s) => s.key === currentStatus);
    const statusIndex = jobStatuses.findIndex((s) => s.id === statusId);

    if (statusIndex < currentIndex) return "completed";
    if (statusIndex === currentIndex) return "active";
    return "pending";
  };

  const currentIndex = jobStatuses.findIndex((s) => s.key === currentStatus);
  const progressPercentage = currentIndex !== -1 ? ((currentIndex + 1) / jobStatuses.length) * 100 : 0;

  return (
    <div className="vertical-timeline-container" style={{ '--accent-color': accentColor }}>
      <div className="vertical-timeline-line">
        <div
          className="vertical-timeline-fill"
          style={{
            height: `${progressPercentage}%`,
            '--accent-color': accentColor
          }}
        />
      </div>

      <div className="vertical-timeline-steps">
        {jobStatuses.map((status, index) => {
          const state = getStatusState(status.id);
          const isLast = index === jobStatuses.length - 1;
          const isLeft = index % 2 === 0;
          const nextStatus = !isLast ? jobStatuses[index + 1] : null;
          const nextState = nextStatus ? getStatusState(nextStatus.id) : null;
          const isConnectorCompleted = !isLast && (state === "completed" || state === "active" || nextState === "completed" || nextState === "active");

          return (
            <div key={status.id} className={`vertical-timeline-step-wrapper ${isLeft ? 'step-left' : 'step-right'}`}>
              {!isLeft && (
                <div className={`vertical-timeline-icon ${state}`}>
                  <div className="timeline-icon-circle">
                    {state === "completed" && <span className="icon-check">✓</span>}
                    {state === "active" && <span className="icon-dot"></span>}
                    {state === "pending" && <span className="icon-emoji">{status.icon}</span>}
                  </div>
                </div>
              )}

              <div className={`vertical-timeline-content ${isLeft ? 'content-left' : 'content-right'}`}>
                {!isLeft && (
                  <div className="timeline-time">
                    <span className="time-label">Step {status.id}</span>
                  </div>
                )}
                <div className={`timeline-title ${state}`}>{status.title}</div>
                <div className={`timeline-description ${state}`}>{status.description}</div>
                {isLeft && (
                  <div className="timeline-time">
                    <span className="time-label">Step {status.id}</span>
                  </div>
                )}
              </div>

              {isLeft && (
                <div className={`vertical-timeline-icon ${state}`}>
                  <div className="timeline-icon-circle">
                    {state === "completed" && <span className="icon-check">✓</span>}
                    {state === "active" && <span className="icon-dot"></span>}
                    {state === "pending" && <span className="icon-emoji">{status.icon}</span>}
                  </div>
                </div>
              )}

              {!isLast && (
                <div
                  className={`vertical-timeline-connector ${isConnectorCompleted ? "completed" : ""}`}
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

  // Summary datas with icons and metadata
  const summaryData = useMemo(() => [
    {
      label: "Card ID",
      value: card?.code || card?.id || "N/A",
      icon: "🔖",
      type: "id",
      copyable: true
    },
    {
      label: "Title",
      value: card?.title || "N/A",
      icon: "📝",
      type: "text"
    },
    {
      label: "Owner",
      value: card?.user || formValues?.owner || "None",
      icon: "👤",
      type: "user"
    },
    {
      label: "Current Status",
      value: JOB_STATUSES.find(s => s.key === currentStatus)?.title || "Pre-Arrival",
      icon: "📍",
      type: "status",
      highlight: true
    },
    {
      label: "Vessel Name",
      value: card?.vessel || formValues?.vessel || "N/A",
      icon: "🚢",
      type: "text"
    },
    {
      label: "Customer",
      value: card?.customer || formValues?.customer || "N/A",
      icon: "🏢",
      type: "text"
    },
    {
      label: "Port",
      value: card?.port || formValues?.port || "N/A",
      icon: "⚓",
      type: "text"
    },
    {
      label: "Progress",
      value: card?.progress !== undefined ? `${card.progress}%` : "N/A",
      icon: "📊",
      type: "progress"
    },
    {
      label: "ETA Date",
      value: card?.etaDate || formValues?.etaDate || "N/A",
      icon: "📅",
      type: "date"
    },
    {
      label: "ETA Time",
      value: card?.etaTime || formValues?.etaTime || "N/A",
      icon: "🕐",
      type: "time"
    },
    {
      label: "Days",
      value: card?.days ? `${card.days} days` : "N/A",
      icon: "📆",
      type: "text"
    },
    {
      label: "Time Left",
      value: card?.timeLeft || "N/A",
      icon: "⏱️",
      type: "text"
    },
    {
      label: "Priority",
      value: card?.priority || formValues?.priority || "Normal",
      icon: "⭐",
      type: "text"
    },
    {
      label: "IMO Number",
      value: card?.imoNumber || formValues?.imoNumber || "N/A",
      icon: "🆔",
      type: "text",
      copyable: true
    },
    {
      label: "Flag",
      value: card?.flag || formValues?.flag || "N/A",
      icon: "🚩",
      type: "text"
    },
    {
      label: "Agent",
      value: card?.agent || formValues?.agent || "N/A",
      icon: "🤝",
      type: "text"
    },
    {
      label: "Service Type",
      value: card?.serviceType || formValues?.serviceType || "N/A",
      icon: "🔧",
      type: "text"
    },
    {
      label: "Cargo Type",
      value: card?.cargoType || formValues?.cargoType || "N/A",
      icon: "📦",
      type: "text"
    },
    {
      label: "Created Date",
      value: card?.createdDate || formValues?.createdDate || card?.createdAt || "N/A",
      icon: "📆",
      type: "date"
    },
    {
      label: "Last Updated",
      value: card?.updatedDate || formValues?.updatedDate || card?.updatedAt || "N/A",
      icon: "🔄",
      type: "date"
    },
    {
      label: "Vessel Type",
      value: card?.vesselType || formValues?.vesselType || "N/A",
      icon: "⛴️",
      type: "text"
    },
    {
      label: "Gross Tonnage",
      value: card?.grossTonnage ? `${card.grossTonnage} GT` : formValues?.grossTonnage ? `${formValues.grossTonnage} GT` : "N/A",
      icon: "⚖️",
      type: "text"
    },
    {
      label: "Call Sign",
      value: card?.callSign || formValues?.callSign || "N/A",
      icon: "📡",
      type: "text",
      copyable: true
    },
  ], [card, formValues, currentStatus]);

  const handleCopy = (text, label) => {
    if (text && text !== "N/A" && text !== "None") {
      navigator.clipboard.writeText(text).then(() => {
        // You could add a toast notification here
        console.log(`Copied ${label}: ${text}`);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  return (
    <div className="cardform-body general-tab-body">
      <div className="general-sections-wrapper">
        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon">
              <span>📊</span>
            </div>
            <div className="cf-section-title">Job Status</div>
          </div>
          <div className="cf-section-body">
            <VerticalTimeline
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
              {summaryData.map((item, index) => {
                const isEmpty = !item.value || item.value === "N/A" || item.value === "None";
                return (
                  <div
                    key={index}
                    className={`summary-item ${item.highlight ? 'summary-item-highlight' : ''} ${isEmpty ? 'summary-item-empty' : ''}`}
                    style={{ '--accent-color': accentColor }}
                  >
                    <div className="summary-item-header">
                      <div className="summary-icon">{item.icon}</div>
                      <div className="summary-label">{item.label}</div>
                      {item.copyable && !isEmpty && (
                        <button
                          className="summary-copy-btn"
                          onClick={() => handleCopy(item.value, item.label)}
                          aria-label={`Copy ${item.label}`}
                          title={`Copy ${item.label}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 4.5V2.5C5.5 1.94772 5.94772 1.5 6.5 1.5H13.5C14.0523 1.5 14.5 1.94772 14.5 2.5V9.5C14.5 10.0523 14.0523 10.5 13.5 10.5H11.5M5.5 4.5H2.5C1.94772 4.5 1.5 4.94772 1.5 5.5V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H9.5C10.0523 13.5 10.5 13.0523 10.5 12.5V9.5M5.5 4.5C5.5 4.94772 5.94772 5.5 6.5 5.5H9.5M10.5 9.5V6.5C10.5 5.94772 10.0523 5.5 9.5 5.5H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className={`summary-value ${item.type === 'status' ? 'summary-value-status' : ''} ${item.type === 'progress' ? 'summary-value-progress' : ''}`}>
                      {isEmpty ? (
                        <span className="summary-empty-text">Not set</span>
                      ) : (
                        item.value
                      )}
                    </div>
                    {item.type === 'status' && !isEmpty && (
                      <div className="summary-status-indicator" style={{ backgroundColor: accentColor }}></div>
                    )}
                    {item.type === 'progress' && !isEmpty && card?.progress !== undefined && (
                      <div className="summary-progress-bar">
                        <div
                          className="summary-progress-fill"
                          style={{
                            width: `${card.progress}%`,
                            backgroundColor: accentColor
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

