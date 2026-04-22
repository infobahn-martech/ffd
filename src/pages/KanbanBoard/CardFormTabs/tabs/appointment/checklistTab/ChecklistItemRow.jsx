import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { FormTextarea } from "./checklistFormPrimitives";
import ChecklistFilePreviewCompact from "./ChecklistFilePreviewCompact";
import { formatFileSizeBytes } from "./checklistFormat";

const ReqBadge = ({ requirement }) => {
  if (!requirement?.label) return <span className="cl-req-cell">—</span>;
  const { variant, label } = requirement;
  const cls = [
    "cl-req-badge",
    variant === "copy_only" && "cl-req-badge--amber",
    variant === "original" && "cl-req-badge--red",
    variant === "format" && "cl-req-badge--blue",
    (variant === "custom" || variant === "none") && "cl-req-badge--neutral",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={cls} title={label}>
      {label}
    </span>
  );
};

ReqBadge.propTypes = {
  requirement: PropTypes.shape({
    variant: PropTypes.string,
    label: PropTypes.string,
  }),
};

const ChecklistItemRow = ({
  item,
  itemData,
  onChange,
  cardColor = "#2A00FF",
  isViewOnly = false,
  isDAModule = false,
}) => {
  const { id, title, description, requirement, expiryDateRequired, fullLabel = "", uploadedFromApi = [] } = item;

  const [remarks, setRemarks] = useState(itemData?.remarks || "");
  const [uploadedFile, setUploadedFile] = useState(itemData?.uploadedFile || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const apiFiles = itemData?.apiUploadedFiles ?? uploadedFromApi ?? [];
  const hasApiFiles = Array.isArray(apiFiles) && apiFiles.length > 0;

  useEffect(() => {
    setRemarks(itemData?.remarks || "");
    setUploadedFile(itemData?.uploadedFile ?? null);
  }, [itemData]);

  const hasUserFile = uploadedFile != null;
  const done = hasUserFile || hasApiFiles;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      onChange(id, { ...itemData, uploadedFile: file, remarks, checked: true, apiUploadedFiles: apiFiles });
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    onChange(id, { ...itemData, uploadedFile: null, remarks, checked: false, apiUploadedFiles: apiFiles });
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
      onChange(id, { ...itemData, uploadedFile: files[0], remarks, checked: true, apiUploadedFiles: apiFiles });
    }
  };
  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleRemarksChange = (e) => {
    const newRemarks = e.target.value;
    setRemarks(newRemarks);
    onChange(id, { ...itemData, uploadedFile, remarks: newRemarks, checked: done, apiUploadedFiles: apiFiles });
  };

  return (
    <tr className={`checklist-table-row cl-item-row ${done ? "checked" : ""}`} style={{ "--card-color": cardColor }}>
      <td className="checklist-table-checkbox">
        <div className="checklist-checkbox-wrapper checklist-checkbox-wrapper--table">
          <input type="checkbox" checked={done} disabled className="checklist-checkbox" readOnly />
          <span className="checklist-checkbox-custom checklist-checkbox-custom--table">
            {done && <span className="checkmark">✓</span>}
          </span>
        </div>
      </td>
      <td className="checklist-table-label cl-col-item">
        <div className="cl-item-title">{title}</div>
        {description ? <div className="cl-item-desc">{description}</div> : null}
        {fullLabel ? <span className="cl-item-fulllabel sr-only">{fullLabel}</span> : null}
      </td>
      <td className="checklist-table-requirement cl-col-req">
        <ReqBadge requirement={requirement} />
      </td>
      <td className="checklist-table-expiry cl-col-expiry">
        {expiryDateRequired ? (
          <input
            type="date"
            className="checklist-expiry-input"
            value={itemData?.expiryDate || ""}
            onChange={(e) => {
              const expiryDate = e.target.value;
              onChange(id, { ...itemData, uploadedFile, remarks, checked: done, expiryDate, apiUploadedFiles: apiFiles });
            }}
            disabled={isViewOnly}
          />
        ) : (
          <span className="cl-na">—</span>
        )}
      </td>
      <td className="checklist-table-upload cl-col-files">
        <div className="cl-files-stack">
          {hasApiFiles
            && apiFiles.map((f) => (
              <div key={f.id || f.name} className="cl-file-chip-wrap">
                <ChecklistFilePreviewCompact file={f} isDAModule />
              </div>
            ))}
          {isViewOnly && hasUserFile && (
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
          )}
          {!isViewOnly && (
            <div
              className={`checklist-table-upload-zone cl-upload-zone ${isDragging ? "dragging" : ""} ${
                uploadedFile ? "has-file" : ""
              }`}
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
                  <svg className="checklist-table-upload-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 5V19M12 5L7 10M12 5L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 15V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="checklist-table-upload-placeholder-text">Drop or browse</span>
                </div>
              )}
            </div>
          )}
        </div>
      </td>
      <td className="checklist-table-remarks">
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
