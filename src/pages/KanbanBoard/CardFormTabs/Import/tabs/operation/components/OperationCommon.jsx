import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ensureHtmlForQuill } from "../operationReportMessageHtml";
import DateTimePickerField from "../../../../shared/components/DateTimePickerField";
import { isEventFieldRequired } from "../operationConstants";
import SearchableSelect, { deriveSearchPlaceholder } from "../../../../../../../components/form/SearchableSelect";

export const FormSection = ({ icon, title, children }) => {
  return (
    <>
      {title && (
        <div className="cf-section-header">
          <span className="cf-section-icon">
            <img src={icon} alt={title} />
          </span>
          <span className="cf-section-title">{title}</span>
        </div>
      )}
      <div className="cf-section-body">{children}</div>
    </>
  );
};

FormSection.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export const FormField = ({ label, children, className = "" }) => {
  return (
    <div className={`cf-field ${className}`}>
      {label && <label>{label}</label>}
      {children}
    </div>
  );
};

FormField.propTypes = {
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export const OperationFormCard = ({ className = "", children, topRightAction = null }) => {
  const hasAction = Boolean(topRightAction);

  return (
    <div className={`operation-form-card${hasAction ? " operation-form-card--has-action" : ""} ${className}`.trim()}>
      {hasAction ? <div className="operation-form-card-header-action">{topRightAction}</div> : null}
      {children}
    </div>
  );
};

OperationFormCard.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  topRightAction: PropTypes.node,
};

export const DynamicDateTimeFields = ({ eventFields = [], formValues, handleChange, isViewOnly = false }) => {
  if (!eventFields.length) return null;

  return eventFields.map((field) => {
    const keyPrefix = field.keyPrefix;
    const dateKey = `${keyPrefix}Date`;
    const timeKey = `${keyPrefix}Time`;
    const label = isEventFieldRequired(field) ? `${field.event_name} *` : field.event_name;

    return (
      <FormField key={`${field.stage_id || "stage"}-${field.event_name}-${keyPrefix}`} label={label}>
        <DateTimePickerField
          dateValue={formValues[dateKey] || ""}
          timeValue={formValues[timeKey] || ""}
          onDateChange={handleChange(dateKey)}
          onTimeChange={handleChange(timeKey)}
          dateFieldName={dateKey}
          timeFieldName={timeKey}
          disabled={isViewOnly}
        />
      </FormField>
    );
  });
};

DynamicDateTimeFields.propTypes = {
  eventFields: PropTypes.arrayOf(
    PropTypes.shape({
      stage_id: PropTypes.number,
      event_name: PropTypes.string,
      is_required: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
      keyPrefix: PropTypes.string,
    })
  ),
  formValues: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
};

export const EMPTY_ADDITIONAL_TIME_OBJECT = { label: "", date: "", time: "" };

export const appendAdditionalTimeObject = (items = []) => {
  const rows = Array.isArray(items) ? items : [];
  return [...rows, { ...EMPTY_ADDITIONAL_TIME_OBJECT }];
};

const scrollAdditionalTimeObjectIntoView = (fieldEl) => {
  if (!fieldEl) return;

  const scrollContainer = fieldEl.closest(".operation-form-column");
  if (!scrollContainer) return;

  const containerRect = scrollContainer.getBoundingClientRect();
  const fieldRect = fieldEl.getBoundingClientRect();
  const scrollPadding = 12;

  if (fieldRect.bottom > containerRect.bottom) {
    scrollContainer.scrollTop += fieldRect.bottom - containerRect.bottom + scrollPadding;
  } else if (fieldRect.top < containerRect.top) {
    scrollContainer.scrollTop -= containerRect.top - fieldRect.top + scrollPadding;
  }
};

const focusAdditionalTimeObjectRow = (fieldEl, inputEl) => {
  scrollAdditionalTimeObjectIntoView(fieldEl);
  inputEl?.focus({ preventScroll: true });
};

export const AdditionalTimeObjectAddButton = ({
  onClick,
  disabled = false,
  title = "Add time object",
}) => (
  <button
    type="button"
    className="operation-additional-time-object-add-icon-btn"
    onClick={onClick}
    disabled={disabled}
    aria-label={title}
    title={title}
  >
    +
  </button>
);

AdditionalTimeObjectAddButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  title: PropTypes.string,
};

