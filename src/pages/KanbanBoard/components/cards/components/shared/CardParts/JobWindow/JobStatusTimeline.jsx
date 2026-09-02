import { Activity } from "lucide-react";
import PropTypes from "prop-types";
import { JOB_STATUS_STEPS, jobStatusStepIndex } from "./jobStatusSteps";
import "../../../../../../../../design/scss/pages/kanban-board/jobWindow.scss";

/**
 * Vertical Status Timeline (Pickup Request Sent -> ... -> Job Closed) — a semantic
 * operational-status field, independent of the card's Kanban column. Clicking a
 * step sets it as the current status; every step at or before it renders as done.
 */
function JobStatusTimeline({ status, onPatchSection }) {
  const currentIndex = jobStatusStepIndex(status?.current);

  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <div className="cf-section-icon">
          <Activity size={15} aria-hidden />
        </div>
        <div className="cf-section-title">Status Timeline</div>
      </div>
      <div className="cf-section-body">
        <div className="job-status-timeline">
          {JOB_STATUS_STEPS.map((step, index) => {
            const isDone = currentIndex >= 0 && index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <button
                key={step.key}
                type="button"
                className={`job-status-timeline-step${isDone ? " done" : ""}${isCurrent ? " current" : ""}`}
                onClick={() => onPatchSection("status", { current: step.key })}
              >
                <span className="job-status-timeline-rail" aria-hidden>
                  <span className="job-status-timeline-dot" />
                </span>
                <span className="job-status-timeline-label">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

JobStatusTimeline.propTypes = {
  status: PropTypes.object,
  onPatchSection: PropTypes.func.isRequired,
};

export default JobStatusTimeline;
