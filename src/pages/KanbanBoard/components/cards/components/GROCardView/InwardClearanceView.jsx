import PropTypes from "prop-types";
import DateTimePickerField from "../../../../CardFormTabs/components/DateTimePickerField";
import {
  formatGroDocumentDisplayName,
  getGroDocumentVerifyStatus,
  groDocumentHasDownloadableUrl,
  GRO_FILE_BADGE,
  getGroFileType,
} from "./groCardUtils";

const GroDocumentFilePreview = ({ fileName, fileUrl }) => {
  const kind = getGroFileType(fileName || fileUrl || "");
  const badge = GRO_FILE_BADGE[kind] || "";

  const SheetBase = ({ children }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
      {children}
    </svg>
  );

  let inner = (
    <SheetBase>
      <path d="M16 13H8M16 17H8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </SheetBase>
  );

  if (kind === "pdf") {
    inner = (
      <SheetBase>
        <path d="M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
      </SheetBase>
    );
  } else if (kind === "excel") {
    inner = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.35" />
        <path d="M4 9h16M4 14h16M10 4v16M15 4v16" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  } else if (kind === "word") {
    inner = (
      <SheetBase>
        <path d="M10 11l2 6 2-6 2 6 2-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </SheetBase>
    );
  } else if (kind === "image") {
    inner = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <rect x="3.5" y="5" width="17" height="14" rx="2" stroke="currentColor" strokeWidth="1.35" />
        <circle cx="8.5" cy="10" r="1.6" fill="currentColor" />
        <path d="M21 17l-5-5-4 4-2.5-2.5L4 17" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <div className={`gro-document-preview-icon gro-document-preview-icon--${kind}`} title={fileName || fileUrl || ""}>
      <span className="gro-document-preview-icon-graphic">{inner}</span>
      {badge ? (
        <span className="gro-document-preview-icon-badge" aria-hidden>
          {badge}
        </span>
      ) : null}
    </div>
  );
};

GroDocumentFilePreview.propTypes = {
  fileName: PropTypes.string,
  fileUrl: PropTypes.string,
};

