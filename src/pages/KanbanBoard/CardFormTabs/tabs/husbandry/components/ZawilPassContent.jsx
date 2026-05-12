import { useState, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { FormSection, FormField, ReactQuillEditor, getCrewMultiSelectStyles, formatCrewOptionLabel } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import { useCrewPassTabApi } from "./useCrewPassTabApi";

const ZawilPassContent = ({ formValues, handleChange, cardColor, card }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    crewOptions,
    crewLoading,
    crewLoadError,
    crewEmpty,
    saving,
    handleSave,
  } = useCrewPassTabApi({
    passType: "ZAWIL",
    formValues,
    card,
    selectedCrewField: "zawilPassSelectedCrew",
    remarksField: "zawilPassDescription",
    documentsField: "zawilPassDocuments",
  });

  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("zawilPassSelectedCrew")(syntheticEvent);
  };

  const selectedCrewValues =
    formValues.zawilPassSelectedCrew
      ?.map((crewId) =>
        crewOptions.find((opt) => String(opt.value) === String(crewId))
      )
      .filter(Boolean) || [];

  const customSelectStyles = getCrewMultiSelectStyles(cardColor);

  const crewPlaceholder = crewLoading
    ? "Loading crew..."
    : crewLoadError
      ? "Unable to load crew"
      : crewEmpty
        ? "No crew available"
        : selectedCrewValues.length > 0
          ? `${selectedCrewValues.length} crew selected`
          : "Select crew members...";

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
                    placeholder={crewPlaceholder}
                    classNamePrefix="react-select"
                    styles={customSelectStyles}
                    formatOptionLabel={formatCrewOptionLabel}
                    isClearable
                    isSearchable
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    isLoading={crewLoading}
                    isDisabled={crewLoading}
                    noOptionsMessage={() =>
                      crewLoading ? "Loading..." : "No crew found"
                    }
                  />
                </div>
                {!crewLoading && crewLoadError ? (
                  <div className="crew-pass-select-message crew-pass-select-message--error">
                    {crewLoadError}
                  </div>
                ) : null}
                {!crewLoading && !crewLoadError && crewEmpty ? (
                  <div className="crew-pass-select-message crew-pass-select-message--empty">
                    No crew members found.
                  </div>
                ) : null}
              </FormField>

              <FormField label="Documents" className="cf-field-full">
                <div className="zawilpass-documents-inner">
                  <AttachmentsList
                    attachments={formValues.zawilPassDocuments || []}
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
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
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
  card: PropTypes.object,
};

export default ZawilPassContent;
