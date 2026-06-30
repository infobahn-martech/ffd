import { useState, useRef, useEffect } from "react";

import PropTypes from "prop-types";

import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";

import { FormSection, FormField, FormSelect, ReactQuillEditor } from "./Husbandry.components";

import DateTimePickerField from "../../../../shared/components/DateTimePickerField";

import wasteTypeService from "../../../../../../../services/wasteTypeService";



const parseWasteDisposalDateValue = (value) => {

  const v = String(value || "").trim();

  if (!v) return { date: "", time: "00:00" };

  const mDate = v.match(/^(\d{4}-\d{2}-\d{2})/);

  const datePart = mDate ? mDate[1] : "";

  const mTime = v.match(/T(\d{2}:\d{2})/);

  const timePart = mTime ? mTime[1] : "00:00";

  return { date: datePart, time: timePart };

};



const mergeWasteDisposalDateValue = (dateStr, timeStr) => {

  if (!dateStr) return "";

  if (!timeStr || timeStr === "00:00") return dateStr;

  return `${dateStr}T${timeStr}`;

};



const WasteDisposalContent = ({ formValues, handleChange, cardColor }) => {

  const [isDraggingRequestEmail, setIsDraggingRequestEmail] = useState(false);

  const [isDraggingWasteDisposalDocuments, setIsDraggingWasteDisposalDocuments] = useState(false);

  const requestEmailFileInputRef = useRef(null);

  const wasteDisposalDocumentsFileInputRef = useRef(null);



  const [wasteTypes, setWasteTypes] = useState([]);

  const [loadingWasteTypes, setLoadingWasteTypes] = useState(false);



  useEffect(() => {

    let cancelled = false;

    (async () => {

      try {

        setLoadingWasteTypes(true);

        const { data } = await wasteTypeService.getWasteTypes({

          params: { page: 1, limit: 500 },

        });

        const rawList = data?.data ?? data?.waste_types ?? [];

        const list = Array.isArray(rawList) ? rawList : [];

        if (!cancelled) setWasteTypes(list);

      } catch {

        if (!cancelled) setWasteTypes([]);

      } finally {

        if (!cancelled) setLoadingWasteTypes(false);

      }

    })();

    return () => {

      cancelled = true;

    };

  }, []);



  const wasteTypeOptions = wasteTypes.map((w) => ({

    value: String(w.waste_type_id ?? w._id ?? ""),

    label: w.waste_type ?? "",

  }));



  const handleWasteTypeChange = (e) => {

    handleChange("wasteTypeId")(e);

    const id = e.target.value;

    const row = wasteTypes.find((w) => String(w.waste_type_id ?? w._id) === id);

    handleChange("wasteType")({ target: { value: row?.waste_type ?? "" } });

  };



  const disposalDateParts = parseWasteDisposalDateValue(formValues.wasteDisposalDate);



  const handleDisposalDateTimeChange = (next) => {

    const merged = mergeWasteDisposalDateValue(next?.date ?? "", next?.time ?? "");

    handleChange("wasteDisposalDate")({ target: { value: merged } });

  };



  const handleRequestEmailFileChange = (e) => {

    const files = Array.from(e.target.files || []);

    const syntheticEvent = { target: { value: files } };

    handleChange("wasteDisposalRequestEmailDocuments")(syntheticEvent);

  };



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



  const handleWasteDisposalDocumentsFileChange = (e) => {

    const files = Array.from(e.target.files || []);

    const syntheticEvent = { target: { value: files } };

    handleChange("wasteDisposalDocuments")(syntheticEvent);

  };



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



  const requestEmailFiles = formValues.wasteDisposalRequestEmailDocuments || [];

  const requestEmailFilesCount = requestEmailFiles.length;

  const wasteDisposalDocumentsFiles = formValues.wasteDisposalDocuments || [];

  const wasteDisposalDocumentsFilesCount = wasteDisposalDocumentsFiles.length;



  const handleSave = () => {


  };



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

        style={{ "--card-color": cardColor || "#00368c" }}

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

            <div className="upload-text-content">

              <p className="upload-main-text">

                Drag and drop your files here, or <span className="upload-link">click to browse</span>

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

                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">

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

                    <span className="file-name">{file.name || `File ${index + 1}`}</span>

                    <span className="file-size">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : ""}</span>

                  </div>

                  <button

                    type="button"

                    className="file-remove-btn"

                    onClick={(e) => {

                      e.stopPropagation();

                      onRemoveFile(index);

                    }}

                  >

                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">

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

          <div className="transport-request-layout">

            <div className="transport-request-left transport-panel-card">

              <div className="transport-panel-header">

                <h3 className="transport-panel-header__title">Request Details</h3>

              </div>



              <div className="transport-request-left__scroll transport-panel-scroll">

                <FormField label="Request Email" className="cf-field-full">

                  <div className="transport-upload-box">

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

                  </div>

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

                    value={formValues.wasteTypeId || ""}

                    onChange={handleWasteTypeChange}

                    options={wasteTypeOptions}

                    placeholder={loadingWasteTypes ? "Loading waste types..." : "Select waste type..."}

                    disabled={loadingWasteTypes}

                  />

                </FormField>



                <FormField label="Disposal Date">

                  <div className="transport-date-time-field">

                    <DateTimePickerField

                      dateValue={disposalDateParts.date}

                      timeValue={disposalDateParts.time}

                      onDateTimeChange={handleDisposalDateTimeChange}

                      dateFieldName="wasteDisposalDate"

                      timeFieldName="wasteDisposalDate"

                      placeholder="Select date and time"

                    />

                  </div>

                </FormField>



                <FormField label="Documents" className="cf-field-full">

                  <div className="transport-upload-box">

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

                  </div>

                </FormField>

              </div>



              <div className="transport-save-footer">

                <button type="button" className="form-save-button" onClick={handleSave}>

                  Save

                </button>

              </div>

            </div>



            <div className="transport-request-right transport-panel-card">

              <div className="transport-panel-header">

                <h3 className="transport-panel-header__title">Remarks</h3>

              </div>

              <div className="transport-request-right__body transport-panel-scroll">

                <ReactQuillEditor

                  value={formValues?.wasteDisposalDescription || ""}

                  onChange={handleChange("wasteDisposalDescription")}

                  placeholder="Enter remarks..."

                  name="wasteDisposalDescription"

                  className="transport-remarks-quill"

                />

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