const normalizeAdditionalTimeValue = (date, time) => {
  const dateValue = String(date || "").trim();
  const timeValue = String(time || "").trim();
  if (!dateValue || !timeValue) return "";
  const normalizedTime = /^\d{2}:\d{2}:\d{2}$/.test(timeValue) ? timeValue : `${timeValue}:00`;
  return `${dateValue} ${normalizedTime}`;
};

export const buildAdditionalTimeObjectsPayload = (items = []) =>
  (Array.isArray(items) ? items : [])
    .map((row) => {
      const label = String(row?.label || "").trim();
      const timeObjectValue = normalizeAdditionalTimeValue(row?.date, row?.time);
      if (!label || !timeObjectValue) return null;
      return {
        time_object_name: label,
        time_object_value: timeObjectValue,
        is_additional: true,
      };
    })
    .filter(Boolean);

/**
 * Build the `time_object` payload for `time_object/save_call_time_object` from a
 * single additional time-object row. Requires a name; the date/time value is
 * included when present (empty string otherwise) so a row can be saved as soon
 * as it's named. Returns null when there is no name. Existing rows carry an
 * `id` (time_object_id) so the backend can update them instead of inserting.
 */
export const buildCallTimeObjectPayload = (row) => {
  const label = String(row?.label || "").trim();
  if (!label) return null;
  const payload = {
    time_object_name: label,
    time_object_value: normalizeAdditionalTimeValue(row?.date, row?.time),
    is_additional: true,
  };
  if (row?.id != null && String(row.id).trim() !== "") {
    payload.time_object_id = row.id;
  }
  return payload;
};

/**
 * Persist every valid additional time-object row for a stage via the shared
 * `saveCallTimeObject` action. Invalid/empty rows are skipped.
 */
export const persistAdditionalTimeObjects = async ({
  rows = [],
  callId,
  stageId,
  saveCallTimeObject,
}) => {
  if (typeof saveCallTimeObject !== "function") return;
  for (const row of Array.isArray(rows) ? rows : []) {
    const timeObject = buildCallTimeObjectPayload(row);
    if (!timeObject) continue;
    await saveCallTimeObject({ callId, stageId, timeObject });
  }
};

/** Pull the saved time_object_id out of a save_call_time_object response. */
export const extractCallTimeObjectId = (data) =>
  data?.time_object_id ??
  data?.data?.time_object_id ??
  data?.id ??
  data?.data?.id ??
  null;

/**
 * Save a single additional time-object row via `saveCallTimeObject` and return
 * the backend time_object_id (when provided) so the caller can stamp the row
 * for later updates/deletes. Returns null when the row is incomplete.
 */
export const commitAdditionalTimeObject = async ({
  row,
  callId,
  stageId,
  saveCallTimeObject,
}) => {
  const timeObject = buildCallTimeObjectPayload(row);
  if (!timeObject || typeof saveCallTimeObject !== "function" || !callId) return null;
  const data = await saveCallTimeObject({ callId, stageId, timeObject });
  return extractCallTimeObjectId(data);
};

export const validateAdditionalTimeObjects = (items = []) => {
  const rows = Array.isArray(items) ? items : [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || {};
    const label = String(row.label || "").trim();
    const date = String(row.date || "").trim();
    const time = String(row.time || "").trim();
    const hasLabel = Boolean(label);
    const hasDate = Boolean(date);
    const hasTime = Boolean(time);
    const isEmpty = !hasLabel && !hasDate && !hasTime;

    if (isEmpty) continue;

    if (hasLabel && (!hasDate || !hasTime)) {
      return {
        valid: false,
        message: `Additional time object "${label}" requires both date and time.`,
      };
    }

    if ((hasDate || hasTime) && !hasLabel) {
      return {
        valid: false,
        message: "Additional time objects with date/time require a label.",
      };
    }
  }

  return { valid: true };
};

const additionalTimeObjectSignature = (row) =>
  [
    String(row?.label || "").trim(),
    String(row?.date || "").trim(),
    String(row?.time || "").trim(),
  ].join("|");

const isAdditionalTimeObjectCommittable = (row) =>
  Boolean(String(row?.label || "").trim());

