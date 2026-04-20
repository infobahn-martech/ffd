/**
 * Builds multipart/form-data for POST /call_file/create_call_file
 */

function str(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
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
 *   dailyReportEmailOptions?: Array<{ value?: unknown, label?: string }>,
 *   billingInstructionEmailOptions?: Array<{ value?: unknown, label?: string }>,
 * }} options
 */
export function buildCreateCallFileFormData(formPayload, options = {}) {
  const fv = formPayload || {};
  const {
    appointmentFiles = [],
    dailyReportEmailOptions = [],
    billingInstructionEmailOptions = [],
  } = options;
  const fd = new FormData();

  const appendScalar = (key, value) => {
    if (value === undefined || value === null) return;
    const s = typeof value === "string" ? value.trim() : value;
    if (s === "" || s === undefined) return;
    fd.append(key, typeof s === "number" ? String(s) : s);
  };

  (appointmentFiles || []).forEach((file) => {
    if (file instanceof File || (typeof Blob !== "undefined" && file instanceof Blob)) {
      fd.append("appointment_email_file", file);
    }
  });

  const datePart = str(fv.appointmentReceivedDate);
  const timePart = str(fv.appointmentReceivedTime);
  let appointmentReceived = "";
  if (datePart && timePart) {
    appointmentReceived = `${datePart}T${timePart}`;
  } else if (datePart) {
    appointmentReceived = datePart;
  }
  appendScalar("appointment_received_date", appointmentReceived);

  appendScalar("card_title", str(fv.cardTitle));
  appendScalar("owner_id", str(fv.owner));
  appendScalar("port_id", str(fv.port));
  appendScalar("call_type", str(fv.typeOfCall));
  appendScalar("swimlane_id", str(fv.swimlane_id ?? fv.swimlaneId ?? ""));

  appendScalar("assigned_operator_id", str(fv.assignedOperator));
  appendScalar("billing_entity_id", str(fv.mainBillingEntity));
  appendScalar("other_billing_entity_id", str(fv.otherBillingEntity));
  appendScalar("vessel_type_id", str(fv.vesselType));
  appendScalar("barge_type_id", str(fv.bargeType));
  appendScalar("vessel_id", str(fv.vesselName));

  appendScalar("vessel_owner", str(fv.vesselOwner));
  appendScalar("vessel_principal", str(fv.vesselPrincipal));
  appendScalar("vessel_manager", str(fv.vesselManager));
  appendScalar("service_requestor_name", str(fv.serviceRequestorName));
  appendScalar("service_requestor_email", str(fv.serviceRequestorEmail));

  const daily = resolveSelectionsToNumericReferenceIds(fv.dailyReportEmail, dailyReportEmailOptions);
  if (daily.length) {
    fd.append("daily_report_emails", JSON.stringify(daily));
  }

  const billingInst = resolveSelectionsToNumericReferenceIds(
    fv.billingInstructionEmails,
    billingInstructionEmailOptions,
    dailyReportEmailOptions
  );
  if (billingInst.length) {
    fd.append("billing_instruction_emails", JSON.stringify(billingInst));
  }

  const entityFields = Array.isArray(fv.entity_fields) ? fv.entity_fields : [];
  if (entityFields.length) {
    fd.append("entity_fields", JSON.stringify(entityFields));
  }

  return fd;
}
