import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../assets/images/cv.png";
import { buildDepartureReportBody } from "../../services/sendReportBodyBuilder";
import { ensureHtmlForQuill, resolveReportBodyHtml } from "./operationReportMessageHtml";
import {
  DynamicDateTimeFields,
  FormField,
  FormInput,
  FormSection,
  OperationEmailPreviewPanel,
  OperationFileUpload,
  OperationFormCard,
  OperationSaveSection,
} from "./components/OperationCommon";

function Departure({
  formValues,
  handleChange,
  cardColor,
  onSendReport,
  isViewOnly = false,
  eventFields = [],
}) {
  const [reportDraft, setReportDraft] = useState({
    from: "operations@shipping.com",
    to: "",
    cc: "",
    subject: "Report - Departure",
    message: "",
  });
  const [isSavingDeparture, setIsSavingDeparture] = useState(false);

  const handleDepartureDocumentsAdd = (files) => {
    if (files.length > 0) {
      const currentAttachments = formValues.departureAttachments || [];
      const updatedAttachments = [...currentAttachments, ...files];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("departureAttachments")(syntheticEvent);
    }
  };

  useEffect(() => {
    setReportDraft((prev) => ({
      ...prev,
      message: ensureHtmlForQuill(buildDepartureReportBody(formValues)),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReportDraftChange = (field, value) => {
    setReportDraft((prev) => ({ ...prev, [field]: value }));
  };

  const saveDepartureData = async () => {
    console.log("Saving Departure data:", formValues);
    // TODO: replace with Departure save API call
    return true;
  };

  const handleSaveAndSendReport = async () => {
    setIsSavingDeparture(true);
    try {
      const saveResult = await saveDepartureData();
      if (!saveResult) return;

      await onSendReport?.({
        tabName: "Departure",
        from: reportDraft.from,
        to: reportDraft.to,
        cc: reportDraft.cc,
        subject: reportDraft.subject,
        body: resolveReportBodyHtml(reportDraft.message, buildDepartureReportBody(formValues)),
        attachments: formValues.departureAttachments || [],
      });
    } finally {
      setIsSavingDeparture(false);
    }
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Departure Information</h3>
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="operation-tab-layout">
          <div className="departure-form">
            <div className="operation-two-column-grid operation-two-column-grid--split-scroll">
              <OperationFormCard className="operation-form-column">
                <FormField label="Email Requested Accept">
                  <OperationFileUpload
                    files={formValues.departureAttachments || []}
                    onAddFiles={handleDepartureDocumentsAdd}
                    isViewOnly={isViewOnly}
                    ariaLabel="Upload departure documents"
                  />
                </FormField>

                <DynamicDateTimeFields
                  eventFields={eventFields}
                  formValues={formValues}
                  handleChange={handleChange}
                  isViewOnly={isViewOnly}
                />
                <FormField label="Next port">
                  <FormInput
                    type="text"
                    value={formValues.nextPort || ""}
                    onChange={handleChange("nextPort")}
                    placeholder="Enter next port..."
                    disabled={isViewOnly}
                  />
                </FormField>
              </OperationFormCard>
              <OperationFormCard className="operation-email-column">
                <OperationEmailPreviewPanel
                  from={reportDraft.from}
                  to={reportDraft.to}
                  cc={reportDraft.cc}
                  subject={reportDraft.subject}
                  message={reportDraft.message}
                  attachments={formValues.departureAttachments || []}
                  onChange={handleReportDraftChange}
                  onSend={handleSaveAndSendReport}
                  isSending={isSavingDeparture}
                  isViewOnly={isViewOnly}
                />
              </OperationFormCard>
            </div>
          </div>
          <OperationSaveSection isViewOnly={isViewOnly} onSave={handleSaveAndSendReport} isSaving={isSavingDeparture} />
        </div>
      </FormSection>
    </div>
  );
}

Departure.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
  isViewOnly: PropTypes.bool,
  eventFields: PropTypes.array,
};

export default Departure;