export const AdditionalTimeObjectsFields = ({
  value = [],
  onChange,
  onRemoveRow,
  onCommitRow,
  isViewOnly = false,
  title = "Additional Time Objects",
  hideAddButton = false,
}) => {
  const rows = Array.isArray(value) ? value : [];
  const rowRefs = useRef([]);
  const labelInputRefs = useRef([]);
  const previousRowCountRef = useRef(rows.length);
  const isInitialRowCountRef = useRef(true);
  const focusTimeoutRef = useRef(null);
  const committedSignaturesRef = useRef([]);
  const commitBlurTimeoutRef = useRef(null);

  useEffect(() => {
    rowRefs.current.length = rows.length;
    labelInputRefs.current.length = rows.length;
  }, [rows.length]);

  useEffect(() => {
    if (isInitialRowCountRef.current) {
      isInitialRowCountRef.current = false;
      previousRowCountRef.current = rows.length;
      return;
    }

    if (rows.length <= previousRowCountRef.current) {
      previousRowCountRef.current = rows.length;
      return;
    }

    const newRowIndex = rows.length - 1;
    previousRowCountRef.current = rows.length;

    const frameId = requestAnimationFrame(() => {
      focusTimeoutRef.current = window.setTimeout(() => {
        focusAdditionalTimeObjectRow(
          rowRefs.current[newRowIndex],
          labelInputRefs.current[newRowIndex]
        );
      }, 0);
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    };
  }, [rows.length]);

  const emitChange = (nextRows) => {
    onChange?.(nextRows);
  };

  const handleAddRow = () => {
    emitChange(appendAdditionalTimeObject(rows));
  };

  const handleRemoveRow = (index) => {
    // When a parent owns persistence (delete API call + state update), delegate
    // the whole removal to it so saved rows can be deleted on the backend.
    if (typeof onRemoveRow === "function") {
      onRemoveRow(rows[index], index);
      return;
    }
    emitChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleRowChange = (index, patch) => {
    emitChange(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  // Commit (save) a single row on Enter / outside click. Fires once a row has a
  // name, and only when its value changed since the last successful commit so we
  // don't spam the save_call_time_object endpoint.
  const commitRow = (index) => {
    if (typeof onCommitRow !== "function") return;
    const row = rows[index];
    if (!row || !isAdditionalTimeObjectCommittable(row)) return;
    const signature = additionalTimeObjectSignature(row);
    if (committedSignaturesRef.current[index] === signature) return;
    committedSignaturesRef.current[index] = signature;
    onCommitRow(row, index);
  };

  const handleRowKeyDown = (index) => (event) => {
    if (event.key !== "Enter") return;
    // Don't submit a surrounding form; just commit this row.
    event.preventDefault();
    commitRow(index);
  };

  const handleRowBlur = (index) => (event) => {
    if (typeof onCommitRow !== "function") return;
    const rowEl = rowRefs.current[index];
    const related = event?.relatedTarget;
    // Focus moved to another control inside the same row -> still editing.
    if (rowEl && related && rowEl.contains(related)) return;
    // Focus moved into the date/time picker popup (rendered in a portal).
    if (related?.closest && related.closest(".cf-datetime-popper")) return;

    if (commitBlurTimeoutRef.current) {
      clearTimeout(commitBlurTimeoutRef.current);
    }
    // Defer so focus can settle; bail if the picker popup is open or focus is
    // still within the row (covers browsers where relatedTarget is null).
    commitBlurTimeoutRef.current = window.setTimeout(() => {
      if (typeof document !== "undefined" && document.querySelector(".cf-datetime-popper")) {
        return;
      }
      const active = document.activeElement;
      if (rowEl && active && active !== document.body && rowEl.contains(active)) return;
      commitRow(index);
    }, 0);
  };

  useEffect(
    () => () => {
      if (commitBlurTimeoutRef.current) {
        clearTimeout(commitBlurTimeoutRef.current);
      }
    },
    []
  );

  // Seed signatures for rows that arrive already saved (have an id) so a plain
  // focus/blur doesn't redundantly re-save an unchanged loaded row.
  useEffect(() => {
    rows.forEach((row, index) => {
      if (row?.id != null && committedSignaturesRef.current[index] === undefined) {
        committedSignaturesRef.current[index] = additionalTimeObjectSignature(row);
      }
    });
  });

  if (rows.length === 0) return null;

  const rowFields = rows.map((row, index) => {
    const rowLabel = String(row?.label || "").trim();
    const removeLabel = rowLabel || `additional time object ${index + 1}`;

    return (
      <div
        key={`additional-time-object-${index}`}
        ref={(element) => {
          rowRefs.current[index] = element;
        }}
        className="cf-field operation-additional-time-object-field"
        onKeyDown={!isViewOnly ? handleRowKeyDown(index) : undefined}
        onBlur={!isViewOnly ? handleRowBlur(index) : undefined}
      >
        <div className="operation-additional-time-object-label-row">
          {isViewOnly ? (
            <label>{rowLabel || "—"}</label>
          ) : (
            <input
              ref={(element) => {
                labelInputRefs.current[index] = element;
              }}
              type="text"
              className="operation-additional-time-object-label-input"
              value={row?.label || ""}
              onChange={(e) => handleRowChange(index, { label: e.target.value })}
              placeholder="Enter time object name..."
              aria-label={`Time object name ${index + 1}`}
            />
          )}
          {!isViewOnly ? (
            <button
              type="button"
              className="operation-additional-time-object-remove-btn"
              onClick={() => handleRemoveRow(index)}
              aria-label={`Remove ${removeLabel}`}
              title="Remove"
            >
              ×
            </button>
          ) : null}
        </div>

        <DateTimePickerField
          dateValue={row?.date || ""}
          timeValue={row?.time || ""}
          onDateChange={(e) => handleRowChange(index, { date: e.target.value })}
          onTimeChange={(e) => handleRowChange(index, { time: e.target.value })}
          dateFieldName={`additional-time-object-${index}-date`}
          timeFieldName={`additional-time-object-${index}-time`}
          disabled={isViewOnly}
        />
      </div>
    );
  });

  if (hideAddButton) {
    return rowFields;
  }

  return (
    <div className="operation-additional-time-objects">
      <div className="operation-additional-time-objects-header">
        <h4 className="operation-additional-time-objects-title">{title}</h4>
        {!isViewOnly ? (
          <button
            type="button"
            className="operation-additional-time-objects-add-btn"
            onClick={handleAddRow}
          >
            + Add Time Object
          </button>
        ) : null}
      </div>

      {rowFields}
    </div>
  );
};

AdditionalTimeObjectsFields.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.string,
      date: PropTypes.string,
      time: PropTypes.string,
    })
  ),
  onChange: PropTypes.func,
  onRemoveRow: PropTypes.func,
  onCommitRow: PropTypes.func,
  isViewOnly: PropTypes.bool,
  title: PropTypes.string,
  hideAddButton: PropTypes.bool,
};

