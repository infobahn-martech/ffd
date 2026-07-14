import { getEventFieldKeyPrefix } from "./operationConstants";
import { ensureHtmlForQuill } from "./operationReportMessageHtml";
import { parseApiDateTimeParts } from "./preArrivalDetailApply";

/** Treat the canonical "0000-00-00 00:00:00" placeholder as empty. */
const isUsableDateTime = (raw) => {
  const text = String(raw ?? "").trim();
  if (!text) return false;
  if (text.startsWith("0000-")) return false;
  return true;
};

/**
 * Apply `departure/get_departure_detail` payload onto the Operation/Departure form.
 *
 * Time objects are matched against the pre-loaded stage fields by
 * `time_object_id`, falling back to `event_name` / `getEventFieldKeyPrefix`
 * when the stage fields aren't ready yet.
 */
export function applyDepartureGetDetailToForm({ responseBody, eventFields = [], handleChange }) {
  if (typeof handleChange !== "function") return;

  const root = responseBody?.data ?? responseBody ?? {};
  const timeObjects = root.time_objects ?? root.timeObjects ?? [];

  const nextPort = String(root.next_port ?? root.nextPort ?? "").trim();
  if (nextPort) {
    handleChange("nextPort")({ target: { value: nextPort } });
  }

  const emailRequestDocUrl = String(root.email_request_doc_url ?? "").trim();
  if (emailRequestDocUrl) {
    const fileName =
      String(root.email_request_doc ?? "").trim() ||
      emailRequestDocUrl.split("/").pop() ||
      "Attachment";
    handleChange("departureAttachments")({
      target: { value: [{ id: "email-request-doc", name: fileName, file_url: emailRequestDocUrl }] },
    });
  }

  const additionalTimeObjects = [];

  for (const to of Array.isArray(timeObjects) ? timeObjects : []) {
    const rawValue = to?.time_object_value ?? to?.value;
    if (!isUsableDateTime(rawValue)) continue;
    const { date, time } = parseApiDateTimeParts(rawValue);
    if (!date || !time) continue;

    const toId = to?.time_object_id ?? to?.timeObjectId;
    const toName = to?.time_object ?? to?.time_object_name ?? to?.event_name ?? "";
    const fieldKey = String(to?.field_key ?? "").trim();

    const matched = (Array.isArray(eventFields) ? eventFields : []).find((field) => {
      const fid = field?.time_object_id ?? field?.event_type_id ?? field?.id;
      if (toId != null && fid != null && Number(fid) === Number(toId)) return true;
      if (fieldKey) {
        const candidateKeys = [
          field?.field_key,
          field?.keyPrefix,
          getEventFieldKeyPrefix(field?.event_name ?? field?.time_object ?? ""),
        ]
          .map((value) => String(value ?? "").trim().toLowerCase())
          .filter(Boolean);
        if (candidateKeys.includes(fieldKey.toLowerCase())) return true;
      }
      return (
        String(field?.event_name || "").trim().toLowerCase() ===
        String(toName).trim().toLowerCase()
      );
    });

    // Anything that doesn't map to a known stage field (or is explicitly flagged)
    // is an additional/custom time object.
    const isAdditional = Boolean(to?.is_additional ?? to?.isAdditional) || !matched;

    if (isAdditional) {
      const label = String(toName).trim();
      if (label) {
        additionalTimeObjects.push({
          label,
          date,
          time,
          ...(toId != null ? { id: toId } : {}),
        });
      }
      continue;
    }

    handleChange(`${matched.keyPrefix}Date`)({ target: { value: date } });
    handleChange(`${matched.keyPrefix}Time`)({ target: { value: time } });
  }

  if (additionalTimeObjects.length) {
    handleChange("departureAdditionalTimeObjects")({
      target: { value: additionalTimeObjects },
    });
  }
}

/**
 * Pull the saved email preview (`departure_report`) out of the detail payload.
 * Returns `null` when the call has no saved report yet.
 */
export function extractDepartureReportDraftFromDetail(responseBody) {
  const root = responseBody?.data ?? responseBody ?? {};
  const report = root.departure_report ?? root.departureReport;
  if (!report || typeof report !== "object") return null;

  const attachments = (Array.isArray(report.attachments) ? report.attachments : [])
    .map((item) => {
      const fileUrl = item?.file_url ?? item?.fileUrl ?? "";
      if (!fileUrl) return null;
      const fileName = item?.file_name ?? item?.fileName ?? fileUrl.split("/").pop() ?? "Attachment";
      return { id: fileUrl, name: fileName, file_url: fileUrl };
    })
    .filter(Boolean);

  return {
    from: String(report.from_email ?? "operations@shipping.com").trim(),
    to: String(report.to_email ?? "").trim(),
    cc: String(report.cc_emails ?? report.cc_email ?? "").trim(),
    subject: String(report.subject ?? "Report - Departure").trim(),
    message: report.body != null ? ensureHtmlForQuill(String(report.body)) : "",
    attachments,
  };
}
