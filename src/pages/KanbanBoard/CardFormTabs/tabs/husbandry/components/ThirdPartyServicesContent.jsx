import { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, FormSelect, ReactQuillEditor } from "./Husbandry.components";
import thirdPartyService from "../../../../../../services/thirdPartyService";

const unwrapApiList = (axiosData) => {
  const payload = axiosData?.data ?? axiosData;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const ThirdPartyServicesContent = ({ formValues, handleChange, cardColor }) => {
  const [isDraggingRequestEmail, setIsDraggingRequestEmail] = useState(false);
  const [isDraggingThirdPartyDocuments, setIsDraggingThirdPartyDocuments] = useState(false);
  const [thirdPartyServiceCatalog, setThirdPartyServiceCatalog] = useState([]);
  const [loadingThirdPartyServiceCatalog, setLoadingThirdPartyServiceCatalog] = useState(false);
  const requestEmailFileInputRef = useRef(null);
  const thirdPartyDocumentsFileInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingThirdPartyServiceCatalog(true);
        const { data } = await thirdPartyService.getThirdPartyServices({
          params: {
            page: 1,
            limit: 1000,
            sortBy: "third_party_service",
            sortOrder: "ASC",
          },
        });
        const list = unwrapApiList(data);
        if (!cancelled) setThirdPartyServiceCatalog(list);
      } catch {
        if (!cancelled) setThirdPartyServiceCatalog([]);
      } finally {
        if (!cancelled) setLoadingThirdPartyServiceCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle file upload for Request Email documents
  const handleRequestEmailFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const syntheticEvent = { target: { value: files } };
    handleChange("thirdPartyServicesRequestEmailDocuments")(syntheticEvent);
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
      handleChange("thirdPartyServicesRequestEmailDocuments")(syntheticEvent);
    }
  };

  const handleRequestEmailBrowseClick = () => {
    requestEmailFileInputRef.current?.click();
  };

  const handleRemoveRequestEmailFile = (index) => {
    const files = Array.from(formValues.thirdPartyServicesRequestEmailDocuments || []);
    files.splice(index, 1);
    const syntheticEvent = { target: { value: files } };
    handleChange("thirdPartyServicesRequestEmailDocuments")(syntheticEvent);
  };

  // Handle file upload for Third-Party Services Documents
  const handleThirdPartyDocumentsFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const syntheticEvent = { target: { value: files } };
    handleChange("thirdPartyServicesDocuments")(syntheticEvent);
  };

  // Handle drag and drop for Third-Party Services Documents
  const handleThirdPartyDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThirdPartyDocuments(true);
  };

  const handleThirdPartyDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThirdPartyDocuments(false);
  };

  const handleThirdPartyDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingThirdPartyDocuments(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const syntheticEvent = { target: { value: files } };
      handleChange("thirdPartyServicesDocuments")(syntheticEvent);
    }
  };

  const handleThirdPartyDocumentsBrowseClick = () => {
    thirdPartyDocumentsFileInputRef.current?.click();
  };

  const handleRemoveThirdPartyDocumentsFile = (index) => {
    const files = Array.from(formValues.thirdPartyServicesDocuments || []);
    files.splice(index, 1);
    const syntheticEvent = { target: { value: files } };
    handleChange("thirdPartyServicesDocuments")(syntheticEvent);
  };

  // Get selected files
  const requestEmailFiles = formValues.thirdPartyServicesRequestEmailDocuments || [];
  const requestEmailFilesCount = requestEmailFiles.length;
  const thirdPartyDocumentsFiles = formValues.thirdPartyServicesDocuments || [];
  const thirdPartyDocumentsFilesCount = thirdPartyDocumentsFiles.length;

  // Service Type options from GET /service/get_all_third_party_service { third_party_service_id, third_party_service }
  const serviceTypeOptions = useMemo(() => {
    const fromApi = thirdPartyServiceCatalog.map((row) => ({
      value: String(row.third_party_service_id ?? row._id ?? ""),
      label: row.third_party_service ?? "",
    }));
    return [...fromApi.filter((o) => o.value), { value: "Others", label: "Others" }];
  }, [thirdPartyServiceCatalog]);

  // Check if "Others" is selected
  const isOthersSelected = formValues.thirdPartyServiceType === "Others";

  // Handle save
  const handleSave = () => {
    console.log("Saving Third-Party Services data:", {
      serviceType: formValues.thirdPartyServiceType,
      thirdPartyServiceTypeOther: formValues.thirdPartyServiceTypeOther,
      thirdPartyPONumber: formValues.thirdPartyPONumber,
      thirdPartyServicesRequestEmailDocuments: formValues.thirdPartyServicesRequestEmailDocuments,
      thirdPartyServicesDocuments: formValues.thirdPartyServicesDocuments,
      thirdPartyServicesDescription: formValues.thirdPartyServicesDescription,
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
          onChange={fieldName === "thirdPartyServicesRequestEmailDocuments" ? handleRequestEmailFileChange : handleThirdPartyDocumentsFileChange}
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
        <div className="pre-arrival-form third-party-services-form">
          <div className="general-info-two-column">
            <div className="general-info-left">
              <FormField label="Service Type">
                <FormSelect
                  value={formValues.thirdPartyServiceType || ""}
                  onChange={handleChange("thirdPartyServiceType")}
                  options={serviceTypeOptions}
                  placeholder={loadingThirdPartyServiceCatalog ? "Loading service types..." : "Select service type..."}
                  disabled={loadingThirdPartyServiceCatalog}
                />
              </FormField>

              {isOthersSelected && (
                <FormField label="Specify Other Service Type">
                  <div className="cf-input">
                    <input
                      type="text"
                      value={formValues.thirdPartyServiceTypeOther || ""}
                      onChange={handleChange("thirdPartyServiceTypeOther")}
                      placeholder="Enter other service type..."
                    />
                  </div>
                </FormField>
              )}

              <FormField label="PO Number">
                <div className="cf-input">
                  <input
                    type="text"
                    value={formValues.thirdPartyPONumber || ""}
                    onChange={handleChange("thirdPartyPONumber")}
                    placeholder="Enter PO number..."
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
                  "thirdPartyServicesRequestEmailDocuments"
                )}
              </FormField>

              <FormField label="Documents" className="cf-field-full">
                {renderFileUpload(
                  thirdPartyDocumentsFiles,
                  thirdPartyDocumentsFilesCount,
                  isDraggingThirdPartyDocuments,
                  thirdPartyDocumentsFileInputRef,
                  handleThirdPartyDocumentsDragOver,
                  handleThirdPartyDocumentsDragLeave,
                  handleThirdPartyDocumentsDrop,
                  handleThirdPartyDocumentsBrowseClick,
                  handleRemoveThirdPartyDocumentsFile,
                  "thirdPartyServicesDocuments"
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
                    value={formValues?.thirdPartyServicesDescription || ""}
                    onChange={handleChange("thirdPartyServicesDescription")}
                    placeholder="Enter remarks..."
                    name="thirdPartyServicesDescription"
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

ThirdPartyServicesContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default ThirdPartyServicesContent;

