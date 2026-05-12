import { useState, useRef } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { notify } from "../../../../../../components/Toaster";
import {
  FormSection,
  FormField,
  ReactQuillEditor,
  getCrewMultiSelectStyles,
  formatCrewOptionLabel,
} from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import CrewPassRequestsTable from "./CrewPassRequestsTable";
import { useCrewPassTabApi } from "./useCrewPassTabApi";

const REQUEST_EMAIL_ACCEPT_ATTR = ".msg,.eml,.pdf,.doc,.docx";
const REQUEST_EMAIL_EXT_RE = /\.(msg|eml|pdf|doc|docx)$/i;

const ZawilPassContent = ({ formValues, handleChange, cardColor, card }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingEmail, setIsDraggingEmail] = useState(false);
  const fileInputRef = useRef(null);
  const requestEmailInputRef = useRef(null);

  const {
    crewOptions,
    crewLoading,
    crewLoadState,
    crewEmpty,
    crewPlaceholder,
    saving,
    handleSave,
    passRequests,
    passRequestsLoading,
  } = useCrewPassTabApi({
    passType: "Zawil",
    formValues,
    card,
    selectedCrewField: "zawilPassSelectedCrew",
    remarksField: "zawilPassDescription",
    documentsField: "zawilPassDocuments",
    requestEmailFileField: "zawilPassRequestEmailFile",
  });

  const handleCrewChange = (selectedOptions) => {
    const values = selectedOptions?.map((option) => option.value) || [];
    const syntheticEvent = { target: { value: values } };
    handleChange("zawilPassSelectedCrew")(syntheticEvent);
  };

  const selectedCrewValues =
    (formValues.zawilPassSelectedCrew || [])
      .map((crewId) =>
        crewOptions.find((opt) => String(opt.value) === String(crewId))
      )
      .filter(Boolean);

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

  const filterRequestEmailFiles = (files) =>
    Array.from(files || []).filter((f) => REQUEST_EMAIL_EXT_RE.test(f.name));

  const handleRequestEmailDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingEmail(true);
  };

  const handleRequestEmailDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingEmail(false);
  };

  const handleRequestEmailDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRequestEmailDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingEmail(false);
    const raw = Array.from(e.dataTransfer.files || []);
    const allowed = filterRequestEmailFiles(raw);
    if (allowed.length === 0) {
      if (raw.length > 0) {
        notify(
          "Only .msg, .eml, .pdf, .doc, .docx files are allowed for request email.",
          "warning",
          "top-center"
        );
      }
      return;
    }
    handleChange("zawilPassRequestEmailFile")({
      target: { value: [fileToAttachment(allowed[0])] },
    });
  };

  const handleRequestEmailFileInputChange = (e) => {
    const raw = Array.from(e.target.files || []);
    const allowed = filterRequestEmailFiles(raw);
    if (allowed.length === 0) {
      if (raw.length > 0) {
        notify(
          "Only .msg, .eml, .pdf, .doc, .docx files are allowed for request email.",
          "warning",
          "top-center"
        );
      }
    } else {
      handleChange("zawilPassRequestEmailFile")({
        target: { value: [fileToAttachment(allowed[0])] },
      });
    }
    if (requestEmailInputRef.current) {
      requestEmailInputRef.current.value = "";
    }
  };

  const handleRequestEmailRemoveAttachment = () => {
    handleChange("zawilPassRequestEmailFile")({ target: { value: [] } });
  };

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
          <div className="general-info-two-column operation-section-form-layout crew-pass-premium-grid">
            <div className="general-info-left crew-pass-premium-left">
              <div className="crew-pass-request-details-card">
                <div className="crew-pass-request-details-card__header">
                  <h3 className="crew-pass-request-details-card__title">Request Details</h3>
                </div>
                <div className="crew-pass-request-details-card__body crew-pass-thin-scrollbar">
                  <FormField label="Request Email">
                    <div className="zawilpass-request-email-inner">
                      <AttachmentsList
                        attachments={formValues.zawilPassRequestEmailFile || []}
                        onAdd={() => {}}
                        onRemove={handleRequestEmailRemoveAttachment}
                        cardColor={cardColor}
                        isDragging={isDraggingEmail}
                        onDragEnter={handleRequestEmailDragEnter}
                        onDragLeave={handleRequestEmailDragLeave}
                        onDragOver={handleRequestEmailDragOver}
                        onDrop={handleRequestEmailDrop}
                        fileInputRef={requestEmailInputRef}
                        onFileInputChange={handleRequestEmailFileInputChange}
                        accept={REQUEST_EMAIL_ACCEPT_ATTR}
                        multiple={false}
                      />
                    </div>
                  </FormField>

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
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        menuShouldBlockScroll={true}
                        isClearable
                        isSearchable
                        closeMenuOnSelect={false}
                        hideSelectedOptions={true}
                        isLoading={crewLoading}
                        isDisabled={crewLoading || crewLoadState === "missing_call_id"}
                        noOptionsMessage={() =>
                          crewLoading ? "Loading..." : "No crew found"
                        }
                      />
                    </div>
                    {!crewLoading && (crewLoadState === "missing_call_id" || crewLoadState === "api_error") ? (
                      <div className="crew-pass-select-message crew-pass-select-message--error">
                        {crewLoadState === "missing_call_id"
                          ? "Call id is required"
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
              </div>
            </div>

            <div className="general-info-right crew-pass-requests-sidebar">
              <CrewPassRequestsTable
                title="Zawil Pass Requests"
                requests={passRequests?.zawil || []}
                loading={passRequestsLoading}
                passType="Zawil"
              />
            </div>
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
