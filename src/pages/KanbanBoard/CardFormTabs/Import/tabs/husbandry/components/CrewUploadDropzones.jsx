import { useRef, useState } from "react";
import PropTypes from "prop-types";

const DROPZONE_CONFIG = [
  { key: "crewList", title: "Crew List", accept: ".xlsx,.xls,.csv", multiple: false },
  { key: "passportIqama", title: "Passport / Iqama", accept: ".pdf,.jpg,.jpeg,.png", multiple: true },
  { key: "visa", title: "Visa", accept: ".pdf,.jpg,.jpeg,.png", multiple: true },
];

const DropzoneIcon = ({ status }) => {
  if (status === "uploading") {
    return <span className="crew-dropzone__spinner" aria-hidden="true" />;
  }
  if (status === "completed") {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (status === "failed") {
    return (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5V9M8 11.5H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 18a4.5 4.5 0 0 1-1.5-8.74A5.5 5.5 0 0 1 16.5 8H17a4 4 0 0 1 1 7.87M12 11v8M9 14l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

DropzoneIcon.propTypes = {
  status: PropTypes.oneOf(["pending", "uploading", "completed", "failed"]).isRequired,
};

// Compact drag & drop upload boxes for the Crew Management hero's left
// (of the progress tracker) side. Step 1 (Crew List) triggers a real import
// API via onSelectCrewListFile; steps 2/3 are local-only and gated until
// step 1 completes — mirrors the gating previously done inside
// CrewUploadSteps, which is now a pure progress/status display.
const CrewUploadDropzones = ({
  steps,
  movementType,
  movementTypeOptions,
  onChangeMovementType,
  onCrewListBlocked,
  onSelectCrewListFile,
  onSelectPassportIqamaFiles,
  onSelectVisaFiles,
}) => {
  const [draggingKey, setDraggingKey] = useState(null);
  const fileInputRefs = useRef({});

  const handlers = {
    crewList: (file) => onSelectCrewListFile(file),
    passportIqama: (fileList) => onSelectPassportIqamaFiles(fileList),
    visa: (fileList) => onSelectVisaFiles(fileList),
  };

  // Crew List additionally requires a movement type to be picked first;
  // Passport/Iqama and Visa keep the original "crew list completed" gate.
  const isDisabled = (key) =>
    key === "crewList" ? !movementType : steps.crewList?.status !== "completed";

  const openPicker = (key) => {
    if (isDisabled(key)) {
      if (key === "crewList") onCrewListBlocked?.();
      return;
    }
    if (steps[key]?.status === "uploading") return;
    fileInputRefs.current[key]?.click();
  };

  const handleDragEnter = (key) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled(key)) setDraggingKey(key);
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
    if (isDisabled(key)) {
      if (key === "crewList") onCrewListBlocked?.();
      return;
    }
    handlers[key](multiple ? e.dataTransfer.files : e.dataTransfer.files?.[0]);
  };

  return (
    <div className="crew-upload-dropzones">
      {DROPZONE_CONFIG.map((zone) => {
        const state = steps[zone.key] || { status: "pending", files: [] };
        const disabled = isDisabled(zone.key);

        return (
          <div
            key={zone.key}
            className={`crew-dropzone crew-dropzone--${state.status}${disabled ? " crew-dropzone--disabled" : ""}${draggingKey === zone.key ? " crew-dropzone--active" : ""}`}
            onClick={() => openPicker(zone.key)}
            onDragEnter={handleDragEnter(zone.key)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop(zone.key, zone.multiple)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            title={zone.title}
          >
            {zone.key === "crewList" && (
              <select
                className="crew-dropzone__movement-select"
                value={movementType}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  onChangeMovementType(e.target.value);
                }}
                aria-label="Movement type"
              >
                <option value="">Movement type</option>
                {movementTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            <input
              ref={(el) => (fileInputRefs.current[zone.key] = el)}
              type="file"
              accept={zone.accept}
              multiple={zone.multiple}
              className="crew-dropzone__input"
              disabled={disabled}
              onChange={(e) => {
                handlers[zone.key](zone.multiple ? e.target.files : e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <span className={`crew-dropzone__icon crew-dropzone__icon--${state.status}`}>
              <DropzoneIcon status={state.status} />
            </span>
            <span className="crew-dropzone__title">{zone.title}</span>
          </div>
        );
      })}
    </div>
  );
};

const stepStatePropType = PropTypes.shape({
  status: PropTypes.oneOf(["pending", "uploading", "completed", "failed"]),
  files: PropTypes.array,
  progress: PropTypes.number,
});

CrewUploadDropzones.propTypes = {
  steps: PropTypes.shape({
    crewList: stepStatePropType,
    passportIqama: stepStatePropType,
    visa: stepStatePropType,
  }).isRequired,
  movementType: PropTypes.string,
  movementTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })
  ),
  onChangeMovementType: PropTypes.func,
  onCrewListBlocked: PropTypes.func,
  onSelectCrewListFile: PropTypes.func.isRequired,
  onSelectPassportIqamaFiles: PropTypes.func.isRequired,
  onSelectVisaFiles: PropTypes.func.isRequired,
};

CrewUploadDropzones.defaultProps = {
  movementType: "",
  movementTypeOptions: [],
};

export default CrewUploadDropzones;
