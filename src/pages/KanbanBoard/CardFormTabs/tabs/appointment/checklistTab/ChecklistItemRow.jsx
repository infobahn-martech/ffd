import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { FormTextarea } from "./checklistFormPrimitives";

const RequirementIndicator = ({ requirement }) => {
  if (!requirement?.label) return null;
  const label = String(requirement.label);
  const isOriginal = /original/i.test(label);
  const isFormat = /format/i.test(label) || /attached/i.test(label);
  const toneClass = isOriginal ? "cl-req-icon--original" : isFormat ? "cl-req-icon--format" : "cl-req-icon--copy";
  const icon = isOriginal ? "✓" : isFormat ? "📎" : "⧉";

  return (
    <span className={`cl-req-icon ${toneClass}`} title={label} aria-label={label}>
      {icon}
    </span>
  );
};

RequirementIndicator.propTypes = {
  requirement: PropTypes.shape({
    label: PropTypes.string,
  }),
};

const FileActionIcon = ({ file, onClick }) => {
  const name = file?.file_name ?? file?.fileName ?? file?.name ?? "File";
  return (
    <button type="button" className="cl-file-icon-btn cl-file-icon-btn--existing" onClick={onClick} title={name} aria-label={name}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    </button>
  );
};

FileActionIcon.propTypes = {
  file: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};

const ChecklistItemRow = ({
  item,
  itemData,
  onChange,
  cardColor = "#2A00FF",
  isViewOnly = false,
}) => {
  const { id, title, expiryDateRequired, uploadedFromApi = [], requirement, requireCopyOnlyFromApi } = item;

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

  const handleApiFileClick = (file) => {
    const href = file?.url || file?.link;
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
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
        <div className="cl-item-inline">
          <div className="cl-item-title cl-item-title--primary" title={title}>{title}</div>
          {(requireCopyOnlyFromApi || requirement?.label) ? (
            <RequirementIndicator requirement={requirement || { label: "Require Copy Only" }} />
          ) : null}
          {expiryDateRequired ? (
            <div className="cl-item-expiry cl-item-expiry--inline">
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
        </div>
      </td>
      <td className="checklist-table-upload cl-col-upload">
        <div className="cl-upload-col">
          <div className="cl-upload-inline">
            {hasApiFiles
              ? apiFiles.map((f) => (
                <FileActionIcon
                  key={f.id || f.file_id || f.name}
                  file={f}
                  onClick={() => handleApiFileClick(f)}
                />
              ))
              : null}
            {uploadedFile ? (
              <button
                type="button"
                className="cl-file-icon-btn cl-file-icon-btn--local"
                onClick={handleRemoveFile}
                title={uploadedFile?.name || uploadedFile?.fileName || "Remove file"}
                aria-label="Remove uploaded file"
              >
                ×
              </button>
            ) : null}
          </div>
          {!isViewOnly ? (
            <button
              type="button"
              className={`cl-upload-dropzone ${isDragging ? "dragging" : ""}`}
              onClick={handleBrowseClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              title={uploadedFile ? "Replace uploaded file" : "Upload file"}
              aria-label={uploadedFile ? "Replace uploaded file" : "Upload file"}
            >
              <span className="cl-upload-dropzone__text">
                Drag and drop your files here, or <span className="cl-upload-dropzone__link">click to browse</span>
              </span>
              <span className="cl-upload-dropzone__hint">Supports all file formats</span>
            </button>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            id={`file-upload-${id}`}
            onChange={handleFileChange}
            className="checklist-file-input"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
        </div>
      </td>
      <td className="checklist-table-remarks cl-col-remarks">
        <FormTextarea
          value={remarks}
          onChange={handleRemarksChange}
          placeholder="Add remarks…"
          rows={1}
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
};

export default ChecklistItemRow;
