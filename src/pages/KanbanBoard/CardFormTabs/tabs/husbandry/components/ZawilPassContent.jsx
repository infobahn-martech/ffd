import { useState, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";

const ZawilPassContent = ({ formValues, handleChange, cardColor }) => {
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
    handleChange("zawilPassSelectedCrew")(syntheticEvent);
  };

  // Get selected crew values for react-select
  const selectedCrewValues = formValues.zawilPassSelectedCrew?.map((crewId) =>
    crewOptions.find((opt) => opt.value === crewId?.toString() || opt.value === crewId)
  ).filter(Boolean) || [];

  const customSelectStyles = getCrewMultiSelectStyles(cardColor);


  const fileToAttachment = (file) => ({
    name: file.name,
    file,
    size: file.size,
    type: file.type,
  });

  const handleDocumentsDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDocumentsDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDocumentsDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentsDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const current = formValues.zawilPassDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("zawilPassDocuments")({ target: { value: [...current, ...added] } });
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const current = formValues.zawilPassDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("zawilPassDocuments")({ target: { value: [...current, ...added] } });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const current = formValues.zawilPassDocuments || [];
    handleChange("zawilPassDocuments")({ target: { value: current.filter((_, i) => i !== index) } });
  };

  // Handle save
  const handleSave = () => {
    // You can add validation here
    console.log("Saving Zawil Pass data:", {
      zawilPassNumber: formValues.zawilPassNumber,
      zawilPassIssuedDate: formValues.zawilPassIssuedDate,
      zawilPassExpiryDate: formValues.zawilPassExpiryDate,
      zawilPassStatus: formValues.zawilPassStatus,
      zawilPassETA: formValues.zawilPassETA,
      zawilPassETATime: formValues.zawilPassETATime,
      statusSignOnOff: formValues.statusSignOnOff,
      zawilPassSelectedCrew: formValues.zawilPassSelectedCrew,
      zawilPassDocuments: formValues.zawilPassDocuments,
    });
    // Add your save logic here
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form zawilpass-form">
          <div className="general-info-two-column operation-section-form-layout">
            <div className="general-info-left">
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
                    formatOptionLabel={formatCrewOptionLabel}
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                  />
                </div>
              </FormField>

              <FormField label="Documents" className="cf-field-full">
                <div className="zawilpass-documents-inner">
                  <AttachmentsList
                    attachments={formValues.zawilPassDocuments || []}
                    onAdd={() => { }}
                    onRemove={handleDocumentsRemoveAttachment}
                    cardColor={cardColor}
                    isDragging={isDragging}
                    onDragEnter={handleDocumentsDragEnter}
                    onDragLeave={handleDocumentsDragLeave}
                    onDragOver={handleDocumentsDragOver}
                    onDrop={handleDocumentsDrop}
                    fileInputRef={fileInputRef}
                    onFileInputChange={handleDocumentsFileInputChange}
                  />
                </div>
              </FormField>

              <div className="zawilpass-remarks">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formValues?.zawilPassDescription || ""}
                    onChange={handleChange("zawilPassDescription")}
                    placeholder="Enter remarks..."
                    name="zawilPassDescription"
                  />
                </FormField>
              </div>

              <div className="form-save-button-wrapper zawilpass-save-footer">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="general-info-right zawilpass-empty-right"></div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

ZawilPassContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default ZawilPassContent;

