import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import GroupSettingsIcon from "../../../../../assets/images/cv.png";
import { notify } from "../../../../../components/Toaster";
import { buildPreArrivalReportBody } from "../../services/sendReportBodyBuilder";
import {
  DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING,
  collectPreArrivalProcessAttachments,
} from "./preArrivalDocumentHandling";
import preArrivalInfoService from "../../../../../services/preArrivalInfoService";
import userService from "../../../../../services/userService";
import preArrivalService from "../../../../../services/preArrivalService";
import appointmentAcceptanceService from "../../../../../services/appointmentAcceptanceService";
import coordinatesService from "../../../../../services/coordinatesService";
import {
  BAD_WEATHER,
  PRE_ARRIVAL_CUSTOM_CLEARANCE_ROLE_ID,
  PRE_ARRIVAL_GRO_ROLE_ID,
  PRE_ARRIVAL_SABER_STATUS_OPTIONS,
  PRE_ARRIVAL_SABER_STATUS_SAVE_VALUE,
  PRE_ARRIVAL_WEATHER_FORECAST_OPTIONS,
  PRE_ARRIVAL_WEATHER_FORECAST_SAVE_VALUE,
  SABER_APPLIED_BY_SEDRES,
} from "./operationConstants";
import {
  DynamicDateTimeFields,
  FormField,
  FormInput,
  FormSection,
  FormSelect,
  OperationEmailPreviewPanel,
  OperationFileUpload,
  OperationFormCard,
  OperationSaveSection,
} from "./components/OperationCommon";
import { extractReportTemplateFields } from "./operationReportTemplate";
import {
  applyPreArrivalGetDetailToForm,
  findTaskDocumentGroupByRole,
  mergePreArrivalDetailDocuments,
} from "./preArrivalDetailApply";

const IconUpload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function openAttachmentPreview(attachment) {
  const raw = attachment?.file;
  if (raw instanceof Blob) {
    const url = URL.createObjectURL(raw);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }
  const link = attachment?.url || attachment?.attachment;
  if (typeof link === "string" && /^https?:\/\//i.test(link)) {
    window.open(link, "_blank", "noopener,noreferrer");
    return;
  }
  console.log("Preview document:", attachment?.name);
}

const CompactFileUploadRow = ({ label, files = [], onAddFiles, onRemoveAt, isViewOnly = false }) => {
  const inputRef = useRef(null);
  const hasFiles = (files || []).length > 0;

  const handleInput = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length) {
      const mapped = selectedFiles.map((file) => ({
        name: file.name,
        file,
        size: file.size,
        type: file.type,
      }));
      onAddFiles(mapped);
    }
    e.target.value = "";
  };

  return (
    <div className="document-row compact-file-upload-row">
      <div className="document-row-name compact-file-upload-label">
        <span title={label}>{label}</span>
      </div>
      <div className="document-row-actions compact-file-upload-actions">
        {hasFiles && (
          <button type="button" className="document-row-icon-btn" onClick={() => openAttachmentPreview(files[0])} title="Preview">
            <IconEye />
          </button>
        )}
        {!isViewOnly && (
          <>
            <button type="button" className="document-row-icon-btn" onClick={() => inputRef.current?.click()} title={hasFiles ? "Add more files" : "Upload files"}>
              <IconUpload />
            </button>
            <input ref={inputRef} type="file" className="document-row-file-input" onChange={handleInput} aria-label={`Upload ${label}`} multiple />
            {/* {hasFiles && (
              <button type="button" className="document-row-icon-btn document-row-icon-btn--danger" onClick={() => onRemoveAt(files.length - 1)} title="Remove latest file">
                <IconTrash />
              </button>
            )} */}
          </>
        )}
      </div>
    </div>
  );
};

