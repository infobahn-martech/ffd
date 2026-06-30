import { useState, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../../assets/images/cv.png";
import { notify } from "../../../../../../../components/Toaster";
import { FormSection, FormField, FormSelect, ReactQuillEditor } from "./Husbandry.components";
import AttachmentsList from "../../appointment/AttachmentsList";
import CrewPassRequestsTable from "./CrewPassRequestsTable";
import thirdPartyService from "../../../../../../../services/thirdPartyService";

const REQUEST_EMAIL_ACCEPT_ATTR = ".msg,.eml,.pdf,.doc,.docx";
const REQUEST_EMAIL_EXT_RE = /\.(msg|eml|pdf|doc|docx)$/i;
const DOCUMENTS_ACCEPT_ATTR = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

const unwrapApiList = (axiosData) => {
  const payload = axiosData?.data ?? axiosData;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const ThirdPartyServicesContent = ({ formValues, handleChange, cardColor }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingEmail, setIsDraggingEmail] = useState(false);
  const fileInputRef = useRef(null);
  const requestEmailInputRef = useRef(null);

  const [thirdPartyServiceCatalog, setThirdPartyServiceCatalog] = useState([]);
  const [loadingThirdPartyServiceCatalog, setLoadingThirdPartyServiceCatalog] = useState(false);

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
    handleChange("thirdPartyServicesRequestEmailDocuments")({
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
      handleChange("thirdPartyServicesRequestEmailDocuments")({
        target: { value: [fileToAttachment(allowed[0])] },
      });
    }
    if (requestEmailInputRef.current) {
      requestEmailInputRef.current.value = "";
    }
  };

  const handleRequestEmailRemoveAttachment = () => {
    handleChange("thirdPartyServicesRequestEmailDocuments")({ target: { value: [] } });
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
      const current = normalizeAttachmentList(formValues.thirdPartyServicesDocuments || []);
      const added = files.map(fileToAttachment);
      handleChange("thirdPartyServicesDocuments")({ target: { value: [...current, ...added] } });
    }
  };

  const handleDocumentsFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const current = normalizeAttachmentList(formValues.thirdPartyServicesDocuments || []);
      const added = files.map(fileToAttachment);
      handleChange("thirdPartyServicesDocuments")({ target: { value: [...current, ...added] } });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDocumentsRemoveAttachment = (index) => {
    const current = normalizeAttachmentList(formValues.thirdPartyServicesDocuments || []);
    handleChange("thirdPartyServicesDocuments")({
      target: { value: current.filter((_, i) => i !== index) },
    });
  };

  const serviceTypeOptions = useMemo(() => {
    const fromApi = thirdPartyServiceCatalog.map((row) => ({
      value: String(row.third_party_service_id ?? row._id ?? ""),
      label: row.third_party_service ?? "",
    }));
    return [...fromApi.filter((o) => o.value), { value: "Others", label: "Others" }];
  }, [thirdPartyServiceCatalog]);

  const isOthersSelected = formValues.thirdPartyServiceType === "Others";

  const handleSave = () => {
  };

  const requestEmailAttachments = normalizeAttachmentList(
    formValues.thirdPartyServicesRequestEmailDocuments || []
  );
  const documentsAttachments = normalizeAttachmentList(formValues.thirdPartyServicesDocuments || []);

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="pre-arrival-form third-party-services-form">
          <div className="general-info-two-column operation-section-form-layout crew-pass-premium-grid">
            <div className="general-info-left crew-pass-premium-left">
              <div className="crew-pass-request-details-card">
                <div className="crew-pass-request-details-card__header">
                  <h3 className="crew-pass-request-details-card__title">Request Details</h3>
                </div>
                <div className="crew-pass-request-details-card__body crew-pass-form-fields crew-pass-thin-scrollbar">
                  <FormField label="Service Type">
                    <FormSelect
                      value={formValues.thirdPartyServiceType || ""}
                      onChange={handleChange("thirdPartyServiceType")}
                      options={serviceTypeOptions}
                      placeholder={
                        loadingThirdPartyServiceCatalog
                          ? "Loading service types..."
                          : "Select service type..."
                      }
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

                  <FormField label="Request Email">
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

                  <FormField label="Documents" className="cf-field-full">
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

                  <div className="cgpass-remarks">
                    <FormField label="Remarks">
                      <ReactQuillEditor
                        value={formValues?.thirdPartyServicesDescription || ""}
                        onChange={handleChange("thirdPartyServicesDescription")}
                        placeholder="Enter remarks..."
                        name="thirdPartyServicesDescription"
                      />
                    </FormField>
                  </div>

                  <div className="form-save-button-wrapper cgpass-save-footer">
                    <button type="button" className="form-save-button" onClick={handleSave}>
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="general-info-right crew-pass-requests-sidebar">
              <CrewPassRequestsTable
                title="Third-Party Service Requests"
                requests={[]}
                loading={false}
                passType="THIRD_PARTY"
                emptyMessage="No service requests found"
              />
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
