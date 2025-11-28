import { useState, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../assets/images/cv.png";
import { FormSection, FormField, FormInput } from "./Husbandry.components";

const HotelContent = ({ formValues, handleChange, cardColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Generate crew options from crewList
  const crewOptions = formValues.crewList?.map((crew) => ({
    value: crew.id?.toString() || crew.crewName,
    label: crew.crewName || `Crew Member ${crew.id}`,
  })) || [];

  // Handle multi-select crew change
  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("hotelSelectedCrew")(syntheticEvent);
  };

  // Get selected crew values for react-select
  const selectedCrewValues = formValues.hotelSelectedCrew?.map((crewId) =>
    crewOptions.find((opt) => opt.value === crewId?.toString() || opt.value === crewId)
  ).filter(Boolean) || [];

  // Custom styles for react-select multi-select
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      border: 'none',
      boxShadow: 'none',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '2px 4px',
      '&:hover': {
        border: 'none',
        boxShadow: 'none',
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 8px',
      minHeight: '38px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
    }),
    multiValue: (base, state) => ({
      ...base,
      backgroundColor: cardColor || '#2A00FF',
      borderRadius: '6px',
      padding: '2px 4px',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      minHeight: '28px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#ffffff',
      fontSize: '12px',
      fontWeight: '500',
      padding: '4px 6px',
      paddingRight: '4px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#ffffff',
      borderRadius: '4px',
      padding: '2px 4px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999',
      fontSize: '13px',
      marginLeft: '4px',
    }),
    input: (base) => ({
      ...base,
      color: '#1a1a1a',
      fontSize: '13px',
      margin: '0',
      padding: '0',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      paddingRight: '8px',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#666',
      padding: '4px',
      '&:hover': {
        color: cardColor || '#2A00FF',
      },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: '#999',
      padding: '4px',
      '&:hover': {
        color: '#ff0000',
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e2e2ea',
      marginTop: '4px',
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '4px',
      maxHeight: '200px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? cardColor || '#2A00FF'
        : state.isFocused
        ? 'rgba(42, 0, 255, 0.1)'
        : '#ffffff',
      color: state.isSelected ? '#ffffff' : '#1a1a1a',
      fontSize: '13px',
      padding: '10px 12px',
      borderRadius: '6px',
      margin: '2px 0',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: cardColor || '#2A00FF',
        color: '#ffffff',
      },
    }),
  };

  // Handle file upload for documents
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const syntheticEvent = { target: { value: files } };
    handleChange("hotelDocuments")(syntheticEvent);
  };

  // Handle drag and drop
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
      const syntheticEvent = { target: { value: files } };
      handleChange("hotelDocuments")(syntheticEvent);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (index) => {
    const files = Array.from(formValues.hotelDocuments || []);
    files.splice(index, 1);
    const syntheticEvent = { target: { value: files } };
    handleChange("hotelDocuments")(syntheticEvent);
  };

  // Get selected files
  const selectedFiles = formValues.hotelDocuments || [];
  const selectedFilesCount = selectedFiles.length;

  // Handle save
  const handleSave = () => {
    console.log("Saving Hotel data:", {
      hotelSelectedCrew: formValues.hotelSelectedCrew,
      hotelName: formValues.hotelName,
      hotelCheckInDate: formValues.hotelCheckInDate,
      hotelCheckInTime: formValues.hotelCheckInTime,
      hotelDocuments: formValues.hotelDocuments,
    });
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form">
          <div className="form-group">
            <h3 className="form-group-title">Hotel Information</h3>
            <div className="cf-grid two">
              <FormField label="Select Crew">
                <div className="cf-select react-select-container crew-multi-select">
                  <Select
                    isMulti
                    value={selectedCrewValues}
                    onChange={handleCrewChange}
                    options={crewOptions}
                    placeholder={selectedCrewValues.length > 0 ? `${selectedCrewValues.length} crew selected` : "Select crew members..."}
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                </div>
              </FormField>

              <FormField label="Hotel Name">
                <FormInput
                  type="text"
                  placeholder="Enter hotel name..."
                  value={formValues.hotelName || ""}
                  onChange={handleChange("hotelName")}
                />
              </FormField>

              <FormField label="Check-in Date">
                <div className="cf-input date-time-row">
                  <input
                    type="date"
                    value={formValues.hotelCheckInDate || ""}
                    onChange={handleChange("hotelCheckInDate")}
                    placeholder="Select date"
                  />
                  <input
                    type="time"
                    value={formValues.hotelCheckInTime || ""}
                    onChange={handleChange("hotelCheckInTime")}
                    placeholder="Select time"
                  />
                </div>
              </FormField>

              <FormField label="Documents" className="cf-field-full">
                <div
                  className={`document-upload-zone ${isDragging ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="hotelDocuments"
                    multiple
                    onChange={handleFileChange}
                    className="file-input-hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />

                  {selectedFilesCount === 0 ? (
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
                            stroke={cardColor || "#2A00FF"}
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            fill="none"
                          />
                          <path
                            d="M24 16V32M24 16L18 22M24 16L30 22M12 36H36"
                            stroke={cardColor || "#2A00FF"}
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
                        <span className="files-count">{selectedFilesCount} file(s) uploaded</span>
                        <button
                          type="button"
                          className="add-more-files-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBrowseClick();
                          }}
                        >
                          + Add More
                        </button>
                      </div>
                      <div className="files-list">
                        {selectedFiles.map((file, index) => (
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
                                  stroke={cardColor || "#2A00FF"}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M11 2V6H15"
                                  stroke={cardColor || "#2A00FF"}
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
                                handleRemoveFile(index);
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
              </FormField>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="checklist-btn-primary"
              onClick={handleSave}
              style={{ "--card-color": cardColor }}
            >
              Save
            </button>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

HotelContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default HotelContent;

