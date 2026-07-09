import PropTypes from "prop-types";

const STEP_CONFIG = [
  { key: "crewList", title: "Crew List" },
  { key: "passportIqama", title: "Passport / Iqama" },
  { key: "visa", title: "Visa" },
];

const StepIcon = ({ status, stepNumber }) => {
  if (status === "uploading") {
    return <span className="crew-upload-node__spinner" aria-hidden="true" />;
  }
  if (status === "completed") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V9M8 11.5H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return <span className="crew-upload-node__number">{stepNumber}</span>;
};

StepIcon.propTypes = {
  status: PropTypes.oneOf(["pending", "uploading", "completed", "failed"]).isRequired,
  stepNumber: PropTypes.number.isRequired,
};

// Compact 3-step crew document progress tracker for the Crew Management
// hero's right side — a read-only circle/line stepper (matching the app's
// existing stage-stepper visual language) that reflects upload status.
// Actual file selection now happens in the CrewUploadDropzones boxes to its
// left; this component no longer accepts file input directly.
const CrewUploadSteps = ({ steps }) => {
  const completedCount = STEP_CONFIG.filter((step) => steps[step.key]?.status === "completed").length;

  return (
    <div className="crew-upload-steps">
      <div className="crew-upload-steps__header">
        <span className="crew-upload-steps__title">Crew Documents</span>
        <span className="crew-upload-steps__progress">{completedCount}/3</span>
      </div>

      <div className="crew-upload-steps__track">
        {STEP_CONFIG.map((step, index) => {
          const state = steps[step.key] || { status: "pending", files: [] };
          const disabled = step.key !== "crewList" && steps.crewList?.status !== "completed";
          const isLast = index === STEP_CONFIG.length - 1;

          return (
            <div key={step.key} className="crew-upload-node">
              <div
                className={`crew-upload-node__row${disabled ? " crew-upload-node__row--disabled" : ""}`}
              >
                <div
                  className={`crew-upload-node__circle crew-upload-node__circle--${state.status}${disabled ? " crew-upload-node__circle--disabled" : ""}`}
                  title={step.title}
                >
                  <StepIcon status={state.status} stepNumber={index + 1} />
                </div>
                {!isLast && (
                  <span
                    className={`crew-upload-node__connector${state.status === "completed" ? " crew-upload-node__connector--complete" : ""}`}
                  />
                )}
              </div>
              <span className="crew-upload-node__title">{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const stepStatePropType = PropTypes.shape({
  status: PropTypes.oneOf(["pending", "uploading", "completed", "failed"]),
  files: PropTypes.array,
  progress: PropTypes.number,
});

CrewUploadSteps.propTypes = {
  steps: PropTypes.shape({
    crewList: stepStatePropType,
    passportIqama: stepStatePropType,
    visa: stepStatePropType,
  }).isRequired,
};

export default CrewUploadSteps;