CompactFileUploadRow.propTypes = {
  label: PropTypes.string.isRequired,
  files: PropTypes.array,
  isRequired: PropTypes.bool,
  onAddFiles: PropTypes.func.isRequired,
  onRemoveAt: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

const SaberUploadBox = ({ files = [], onAddFiles, isViewOnly = false }) => {
  return (
    <OperationFileUpload
      files={files}
      onAddFiles={onAddFiles}
      isViewOnly={isViewOnly}
      ariaLabel="Upload SABER certificate files"
    />
  );
};

SaberUploadBox.propTypes = {
  files: PropTypes.array,
  onAddFiles: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

function DocumentGroupCard({ title, children }) {
  return (
    <div className="document-group-card">
      <h4 className="document-group-card__title">{title}</h4>
      <div className="document-group-card__body">{children}</div>
    </div>
  );
}

DocumentGroupCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function PreArrivalDocumentHandlingSection({
  formValues,
  handleChange,
  isViewOnly,
  portId,
  callId,
  assigneeHints = null,
  detailDocSkip = null,
}) {
  const dh = formValues.preArrivalDocumentHandling || DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING;
  const stageFiles = Array.isArray(dh.stageFiles) ? dh.stageFiles : [];
  const dhRef = useRef(dh);
  const selectedGroOption = formValues.assignedGro || "";
  const selectedCustomClearanceOption = formValues.assignedCustom || "";
  const [groOptions, setGroOptions] = useState([]);
  const [customClearanceOptions, setCustomClearanceOptions] = useState([]);

  const groOptionsForSelect = useMemo(() => {
    const h = assigneeHints?.gro;
    const base = groOptions;
    if (!h?.value) return base;
    const v = String(h.value);
    if (base.some((o) => o.value === v)) return base;
    return [
      {
        value: v,
        label: h.label || `User ${v}`,
        roleId: h.roleId != null ? Number(h.roleId) : PRE_ARRIVAL_GRO_ROLE_ID,
      },
      ...base,
    ];
  }, [groOptions, assigneeHints?.gro]);

  const customOptionsForSelect = useMemo(() => {
    const h = assigneeHints?.customClearance;
    const base = customClearanceOptions;
    if (!h?.value) return base;
    const v = String(h.value);
    if (base.some((o) => o.value === v)) return base;
    return [
      {
        value: v,
        label: h.label || `User ${v}`,
        roleId: h.roleId != null ? Number(h.roleId) : PRE_ARRIVAL_CUSTOM_CLEARANCE_ROLE_ID,
      },
      ...base,
    ];
  }, [customClearanceOptions, assigneeHints?.customClearance]);

  useEffect(() => {
    dhRef.current = dh;
  }, [dh]);

  const setDh = (next) => {
    handleChange("preArrivalDocumentHandling")({ target: { value: next } });
  };

  const patchRowFiles = (processKey, rowId, nextFiles) => {
    const rows = (dh.documents[processKey] || []).map((r) => (r.id === rowId ? { ...r, files: nextFiles } : r));
    setDh({ ...dh, documents: { ...dh.documents, [processKey]: rows } });
  };

  const mergeRoleDocuments = useCallback((existingRows = [], incomingRows = []) => {
    const normalizedIncoming = (Array.isArray(incomingRows) ? incomingRows : []).map((row, index) => ({
      id: row?.document_id != null ? String(row.document_id) : row?.call_task_document_id != null ? String(row.call_task_document_id) : `role-doc-${index}`,
      name: row?.document_name || row?.name || `Document ${index + 1}`,
      is_required: Boolean(row?.is_required ?? row?.required),
      files:
        row?.is_uploaded && row?.file_url
          ? [
            {
              name: row?.file_name || row?.document_name || `Document ${index + 1}`,
              url: row.file_url,
              uploadedBy: row?.uploaded_by_user || null,
              uploadedAt: row?.uploaded_at || null,
              remarks: row?.remarks || null,
              status: row?.status ?? null,
            },
          ]
          : [],
    }));

    return normalizedIncoming.map((incomingRow) => {
      const matched = (existingRows || []).find((row) => String(row?.id) === String(incomingRow.id));
      return {
        ...incomingRow,
        files:
          Array.isArray(matched?.files) && matched.files.length > 0
            ? matched.files
            : incomingRow.files,
      };
    });
  }, []);

  const showGroDocuments = Boolean(selectedGroOption);
  const showCustomDocuments = Boolean(selectedCustomClearanceOption);
  const showDocumentHandlingContent = showGroDocuments || showCustomDocuments;

  useEffect(() => {
    let cancelled = false;

    const mapUserOptions = (response) =>
      (response?.data?.data || response?.data || [])
        .filter((user) => user?.user_id != null)
        .map((user) => ({
          value: String(user.user_id),
          label: user.name || `User ${user.user_id}`,
          roleId: user.role_id ?? user.roleId ?? user?.role?.role_id ?? user?.role?.id ?? null,
        }));

    const loadUserOptions = async () => {
      if (!portId) {
        setGroOptions([]);
        setCustomClearanceOptions([]);
        handleChange("assignedGro")({ target: { value: "" } });
        handleChange("assignedCustom")({ target: { value: "" } });
        return;
      }

      try {
        const [groRes, clearanceRes] = await Promise.all([
          userService.getUsersByRole({ role_id: 4, port_id: portId }),
          userService.getUsersByRole({ role_id: 5, port_id: portId }),
        ]);
        if (cancelled) return;

        const nextGroOptions = mapUserOptions(groRes);
        const nextCustomClearanceOptions = mapUserOptions(clearanceRes);
        setGroOptions(nextGroOptions);
        setCustomClearanceOptions(nextCustomClearanceOptions);

        if (selectedGroOption && !nextGroOptions.some((option) => option.value === selectedGroOption)) {
          handleChange("assignedGro")({ target: { value: "" } });
        }
        if (
          selectedCustomClearanceOption &&
          !nextCustomClearanceOptions.some((option) => option.value === selectedCustomClearanceOption)
        ) {
          handleChange("assignedCustom")({ target: { value: "" } });
        }
      } catch (error) {
        if (cancelled) return;
        setGroOptions([]);
        setCustomClearanceOptions([]);
        handleChange("assignedGro")({ target: { value: "" } });
        handleChange("assignedCustom")({ target: { value: "" } });
        console.error("[Operation] users/get_users_by_role failed", error);
      }
    };

    loadUserOptions();

    return () => {
      cancelled = true;
    };
  }, [portId, selectedGroOption, selectedCustomClearanceOption, handleChange]);

  useEffect(() => {
    let cancelled = false;

    const selectedGroRoleId = groOptionsForSelect.find((option) => option.value === selectedGroOption)?.roleId;
    const selectedCustomRoleId = customOptionsForSelect.find(
      (option) => option.value === selectedCustomClearanceOption
    )?.roleId;

    const skipGro =
      Boolean(detailDocSkip?.groHasDocs) &&
      detailDocSkip?.groUserId != null &&
      String(detailDocSkip.groUserId) === String(selectedGroOption || "");
    const skipCustom =
      Boolean(detailDocSkip?.customHasDocs) &&
      detailDocSkip?.customUserId != null &&
      String(detailDocSkip.customUserId) === String(selectedCustomClearanceOption || "");

    const loadRoleBasedDocuments = async () => {
      const tasks = [];
      if (!skipGro && selectedGroRoleId && selectedGroOption && callId) {
        tasks.push(
          preArrivalInfoService.getDocumentsByRole({
            role_id: selectedGroRoleId,
            user_id: selectedGroOption,
            call_id: callId,
          })
        );
      } else {
        tasks.push(Promise.resolve(null));
      }
      if (!skipCustom && selectedCustomRoleId && selectedCustomClearanceOption && callId) {
        tasks.push(
          preArrivalInfoService.getDocumentsByRole({
            role_id: selectedCustomRoleId,
            user_id: selectedCustomClearanceOption,
            call_id: callId,
          })
        );
      } else {
        tasks.push(Promise.resolve(null));
      }

      try {
        const [groResponse, customResponse] = await Promise.all(tasks);
        if (cancelled) return;

        const currentDh = dhRef.current || DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING;
        const groRows = skipGro
          ? currentDh?.documents?.gro || []
          : mergeRoleDocuments(currentDh?.documents?.gro || [], groResponse?.data?.data || []);
        const customRows = skipCustom
          ? currentDh?.documents?.customClearance || []
          : mergeRoleDocuments(
            currentDh?.documents?.customClearance || [],
            customResponse?.data?.data || []
          );

        setDh({
          ...currentDh,
          documents: {
            ...currentDh.documents,
            gro: selectedGroOption ? groRows : [],
            customClearance: selectedCustomClearanceOption ? customRows : [],
          },
        });
      } catch (error) {
        if (cancelled) return;
        console.error("[Operation] pre_arrival/get_documents_by_role failed", error);
      }
    };

    loadRoleBasedDocuments();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setDh is stable via handleChange + dhRef; omitting avoids refetch loops
  }, [
    selectedGroOption,
    selectedCustomClearanceOption,
    callId,
    groOptionsForSelect,
    customOptionsForSelect,
    mergeRoleDocuments,
    detailDocSkip?.groUserId,
    detailDocSkip?.customUserId,
    detailDocSkip?.groHasDocs,
    detailDocSkip?.customHasDocs,
  ]);

  return (
    <div className="document-handling-section">
      <div className="document-handling-preselect">
        <FormField label="Select GRO">
          <FormSelect
            value={formValues.assignedGro || ""}
            onChange={handleChange("assignedGro")}
            options={groOptionsForSelect}
            placeholder="Select GRO"
            disabled={isViewOnly || !portId}
          />
        </FormField>
        <FormField label="Select Custom clearance">
          <FormSelect
            value={formValues.assignedCustom || ""}
            onChange={handleChange("assignedCustom")}
            options={customOptionsForSelect}
            placeholder="Select Custom clearance"
            disabled={isViewOnly || !portId}
          />
        </FormField>
      </div>

      {stageFiles.length > 0 && (
        <div className="document-handling-stage-docs" role="region" aria-label="Stage documents">
          <h4 className="document-group-card__title">Stage documents</h4>
          <ul className="document-stage-file-list">
            {stageFiles.map((f, idx) => (
              <li key={`${f.stage_document_id ?? idx}-${f.name}`}>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer">
                    {f.name}
                  </a>
                ) : (
                  <span>{f.name}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showDocumentHandlingContent && (
        <>
          <div className="document-handling-section__divider" />
          <div className="document-handling-header-row" role="group" aria-label="Document handling">
            <h3 className="document-handling-section__heading">Document handling</h3>
          </div>

          {showGroDocuments && (
            <DocumentGroupCard title="GRO documents">
              {(dh.documents.gro || []).map((doc) => (
                <CompactFileUploadRow
                  key={doc.id}
                  label={doc.name}
                  files={doc.files || []}
                  isRequired={Boolean(doc.is_required)}
                  isViewOnly={isViewOnly}
                  onAddFiles={(newFiles) => patchRowFiles("gro", doc.id, [...(doc.files || []), ...newFiles])}
                  onRemoveAt={(idx) => patchRowFiles("gro", doc.id, (doc.files || []).filter((_, i) => i !== idx))}
                />
              ))}
            </DocumentGroupCard>
          )}

          {showCustomDocuments && (
            <DocumentGroupCard title="Custom clearance documents">
              {(dh.documents.customClearance || []).map((doc) => (
                <CompactFileUploadRow
                  key={doc.id}
                  label={doc.name}
                  files={doc.files || []}
                  isRequired={Boolean(doc.is_required)}
                  isViewOnly={isViewOnly}
                  onAddFiles={(newFiles) =>
                    patchRowFiles("customClearance", doc.id, [...(doc.files || []), ...newFiles])
                  }
                  onRemoveAt={(idx) =>
                    patchRowFiles("customClearance", doc.id, (doc.files || []).filter((_, i) => i !== idx))
                  }
                />
              ))}
            </DocumentGroupCard>
          )}
        </>
      )}
    </div>
  );
}

PreArrivalDocumentHandlingSection.propTypes = {
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  callId: PropTypes.string,
  assigneeHints: PropTypes.shape({
    gro: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
      roleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    customClearance: PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
      roleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
  detailDocSkip: PropTypes.shape({
    groUserId: PropTypes.string,
    customUserId: PropTypes.string,
    groHasDocs: PropTypes.bool,
    customHasDocs: PropTypes.bool,
  }),
};

function PreArrival({
  card,
  formValues,
  handleChange,
  cardColor,
  isViewOnly = false,
  eventFields = [],
  portId,
  callTypeId,
}) {
  const [isSavingPreArrival, setIsSavingPreArrival] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [isLoadingCoordinateTypes, setIsLoadingCoordinateTypes] = useState(false);
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false);
  const [coordinateTypeOptions, setCoordinateTypeOptions] = useState([]);
  const [coordinateOptions, setCoordinateOptions] = useState([]);
  const [reportDraft, setReportDraft] = useState({
    from: "operations@shipping.com",
    to: "",
    cc: "",
    subject: "Report - Pre Arrival",
    message: "",
  });
  const emailPreviewFromDetailRef = useRef(false);
  const [preArrivalDetailAssigneeHints, setPreArrivalDetailAssigneeHints] = useState({
    gro: null,
    customClearance: null,
  });
  const [preArrivalDetailDocSkip, setPreArrivalDetailDocSkip] = useState({
    groUserId: null,
    customUserId: null,
    groHasDocs: false,
    customHasDocs: false,
  });
  const formValuesRef = useRef(formValues);
  const coordinatesFetchGenRef = useRef(0);
  const pendingCoordinateIdRef = useRef(null);
  const preArrivalDocumentsDetailRef = useRef({ taskDocuments: [], stageDocuments: [] });

  const callId = useMemo(
    () => String(card?.call_id ?? card?.callId ?? formValues?.call_id ?? formValues?.callId ?? card?.id ?? "").trim(),
    [card?.call_id, card?.callId, card?.id, formValues?.call_id, formValues?.callId]
  );

  const eventFieldsApplyKey = useMemo(
    () =>
      (eventFields || [])
        .map((f) =>
          [f.keyPrefix, f.event_type_id ?? f.time_object_id ?? "", f.event_name ?? ""].join(":")
        )
        .join("|"),
    [eventFields]
  );

  useEffect(() => {
    formValuesRef.current = formValues;
  }, [formValues]);

  useEffect(() => {
    pendingCoordinateIdRef.current = null;
    preArrivalDocumentsDetailRef.current = { taskDocuments: [], stageDocuments: [] };
    emailPreviewFromDetailRef.current = false;
    setPreArrivalDetailAssigneeHints({ gro: null, customClearance: null });
    setPreArrivalDetailDocSkip({
      groUserId: null,
      customUserId: null,
      groHasDocs: false,
      customHasDocs: false,
    });
  }, [callId]);

  const documentHandlingRowsKey = useMemo(() => {
    const dh = formValues.preArrivalDocumentHandling;
    const groIds = (dh?.documents?.gro || []).map((r) => r.id).join(",");
    const ccIds = (dh?.documents?.customClearance || []).map((r) => r.id).join(",");
    return `${formValues.assignedGro || ""}|${formValues.assignedCustom || ""}|${groIds}|${ccIds}`;
  }, [
    formValues.preArrivalDocumentHandling,
    formValues.assignedGro,
    formValues.assignedCustom,
  ]);

  const applyDetailDocuments = useCallback(() => {
    const { taskDocuments, stageDocuments } = preArrivalDocumentsDetailRef.current;
    if (!taskDocuments?.length && !stageDocuments?.length) return;
    const dhCurrent = formValuesRef.current?.preArrivalDocumentHandling;
    const nextDh = mergePreArrivalDetailDocuments(
      dhCurrent,
      taskDocuments || [],
      stageDocuments || []
    );
    if (!nextDh) return;
    if (JSON.stringify(nextDh) !== JSON.stringify(dhCurrent)) {
      handleChange("preArrivalDocumentHandling")({ target: { value: nextDh } });
    }
  }, [handleChange]);

  useEffect(() => {
    if (isViewOnly || !callId) return;

    let cancelled = false;

    const run = async () => {
      try {
        const res = await preArrivalService.getPreArrivalDetail(callId);
        if (cancelled) return;
        const body = res?.data ?? res;
        const status = body?.status;
        if (typeof status === "string" && status.toLowerCase() === "error") return;

        const root = body?.data ?? body ?? {};
        preArrivalDocumentsDetailRef.current = {
          taskDocuments: root.task_documents ?? root.taskDocuments ?? [],
          stageDocuments: root.stage_documents ?? root.stageDocuments ?? [],
        };

        const snapshot = formValuesRef.current;
        const { coordinatesId } = applyPreArrivalGetDetailToForm({
          responseBody: body,
          eventFields,
          handleChange,
          currentForm: snapshot,
        });
        if (coordinatesId && !String(snapshot.coordinateTypeId || "").trim()) {
          pendingCoordinateIdRef.current = coordinatesId;
        }

        const taskDocs = root.task_documents ?? root.taskDocuments ?? [];
        const groG = findTaskDocumentGroupByRole(taskDocs, PRE_ARRIVAL_GRO_ROLE_ID);
        const ccG = findTaskDocumentGroupByRole(taskDocs, PRE_ARRIVAL_CUSTOM_CLEARANCE_ROLE_ID);

        setPreArrivalDetailAssigneeHints({
          gro:
            groG?.user_id != null
              ? {
                value: String(groG.user_id),
                label: groG.name || `User ${groG.user_id}`,
                roleId: groG.role_id ?? PRE_ARRIVAL_GRO_ROLE_ID,
              }
              : null,
          customClearance:
            ccG?.user_id != null
              ? {
                value: String(ccG.user_id),
                label: ccG.name || `User ${ccG.user_id}`,
                roleId: ccG.role_id ?? PRE_ARRIVAL_CUSTOM_CLEARANCE_ROLE_ID,
              }
              : null,
        });

        setPreArrivalDetailDocSkip({
          groUserId: groG?.user_id != null ? String(groG.user_id) : null,
          customUserId: ccG?.user_id != null ? String(ccG.user_id) : null,
          groHasDocs: Boolean(groG?.documents?.length),
          customHasDocs: Boolean(ccG?.documents?.length),
        });

        const sent = root.sent_report ?? root.sentReport;
        if (sent != null && typeof sent === "object") {
          emailPreviewFromDetailRef.current = true;
          setReportDraft({
            from: sent.from_email != null ? String(sent.from_email) : "operations@shipping.com",
            to: sent.to_email != null ? String(sent.to_email) : "",
            cc:
              sent.cc_emails != null
                ? String(sent.cc_emails)
                : sent.cc_email != null
                  ? String(sent.cc_email)
                  : "",
            subject: sent.subject != null ? String(sent.subject) : "Report - Pre Arrival",
            message: sent.body != null ? String(sent.body) : "",
          });
        } else {
          emailPreviewFromDetailRef.current = false;
        }

        applyDetailDocuments();
      } catch (error) {
        if (!cancelled) {
          console.error("[Operation] pre_arrival/get_prearrival_detail failed", error);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [callId, isViewOnly, eventFieldsApplyKey, handleChange, applyDetailDocuments, eventFields]);

  useEffect(() => {
    if (isViewOnly) return;
    applyDetailDocuments();
  }, [documentHandlingRowsKey, isViewOnly, applyDetailDocuments]);

  useEffect(() => {
    const needId = pendingCoordinateIdRef.current;
    if (!needId || String(formValues.coordinateTypeId || "").trim() || !coordinateTypeOptions.length) {
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      for (const opt of coordinateTypeOptions) {
        if (cancelled) return;
        try {
          const response = await coordinatesService.getCoordinatesByType({
            coordinate_type_id: opt.value,
          });
          const raw = response?.data?.data ?? response?.data ?? [];
          const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
          const found = list.some((item) => String(item.coordinates_id) === String(needId));
          if (found) {
            if (!cancelled) {
              handleChange("coordinateTypeId")({ target: { value: opt.value } });
              pendingCoordinateIdRef.current = null;
            }
            return;
          }
        } catch {
          /* try next coordinate type */
        }
      }
    };

    resolve();

    return () => {
      cancelled = true;
    };
  }, [coordinateTypeOptions, formValues.coordinateTypeId, handleChange]);

  const handleSaberUtAddFiles = (files) => {
    const currentAttachments = formValues.saberUtDocumentsAttachments || [];
    handleChange("saberUtDocumentsAttachments")({ target: { value: [...currentAttachments, ...files] } });
  };

  const handleSaberUtStatusChange = (e) => {
    const value = e.target.value;
    handleChange("saberUtStatus")(e);
    if (value !== SABER_APPLIED_BY_SEDRES) {
      handleChange("saberUtDocumentsAttachments")({ target: { value: [] } });
    }
  };

  const handleWeatherForecastChange = (e) => {
    const value = e.target.value;
    handleChange("weatherForecast")(e);

    if (value === BAD_WEATHER) {
      notify(
        "Bad weather selected. Please re-check ETA and clearance time objects.",
        "warning"
      );
      handleChange("preArrivalTimeObjectsNeedRecheck")({
        target: { value: true },
      });
    } else {
      handleChange("preArrivalTimeObjectsNeedRecheck")({
        target: { value: false },
      });
    }
  };

  const handlePreArrivalTimeObjectChange = useCallback(
    (fieldName) => (event) => {
      handleChange(fieldName)(event);
      if (formValues.preArrivalTimeObjectsNeedRecheck) {
        handleChange("preArrivalTimeObjectsNeedRecheck")({ target: { value: false } });
      }
    },
    [handleChange, formValues.preArrivalTimeObjectsNeedRecheck]
  );

  const fetchCoordinatesByType = useCallback(
    async (coordinateTypeId) => {
      if (!coordinateTypeId) {
        setCoordinateOptions([]);
        handleChange("coordinates")({ target: { value: "" } });
        handleChange("preArrivalCoordinatesId")({ target: { value: "" } });
        return;
      }

      const fetchId = ++coordinatesFetchGenRef.current;
      setIsLoadingCoordinates(true);
      try {
        const response = await coordinatesService.getCoordinatesByType({
          coordinate_type_id: coordinateTypeId,
        });
        if (fetchId !== coordinatesFetchGenRef.current) return;

        const raw = response?.data?.data ?? response?.data ?? [];
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const mapped = list
          .filter((item) => item?.coordinates_id != null && String(item.coordinates || "").trim())
          .map((item) => ({
            value: String(item.coordinates_id),
            label: String(item.coordinates).trim(),
          }));

        setCoordinateOptions(mapped);

        if (mapped.length === 0) {
          handleChange("preArrivalCoordinatesId")({ target: { value: "" } });
          handleChange("coordinates")({ target: { value: "" } });
          notify("No coordinates found for selected type.", "warning");
          return;
        }

        const latest = formValuesRef.current || {};
        const byId = mapped.find((o) => o.value === String(latest.preArrivalCoordinatesId || ""));
        const byCoords = mapped.find(
          (o) => o.label === String(latest.coordinates || "").trim()
        );
        const pick = byId || byCoords;
        if (pick) {
          handleChange("preArrivalCoordinatesId")({ target: { value: pick.value } });
          handleChange("coordinates")({ target: { value: pick.label } });
        }
      } catch (error) {
        if (fetchId !== coordinatesFetchGenRef.current) return;
        setCoordinateOptions([]);
        handleChange("coordinates")({ target: { value: "" } });
        handleChange("preArrivalCoordinatesId")({ target: { value: "" } });
        notify(error?.response?.data?.message || "Failed to fetch coordinates.", "error");
      } finally {
        if (fetchId === coordinatesFetchGenRef.current) {
          setIsLoadingCoordinates(false);
        }
      }
    },
    [handleChange]
  );

  useEffect(() => {
    let cancelled = false;

    const loadCoordinateTypes = async () => {
      setIsLoadingCoordinateTypes(true);
      try {
        const response = await coordinatesService.getAllCoordinateTypes();
        if (cancelled) return;
        const rawData = response?.data?.data ?? response?.data ?? [];
        const typeList = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
        const mappedOptions = typeList
          .filter((item) => item?.coordinate_type_id != null)
          .map((item) => ({
            value: String(item.coordinate_type_id),
            label: String(item.coordinate_type || ""),
          }))
          .filter((option) => option.label.trim().length > 0);
        setCoordinateTypeOptions(mappedOptions);
      } catch (error) {
        if (cancelled) return;
        setCoordinateTypeOptions([]);
        notify(error?.response?.data?.message || "Failed to fetch coordinate types.", "error");
      } finally {
        if (!cancelled) {
          setIsLoadingCoordinateTypes(false);
        }
      }
    };

    loadCoordinateTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!formValues.coordinateTypeId) {
      coordinatesFetchGenRef.current += 1;
      setCoordinateOptions([]);
      return;
    }
    fetchCoordinatesByType(formValues.coordinateTypeId);
  }, [formValues.coordinateTypeId, fetchCoordinatesByType]);

  const handleCoordinateTypeChange = (e) => {
    const selectedTypeId = e.target.value;
    handleChange("coordinateTypeId")({ target: { value: selectedTypeId } });
    handleChange("preArrivalCoordinatesId")({ target: { value: "" } });
    handleChange("coordinates")({ target: { value: "" } });
    if (!selectedTypeId) {
      coordinatesFetchGenRef.current += 1;
      setCoordinateOptions([]);
    }
  };

  const handleCoordinatesSelectChange = (e) => {
    const selectedId = e.target.value;
    handleChange("preArrivalCoordinatesId")({ target: { value: selectedId } });
    const opt = coordinateOptions.find((o) => o.value === selectedId);
    handleChange("coordinates")({ target: { value: opt?.label || "" } });
  };

  const savePreArrivalData = async () => {
    const callId = card?.call_id || card?.callId || formValues?.call_id || formValues?.callId || card?.id || "";
    const cardId = card?.id || card?.card_id || formValues?.card_id || "";
    const assignedGro = formValues.assignedGro || "";
    const assignedCustom = formValues.assignedCustom || "";

    if (!callId) {
      notify("Call ID is required.", "error");
      return false;
    }
    if (!cardId) {
      notify("Card ID is required.", "error");
      return false;
    }
    if (!assignedGro) {
      notify("Assigned GRO is required.", "error");
      return false;
    }
    if (!assignedCustom) {
      notify("Assigned Custom clearance is required.", "error");
      return false;
    }

    if (
      formValues.weatherForecast === BAD_WEATHER &&
      formValues.preArrivalTimeObjectsNeedRecheck === true
    ) {
      notify(
        "Please re-check ETA and clearance time objects before saving.",
        "warning"
      );
      return false;
    }

    const timeObjects = (eventFields || [])
      .map((field, index) => {
        const dateKey = `${field.keyPrefix}Date`;
        const timeKey = `${field.keyPrefix}Time`;

        const date = formValues[dateKey];
        const time = formValues[timeKey];

        if (!date || !time) return null;
        const timeObjectId =
          field.time_object_id ??
          field.event_type_id ??
          field.eventTypeId ??
          field.event_typeid ??
          field.id ??
          null;
        if (timeObjectId == null) {
          console.warn("[Operation] Missing time_object_id for event field", field, index);
          return null;
        }
        return {
          time_object_id: Number(timeObjectId),
          time_object_value: `${date} ${time}:00`,
        };
      })
      .filter(Boolean);

    const attachmentFile = (item) => {
      if (item?.file instanceof File) return item.file;
      if (item instanceof File) return item;
      return null;
    };

    const fd = new FormData();
    fd.append("call_id", callId);
    fd.append("card_id", cardId);
    fd.append("time_objects", JSON.stringify(timeObjects));
    const saberStatusNum = PRE_ARRIVAL_SABER_STATUS_SAVE_VALUE[formValues.saberUtStatus];
    fd.append(
      "saber_status",
      saberStatusNum != null ? String(saberStatusNum) : ""
    );
    const weatherForecastNum = PRE_ARRIVAL_WEATHER_FORECAST_SAVE_VALUE[formValues.weatherForecast];
    fd.append(
      "weather_forecast",
      weatherForecastNum != null ? String(weatherForecastNum) : ""
    );
    const coordinatesId = String(formValues.preArrivalCoordinatesId || "").trim();
    if (coordinatesId) {
      fd.append("coordinates_id", coordinatesId);
    }
    fd.append("assigned_gro", assignedGro);
    fd.append("assigned_custom", assignedCustom);

    if (formValues.saberUtStatus === SABER_APPLIED_BY_SEDRES) {
      (formValues.saberUtDocumentsAttachments || []).forEach((item) => {
        const f = attachmentFile(item);
        if (f) {
          fd.append("saber_attachments[]", f);
        }
      });
    }

    const dh = formValues.preArrivalDocumentHandling;
    (dh?.documents?.gro || []).forEach((doc) => {
      (doc.files || []).forEach((item) => {
        const f = attachmentFile(item);
        if (!f) return;
        fd.append(`gro_docs[${doc.id}]`, f);
      });
    });

    (dh?.documents?.customClearance || []).forEach((doc) => {
      (doc.files || []).forEach((item) => {
        const f = attachmentFile(item);
        if (!f) return;
        fd.append(`custom_docs[${doc.id}]`, f);
      });
    });

    const reportBody = reportDraft.message || buildPreArrivalReportBody(formValues);
    fd.append(
      "pre_arrival_report",
      JSON.stringify({
        subject: reportDraft.subject ?? "",
        body: reportBody ?? "",
        to_email: reportDraft.to ?? "",
        from_email: reportDraft.from ?? "",
        cc_emails: reportDraft.cc ?? "",
      })
    );

    for (let pair of fd.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      setIsSavingPreArrival(true);
      await preArrivalService.savePreArrival(fd);
      notify("Pre Arrival saved successfully.", "success");
      return true;
    } catch (error) {
      notify(error?.response?.data?.message || "Failed to save Pre Arrival.", "error");
      return false;
    } finally {
      setIsSavingPreArrival(false);
    }
  };

  const preArrivalReportAttachments = [
    ...(formValues.saberUtDocumentsAttachments || []),
    ...collectPreArrivalProcessAttachments(formValues.preArrivalDocumentHandling),
  ];

  useEffect(() => {
    setReportDraft((prev) => ({
      ...prev,
      message: buildPreArrivalReportBody(formValues),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadReportTemplate = async () => {
      if (!portId || !callTypeId) return;

      try {
        const response = await appointmentAcceptanceService.getTemplateByPortCallType({
          port_id: portId,
          call_type_id: callTypeId,
          report_type_id: 2,
        });
        if (cancelled) return;
        if (emailPreviewFromDetailRef.current) return;

        const template = extractReportTemplateFields(response);
        setReportDraft((prev) => ({
          ...prev,
          from: template.from || prev.from,
          subject: template.subject || prev.subject,
          message: template.message || prev.message,
        }));
      } catch (error) {
        if (cancelled) return;
        console.error("[Operation] report_template/get_template_by_port_calltype failed", error);
      }
    };

    loadReportTemplate();

    return () => {
      cancelled = true;
    };
  }, [portId, callTypeId]);

  const handleReportDraftChange = (field, value) => {
    setReportDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendPreArrivalReport = async () => {
    if (!callId) {
      notify("Call ID is required to send the report.", "error");
      return;
    }

    const body = reportDraft.message || buildPreArrivalReportBody(formValues) || "";

    setIsSendingReport(true);
    try {
      await preArrivalService.sendPreArrivalReport({
        call_id: callId,
        report_type_id: 2,
        from_email: String(reportDraft.from ?? "").trim(),
        to_email: String(reportDraft.to ?? "").trim(),
        cc_emails: String(reportDraft.cc ?? "").trim(),
        subject: String(reportDraft.subject ?? "").trim(),
        body,
      });
      notify("Pre Arrival report sent successfully.", "success");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to send Pre Arrival report.";
      notify(msg, "error");
    } finally {
      setIsSendingReport(false);
    }
  };

  return (
    <div className="cardform-left-full" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Pre-Arrival Information</h3>
      </div>
      <FormSection icon={GroupSettingsIcon} title="">
        <div className="operation-tab-layout">
          <div className="pre-arrival-form operation-tab-scroll">
            <div className="operation-prearrival-grid">
              <OperationFormCard className="operation-form-column">
                <div
                  className={`prearrival-timeobject-highlight ${formValues.weatherForecast === BAD_WEATHER && formValues.preArrivalTimeObjectsNeedRecheck
                    ? "is-warning"
                    : ""
                    }`.trim()}
                >
                  <DynamicDateTimeFields
                    eventFields={eventFields}
                    formValues={formValues}
                    handleChange={handlePreArrivalTimeObjectChange}
                    isViewOnly={isViewOnly}
                  />
                </div>

                <FormField label="SABER Status">
                  <FormSelect
                    value={formValues.saberUtStatus || ""}
                    onChange={handleSaberUtStatusChange}
                    options={PRE_ARRIVAL_SABER_STATUS_OPTIONS}
                    placeholder="Select SABER status..."
                    disabled={isViewOnly}
                  />
                </FormField>

                {formValues.saberUtStatus === SABER_APPLIED_BY_SEDRES && (
                  <FormField label="SABER Certificate Upload">
                    <SaberUploadBox
                      files={formValues.saberUtDocumentsAttachments || []}
                      onAddFiles={handleSaberUtAddFiles}
                      isViewOnly={isViewOnly}
                    />
                  </FormField>
                )}

                <FormField label="Weather Forecast">
                  <FormSelect
                    value={formValues?.weatherForecast || ""}
                    onChange={handleWeatherForecastChange}
                    options={PRE_ARRIVAL_WEATHER_FORECAST_OPTIONS}
                    placeholder="Select weather forecast..."
                    disabled={isViewOnly}
                  />
                  {formValues.weatherForecast === BAD_WEATHER && (
                    <div className="prearrival-windy-map">
                      <iframe
                        title="Windy Weather Map"
                        width="650"
                        height="450"
                        src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=8&overlay=wind&product=ecmwf&level=surface&lat=27.284&lon=49.109&detailLat=29.0525682775337&detailLon=48.087158203125&marker=true"
                        frameBorder="0"
                      />
                    </div>
                  )}
                </FormField>

                <FormField label="Coordinates Type">
                  <FormSelect
                    value={formValues?.coordinateTypeId || ""}
                    onChange={handleCoordinateTypeChange}
                    options={coordinateTypeOptions}
                    placeholder="Select coordinate type..."
                    disabled={isViewOnly || isLoadingCoordinateTypes || isLoadingCoordinates}
                  />
                </FormField>

                {formValues?.coordinateTypeId ? (
                  <FormField label="Select Coordinates">
                    <FormSelect
                      value={formValues?.preArrivalCoordinatesId || ""}
                      onChange={handleCoordinatesSelectChange}
                      options={coordinateOptions}
                      placeholder={
                        isLoadingCoordinates
                          ? "Loading coordinates..."
                          : coordinateOptions.length
                            ? "Select coordinates..."
                            : "No coordinates for this type"
                      }
                      disabled={
                        isViewOnly ||
                        isLoadingCoordinates ||
                        coordinateOptions.length === 0
                      }
                    />
                  </FormField>
                ) : (
                  !!formValues?.coordinates && (
                    <FormField label="Coordinates">
                      <FormInput
                        type="text"
                        value={formValues?.coordinates || ""}
                        onChange={() => { }}
                        placeholder="Coordinates will appear here..."
                        disabled
                      />
                    </FormField>
                  )
                )}
              </OperationFormCard>
              <OperationFormCard className="operation-document-column">
                <PreArrivalDocumentHandlingSection
                  formValues={formValues}
                  handleChange={handleChange}
                  isViewOnly={isViewOnly}
                  portId={portId}
                  callId={callId}
                  assigneeHints={preArrivalDetailAssigneeHints}
                  detailDocSkip={preArrivalDetailDocSkip}
                />
              </OperationFormCard>
              <OperationFormCard className="operation-email-column">
                <OperationEmailPreviewPanel
                  from={reportDraft.from}
                  to={reportDraft.to}
                  cc={reportDraft.cc}
                  subject={reportDraft.subject}
                  message={reportDraft.message}
                  attachments={preArrivalReportAttachments}
                  onChange={handleReportDraftChange}
                  onSend={handleSendPreArrivalReport}
                  isSending={isSendingReport || isSavingPreArrival}
                  isViewOnly={isViewOnly}
                />
              </OperationFormCard>
            </div>
          </div>
          <OperationSaveSection isViewOnly={isViewOnly} onSave={savePreArrivalData} isSaving={isSavingPreArrival} />
        </div>
      </FormSection>
    </div>
  );
}

PreArrival.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  ownerInitial: PropTypes.string.isRequired,
  cardUser: PropTypes.string,
  cardColor: PropTypes.string,
  onAddLink: PropTypes.func,
  onRemoveLink: PropTypes.func,
  isViewOnly: PropTypes.bool,
  eventFields: PropTypes.array,
  portId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  callTypeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PreArrival;
