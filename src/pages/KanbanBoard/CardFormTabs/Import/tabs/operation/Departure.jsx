import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../../assets/images/cv.png";
import { buildDepartureReportBody } from "../../services/sendReportBodyBuilder";
import { ensureHtmlForQuill, resolveReportBodyHtml } from "./operationReportMessageHtml";
import { notify } from "../../../../../../components/Toaster";
import useArrivalReducer from "../../../../../../store/ArrivalReducer";
import { OPERATION_STAGE_IDS } from "./operationConstants";
import {
  AdditionalTimeObjectAddButton,
  AdditionalTimeObjectsFields,
  appendAdditionalTimeObject,
  commitAdditionalTimeObject,
  DynamicDateTimeFields,
  FormField,
  FormInput,
  FormSection,
  mapAttachmentsForSave,
  OperationEmailPreviewPanel,
  OperationFileUpload,
  OperationFormCard,
  OperationSaveSection,
  persistAdditionalTimeObjects,
  refreshAdditionalTimeObjectsByCall,
  useApplyStageTimeObjectValues,
  validateAdditionalTimeObjects,
} from "./components/OperationCommon";

function Departure({
  formValues,
  handleChange,
  cardColor,
  onSendReport,
  isViewOnly = false,
  eventFields = [],
  callId = "",
  billingEntityId,
  stageId = OPERATION_STAGE_IDS.DEPARTURE,
}) {
  const saveCallTimeObjectAction = useArrivalReducer((s) => s.saveCallTimeObject);
  const getTimeObjectsByCallAction = useArrivalReducer((s) => s.getTimeObjectsByCall);
  const deleteCallTimeObjectAction = useArrivalReducer((s) => s.deleteCallTimeObject);
  const [reportDraft, setReportDraft] = useState({
    from: "operations@shipping.com",
    to: "",
    cc: "",
    subject: "Report - Departure",
    message: "",
  });
  const [isSavingDeparture, setIsSavingDeparture] = useState(false);

  const resolvedCallId = String(
    callId || formValues?.call_id || formValues?.callId || ""
  ).trim();

  useApplyStageTimeObjectValues(eventFields, formValues, handleChange);

  const handleDepartureDocumentsAdd = (files) => {
    if (files.length > 0) {
      const currentAttachments = formValues.departureAttachments || [];
      const updatedAttachments = [...currentAttachments, ...files];
      const syntheticEvent = { target: { value: updatedAttachments } };
      handleChange("departureAttachments")(syntheticEvent);
    }
  };

  const handleDepartureAttachmentsChange = (nextAttachments) => {
    handleChange("departureAttachments")({ target: { value: nextAttachments } });
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

  const toDateTimeValue = (datePart, timePart) => {
    const dateValue = String(datePart || "").trim();
    const timeValue = String(timePart || "").trim();
    if (!dateValue || !timeValue) return "";
    return `${dateValue} ${timeValue}`;
  };

  const buildDepartureTimeObjectsPayload = () =>
    (Array.isArray(eventFields) ? eventFields : [])
      .map((field) => {
        const keyPrefix = field?.keyPrefix;
        if (!keyPrefix) return null;
        const timeObjectValue = toDateTimeValue(
          formValues?.[`${keyPrefix}Date`],
          formValues?.[`${keyPrefix}Time`]
        );
        if (!timeObjectValue) return null;
        const timeObjectId = field?.time_object_id ?? field?.event_type_id;
        if (timeObjectId == null || timeObjectId === "") return null;
        return {
          time_object_id: timeObjectId,
          time_object_value: `${timeObjectValue}:00`,
        };
      })
      .filter(Boolean);

  const saveDepartureData = async () => {
    const additionalValidation = validateAdditionalTimeObjects(
      formValues.departureAdditionalTimeObjects
    );
    if (!additionalValidation.valid) {
      notify(additionalValidation.message, "error");
      return false;
    }

    if (!resolvedCallId) {
      notify("Call ID is required to save Departure.", "error");
      return false;
    }

    const timeObjects = buildDepartureTimeObjectsPayload();
    const departureReport = {
      subject: reportDraft.subject ?? "",
      body: resolveReportBodyHtml(reportDraft.message, buildDepartureReportBody(formValues)) ?? "",
      to_email: reportDraft.to ?? "",
      from_email: reportDraft.from ?? "",
      cc_emails: reportDraft.cc ?? "",
      attachments: mapAttachmentsForSave(formValues.departureAttachments || []),
    };
    console.log("Saving Departure data:", {
      ...formValues,
      time_objects: timeObjects,
      departure_report: departureReport,
    });
    // TODO: replace with Departure save API call for stage time objects (append time_objects + departure_report to FormData)

    try {
      await persistAdditionalTimeObjects({
        rows: formValues.departureAdditionalTimeObjects,
        callId: resolvedCallId,
        stageId,
        saveCallTimeObject: saveCallTimeObjectAction,
      });
      return true;
    } catch (error) {
      notify(
        error?.response?.data?.message || "Failed to save departure time objects.",
        "error"
      );
      return false;
    }
  };

  const handleCommitAdditionalTimeObject = async (row, index) => {
    if (!resolvedCallId) return;
    try {
      const newId = await commitAdditionalTimeObject({
        row,
        callId: resolvedCallId,
        stageId,
        saveCallTimeObject: saveCallTimeObjectAction,
      });
      const refreshedRows = await refreshAdditionalTimeObjectsByCall({
        callId: resolvedCallId,
        stageId,
        portId: formValues?.port_id ?? formValues?.portId ?? "",
        callTypeId:
          formValues?.call_type_id ??
          formValues?.typeOfCall ??
          formValues?.callTypeId ??
          "",
        getTimeObjectsByCall: getTimeObjectsByCallAction,
        currentRows: formValues.departureAdditionalTimeObjects || [],
        committedIndex: index,
      });
      if (refreshedRows) {
        handleChange("departureAdditionalTimeObjects")({ target: { value: refreshedRows } });
      } else if (newId != null && String(row?.id ?? "") !== String(newId)) {
        const rows = formValues.departureAdditionalTimeObjects || [];
        const next = rows.map((r, i) => (i === index ? { ...r, id: newId } : r));
        handleChange("departureAdditionalTimeObjects")({ target: { value: next } });
      }
    } catch (error) {
      notify(
        error?.response?.data?.message || "Failed to save time object.",
        "error"
      );
    }
  };

  const handleRemoveAdditionalTimeObject = async (row, index) => {
    const rows = formValues.departureAdditionalTimeObjects || [];
    const next = rows.filter((_, rowIndex) => rowIndex !== index);

    if (row?.id != null && String(row.id).trim() !== "" && resolvedCallId) {
      try {
        await deleteCallTimeObjectAction({
          timeObjectId: row.id,
          callId: resolvedCallId,
          stageId,
        });
      } catch (error) {
        notify(
          error?.response?.data?.message || "Failed to delete time object.",
          "error"
        );
        return;
      }
    }

    handleChange("departureAdditionalTimeObjects")({ target: { value: next } });
  };

  const handleSaveAndSendReport = async () => {
    setIsSavingDeparture(true);
    try {
      const saveResult = await saveDepartureData();
      if (!saveResult) return;

      await onSendReport?.({
        tabName: "Departure",
        call_id: resolvedCallId,
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
              <OperationFormCard
                className="operation-form-column"
                topRightAction={
                  !isViewOnly ? (
                    <AdditionalTimeObjectAddButton
                      onClick={() =>
                        handleChange("departureAdditionalTimeObjects")({
                          target: {
                            value: appendAdditionalTimeObject(formValues.departureAdditionalTimeObjects),
                          },
                        })
                      }
                    />
                  ) : null
                }
              >
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

                <AdditionalTimeObjectsFields
                  value={formValues.departureAdditionalTimeObjects || []}
                  onChange={(next) =>
                    handleChange("departureAdditionalTimeObjects")({ target: { value: next } })
                  }
                  onRemoveRow={handleRemoveAdditionalTimeObject}
                  onCommitRow={handleCommitAdditionalTimeObject}
                  isViewOnly={isViewOnly}
                  hideAddButton
                />
              </OperationFormCard>
              <OperationFormCard className="operation-email-column">
                <OperationEmailPreviewPanel
                  from={reportDraft.from}
                  to={reportDraft.to}
                  cc={reportDraft.cc}
                  subject={reportDraft.subject}
                  message={reportDraft.message}
                  attachments={formValues.departureAttachments || []}
                  onAttachmentsChange={handleDepartureAttachmentsChange}
                  billingEntityId={billingEntityId ?? formValues.mainBillingEntity}
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
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  billingEntityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Departure;
