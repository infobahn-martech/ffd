import { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";
import { notify } from "../../../../../../../components/Toaster";
import { FormSection, FormField, FormSelect, FormGroup, PremiumCardHeader, ReactQuillEditor } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import HusbandryServiceRequestsTable from "./HusbandryServiceRequestsTable";
import useAddOnServiceRequestReducer from "../../../../../../../store/AddOnServiceRequestReducer";
import { MAIN_TABS, SERVICE_ACCENT, LAUNCH_HIRE_SERVICE_TYPE_OPTIONS } from "./Husbandry.constants";

const ADD_ON_SERVICE_ACCENT = SERVICE_ACCENT[MAIN_TABS.ADD_ON_SERVICES];

const REQUEST_EMAIL_ACCEPT_ATTR = ".msg,.eml,.pdf,.doc,.docx";
const REQUEST_EMAIL_EXT_RE = /\.(msg|eml|pdf|doc|docx)$/i;
const DOCUMENTS_ACCEPT_ATTR = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

// Same "Type of Service" option list LaunchHireContent uses, plus the
// "Others" fallback that ThirdPartyServicesContent's Service Type field has.
const ADD_ON_SERVICE_TYPE_OPTIONS = [...LAUNCH_HIRE_SERVICE_TYPE_OPTIONS, { value: "Others", label: "Others" }];

const ADD_ON_SERVICE_REQUEST_COLUMNS = [
  { key: "service_name", header: "Service Type", accessor: (r) => r?.service_name },
  { key: "remarks", header: "Remarks", accessor: (r) => r?.remarks },
  { key: "status", header: "Status", accessor: (r) => r?.status, type: "status" },
  { key: "requested_date", header: "Requested", accessor: (r) => r?.created_date, type: "date" },
  { key: "document", header: "Document", accessor: (r) => r?.document_url, type: "document" },
];

const AddOnServicesContent = ({ formValues, handleChange, cardColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingEmail, setIsDraggingEmail] = useState(false);
  const fileInputRef = useRef(null);
  const requestEmailInputRef = useRef(null);

  const callId = formValues.call_id || formValues.callId || formValues.card_call_id;
  const {
    addOnServiceRequests,
    isLoadingList,
    isSaving,
    getAddOnServiceRequests,
    createAddOnServiceRequest,
  } = useAddOnServiceRequestReducer();

  useEffect(() => {
    void getAddOnServiceRequests(callId);
  }, [callId, getAddOnServiceRequests]);

  const addOnServiceRequestRows = addOnServiceRequests.map((row) => ({
    ...row,
    document_url: row?.request_email_url || row?.documents?.[0]?.file_url || "",
  }));

  const fileToAttachment = (file) => ({
    name: file.name,
    file,
    size: file.size,
    type: file.type,
  });

  const normalizeAttachmentList = (items) =>
    (items || []).map((item) =>
      item && typeof item === "object" && "file" in item && item.file instanceof File
        ? item
        : item instanceof File
          ? fileToAttachment(item)
          : item
    );

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
    handleChange("addOnServicesRequestEmailDocuments")({
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
      handleChange("addOnServicesRequestEmailDocuments")({
        target: { value: [fileToAttachment(allowed[0])] },
      });
    }
    if (requestEmailInputRef.current) {
      requestEmailInputRef.current.value = "";
    }
  };

  const handleRequestEmailRemoveAttachment = () => {
    handleChange("addOnServicesRequestEmailDocuments")({ target: { value: [] } });
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
      const current = normalizeAttachmentList(formValues.addOnServicesDocuments || []);
      const added = files.map(fileToAttachment);
      handleChange("addOnServicesDocuments")({ target: { value: [...current, ...added] } });
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const current = normalizeAttachmentList(formValues.addOnServicesDocuments || []);
      const added = files.map(fileToAttachment);
      handleChange("addOnServicesDocuments")({ target: { value: [...current, ...added] } });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const current = normalizeAttachmentList(formValues.addOnServicesDocuments || []);
    handleChange("addOnServicesDocuments")({
      target: { value: current.filter((_, i) => i !== index) },
    });
  };

  const isOthersSelected = formValues.addOnServiceType === "Others";

  const handleSave = useCallback(async () => {
    if (!callId) {
      notify("Call is required to save an add-on service request.", "error", "top-center");
      return;
    }
    if (!formValues.addOnServiceType) {
      notify("Service type is required.", "error", "top-center");
      return;
    }

    const payload = {
      call_id: Number(callId),
      add_on_service_type: formValues.addOnServiceType,
      add_on_service_type_other: formValues.addOnServiceTypeOther || "",
      remarks: formValues.addOnServicesDescription || "",
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    const requestEmailFile = normalizeAttachmentList(
      formValues.addOnServicesRequestEmailDocuments || []
    )[0]?.file;
    if (requestEmailFile instanceof File) {
      formData.append("request_email", requestEmailFile);
    }

    normalizeAttachmentList(formValues.addOnServicesDocuments || []).forEach((attachment) => {
      const file = attachment?.file ?? attachment;
      if (file instanceof File) {
        formData.append("attachments[]", file);
      }
    });

    try {
      const response = await createAddOnServiceRequest(formData);
      notify(
        response?.data?.message || "Add-on service request created successfully",
        "success",
        "top-center"
      );
      await getAddOnServiceRequests(callId);
    } catch (error) {
      notify(
        error?.response?.data?.message || "Failed to create add-on service request",
        "error",
        "top-center"
      );
    }
  }, [callId, formValues, createAddOnServiceRequest, getAddOnServiceRequests]);

  const requestEmailAttachments = normalizeAttachmentList(
    formValues.addOnServicesRequestEmailDocuments || []
  );
  const documentsAttachments = normalizeAttachmentList(formValues.addOnServicesDocuments || []);

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form add-on-services-form">
          <div className="general-info-two-column operation-section-form-layout crew-pass-premium-grid">
            <div className="general-info-left crew-pass-premium-left">
              <div className={`crew-pass-request-details-card husb-accent-${ADD_ON_SERVICE_ACCENT}`}>
                <PremiumCardHeader
                  icon="addOnServices"
                  title="Request Details"
                  subtitle="Submit an add-on service request for this call"
                  headerClassName="crew-pass-request-details-card__header"
                  titleClassName="crew-pass-request-details-card__title"
                />
                <div className="crew-pass-request-details-card__body crew-pass-form-fields crew-pass-thin-scrollbar">
                  <FormGroup icon="list" label="Service Type" accent={ADD_ON_SERVICE_ACCENT}>
                    <FormField>
                      <FormSelect
                        value={formValues.addOnServiceType || ""}
                        onChange={handleChange("addOnServiceType")}
                        options={ADD_ON_SERVICE_TYPE_OPTIONS}
                        placeholder="Select service type..."
                      />
                    </FormField>
                  </FormGroup>

                  {isOthersSelected && (
                    <FormField label="Specify Other Service Type">
                      <div className="cf-input">
                        <input
                          type="text"
                          value={formValues.addOnServiceTypeOther || ""}
                          onChange={handleChange("addOnServiceTypeOther")}
                          placeholder="Enter other service type..."
                        />
                      </div>
                    </FormField>
                  )}

                  <FormGroup icon="mail" label="Request Email" accent={ADD_ON_SERVICE_ACCENT}>
                    <FormField>
                      <div className="transport-upload-box">
                        <AttachmentsList
                          attachments={requestEmailAttachments}
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
                  </FormGroup>

                  <FormGroup icon="folder" label="Documents" accent={ADD_ON_SERVICE_ACCENT}>
                    <FormField className="cf-field-full">
                      <div className="transport-upload-box">
                        <AttachmentsList
                          attachments={documentsAttachments}
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
                          accept={DOCUMENTS_ACCEPT_ATTR}
                          multiple
                        />
                      </div>
                    </FormField>
                  </FormGroup>

                  <FormGroup icon="notebook" label="Remarks" accent={ADD_ON_SERVICE_ACCENT}>
                    <div className="cgpass-remarks">
                      <FormField>
                        <ReactQuillEditor
                          value={formValues?.addOnServicesDescription || ""}
                          onChange={handleChange("addOnServicesDescription")}
                          placeholder="Enter remarks..."
                          name="addOnServicesDescription"
                        />
                      </FormField>
                    </div>
                  </FormGroup>
                </div>
                <div className="form-save-button-wrapper cgpass-save-footer">
                  <button type="button" className="form-save-button" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>

            <div className="general-info-right crew-pass-requests-sidebar">
              <HusbandryServiceRequestsTable
                title="Add-on Service Requests"
                requests={addOnServiceRequestRows}
                loading={isLoadingList}
                columns={ADD_ON_SERVICE_REQUEST_COLUMNS}
                serviceType="ADD_ON"
                emptyMessage="No service requests found"
                accent={ADD_ON_SERVICE_ACCENT}
              />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
};

AddOnServicesContent.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
};

export default AddOnServicesContent;