export const FormInput = ({ type = "text", value, onChange, placeholder, className = "", disabled = false }) => {
  return (
    <div className={`cf-input ${className}`}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
};

FormInput.propTypes = {
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export const FormSelect = ({
  value,
  onChange,
  options = [],
  placeholder,
  searchPlaceholder,
  className = "",
  disabled = false,
  hasError = false,
}) => {
  const normalizedValue = value === undefined || value === null ? "" : String(value);
  const menuPortalTarget = typeof document !== "undefined" ? document.body : null;
  return (
    <SearchableSelect
      value={normalizedValue}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder ?? deriveSearchPlaceholder(placeholder)}
      className={className}
      disabled={disabled}
      hasError={hasError}
      menuPortalTarget={menuPortalTarget}
      menuPosition="fixed"
    />
  );
};

FormSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  hasError: PropTypes.bool,
};

export const FormTextarea = ({ value, onChange, placeholder, className = "", rows = 3, disabled = false }) => {
  return (
    <div className={`cf-textarea ${className}`}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
      />
    </div>
  );
};

FormTextarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  rows: PropTypes.number,
  disabled: PropTypes.bool,
};

const OPERATION_EMAIL_MESSAGE_QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const OPERATION_EMAIL_MESSAGE_QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
  "link",
  "image",
];

/** Pull the underlying File out of an attachment entry (or raw File). */
export const getAttachmentFile = (item) => {
  if (item?.file instanceof File) return item.file;
  if (item instanceof File) return item;
  return null;
};

/** True when an attachment list contains at least one uploadable File. */
export const hasAttachmentFiles = (attachments = []) =>
  (Array.isArray(attachments) ? attachments : []).some((item) => getAttachmentFile(item));

/**
 * Format an attachment size for display. Accepts a byte count (number) or an
 * already-formatted string (e.g. "245K") which is returned unchanged.
 */
export const formatAttachmentSize = (size) => {
  if (size == null || size === "") return "";
  if (typeof size === "string") return size.trim();
  const bytes = Number(size);
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
};

