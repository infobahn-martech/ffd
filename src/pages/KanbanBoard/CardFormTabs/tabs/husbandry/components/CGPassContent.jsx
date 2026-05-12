import { useState, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import { useCrewPassTabApi } from "./useCrewPassTabApi";

const CGPassContent = ({ formValues, handleChange, cardColor, card }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    crewOptions,
    crewLoading,
    crewLoadState,
    crewEmpty,
    crewPlaceholder,
    saving,
    handleSave,
  } = useCrewPassTabApi({
    passType: "CG",
    formValues,
    card,
    selectedCrewField: "cgPassSelectedCrew",
    remarksField: "cgPassDescription",
    documentsField: "cgPassDocuments",
  });

  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("cgPassSelectedCrew")(syntheticEvent);
  };

  const selectedCrewValues =
    formValues.cgPassSelectedCrew
      ?.map((crewId) =>
        crewOptions.find((opt) => String(opt.value) === String(crewId))
      )
      .filter(Boolean) || [];

  const customSelectStyles = getCrewMultiSelectStyles(cardColor);

  const dynamicCrewPlaceholder =
    selectedCrewValues.length > 0
      ? `${selectedCrewValues.length} crew selected`
      : crewPlaceholder;

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
                    placeholder={dynamicCrewPlaceholder}
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                    formatOptionLabel={formatCrewOptionLabel}
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    isLoading={crewLoading}
                    isDisabled={crewLoading || crewLoadState === "missing_call_id" || crewLoadState === "missing_vessel_id"}
                    noOptionsMessage={() =>
                      crewLoading ? "Loading..." : "No crew found"
                    }
                  />
                </div>
                {!crewLoading && (crewLoadState === "missing_call_id" || crewLoadState === "missing_vessel_id" || crewLoadState === "api_error") ? (
                  <div className="crew-pass-select-message crew-pass-select-message--error">
                    {crewLoadState === "missing_call_id"
                      ? "Call id is required"
                      : crewLoadState === "missing_vessel_id"
                        ? "Vessel id is required"
                        : "Unable to load crew"}
                  </div>
                ) : null}
                {!crewLoading && crewEmpty ? (
                  <div className="crew-pass-select-message crew-pass-select-message--empty">
                    No crew found
                  </div>
                ) : null}
              </FormField>

              <FormField label="Documents" className="cf-field-full">
                <div className="cgpass-documents-inner">
                  <AttachmentsList
                    attachments={formValues.cgPassDocuments || []}
                    onAdd={() => {}}
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
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
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
  card: PropTypes.object,
};

export default CGPassContent;