const IconCross = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const IconTick = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const IconReupload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconDownload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/** Inward clearance trigger + upload popover (anchored beside segmented tabs). */
export function InwardClearanceToolbar({
  inwardAnchorRef,
  inwardFileInputRef,
  showInwardClearance,
  onToggleInwardPopover,
  inwardActionLabel = "Inward clearance",
  inwardPopoverTitle = "Inward Clearance",
  inwardFile,
  onInwardFileChange,
  inwardPickerParts,
  onInwardDateTimeChange,
  onInwardCancel,
  onInwardSubmit,
  isSavingInward,
  isGroLoadingDisabled,
}) {
  return (
    <div className="gro-inward-anchor" ref={inwardAnchorRef}>
      <button
        type="button"
        className={`gro-pass-segment${showInwardClearance ? " gro-pass-segment--popover-open" : ""}`}
        aria-expanded={showInwardClearance}
        disabled={isGroLoadingDisabled}
        onClick={onToggleInwardPopover}
      >
        {inwardActionLabel}
      </button>
      {showInwardClearance ? (
        <div className="gro-inward-popover" role="dialog" aria-label={inwardPopoverTitle}>
          <div className="gro-inward-popover-header">{inwardPopoverTitle}</div>
          <div className="gro-inward-popover-body">
            <div className="gro-inward-popover-field">
              <span className="gro-inward-popover-label">File upload</span>
              <div className="gro-premium-upload">
                <input
                  ref={inwardFileInputRef}
                  id="gro-inward-file-input"
                  type="file"
                  className="gro-premium-upload-input-hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={isSavingInward}
                  onChange={onInwardFileChange}
                />
                <button type="button" className="gro-premium-upload-btn" disabled={isSavingInward} onClick={() => inwardFileInputRef.current?.click()}>
                  Choose file
                </button>
                <span className="gro-premium-upload-filename" title={inwardFile?.name || ""}>
                  {inwardFile?.name || "No file chosen"}
                </span>
              </div>
            </div>
            <div className="gro-inward-popover-field gro-inward-popover-datetime-full">
              <span className="gro-inward-popover-label">Date & Time</span>
              <DateTimePickerField
                dateValue={inwardPickerParts.date}
                timeValue={inwardPickerParts.time}
                onDateTimeChange={onInwardDateTimeChange}
                placeholder="YYYY-MM-DD hh:mm"
                popperClassName="gro-inward-datetime-popper"
              />
            </div>
          </div>
          <div className="gro-inward-popover-footer">
            <button type="button" className="gro-inward-popover-btn-cancel" disabled={isSavingInward} onClick={onInwardCancel}>
              Cancel
            </button>
            <button type="button" className="gro-inward-popover-btn-submit" disabled={isSavingInward} onClick={onInwardSubmit}>
              {isSavingInward ? "Saving..." : "Submit"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

InwardClearanceToolbar.propTypes = {
  inwardAnchorRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  inwardFileInputRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
  showInwardClearance: PropTypes.bool.isRequired,
  onToggleInwardPopover: PropTypes.func.isRequired,
  inwardActionLabel: PropTypes.string,
  inwardPopoverTitle: PropTypes.string,
  inwardFile: PropTypes.any,
  onInwardFileChange: PropTypes.func.isRequired,
  inwardPickerParts: PropTypes.shape({
    date: PropTypes.string,
    time: PropTypes.string,
  }).isRequired,
  onInwardDateTimeChange: PropTypes.func.isRequired,
  onInwardCancel: PropTypes.func.isRequired,
  onInwardSubmit: PropTypes.func.isRequired,
  isSavingInward: PropTypes.bool.isRequired,
  isGroLoadingDisabled: PropTypes.bool.isRequired,
};

/** Documents list — verify / reject remarks / download. */
function InwardClearanceView({
  documents,
  isGroLoading,
  activeRemarkDoc,
  remarkDraft,
  verifyingDocId,
  onRemarkDraftChange,
  onCrossClick,
  onRemarkCancel,
  onRemarkSubmit,
  onTickClick,
  onDocumentDownload,
}) {
  return (
    <div className="gro-document-list">
      {isGroLoading ? (
        <div className="gro-document-loading">Loading documents…</div>
      ) : (
        documents.map((doc) => {
          const rowKey = doc.__rowKey;
          const label = formatGroDocumentDisplayName(doc.document_name ?? "");
          const status = getGroDocumentVerifyStatus(doc);
          const isNotUploaded = status === 0;
          const isPendingVerification = status === 1;
          const isVerified = status === 2;
          const isReupload = status === 3;
          const isRejected = status === 4;
          const remarkOpen = activeRemarkDoc === rowKey;
          const rowBusy = verifyingDocId === rowKey;
          const remarksTextRaw = doc?.remarks != null && String(doc.remarks).trim() !== "" ? String(doc.remarks).trim() : "";
          const showRemarksBadge = Boolean(remarksTextRaw) && !isNotUploaded;
          const hasFile = groDocumentHasDownloadableUrl(doc);
          const showDownload = hasFile && !isNotUploaded;

          let rowStatusClass = "gro-document-row-status-not-uploaded";
          if (isPendingVerification) rowStatusClass = "gro-document-row-status-pending";
          else if (isVerified) rowStatusClass = "gro-document-row-status-verified";
          else if (isReupload) rowStatusClass = "gro-document-row-status-reupload";
          else if (isRejected) rowStatusClass = "gro-document-row-status-rejected";

          return (
            <div key={rowKey} className={`gro-document-row ${rowStatusClass}${remarkOpen ? " gro-document-row-editing" : ""}`}>
              <GroDocumentFilePreview fileName={doc.file_name} fileUrl={doc.file_url} />
              <div className="gro-document-main">
                <div className="gro-document-main-top">
                  <span className="gro-document-title">{label}</span>
                  {isNotUploaded ? (
                    <span className="gro-document-no-attachment" title="No file uploaded for this document">
                      No attachment
                    </span>
                  ) : null}
                  {showRemarksBadge ? (
                    <span className="gro-document-remarks-badge" title={remarksTextRaw}>
                      Remarks: {remarksTextRaw}
                    </span>
                  ) : null}
                </div>
              </div>
              {remarkOpen && isPendingVerification ? (
                <div className="gro-inline-remark gro-inline-remark--compact">
                  <input
                    type="text"
                    className="gro-inline-remark-input"
                    placeholder="Enter remarks"
                    value={remarkDraft}
                    disabled={Boolean(verifyingDocId)}
                    onChange={onRemarkDraftChange}
                    aria-label="Document remarks"
                  />
                  <div className="gro-inline-remark-actions">
                    <button type="button" className="gro-inline-remark-btn gro-inline-remark-btn-cancel" disabled={Boolean(verifyingDocId)} onClick={onRemarkCancel}>
                      Cancel
                    </button>
                    <button type="button" className="gro-inline-remark-btn gro-inline-remark-btn-submit" disabled={Boolean(verifyingDocId)} onClick={onRemarkSubmit}>
                      {rowBusy ? "Saving..." : "Submit"}
                    </button>
                  </div>
                </div>
              ) : null}
              <div className="gro-document-actions">
                {isPendingVerification ? (
                  <button
                    type="button"
                    className="gro-doc-action-btn gro-doc-action-btn--approved"
                    disabled={Boolean(verifyingDocId)}
                    onClick={() => onTickClick(doc, rowKey)}
                  >
                    <IconTick />
                    <span>Approved</span>
                  </button>
                ) : null}
                {isVerified ? (
                  <button type="button" className="gro-doc-action-btn gro-doc-action-btn--approved gro-doc-action-btn--readonly" tabIndex={-1} aria-label="Approved">
                    <IconTick />
                    <span>Approved</span>
                  </button>
                ) : null}
                {isPendingVerification ? (
                  <button
                    type="button"
                    className={`gro-doc-action-btn gro-doc-action-btn--reject${remarkOpen ? " gro-doc-action-btn--active" : ""}`}
                    aria-pressed={remarkOpen}
                    aria-label="Reject — add remarks"
                    disabled={Boolean(verifyingDocId)}
                    onClick={() => onCrossClick(rowKey, doc)}
                  >
                    <IconCross />
                    <span>Reject</span>
                  </button>
                ) : null}
                {isReupload ? (
                  <button type="button" className="gro-doc-action-btn gro-doc-action-btn--reupload gro-doc-action-btn--readonly" tabIndex={-1} aria-label="Reupload required">
                    <IconReupload />
                    <span>Reupload</span>
                  </button>
                ) : null}
                {isRejected ? (
                  <button type="button" className="gro-doc-action-btn gro-doc-action-btn--rejected gro-doc-action-btn--readonly" tabIndex={-1} aria-label="Rejected">
                    <IconCross />
                    <span>Rejected</span>
                  </button>
                ) : null}
                {showDownload ? (
                  <button
                    type="button"
                    className="gro-doc-action-btn gro-doc-action-btn--download gro-doc-action-btn--icon-only"
                    title="Download"
                    aria-label="Download"
                    onClick={() => onDocumentDownload(doc)}
                  >
                    <IconDownload />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

InwardClearanceView.propTypes = {
  documents: PropTypes.array.isRequired,
  isGroLoading: PropTypes.bool.isRequired,
  activeRemarkDoc: PropTypes.string,
  remarkDraft: PropTypes.string.isRequired,
  verifyingDocId: PropTypes.string,
  onRemarkDraftChange: PropTypes.func.isRequired,
  onCrossClick: PropTypes.func.isRequired,
  onRemarkCancel: PropTypes.func.isRequired,
  onRemarkSubmit: PropTypes.func.isRequired,
  onTickClick: PropTypes.func.isRequired,
  onDocumentDownload: PropTypes.func.isRequired,
};

export default InwardClearanceView;
