import PropTypes from "prop-types";
import DateTimePickerField from "../../../../../CardFormTabs/components/DateTimePickerField";

/** Task document upload popover (anchored beside segmented tabs). */
function TaskDocumentUploadPanel({
  anchorRef,
  fileInputRef,
  isOpen,
  onToggle,
  actionLabel = "Task Documents",
  panelTitle = "Task Documents",
  file,
  onFileChange,
  pickerParts,
  onDateTimeChange,
  onCancel,
  onSubmit,
  isSaving,
  isDisabled,
}) {
  return (
    <div className="gro-inward-anchor" ref={anchorRef}>
      <button
        type="button"
        className={`gro-pass-segment${isOpen ? " gro-pass-segment--popover-open" : ""}`}
        aria-expanded={isOpen}
        disabled={isDisabled}
        onClick={onToggle}
      >
        {actionLabel}
      </button>
      {isOpen ? (
        <div className="gro-inward-popover" role="dialog" aria-label={panelTitle}>
          <div className="gro-inward-popover-header">{panelTitle}</div>
          <div className="gro-inward-popover-body">
            <div className="gro-inward-popover-field">
              <span className="gro-inward-popover-label">File upload</span>
              <div className="gro-premium-upload">
                <input
                  ref={fileInputRef}
                  id="gro-inward-file-input"
                  type="file"
                  className="gro-premium-upload-input-hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={isSaving}
                  onChange={onFileChange}
                />
                <button
                  type="button"
                  className="gro-premium-upload-btn"
                  disabled={isSaving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose file
                </button>
                <span className="gro-premium-upload-filename" title={file?.name || ""}>
                  {file?.name || "No file chosen"}
                </span>
              </div>
            </div>
            <div className="gro-inward-popover-field gro-inward-popover-datetime-full">
              <span className="gro-inward-popover-label">Date & Time</span>
              <DateTimePickerField
                dateValue={pickerParts.date}
                timeValue={pickerParts.time}
                onDateTimeChange={onDateTimeChange}
                placeholder="YYYY-MM-DD hh:mm"
                popperClassName="gro-inward-datetime-popper"
              />
            </div>
          </div>
          <div className="gro-inward-popover-footer">
            <button type="button" className="gro-inward-popover-btn-cancel" disabled={isSaving} onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="gro-inward-popover-btn-submit" disabled={isSaving} onClick={onSubmit}>
              {isSaving ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

TaskDocumentUploadPanel.propTypes = {
  anchorRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  fileInputRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  actionLabel: PropTypes.string,
  panelTitle: PropTypes.string,
  file: PropTypes.any,
  onFileChange: PropTypes.func.isRequired,
  pickerParts: PropTypes.shape({
    date: PropTypes.string,
    time: PropTypes.string,
  }).isRequired,
  onDateTimeChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
};

export default TaskDocumentUploadPanel;