let attachmentIdCounter = 0;
const createAttachmentId = () =>
  `attachment-${Date.now().toString(36)}-${(attachmentIdCounter += 1)}`;

/** Map a FileList / File[] into the attachment objects the preview panel uses. */
export const mapFilesToAttachments = (fileList = []) =>
  Array.from(fileList || []).map((file) => ({
    id: createAttachmentId(),
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  }));

/**
 * Build the send-report request body. When any attachment carries a File we
 * return multipart FormData (so `attachments[]` can be uploaded); otherwise a
 * plain JSON object is returned so the existing no-attachment flow is untouched.
 */
export const buildSendReportRequestBody = (fields = {}, attachments = []) => {
  const files = (Array.isArray(attachments) ? attachments : [])
    .map(getAttachmentFile)
    .filter(Boolean);

  if (!files.length) {
    return { ...fields };
  }

  const fd = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });
  files.forEach((file) => fd.append("attachments[]", file));
  return fd;
};

const openEmailPreviewAttachment = (attachment) => {
  const raw = getAttachmentFile(attachment);
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
  console.log("[Email Preview] Open attachment:", attachment?.name);
};

const EmailPreviewAttachmentChip = ({ attachment, onRemove }) => {
  const fileName = attachment?.name || "Untitled";
  const fileSize = formatAttachmentSize(attachment?.size);

  const handleRemove = (event) => {
    event.stopPropagation();
    if (typeof onRemove === "function") {
      onRemove(attachment?.id);
    }
  };

  return (
    <div className="email-preview-attachment-chip" title={fileName}>
      <button
        type="button"
        className="email-preview-attachment-link"
        onClick={() => openEmailPreviewAttachment(attachment)}
      >
        <span className="email-preview-attachment-name">{fileName}</span>
        {fileSize ? <span className="email-preview-attachment-size"> ({fileSize})</span> : null}
      </button>
      {typeof onRemove === "function" ? (
        <button
          type="button"
          className="email-preview-attachment-remove"
          onClick={handleRemove}
          aria-label={`Remove ${fileName}`}
          title="Remove"
        >
          ×
        </button>
      ) : null}
    </div>
  );
};

EmailPreviewAttachmentChip.propTypes = {
  attachment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    file: PropTypes.object,
    url: PropTypes.string,
  }).isRequired,
  onRemove: PropTypes.func,
};

