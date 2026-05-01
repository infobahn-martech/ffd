import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import { FormTextarea } from "./checklistFormPrimitives";

const formatExpiryDisplay = (value) => {
  if (!value) return "--/--/----";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

/** Preview/open URL from API checklist upload — prefer file_url over legacy url/link. */
const getApiUploadedPreviewUrl = (file) =>
  file?.file_url ?? file?.url ?? file?.link ?? null;

const getRequirementMetaLabel = ({ requireCopyOnlyFromApi, requirement }) => {
  if (requireCopyOnlyFromApi) return "Req Copy";
  if (!requirement?.label) return "";

  const label = String(requirement.label).trim();
  if (!label) return "";
  if (/copy/i.test(label)) return "Req Copy";
  if (/original/i.test(label)) return "Req Original";
  return label;
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
  const fileInputRef = useRef(null);

  const checked = itemData?.checked === true;
  const apiFiles = itemData?.apiUploadedFiles ?? uploadedFromApi ?? [];
  const firstApiFileWithUrl =
    Array.isArray(apiFiles) ? apiFiles.find((f) => Boolean(getApiUploadedPreviewUrl(f))) : null;
  const firstApiPreviewUrl = firstApiFileWithUrl ? getApiUploadedPreviewUrl(firstApiFileWithUrl) : null;
  const hasPreviewableApiFile = Boolean(firstApiPreviewUrl);
  const canViewFile = Boolean(uploadedFile) || hasPreviewableApiFile;
  const viewButtonTitle = uploadedFile
    ? uploadedFile.name || "View uploaded file"
    : firstApiFileWithUrl
      ? String(firstApiFileWithUrl.fileName ?? firstApiFileWithUrl.name ?? "View uploaded file")
      : "No file available";
  const requirementMetaLabel = getRequirementMetaLabel({ requireCopyOnlyFromApi, requirement });
  const showMetaRow = Boolean(expiryDateRequired || requirementMetaLabel);

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

  const handleBrowseClick = () => fileInputRef.current?.click();

  const handleRemarksChange = (e) => {
    const newRemarks = e.target.value;
    setRemarks(newRemarks);
    pushChange({ remarks: newRemarks });
  };

  const handleExpiryChange = (e) => {
    pushChange({ expiryDate: e.target.value });
  };

  const handleViewClick = () => {
    if (uploadedFile) {
      const objectUrl = URL.createObjectURL(uploadedFile);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      return;
    }
    if (firstApiPreviewUrl) {
      window.open(firstApiPreviewUrl, "_blank", "noopener,noreferrer");
    }
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
        <div className="cl-item-content">
          <div className="cl-item-title-row">
            <div className="cl-item-title cl-item-title--primary" title={title}>{title}</div>
          </div>
          {showMetaRow ? (
            <div className="cl-item-meta-row">
              {expiryDateRequired ? (
                <span className="cl-item-meta-chip cl-item-meta-chip--expiry">
                  <span className="cl-item-meta-icon" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M8 3V7M16 3V7M3 10H21" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <span className="cl-item-meta-label">Exp:</span>
                  <input
                    type="date"
                    className="checklist-expiry-input cl-item-expiry-input"
                    value={itemData?.expiryDate || ""}
                    onChange={handleExpiryChange}
                    disabled={isViewOnly}
                    aria-label="Expiry date"
                  />
                  <span className="cl-item-expiry-display" aria-hidden>
                    {formatExpiryDisplay(itemData?.expiryDate || "")}
                  </span>
                </span>
              ) : null}
              {expiryDateRequired && requirementMetaLabel ? <span className="cl-item-meta-sep" aria-hidden>|</span> : null}
              {requirementMetaLabel ? (
                <span className="cl-item-meta-chip" title={requirementMetaLabel}>
                  <span className="cl-item-meta-icon" aria-hidden>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M14 3H7C5.9 3 5 3.9 5 5V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V8L14 3Z" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M14 3V8H19" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M9 12H15M9 16H15" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </span>
                  <span className="cl-item-meta-label">{requirementMetaLabel}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </td>
      <td className="checklist-table-upload cl-col-upload">
        <div className="cl-upload-col">
          <div className="cl-upload-row cl-upload-row--actions">
            {!isViewOnly ? (
              <button
                type="button"
                className="cl-upload-btn"
                onClick={handleBrowseClick}
                title={uploadedFile ? "Replace uploaded file" : "Upload file"}
                aria-label={uploadedFile ? "Replace uploaded file" : "Upload file"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 16V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8 8L12 4L16 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 19H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span>Upload</span>
              </button>
            ) : null}
            <button
              type="button"
              className="cl-upload-view-btn"
              onClick={handleViewClick}
              disabled={!canViewFile}
              title={canViewFile ? viewButtonTitle : "No file available"}
              aria-label={canViewFile ? viewButtonTitle : "No file available"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M2 12C3.8 8.5 7.3 6 12 6C16.7 6 20.2 8.5 22 12C20.2 15.5 16.7 18 12 18C7.3 18 3.8 15.5 2 12Z" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            {!isViewOnly && uploadedFile ? (
              <button
                type="button"
                className="cl-upload-remove-btn"
                onClick={handleRemoveFile}
                title={uploadedFile?.name || uploadedFile?.fileName || "Remove file"}
                aria-label="Remove uploaded file"
              >
                ×
              </button>
            ) : null}
          </div>
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
