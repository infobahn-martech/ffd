import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../assets/images/cv.png";
import { notify } from "../../../../../components/Toaster";
import { buildArrivalReportBody, buildArrivalDailyReportBody } from "../../services/sendReportBodyBuilder";
import appointmentAcceptanceService from "../../../../../services/appointmentAcceptanceService";
import arrivalService from "../../../../../services/arrivalService";
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
import { extractReportTemplateFields } from "./operationReportTemplate";

function Arrival({
  formValues,
  handleChange,
  cardColor,
  onSendReport,
  isViewOnly = false,
  arrivalStageFields = [],
  postArrivalStageFields = [],
  callId = "",
  portId = "",
  callTypeId = "",
}) {
  const resolveFormId = (...values) => {
    for (const value of values) {
      if (value === undefined || value === null) continue;
      const normalized = String(value).trim();
      if (normalized) return normalized;
    }
    return "";
  };

  const toDateTimeValue = (datePart, timePart) => {
    const dateValue = String(datePart || "").trim();
    const timeValue = String(timePart || "").trim();
    if (!dateValue || !timeValue) return "";
    return `${dateValue} ${timeValue}`;
  };

  const buildTimeObjectsPayload = (eventFields, values) =>
    (Array.isArray(eventFields) ? eventFields : [])
      .map((field) => {
        const keyPrefix = field?.keyPrefix;
        if (!keyPrefix) return null;
        const timeObjectValue = toDateTimeValue(values?.[`${keyPrefix}Date`], values?.[`${keyPrefix}Time`]);
        if (!timeObjectValue) return null;
        return {
          time_object_id: field?.time_object_id ?? field?.event_type_id ?? null,
          field_key: field?.field_key || field?.event_name || keyPrefix,
          time_object_value: timeObjectValue,
        };
      })
      .filter(Boolean);

  const buildSaveTimeObjectsPayload = (eventFields, values) =>
    (Array.isArray(eventFields) ? eventFields : [])
      .map((field) => {
        const keyPrefix = field?.keyPrefix;
        if (!keyPrefix) return null;
        const timeObjectValue = toDateTimeValue(values?.[`${keyPrefix}Date`], values?.[`${keyPrefix}Time`]);
        if (!timeObjectValue) return null;
        const timeObjectId = field?.time_object_id ?? field?.event_type_id;
        if (timeObjectId == null || timeObjectId === "") return null;
        return {
          time_object_id: timeObjectId,
          time_object_value: timeObjectValue,
        };
      })
      .filter(Boolean);

  const normalizeAttachmentFile = (fileLike) => {
    if (!fileLike) return null;
    if (fileLike instanceof File || fileLike instanceof Blob) return fileLike;
    if (fileLike?.file instanceof File || fileLike?.file instanceof Blob) return fileLike.file;
    return null;
  };

  const pickAttachmentByName = (files, patterns) =>
    files.find((file) => patterns.some((pattern) => pattern.test(String(file?.name || ""))));

  const resolveCreatedBy = () => {
    if (typeof window === "undefined") return "";
    return String(
      localStorage.getItem("userid") ||
      localStorage.getItem("user_id") ||
      localStorage.getItem("userId") ||
      ""
    ).trim();
  };

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
    { value: "Pending", label: "Pending" },
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

  useEffect(() => {
    let cancelled = false;

    const loadArrivalTemplate = async () => {
      if (reportDraft.reportType !== "arrival") return;

      const resolvedCallId = resolveFormId(callId, formValues?.call_id, formValues?.callId);
      const resolvedPortId = resolveFormId(portId, formValues?.port_id, formValues?.portId);
      const resolvedCallTypeId = resolveFormId(callTypeId, formValues?.call_type_id, formValues?.typeOfCall, formValues?.callTypeId);
      if (!resolvedCallId || !resolvedPortId || !resolvedCallTypeId) return;

      const timeObjects = buildTimeObjectsPayload([...arrivalStageFields, ...postArrivalStageFields], formValues);

      try {
        const response = await appointmentAcceptanceService.getArrivalTemplateByPortCallType({
          call_id: resolvedCallId,
          port_id: resolvedPortId,
          call_type_id: resolvedCallTypeId,
          report_type_id: 4,
          time_objects: timeObjects,
        });

        if (cancelled) return;
        const template = extractReportTemplateFields(response);

        setReportDraft((prev) => ({
          ...prev,
          subject: template.subject || prev.subject,
          message: template.message || prev.message,
        }));
      } catch (error) {
        if (cancelled) return;
        console.error("[Operation] arrival/get_template_by_port_calltype failed", error);
      }
    };

    loadArrivalTemplate();

    return () => {
      cancelled = true;
    };
  }, [callId, portId, callTypeId, formValues, arrivalStageFields, postArrivalStageFields, reportDraft.reportType]);

  const handleReportTypeChange = (nextType) => {
    setReportDraft((prev) => ({
      ...prev,
      reportType: nextType,
      subject: nextType === "daily" ? "Report - Daily Arrival" : "Report - Arrival",
      message: getArrivalMessage(nextType),
    }));
  };

  const saveArrivalData = async () => {
    const resolvedCallId = resolveFormId(callId, formValues?.call_id, formValues?.callId);
    if (!resolvedCallId) {
      notify("Call ID is required to save Arrival.", "error");
      return false;
    }

    const allFields = [...arrivalStageFields, ...postArrivalStageFields];
    const saveTimeObjects = buildSaveTimeObjectsPayload(allFields, formValues);
    const mwpExpiry = toDateTimeValue(formValues?.marineWorkPermitExpiresDate, formValues?.marineWorkPermitExpiresTime);

    const allFiles = (Array.isArray(formValues?.arrivalDocumentsAttachments) ? formValues.arrivalDocumentsAttachments : [])
      .map(normalizeAttachmentFile)
      .filter(Boolean);

    const inwardDoc =
      pickAttachmentByName(allFiles, [/inward/i, /clearance/i]) ||
      allFiles[0] ||
      null;
    const mwpDoc =
      pickAttachmentByName(allFiles, [/mwp/i, /marine/i, /permit/i]) ||
      allFiles[1] ||
      null;

    const fd = new FormData();
    fd.append("call_id", String(resolvedCallId));
    fd.append("time_objects", JSON.stringify(saveTimeObjects));
    fd.append("customs_status", String(formValues?.customInspectionStatus || ""));
    fd.append("immigration_status", String(formValues?.crewImmigrationStatus || ""));
    fd.append("immigration_remarks", String(formValues?.crewImmigrationHoldRemarks || ""));
    fd.append("mwp_expiry", mwpExpiry);
    if (inwardDoc) fd.append("inward_clearance_doc", inwardDoc);
    if (mwpDoc) fd.append("mwp_doc", mwpDoc);

    const createdBy = resolveCreatedBy();
    if (createdBy) {
      fd.append("created_by", createdBy);
    }

    const arrivalReport = String(reportDraft.message || getArrivalMessage(reportDraft.reportType) || "").trim();
    fd.append("arrival_report", arrivalReport);

    try {
      await arrivalService.saveArrivalDetail(fd);
      notify("Arrival saved successfully.", "success");
      return true;
    } catch (error) {
      notify(error?.response?.data?.message || "Failed to save Arrival.", "error");
      return false;
    }
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
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  callTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Arrival;
