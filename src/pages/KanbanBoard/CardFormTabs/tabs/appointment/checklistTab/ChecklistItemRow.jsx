import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { FormTextarea } from "./checklistFormPrimitives";
import ChecklistFilePreviewCompact from "./ChecklistFilePreviewCompact";
import { formatFileSizeBytes } from "./checklistFormat";

const ApiFilePreviewChip = ({ file }) => {
  const displayName = file?.file_name ?? file?.fileName ?? file?.name ?? "File";
  const href = file?.url || file?.link;
  const getFileType = (fileName) => {
    if (!fileName) return "";
    return fileName.split(".").pop()?.toLowerCase() || "";
  };
  const ext = getFileType(displayName);
  const isPDF = ext === "pdf";
  const isWord = ["doc", "docx"].includes(ext);

  const inner = (
    <>
      <div className="cl-api-file-chip__ico" aria-hidden>
        {isPDF ? (
          <div className="cl-file-ico cl-file-ico--pdf" title="PDF">
            <span>PDF</span>
          </div>
        ) : isWord ? (
          <div className="cl-file-ico cl-file-ico--word">W</div>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="cl-api-file-chip__name" title={displayName}>
        {displayName}
      </span>
    </>
  );

  if (href) {
    return (
      <a className="cl-api-file-chip cl-api-file-chip--link" href={href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }
  return <div className="cl-api-file-chip">{inner}</div>;
};

ApiFilePreviewChip.propTypes = {
  file: PropTypes.object,
};

const ChecklistItemRow = ({
  item,
  itemData,
  onChange,
  cardColor = "#2A00FF",
  isViewOnly = false,
  isDAModule = false,
}) => {
  const { id, title, description, expiryDateRequired, fullLabel = "", uploadedFromApi = [], requireCopyOnlyFromApi } = item;

  const [remarks, setRemarks] = useState(itemData?.remarks || "");
  const [uploadedFile, setUploadedFile] = useState(itemData?.uploadedFile || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const checked = itemData?.checked === true;
  const apiFiles = itemData?.apiUploadedFiles ?? uploadedFromApi ?? [];
  const hasApiFiles = Array.isArray(apiFiles) && apiFiles.length > 0;

  useEffect(() => {
    setRemarks(itemData?.remarks || "");
    setUploadedFile(itemData?.uploadedFile ?? null);
  }, [itemData]);

  const pushChange = (patch) => {
    onChange(id, {
      ...itemData,
      remarks,
      uploadedFile,
      apiUploadedFiles: apiFiles,
      ...patch,
    });
  };

  const handleCheckedChange = (e) => {
    const next = e.target.checked;
    pushChange({ checked: next });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      pushChange({ uploadedFile: file });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    pushChange({ uploadedFile: null });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      setUploadedFile(files[0]);
      pushChange({ uploadedFile: files[0] });
    }
  };
  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleRemarksChange = (e) => {
    const newRemarks = e.target.value;
    setRemarks(newRemarks);
    pushChange({ remarks: newRemarks });
  };

  const handleExpiryChange = (e) => {
    pushChange({ expiryDate: e.target.value });
  };

  return (
    <tr className={`checklist-table-row cl-item-row ${checked ? "checked" : ""}`} style={{ "--card-color": cardColor }}>
      <td className="checklist-table-checkbox">
        <label className="checklist-checkbox-wrapper checklist-checkbox-wrapper--table">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleCheckedChange}
            disabled={isViewOnly}
            className="checklist-checkbox"
            aria-label="Mark checklist item done"
          />
          <span className="checklist-checkbox-custom checklist-checkbox-custom--table">
            {checked ? <span className="checkmark">✓</span> : null}
          </span>
        </label>
      </td>
      <td className="checklist-table-label cl-col-item cl-item-cell">
        <div className="cl-item-stack">
          <div className="cl-item-title cl-item-title--primary">{title}</div>
          {requireCopyOnlyFromApi ? (
            <div className="cl-item-badge-row">
              <span className="cl-req-badge cl-req-badge--amber">Require Copy Only</span>
            </div>
          ) : null}
          {expiryDateRequired ? (
            <div className="cl-item-expiry">
              <span className="cl-item-expiry-label">Expiry date</span>
              <input
                type="date"
                className="checklist-expiry-input cl-item-expiry-input"
                value={itemData?.expiryDate || ""}
                onChange={handleExpiryChange}
                disabled={isViewOnly}
              />
            </div>
          ) : null}
          {description ? (
            <div className="cl-item-desc cl-item-desc--stacked">{description}</div>
          ) : null}
          {fullLabel ? <span className="cl-item-fulllabel sr-only">{fullLabel}</span> : null}
        </div>
      </td>
      <td className="checklist-table-upload cl-col-upload">
        <div className="cl-upload-col">
          {hasApiFiles ? (
            <div className="cl-upload-section cl-upload-section--existing">
              <div className="cl-upload-section__label">Existing files</div>
              <div className="cl-api-preview-list">
                {apiFiles.map((f) => (
                  <ApiFilePreviewChip key={f.id || f.file_id || f.name} file={f} />
                ))}
              </div>
            </div>
          ) : null}
          {isViewOnly && !hasApiFiles && uploadedFile ? (
            <div className="checklist-table-view-file-chip">
              <div className="checklist-table-view-file-chip-icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
              <div className="checklist-table-view-file-chip-body">
                <span className="checklist-table-view-file-chip-name">
                  {uploadedFile?.name || uploadedFile?.fileName || "Document.pdf"}
                </span>
                {formatFileSizeBytes(uploadedFile?.size) ? (
                  <span className="checklist-table-view-file-chip-size">{formatFileSizeBytes(uploadedFile?.size)}</span>
                ) : null}
              </div>
            </div>
          ) : null}
          {!isViewOnly && (
            <div className="cl-upload-section cl-upload-section--new">
              {hasApiFiles ? <div className="cl-upload-section__label">New upload</div> : null}
              <div
                className={`checklist-table-upload-zone cl-upload-zone ${isDragging ? "dragging" : ""} ${uploadedFile ? "has-file" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!uploadedFile ? handleBrowseClick : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id={`file-upload-${id}`}
                  onChange={handleFileChange}
                  className="checklist-file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {uploadedFile ? (
                  <div className="checklist-table-file-preview">
                    <ChecklistFilePreviewCompact file={uploadedFile} onRemove={handleRemoveFile} isDAModule={isDAModule} />
                  </div>
                ) : (
                  <div className="checklist-table-upload-placeholder">
                    <svg
                      className="checklist-table-upload-icon"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path d="M12 5V19M12 5L7 10M12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="checklist-table-upload-placeholder-text">Drop or browse</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="checklist-table-remarks cl-col-remarks">
        <FormTextarea
          value={remarks}
          onChange={handleRemarksChange}
          placeholder="Add remarks…"
          rows={2}
          className="checklist-table-textarea cl-remarks-ta"
          disabled={isViewOnly}
        />
      </td>
    </tr>
  );
};

ChecklistItemRow.propTypes = {
  item: PropTypes.object.isRequired,
  itemData: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  isDAModule: PropTypes.bool,
};

export default ChecklistItemRow;
