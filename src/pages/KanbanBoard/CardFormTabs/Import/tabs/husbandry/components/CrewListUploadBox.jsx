import { useRef, useState } from "react";
import PropTypes from "prop-types";

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 18a4.5 4.5 0 0 1-1.5-8.74A5.5 5.5 0 0 1 16.5 8H17a4 4 0 0 1 1 7.87M12 11v8M9 14l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5V9M8 11.5H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Single, movement-type-aware Crew List upload box. Unlike a generic
// dropzone, its title/subtitle track whichever movement type is currently
// selected and that type's own upload status — "Upload Sign On Crew List",
// "Sign On Crew List Uploaded", etc. — instead of a type-less "Crew List"
// box that just turns green on completion.
const CrewListUploadBox = ({
  movementType,
  movementTypeLabel,
  otherMovementTypeLabel,
  status,
  onSelectFile,
  onBlocked,
}) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const disabled = !movementType || status === "uploading";

  const openPicker = () => {
    if (!movementType) {
      onBlocked?.();
      return;
    }
    if (status === "uploading") return;
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (!movementType) {
      onBlocked?.();
      return;
    }
    if (status === "uploading") return;
    const file = e.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  };

  let title = "Crew List";
  let subtitle = "Select a movement type to enable upload";
  let Icon = UploadIcon;

  if (movementType) {
    if (status === "uploading") {
      title = `Uploading ${movementTypeLabel} Crew List…`;
      subtitle = "Please wait";
    } else if (status === "completed") {
      title = `${movementTypeLabel} Crew List Uploaded`;
      subtitle = `Upload another or select ${otherMovementTypeLabel}`;
      Icon = CheckIcon;
    } else if (status === "failed") {
      title = `${movementTypeLabel} Crew List Upload Failed`;
      subtitle = "Tap to try again";
      Icon = WarningIcon;
    } else {
      title = `Upload ${movementTypeLabel} Crew List`;
      subtitle = "Excel or CSV";
    }
  }

  return (
    <div
      className={`crew-list-upload-box crew-list-upload-box--${status}${disabled ? " crew-list-upload-box--disabled" : ""}${dragging ? " crew-list-upload-box--active" : ""}`}
      onClick={openPicker}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="crew-dropzone__input"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onSelectFile(file);
        }}
      />
      <span className={`crew-list-upload-box__icon crew-list-upload-box__icon--${status}`}>
        {status === "uploading" ? <span className="crew-dropzone__spinner" aria-hidden="true" /> : <Icon />}
      </span>
      <span className="crew-list-upload-box__text">
        <span className="crew-list-upload-box__title">{title}</span>
        <span className="crew-list-upload-box__subtitle">{subtitle}</span>
      </span>
    </div>
  );
};

CrewListUploadBox.propTypes = {
  movementType: PropTypes.string,
  movementTypeLabel: PropTypes.string,
  otherMovementTypeLabel: PropTypes.string,
  status: PropTypes.oneOf(["pending", "uploading", "completed", "failed"]),
  onSelectFile: PropTypes.func.isRequired,
  onBlocked: PropTypes.func,
};

CrewListUploadBox.defaultProps = {
  movementType: "",
  movementTypeLabel: "",
  otherMovementTypeLabel: "",
  status: "pending",
};

export default CrewListUploadBox;