const IconAttachmentAdd = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconSendReport = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M22 2L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const OperationEmailPreviewPanel = ({
  reportType,
  reportTypeOptions,
  from,
  to,
  cc,
  subject,
  message,
  attachments = [],
  onAttachmentsChange,
  onChange,
  onReportTypeChange,
  onSend,
  isSending = false,
  isViewOnly = false,
  attachmentsAccept,
}) => {
  const attachmentInputRef = useRef(null);
  const attachmentList = Array.isArray(attachments) ? attachments : [];
  const canEditAttachments = !isViewOnly && typeof onAttachmentsChange === "function";
  const showSend = !isViewOnly && typeof onSend === "function";

  const handleAttachmentFilesSelected = (event) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selected.length) return;
    onAttachmentsChange?.([...attachmentList, ...mapFilesToAttachments(selected)]);
  };

  const handleRemoveAttachment = (attachmentId) => {
    onAttachmentsChange?.(attachmentList.filter((item) => item.id !== attachmentId));
  };

  return (
    <div className="operation-email-preview-panel">
      <div className="operation-email-preview-header">
        <h4>Email Preview</h4>
        <div className="operation-email-preview-header-tools">
          {reportTypeOptions?.length > 0 && (
            <div className="operation-email-report-type">
              <label htmlFor="operation-report-type">Report Type</label>
              <select
                id="operation-report-type"
                value={reportType || reportTypeOptions[0]?.value}
                onChange={(e) => onReportTypeChange?.(e.target.value)}
              >
                {reportTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showSend && (
            <button
              type="button"
              className="operation-email-send-btn"
              onClick={onSend}
              disabled={isSending}
              title={isSending ? "Sending…" : "Save and send report"}
              aria-label={isSending ? "Sending report" : "Save and send report"}
            >
              <IconSendReport />
            </button>
          )}
        </div>
      </div>

      <div className="operation-email-preview-body">
        <FormField label="From">
          <FormInput type="text" value={from || ""} onChange={(e) => onChange?.("from", e.target.value)} placeholder="Sender email" />
        </FormField>
        <FormField label="To">
          <FormInput type="text" value={to || ""} onChange={(e) => onChange?.("to", e.target.value)} placeholder="Recipient emails" />
        </FormField>
        <FormField label="Cc">
          <FormInput type="text" value={cc || ""} onChange={(e) => onChange?.("cc", e.target.value)} placeholder="CC emails" />
        </FormField>
        <FormField label="Subject">
          <FormInput type="text" value={subject || ""} onChange={(e) => onChange?.("subject", e.target.value)} placeholder="Email subject" />
        </FormField>
        <FormField label="Attachments" className="operation-email-preview-attachments-field">
          <div className="email-preview-attachments-list">
            {attachmentList.map((attachment) => (
              <EmailPreviewAttachmentChip
                key={attachment.id}
                attachment={attachment}
                onRemove={canEditAttachments ? handleRemoveAttachment : undefined}
              />
            ))}
            {canEditAttachments ? (
              <>
                <button
                  type="button"
                  className="email-preview-attachment-add"
                  onClick={() => attachmentInputRef.current?.click()}
                  title="Add attachment"
                  aria-label="Add attachment"
                >
                  <IconAttachmentAdd />
                </button>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  multiple
                  accept={attachmentsAccept}
                  className="operation-compact-upload-input"
                  onChange={handleAttachmentFilesSelected}
                  aria-hidden
                  tabIndex={-1}
                />
              </>
            ) : null}
          </div>
        </FormField>
        <FormField label="Message" className="operation-email-preview-message-field">
          <div className="react-quill-wrapper operation-email-preview-message-quill operation-email-quill">
            <ReactQuill
              theme="snow"
              value={ensureHtmlForQuill(message)}
              onChange={(html) => onChange?.("message", html ?? "")}
              modules={OPERATION_EMAIL_MESSAGE_QUILL_MODULES}
              formats={OPERATION_EMAIL_MESSAGE_QUILL_FORMATS}
              placeholder="Type email content here..."
              readOnly={isViewOnly}
            />
          </div>
        </FormField>
      </div>
    </div>
  );
};

OperationEmailPreviewPanel.propTypes = {
  reportType: PropTypes.string,
  reportTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  from: PropTypes.string,
  to: PropTypes.string,
  cc: PropTypes.string,
  subject: PropTypes.string,
  message: PropTypes.string,
  attachments: PropTypes.array,
  onAttachmentsChange: PropTypes.func,
  onChange: PropTypes.func,
  onReportTypeChange: PropTypes.func,
  onSend: PropTypes.func,
  isSending: PropTypes.bool,
  isViewOnly: PropTypes.bool,
  attachmentsAccept: PropTypes.string,
};

export const OperationFileUpload = ({
  files = [],
  onAddFiles,
  isViewOnly = false,
  ariaLabel = "Upload files",
  accept,
}) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    onAddFiles(mapFilesToAttachments(selectedFiles));
    e.target.value = "";
  };

  return (
    <div
      className={`operation-compact-upload-zone${isViewOnly ? " operation-compact-upload-zone--disabled" : ""}`}
      role="button"
      tabIndex={isViewOnly ? -1 : 0}
      onClick={() => !isViewOnly && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (isViewOnly) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      aria-label={ariaLabel}
    >
      <p className="operation-compact-upload-text">
        Drag and drop your files here, or <span>click to browse</span>
      </p>
      {(files || []).length > 0 && <p className="operation-compact-upload-file">{files[0]?.name || `${files.length} file(s) selected`}</p>}
      <input
        ref={inputRef}
        type="file"
        className="operation-compact-upload-input"
        accept={accept}
        multiple
        onChange={handleInputChange}
        aria-hidden
        tabIndex={-1}
      />
    </div>
  );
};

OperationFileUpload.propTypes = {
  files: PropTypes.array,
  onAddFiles: PropTypes.func.isRequired,
  isViewOnly: PropTypes.bool,
  ariaLabel: PropTypes.string,
  accept: PropTypes.string,
};

export const OperationSaveSection = ({ isViewOnly = false, onSave, isSaving = false, className = "" }) => {
  if (isViewOnly) return null;

  return (
    <div className={`operation-sticky-actions ${className}`.trim()}>
      <button type="button" className="form-save-button operation-save-button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

OperationSaveSection.propTypes = {
  isViewOnly: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
  className: PropTypes.string,
};
