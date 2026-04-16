import { useState, useRef } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput, ReactQuillEditor } from "./Husbandry.components";

const MWPRenewalContent = ({ formValues, handleChange, cardColor }) => {
  const [isDraggingRequestEmail, setIsDraggingRequestEmail] = useState(false);
  const [isDraggingMWPDocuments, setIsDraggingMWPDocuments] = useState(false);
  const requestEmailFileInputRef = useRef(null);
  const mwpDocumentsFileInputRef = useRef(null);

  // Handle file upload for Request Email documents
  const handleRequestEmailFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const syntheticEvent = { target: { value: files } };
    handleChange("mwpRenewalRequestEmailDocuments")(syntheticEvent);
  };

  // Handle drag and drop for Request Email
  const handleRequestEmailDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRequestEmail(true); ñ
  };

  const handleRequestEmailDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRequestEmail(false);
  };

  const handleRequestEmailDrop = (e) => {
    ñ
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRequestEmail(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const syntheticEvent = { target: { value: files } };
      handleChange("mwpRenewalRequestEmailDocuments")(syntheticEvent);
    }
  };

  const handleRequestEmailBrowseClick = () => {
    requestEmailFileInputRef.current?.click();
  };

  const handleRemoveRequestEmailFile = (index) => {
    const files = Array.from(formValues.mwpRenewalRequestEmailDocuments || []);
    files.splice(index, 1);
    const syntheticEvent = { target: { value: files } };
    handleChange("mwpRenewalRequestEmailDocuments")(syntheticEvent);
  };

  // Handle file upload for MWP Documents
  const handleMWPDocumentsFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const syntheticEvent = { target: { value: files } };
    handleChange("mwpRenewalDocuments")(syntheticEvent);
  };

  // Handle drag and drop for MWP Documents
  const handleMWPDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMWPDocuments(true);
  };

  const handleMWPDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMWPDocuments(false);
  };

  const handleMWPDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMWPDocuments(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const syntheticEvent = { target: { value: files } };
      handleChange("mwpRenewalDocuments")(syntheticEvent);
    }
  };

  const handleMWPDocumentsBrowseClick = () => {
    mwpDocumentsFileInputRef.current?.click();
  };

  const handleRemoveMWPDocumentsFile = (index) => {
    const files = Array.from(formValues.mwpRenewalDocuments || []);
    files.splice(index, 1);
    const syntheticEvent = { target: { value: files } };
    handleChange("mwpRenewalDocuments")(syntheticEvent);
  };

  // Get selected files
  const requestEmailFiles = formValues.mwpRenewalRequestEmailDocuments || [];
  const requestEmailFilesCount = requestEmailFiles.length;
  const mwpDocumentsFiles = formValues.mwpRenewalDocuments || [];
  const mwpDocumentsFilesCount = mwpDocumentsFiles.length;

  // Handle save
  const handleSave = () => {
    console.log("Saving MWP Renewal data:", {
      mwpRenewalExpiryDate: formValues.mwpRenewalExpiryDate,
      mwpRenewalRequestEmailDocuments: formValues.mwpRenewalRequestEmailDocuments,
      mwpRenewalDocuments: formValues.mwpRenewalDocuments,
      mwpRenewalDescription: formValues.mwpRenewalDescription,
    });
    // Add your save logic here
  };

  // File upload component renderer
  const renderFileUpload = (
    files,
    filesCount,
    isDragging,
    fileInputRef,
    onDragOver,
    onDragLeave,
    onDrop,
    onBrowseClick,
    onRemoveFile,
    fieldName,
    accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
  ) => {
    return (
      <div
        className={`document-upload-zone ${isDragging ? "dragging" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={fieldName}
          multiple
          onChange={fieldName === "mwpRenewalRequestEmailDocuments" ? handleRequestEmailFileChange : handleMWPDocumentsFileChange}
          className="file-input-hidden"
          accept={accept}
        />

        {filesCount === 0 ? (
          <div className="upload-zone-content">
            <div className="upload-icon-wrapper">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="4"
                  width="40"
                  height="40"
                  rx="8"
                  stroke={cardColor || "#00368c"}
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  fill="none"
                />
                <path
                  d="M24 16V32M24 16L18 22M24 16L30 22M12 36H36"
                  stroke={cardColor || "#00368c"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="upload-text-content">
              <p className="upload-main-text">
                Drag & drop files here, or <span className="upload-link">browse</span>
              </p>
              <p className="upload-sub-text">
                Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
              </p>
            </div>
          </div>
        ) : (
          <div className="uploaded-files-list">
            <div className="files-header">
              <span className="files-count">{filesCount} file(s) uploaded</span>
              <button
                type="button"
                className="add-more-files-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onBrowseClick();
                }}
              >
                + Add
              </button>
            </div>
            <div className="files-list">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 2H11L15 6V16C15 17.1 14.1 18 13 18H5C3.9 18 3 17.1 3 16V4C3 2.9 3.9 2 5 2Z"
                        stroke={cardColor || "#00368c"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11 2V6H15"
                        stroke={cardColor || "#00368c"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="file-info">
                    <span className="file-name">
                      {file.name || `File ${index + 1}`}
                    </span>
                    <span className="file-size">
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="file-remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="#999"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form mwp-renewal-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <FormField label="Expiry Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.mwpRenewalExpiryDate || ""}
                    onChange={handleChange("mwpRenewalExpiryDate")}
                    placeholder="Select expiry date"
                  />
                </div>
              </FormField>

              <FormField label="Request Email" className="cf-field-full">
                {renderFileUpload(
                  requestEmailFiles,
                  requestEmailFilesCount,
                  isDraggingRequestEmail,
                  requestEmailFileInputRef,
                  handleRequestEmailDragOver,
                  handleRequestEmailDragLeave,
                  handleRequestEmailDrop,
                  handleRequestEmailBrowseClick,
                  handleRemoveRequestEmailFile,
                  "mwpRenewalRequestEmailDocuments"
                )}
              </FormField>

              <FormField label="MWP Documents" className="cf-field-full">
                {renderFileUpload(
                  mwpDocumentsFiles,
                  mwpDocumentsFilesCount,
                  isDraggingMWPDocuments,
                  mwpDocumentsFileInputRef,
                  handleMWPDocumentsDragOver,
                  handleMWPDocumentsDragLeave,
                  handleMWPDocumentsDrop,
                  handleMWPDocumentsBrowseClick,
                  handleRemoveMWPDocumentsFile,
                  "mwpRenewalDocuments"
                )}
              </FormField>

              <div className="form-save-button-wrapper">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="general-info-right">
              <div className="card-description-wrapper">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formValues?.mwpRenewalDescription || ""}
                    onChange={handleChange("mwpRenewalDescription")}
                    placeholder="Enter remarks..."
                    name="mwpRenewalDescription"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

MWPRenewalContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default MWPRenewalContent;

