import { useRef, useState } from "react";
import PropTypes from "prop-types";

const STEP_CONFIG = [
  {
    key: "crewList",
    title: "Crew List",
    hint: ".xlsx, .xls, .csv",
    accept: ".xlsx,.xls,.csv",
    multiple: false,
  },
  {
    key: "passportIqama",
    title: "Passport / Iqama",
    hint: ".pdf, .jpg, .png",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: true,
  },
  {
    key: "visa",
    title: "Visa",
    hint: ".pdf, .jpg, .png",
    accept: ".pdf,.jpg,.jpeg,.png",
    multiple: true,
  },
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

// Compact 3-step crew document upload widget for the Crew Management hero's
// right side — a circle/line progress stepper (matching the app's existing
// stage-stepper visual language) doubling as the upload drop targets. Step 1
// (Crew List) triggers a real import API via onSelectCrewListFile; steps 2/3
// are local-only (no bulk backend endpoint exists yet) and are gated until
// step 1 completes.
const CrewUploadSteps = ({
  steps,
  onSelectCrewListFile,
  onSelectPassportIqamaFiles,
  onSelectVisaFiles,
}) => {
  const [draggingKey, setDraggingKey] = useState(null);
  const fileInputRefs = useRef({});

  const completedCount = STEP_CONFIG.filter((step) => steps[step.key]?.status === "completed").length;

  const handlers = {
    crewList: (file) => onSelectCrewListFile(file),
    passportIqama: (fileList) => onSelectPassportIqamaFiles(fileList),
    visa: (fileList) => onSelectVisaFiles(fileList),
  };

  const isStepDisabled = (key) => key !== "crewList" && steps.crewList?.status !== "completed";

  const openPicker = (key) => {
    if (isStepDisabled(key) || steps[key]?.status === "uploading") return;
    fileInputRefs.current[key]?.click();
  };

  const handleDragEnter = (key) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isStepDisabled(key)) setDraggingKey(key);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingKey(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (key, multiple) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingKey(null);
    if (isStepDisabled(key)) return;
    handlers[key](multiple ? e.dataTransfer.files : e.dataTransfer.files?.[0]);
  };

  return (
    <div className="crew-upload-steps">
      <div className="crew-upload-steps__header">
        <span className="crew-upload-steps__title">Crew Documents</span>
        <span className="crew-upload-steps__progress">{completedCount}/3</span>
      </div>

      <div className="crew-upload-steps__track">
        {STEP_CONFIG.map((step, index) => {
          const state = steps[step.key] || { status: "pending", files: [] };
          const disabled = isStepDisabled(step.key);
          const isLast = index === STEP_CONFIG.length - 1;
          const fileCount = state.files?.length || 0;

          let caption = step.hint;
          if (disabled) {
            caption = "Upload crew list first.";
          } else if (state.status === "uploading") {
            caption = "Uploading…";
          } else if (state.status === "completed" && step.multiple) {
            caption = `${fileCount} file${fileCount === 1 ? "" : "s"} uploaded`;
          } else if (state.status === "completed") {
            caption = "Uploaded";
          } else if (state.status === "failed") {
            caption = "Failed — retry";
          }

          // Draw attention to the very first step only, and only until a
          // file has actually been picked for it.
          const needsAttention = index === 0 && state.status === "pending";

          return (
            <div key={step.key} className="crew-upload-node">
              <div
                className={`crew-upload-node__row${disabled ? " crew-upload-node__row--disabled" : ""}`}
              >
                <div
                  className={`crew-upload-node__circle crew-upload-node__circle--${state.status}${disabled ? " crew-upload-node__circle--disabled" : ""}${draggingKey === step.key ? " crew-upload-node__circle--active" : ""}${needsAttention ? " crew-upload-node__circle--blink" : ""}`}
                  onClick={() => openPicker(step.key)}
                  onDragEnter={handleDragEnter(step.key)}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(step.key, step.multiple)}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-disabled={disabled}
                  title={step.title}
                >
                  <input
                    ref={(el) => (fileInputRefs.current[step.key] = el)}
                    type="file"
                    accept={step.accept}
                    multiple={step.multiple}
                    className="crew-upload-node__input"
                    disabled={disabled}
                    onChange={(e) => {
                      handlers[step.key](step.multiple ? e.target.files : e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <StepIcon status={state.status} stepNumber={index + 1} />
                </div>
                {!isLast && (
                  <span
                    className={`crew-upload-node__connector${state.status === "completed" ? " crew-upload-node__connector--complete" : ""}`}
                  />
                )}
              </div>
              <span className="crew-upload-node__title">{step.title}</span>
              <span className={`crew-upload-node__caption crew-upload-node__caption--${state.status}`}>
                {caption}
              </span>
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
  onSelectCrewListFile: PropTypes.func.isRequired,
  onSelectPassportIqamaFiles: PropTypes.func.isRequired,
  onSelectVisaFiles: PropTypes.func.isRequired,
};

export default CrewUploadSteps;
