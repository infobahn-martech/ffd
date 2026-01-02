import { useState, useRef } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormSelect, ReactQuillEditor } from "./Husbandry.components";

const WasteDisposalContent = ({ formValues, handleChange, cardColor }) => {
  const [isDraggingRequestEmail, setIsDraggingRequestEmail] = useState(false);
  const [isDraggingWasteDisposalDocuments, setIsDraggingWasteDisposalDocuments] = useState(false);
  const requestEmailFileInputRef = useRef(null);
  const wasteDisposalDocumentsFileInputRef = useRef(null);

  // Handle file upload for Request Email documents
  const handleRequestEmailFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const syntheticEvent = { target: { value: files } };
    handleChange("wasteDisposalRequestEmailDocuments")(syntheticEvent);
  };

  // Handle drag and drop for Request Email
  const handleRequestEmailDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRequestEmail(true);
  };

  const handleRequestEmailDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRequestEmail(false);
  };

  const handleRequestEmailDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingRequestEmail(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const syntheticEvent = { target: { value: files } };
      handleChange("wasteDisposalRequestEmailDocuments")(syntheticEvent);
    }
  };

  const handleRequestEmailBrowseClick = () => {
    requestEmailFileInputRef.current?.click();
  };

  const handleRemoveRequestEmailFile = (index) => {
    const files = Array.from(formValues.wasteDisposalRequestEmailDocuments || []);
    files.splice(index, 1);
    const syntheticEvent = { target: { value: files } };
    handleChange("wasteDisposalRequestEmailDocuments")(syntheticEvent);
  };

  // Handle file upload for Waste Disposal Documents
  const handleWasteDisposalDocumentsFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const syntheticEvent = { target: { value: files } };
    handleChange("wasteDisposalDocuments")(syntheticEvent);
  };

  // Handle drag and drop for Waste Disposal Documents
  const handleWasteDisposalDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingWasteDisposalDocuments(true);
  };

  const handleWasteDisposalDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingWasteDisposalDocuments(false);
  };

  const handleWasteDisposalDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingWasteDisposalDocuments(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const syntheticEvent = { target: { value: files } };
      handleChange("wasteDisposalDocuments")(syntheticEvent);
    }
  };

  const handleWasteDisposalDocumentsBrowseClick = () => {
    wasteDisposalDocumentsFileInputRef.current?.click();
  };

  const handleRemoveWasteDisposalDocumentsFile = (index) => {
    const files = Array.from(formValues.wasteDisposalDocuments || []);
    files.splice(index, 1);
    const syntheticEvent = { target: { value: files } };
    handleChange("wasteDisposalDocuments")(syntheticEvent);
  };

  // Get selected files
  const requestEmailFiles = formValues.wasteDisposalRequestEmailDocuments || [];
  const requestEmailFilesCount = requestEmailFiles.length;
  const wasteDisposalDocumentsFiles = formValues.wasteDisposalDocuments || [];
  const wasteDisposalDocumentsFilesCount = wasteDisposalDocumentsFiles.length;

  // Waste Type options
  const wasteTypeOptions = [
    { value: "Hazardous", label: "Hazardous" },
    { value: "Non-Hazardous", label: "Non-Hazardous" },
    { value: "Recyclable", label: "Recyclable" },
    { value: "Organic", label: "Organic" },
  ];

  // Handle save
  const handleSave = () => {
    console.log("Saving Waste Disposal data:", {
      wasteDisposalRequestEmailDocuments: formValues.wasteDisposalRequestEmailDocuments,
      wasteDisposalPONumber: formValues.wasteDisposalPONumber,
      wasteType: formValues.wasteType,
      wasteDisposalDate: formValues.wasteDisposalDate,
      wasteDisposalDocuments: formValues.wasteDisposalDocuments,
      wasteDisposalDescription: formValues.wasteDisposalDescription,
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
          onChange={fieldName === "wasteDisposalRequestEmailDocuments" ? handleRequestEmailFileChange : handleWasteDisposalDocumentsFileChange}
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
        <div className="pre-arrival-form waste-disposal-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <FormField label="Request Mail" className="cf-field-full">
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
                  "wasteDisposalRequestEmailDocuments"
                )}
              </FormField>

              <FormField label="PO Number">
                <div className="cf-input">
                  <input
                    type="text"
                    value={formValues.wasteDisposalPONumber || ""}
                    onChange={handleChange("wasteDisposalPONumber")}
                    placeholder="Enter PO number..."
                  />
                </div>
              </FormField>

              <FormField label="Waste Type">
                <FormSelect
                  value={formValues.wasteType || ""}
                  onChange={handleChange("wasteType")}
                  options={wasteTypeOptions}
                  placeholder="Select waste type..."
                />
              </FormField>

              <FormField label="Disposal Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.wasteDisposalDate || ""}
                    onChange={handleChange("wasteDisposalDate")}
                    placeholder="Select disposal date"
                  />
                </div>
              </FormField>

              <FormField label="Documents" className="cf-field-full">
                {renderFileUpload(
                  wasteDisposalDocumentsFiles,
                  wasteDisposalDocumentsFilesCount,
                  isDraggingWasteDisposalDocuments,
                  wasteDisposalDocumentsFileInputRef,
                  handleWasteDisposalDocumentsDragOver,
                  handleWasteDisposalDocumentsDragLeave,
                  handleWasteDisposalDocumentsDrop,
                  handleWasteDisposalDocumentsBrowseClick,
                  handleRemoveWasteDisposalDocumentsFile,
                  "wasteDisposalDocuments"
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
                    value={formValues?.wasteDisposalDescription || ""}
                    onChange={handleChange("wasteDisposalDescription")}
                    placeholder="Enter remarks..."
                    name="wasteDisposalDescription"
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

WasteDisposalContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default WasteDisposalContent;
