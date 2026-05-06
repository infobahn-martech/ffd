import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../assets/images/cv.png";
import { buildArrivalReportBody, buildArrivalDailyReportBody } from "../../services/sendReportBodyBuilder";
import {
  DynamicDateTimeFields,
  FormField,
  FormSection,
  FormSelect,
  FormTextarea,
  OperationEmailPreviewPanel,
  OperationFileUpload,
  OperationFormCard,
  OperationSaveSection,
} from "./components/OperationCommon";

function Arrival({
  formValues,
  handleChange,
  cardColor,
  onSendReport,
  isViewOnly = false,
  arrivalStageFields = [],
  postArrivalStageFields = [],
}) {
  const [reportDraft, setReportDraft] = useState({
    reportType: "arrival",
    from: "operations@shipping.com",
    to: "",
    cc: "",
    subject: "Report - Arrival",
    message: "",
  });
  const [isSavingArrival, setIsSavingArrival] = useState(false);

  const crewImmigrationStatusOptions = [
    { value: "Completed", label: "Completed" },
    { value: "On Hold", label: "On Hold" },
  ];
  const customInspectionStatusOptions = [
    { value: "Passed", label: "Passed" },
    { value: "Failed", label: "Failed" },
  ];

  const handleArrivalDocumentsAdd = (files) => {
    if (files.length > 0) {
      const currentAttachments = formValues.arrivalDocumentsAttachments || [];
      const updatedAttachments = [...currentAttachments, ...files];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("arrivalDocumentsAttachments")(syntheticEvent);
    }
  };

  const handleReportDraftChange = (field, value) => {
    setReportDraft((prev) => ({ ...prev, [field]: value }));
  };

  const getArrivalMessage = (reportType) =>
    reportType === "daily" ? buildArrivalDailyReportBody(formValues) : buildArrivalReportBody(formValues);

  useEffect(() => {
    setReportDraft((prev) => ({
      ...prev,
      message: getArrivalMessage(prev.reportType),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReportTypeChange = (nextType) => {
    setReportDraft((prev) => ({
      ...prev,
      reportType: nextType,
      subject: nextType === "daily" ? "Report - Daily Arrival" : "Report - Arrival",
      message: getArrivalMessage(nextType),
    }));
  };

  const saveArrivalData = async () => {
    console.log("Saving Arrival data:", formValues);
    // TODO: replace with Arrival save API call
    return true;
  };

  const handleSaveAndSendReport = async () => {
    setIsSavingArrival(true);
    try {
      const saveResult = await saveArrivalData();
      if (!saveResult) return;

      await onSendReport?.({
        tabName: reportDraft.reportType === "daily" ? "Daily Report" : "Arrival",
        from: reportDraft.from,
        to: reportDraft.to,
        cc: reportDraft.cc,
        subject: reportDraft.subject,
        body: reportDraft.message || getArrivalMessage(reportDraft.reportType),
        attachments: formValues.arrivalDocumentsAttachments || [],
      });
    } finally {
      setIsSavingArrival(false);
    }
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Arrival Information</h3>
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="operation-tab-layout">
          <div className="arrival-form">
            <div className="operation-two-column-grid operation-two-column-grid--split-scroll">
              <OperationFormCard className="operation-form-column">
                <OperationFormCard>
                  <DynamicDateTimeFields
                    eventFields={arrivalStageFields}
                    formValues={formValues}
                    handleChange={handleChange}
                    isViewOnly={isViewOnly}
                  />

                  <FormField label="Custom Inspection Status">
                    <FormSelect
                      value={formValues.customInspectionStatus || "Passed"}
                      onChange={handleChange("customInspectionStatus")}
                      options={customInspectionStatusOptions}
                      placeholder="Select status..."
                      disabled={isViewOnly}
                    />
                  </FormField>

                  {formValues.customInspectionStatus === "Failed" && (
                    <FormField label="Custom Inspection Remark" className="cf-field-full">
                      <FormTextarea
                        value={formValues.customInspectionFailReason || ""}
                        onChange={handleChange("customInspectionFailReason")}
                        placeholder="Specify remark..."
                        rows={3}
                        disabled={isViewOnly}
                      />
                    </FormField>
                  )}

                  <FormField label="Crew immigration completed / on hold">
                    <FormSelect
                      value={formValues.crewImmigrationStatus || ""}
                      onChange={handleChange("crewImmigrationStatus")}
                      options={crewImmigrationStatusOptions}
                      placeholder="Select status..."
                      disabled={isViewOnly}
                    />
                  </FormField>

                  {formValues.crewImmigrationStatus === "On Hold" && (
                    <FormField label="Crew Immigration Remark" className="cf-field-full">
                      <FormTextarea
                        value={formValues.crewImmigrationHoldRemarks || ""}
                        onChange={handleChange("crewImmigrationHoldRemarks")}
                        placeholder="Specify remark..."
                        rows={3}
                        disabled={isViewOnly}
                      />
                    </FormField>
                  )}

                  <DynamicDateTimeFields
                    eventFields={postArrivalStageFields}
                    formValues={formValues}
                    handleChange={handleChange}
                    isViewOnly={isViewOnly}
                  />
                </OperationFormCard>

                <FormField label="Attach Vessel Inward and Marine Work Permit Copies">
                  <OperationFileUpload
                    files={formValues.arrivalDocumentsAttachments || []}
                    onAddFiles={handleArrivalDocumentsAdd}
                    isViewOnly={isViewOnly}
                    ariaLabel="Upload arrival documents"
                  />
                </FormField>
              </OperationFormCard>
              <OperationFormCard className="operation-email-column">
                <OperationEmailPreviewPanel
                  reportType={reportDraft.reportType}
                  reportTypeOptions={[
                    { value: "arrival", label: "Arrival Report" },
                    { value: "daily", label: "Daily Report" },
                  ]}
                  from={reportDraft.from}
                  to={reportDraft.to}
                  cc={reportDraft.cc}
                  subject={reportDraft.subject}
                  message={reportDraft.message}
                  attachments={formValues.arrivalDocumentsAttachments || []}
                  onChange={handleReportDraftChange}
                  onReportTypeChange={handleReportTypeChange}
                  onSend={handleSaveAndSendReport}
                  isSending={isSavingArrival}
                  isViewOnly={isViewOnly}
                />
              </OperationFormCard>
            </div>
          </div>
          <OperationSaveSection isViewOnly={isViewOnly} onSave={handleSaveAndSendReport} isSaving={isSavingArrival} />
        </div>
      </FormSection>
    </div>
  );
}

Arrival.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  cardColor: PropTypes.string,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  onSendReport: PropTypes.func,
  isViewOnly: PropTypes.bool,
  arrivalStageFields: PropTypes.array,
  postArrivalStageFields: PropTypes.array,
};

export default Arrival;
