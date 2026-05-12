import { useState, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";

const CGPassContent = ({ formValues, handleChange, cardColor }) => {
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
    handleChange("cgPassSelectedCrew")(syntheticEvent);
  };

  // Get selected crew values for react-select
  const selectedCrewValues = formValues.cgPassSelectedCrew?.map((crewId) =>
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
      const current = formValues.cgPassDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("cgPassDocuments")({ target: { value: [...current, ...added] } });
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const current = formValues.cgPassDocuments || [];
      const added = files.map(fileToAttachment);
      handleChange("cgPassDocuments")({ target: { value: [...current, ...added] } });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const current = formValues.cgPassDocuments || [];
    handleChange("cgPassDocuments")({ target: { value: current.filter((_, i) => i !== index) } });
  };

  // Handle save
  const handleSave = () => {
    // You can add validation here
    console.log("Saving CG Pass data:", {
      cgPassNumber: formValues.cgPassNumber,
      cgPassIssuedDate: formValues.cgPassIssuedDate,
      cgPassExpiryDate: formValues.cgPassExpiryDate,
      cgPassStatus: formValues.cgPassStatus,
      cgPassETA: formValues.cgPassETA,
      cgPassETATime: formValues.cgPassETATime,
      statusSignOnOff: formValues.statusSignOnOff,
      cgPassSelectedCrew: formValues.cgPassSelectedCrew,
      cgPassDocuments: formValues.cgPassDocuments,
    });
    // Add your save logic here
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form cgpass-form">
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
                <div className="cgpass-documents-inner">
                  <AttachmentsList
                    attachments={formValues.cgPassDocuments || []}
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

              <div className="cgpass-remarks">
                <FormField label="Remarks">
                  <ReactQuillEditor
                    value={formValues?.cgPassDescription || ""}
                    onChange={handleChange("cgPassDescription")}
                    placeholder="Enter remarks..."
                    name="cgPassDescription"
                  />
                </FormField>
              </div>

              <div className="form-save-button-wrapper cgpass-save-footer">
                <button
                  type="button"
                  className="form-save-button"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>

            <div className="general-info-right cgpass-empty-right"></div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

CGPassContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default CGPassContent;

