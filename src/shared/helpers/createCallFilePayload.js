/**
 * Builds multipart/form-data for POST /call_file/create_call_file
 */

import { sanitizeAppointmentEmailBody } from "./sanitizeAppointmentEmailBody";

function str(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function toJsonArrayString(value) {
  if (!Array.isArray(value)) return "[]";
  return JSON.stringify(value);
}

const APPOINTMENT_TYPE_TUG = "tug";
const APPOINTMENT_TYPE_TUG_AND_BARGE = "tug_and_barge";
const APPOINTMENT_TYPE_TAXI_TUG_AND_BARGE = "taxi_tug_and_barge";
const APPOINTMENT_TYPE_VESSEL = "vessel";

// Human-readable labels expected by the backend in the appointment_type field.
const APPOINTMENT_TYPE_API_LABEL = {
  [APPOINTMENT_TYPE_VESSEL]: "Vessel",
  [APPOINTMENT_TYPE_TUG]: "Taxi Tug",
  [APPOINTMENT_TYPE_TUG_AND_BARGE]: "Tug and Barge",
  [APPOINTMENT_TYPE_TAXI_TUG_AND_BARGE]: "Taxi Tug and Barge",
};

// Tug and barge form fields (tug_type_id / vessel_id / barge_* keys) are shared by both barge appointment types.
const isBargeAppointmentType = (value) =>
  value === APPOINTMENT_TYPE_TUG_AND_BARGE || value === APPOINTMENT_TYPE_TAXI_TUG_AND_BARGE;

/** Collapses scalar / array / JSON-array-string appointment type values (canonical value or label) to a canonical value. */
function normalizeAppointmentType(value) {
  let list = value;
  if (typeof list === "string") {
    const trimmed = list.trim();
    if (trimmed.startsWith("[")) {
      try {
        list = JSON.parse(trimmed);
      } catch {
        list = trimmed.split(",");
      }
    } else {
      list = [trimmed];
    }
  }
  if (!Array.isArray(list)) list = list == null ? [] : [list];
  const items = list.map((item) => str(item).toLowerCase()).filter(Boolean);
  const has = (...candidates) => candidates.some((candidate) => items.includes(candidate));
  if (has(APPOINTMENT_TYPE_TAXI_TUG_AND_BARGE, "taxi tug and barge")) return APPOINTMENT_TYPE_TAXI_TUG_AND_BARGE;
  if (has(APPOINTMENT_TYPE_TUG_AND_BARGE, "tug and barge")) return APPOINTMENT_TYPE_TUG_AND_BARGE;
  if (has(APPOINTMENT_TYPE_VESSEL)) return APPOINTMENT_TYPE_VESSEL;
  if (has(APPOINTMENT_TYPE_TUG, "taxi tug")) return APPOINTMENT_TYPE_TUG;
  return items[0] ?? "";
}

/**
 * Maps selected values (numeric ids, id strings, or email labels matching options) to numbers [1, 2, …].
 * Pass multiple option lists (e.g. field-specific + daily-report options): they are merged; when several
 * options share the same label, one whose value is numeric is preferred (billing-instruction APIs often
 * duplicate email in value with no id; billing-entity email options usually have numeric reference ids).
 *
 * @param {unknown} val
 * @param {...Array<{ value?: unknown, label?: string }>} optionLists
 * @returns {number[]}
 */
function resolveSelectionsToNumericReferenceIds(val, ...optionLists) {
  const opts = optionLists.filter(Boolean).flat();
  const list = Array.isArray(val)
    ? val
    : val !== undefined && val !== null && String(val).trim() !== ""
      ? [val]
      : [];

  const toNumericId = (v) => {
    if (v === undefined || v === null) return null;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    const s = String(v).trim();
    if (s === "") return null;
    if (/^\d+$/.test(s)) return Number(s);
    return null;
  };

  return list
    .map((item) => {
      if (item === undefined || item === null) return null;
      if (typeof item === "object" && item !== null) {
        const ref = item.reference ?? item.email_id ?? item.id ?? item.value;
        const n = toNumericId(ref);
        if (n != null) return n;
      }
      const direct = toNumericId(item);
      if (direct != null) return direct;

      const s = String(item).trim();
      if (s === "") return null;

      const byLabel = opts.filter(
        (o) => o?.label != null && String(o.label).toLowerCase() === s.toLowerCase()
      );
      const preferredByLabel = byLabel.find((o) => toNumericId(o.value) != null) ?? byLabel[0];
      if (preferredByLabel) {
        const n = toNumericId(preferredByLabel.value);
        if (n != null) return n;
      }

      const byValue = opts.filter((o) => o != null && String(o.value) === s);
      const preferredByValue = byValue.find((o) => toNumericId(o.value) != null) ?? byValue[0];
      if (preferredByValue) {
        const n = toNumericId(preferredByValue.value);
        if (n != null) return n;
      }
      return null;
    })
    .filter((id) => id != null && !Number.isNaN(id));
}

/**
 * @param {object} formPayload - merged form values + entity_fields + appointment_email_files
 * @param {{
 *   appointmentFiles?: File[],
 *   acceptanceFiles?: File[],
 *   emailAttachments?: Array<{ file_name?: string, file_url?: string }>,
 *   dailyReportEmailOptions?: Array<{ value?: unknown, label?: string }>,
 *   billingInstructionEmailOptions?: Array<{ value?: unknown, label?: string }>,
 *   preserveAppointmentBody?: boolean,
 * }} options
 */
export function buildCreateCallFileFormData(formPayload, options = {}) {
  const fv = formPayload || {};
  const {
    appointmentFiles = [],
    acceptanceFiles = [],
    emailAttachments: emailAttachmentsOption,
    dailyReportEmailOptions = [],
    billingInstructionEmailOptions = [],
    preserveAppointmentBody = false,
  } = options;
  const fd = new FormData();

  const appendStringField = (key, value) => {
    fd.append(key, str(value));
  };

  if (Array.isArray(appointmentFiles) && appointmentFiles.length > 0) {
    appointmentFiles.forEach((file) => {
      if (file instanceof File || (typeof Blob !== "undefined" && file instanceof Blob)) {
        fd.append("appointment_email_file", file);
      }
    });
  }

  if (Array.isArray(acceptanceFiles) && acceptanceFiles.length > 0) {
    acceptanceFiles.forEach((file) => {
      if (file instanceof File || (typeof Blob !== "undefined" && file instanceof Blob)) {
        fd.append("appointment_acceptance_files[]", file);
      }
    });
  }

  const datePart = str(fv.appointmentReceivedDate);
  const timePart = str(fv.appointmentReceivedTime);
  let appointmentReceived = "";
  if (datePart && timePart) {
    appointmentReceived = `${datePart}T${timePart}`;
  } else if (datePart) {
    appointmentReceived = datePart;
  }
  appendStringField("appointment_received_date", appointmentReceived);

  appendStringField("card_title", fv.cardTitle);
  appendStringField("card_color", str(fv.card_color ?? fv.cardColor) || "#2e7d32");
  appendStringField("card_type_id", fv.card_type_id ?? fv.type_id);
  appendStringField("card_tag_id", fv.card_tag_id ?? fv.tag_id);
  appendStringField("card_blocker_id", fv.card_blocker_id ?? fv.blocker_id);
  appendStringField("card_sticker_id", fv.card_sticker_id ?? fv.sticker_id);
  appendStringField("owner_id", fv.owner);
  appendStringField("port_id", fv.port);
  appendStringField("call_type", fv.typeOfCall);
  appendStringField("swimlane_id", fv.swimlane_id ?? fv.swimlaneId ?? "");

  appendStringField("assigned_operator_id", fv.assignedOperator);
  appendStringField("last_port", fv.lastPort);
  const appointmentType = normalizeAppointmentType(fv.appointmentType);
  fd.append("appointment_type", APPOINTMENT_TYPE_API_LABEL[appointmentType] ?? str(fv.appointmentType));

  // Only the keys relevant to the selected appointment type are sent. Each appointment type carries its
  // own billing entity selection(s); Tug and Barge / Taxi Tug and Barge keep the tug and barge entities independent.
  if (appointmentType === APPOINTMENT_TYPE_VESSEL || appointmentType === APPOINTMENT_TYPE_TUG) {
    appendStringField("billing_entity_id", fv.vesselBillingEntity);
    if (appointmentType === APPOINTMENT_TYPE_VESSEL) {
      appendStringField("vessel_type_id", fv.vesselType);
    } else {
      appendStringField("tug_type_id", fv.vesselType);
    }
    appendStringField("vessel_id", fv.vesselName);
    appendStringField("vessel_owner", fv.vesselOwner);
    appendStringField("vessel_principal", fv.vesselPrincipal);
    appendStringField("vessel_manager", fv.vesselManager);
  } else if (isBargeAppointmentType(appointmentType)) {
    // Tug details reuse the standard vessel keys; barge details use the barge_vessel_* keys.
    appendStringField("billing_entity_id", fv.tugBillingEntity);
    appendStringField("barge_billing_entity_id", fv.bargeBillingEntity);
    appendStringField("tug_type_id", fv.tugType);
    appendStringField("barge_type_id", fv.bargeType);
    appendStringField("vessel_id", fv.tugVesselName);
    appendStringField("vessel_owner", fv.tugOwner);
    appendStringField("vessel_principal", fv.tugPrincipal);
    appendStringField("vessel_manager", fv.tugManager);
    appendStringField("barge_vessel_id", fv.bargeVesselName);
    appendStringField("barge_vessel_owner", fv.bargeOwner);
    appendStringField("barge_vessel_principal", fv.bargePrincipal);
    appendStringField("barge_vessel_manager", fv.bargeManager);
  }
  appendStringField("service_requestor_name", fv.serviceRequestorName);
  appendStringField("service_requestor_email", fv.serviceRequestorEmail);

  const checklistIds = (Array.isArray(fv.selectedChecklists) ? fv.selectedChecklists : [])
    .map((id) => str(id))
    .filter(Boolean);
  fd.append("checklist_type_ids", toJsonArrayString(checklistIds));

  const daily = resolveSelectionsToNumericReferenceIds(fv.dailyReportEmail, dailyReportEmailOptions);
  fd.append("daily_report_emails", toJsonArrayString(daily));

  appendStringField("instruction_type", fv.instruction_type);
  appendStringField("billing_instruction_det", fv.billing_instruction_det);

  const billingInst = resolveSelectionsToNumericReferenceIds(
    fv.billingInstructionEmails,
    billingInstructionEmailOptions,
    dailyReportEmailOptions
  );
  fd.append("billing_instruction_emails", toJsonArrayString(billingInst));

  const timeObjects = (Array.isArray(fv.time_objects) ? fv.time_objects : [])
    .map((item) => {
      const timeObjectId = str(item?.time_object_id ?? item?.time_object_stage_id);
      const value = str(item?.time_object_value);
      if (!timeObjectId || !value) return null;
      return {
        time_object_id: timeObjectId,
        time_object_value: value,
      };
    })
    .filter(Boolean);
  fd.append("time_objects", JSON.stringify(timeObjects));

  const appointmentAcceptanceRaw =
    fv.appointment_acceptance && typeof fv.appointment_acceptance === "object"
      ? fv.appointment_acceptance
      : {};
  const originalBody = String(appointmentAcceptanceRaw.body ?? "");
  const sanitizedBody = preserveAppointmentBody
    ? originalBody
    : sanitizeAppointmentEmailBody(originalBody);
  const normalizeEmailAttachments = (value) =>
    (Array.isArray(value) ? value : [])
      .map((item) => ({
        file_name: str(item?.file_name ?? item?.name),
        file_url: str(item?.file_url ?? item?.url),
      }))
      .filter((item) => item.file_name || item.file_url);

  const emailAttachments = normalizeEmailAttachments(
    emailAttachmentsOption ?? fv.email_attachments ?? appointmentAcceptanceRaw.attachments
  );

  const appointmentAcceptance = {
    body: str(sanitizedBody),
    cc_emails: str(appointmentAcceptanceRaw.cc_emails),
    from_email: str(appointmentAcceptanceRaw.from_email),
    subject: str(appointmentAcceptanceRaw.subject),
    to_email: str(appointmentAcceptanceRaw.to_email),
  };
  fd.append("appointment_acceptance", JSON.stringify(appointmentAcceptance));

  // Uploaded email attachments (from /call_file/upload_email_attachments).
  // Always sent — an empty array when nothing was uploaded.
  fd.append("attachments", JSON.stringify(emailAttachments));

  return fd;
}
