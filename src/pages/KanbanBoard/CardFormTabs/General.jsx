import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";
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
  const STEPS_PER_VIEW = 5;
  const [currentPage, setCurrentPage] = useState(0);

  const getStatusState = (statusId) => {
    const currentIndex = jobStatuses.findIndex((s) => s.key === currentStatus);
    const statusIndex = jobStatuses.findIndex((s) => s.id === statusId);

    if (statusIndex < currentIndex) return "completed";
    if (statusIndex === currentIndex) return "active";
    return "pending";
  };

  const completedCount = jobStatuses.findIndex((s) => s.key === currentStatus) + 1;
  const progressPercentage = (completedCount / jobStatuses.length) * 100;

  // Calculate total pages
  const totalPages = Math.ceil(jobStatuses.length / STEPS_PER_VIEW);

  // Auto-center on current status when it changes
  useEffect(() => {
    const currentIndex = jobStatuses.findIndex((s) => s.key === currentStatus);
    if (currentIndex !== -1) {
      const pageForCurrentStatus = Math.floor(currentIndex / STEPS_PER_VIEW);
      setCurrentPage(pageForCurrentStatus);
    }
  }, [currentStatus, jobStatuses]);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

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

      <div className="line-progress-navigation">
        <button
          className="nav-arrow nav-arrow-left"
          onClick={handlePrevious}
          disabled={currentPage === 0}
          aria-label="Previous steps"
          style={{ '--accent-color': accentColor }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="line-progress-steps-wrapper">
          <div
            className="line-progress-steps"
            style={{
              transform: `translateX(-${currentPage * 100}%)`,
              '--accent-color': accentColor
            }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              const pageStart = pageIndex * STEPS_PER_VIEW;
              const pageEnd = Math.min(pageStart + STEPS_PER_VIEW, jobStatuses.length);
              const pageSteps = jobStatuses.slice(pageStart, pageEnd);

              return (
                <div key={pageIndex} className="line-progress-page">
                  {pageSteps.map((status, index) => {
                    const globalIndex = pageStart + index;
                    const state = getStatusState(status.id);
                    const isLast = globalIndex === jobStatuses.length - 1;
                    const nextStatus = !isLast ? jobStatuses[globalIndex + 1] : null;
                    const nextState = nextStatus ? getStatusState(nextStatus.id) : null;
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
              );
            })}
          </div>
        </div>

        <button
          className="nav-arrow nav-arrow-right"
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          aria-label="Next steps"
          style={{ '--accent-color': accentColor }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {totalPages > 1 && (
        <div className="line-progress-pagination">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => handlePageClick(index)}
              aria-label={`Go to page ${index + 1}`}
              style={{ '--accent-color': accentColor }}
            />
          ))}
        </div>
      )}
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
                  <div className={`summary-value ${item.type === 'status' ? 'summary-value-status' : ''}`}>
                    {isEmpty ? (
                      <span className="summary-empty-text">Not set</span>
                    ) : (
                      item.value
                    )}
                  </div>
                  {item.type === 'status' && !isEmpty && (
                    <div className="summary-status-indicator" style={{ backgroundColor: accentColor }}></div>
                  )}
                </div>
              );
            })}
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

