/**
 * Builds multipart/form-data for POST /call_file/create_call_file
 */

function str(v) {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function normalizeEmailList(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((x) => (typeof x === "string" ? x.trim() : x?.value ?? x?.email ?? ""))
      .filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) {
    return [val.trim()];
  }
  return [];
}

/**
 * @param {object} formPayload - merged form values + entity_fields + appointment_email_files
 * @param {{ appointmentFiles?: File[], boardId?: string|number }} options
 */
export function buildCreateCallFileFormData(formPayload, options = {}) {
  const fv = formPayload || {};
  const { appointmentFiles = [], boardId } = options;
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

  if (boardId !== undefined && boardId !== null && String(boardId).trim() !== "") {
    fd.append("board_id", String(boardId).trim());
  }

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

  const daily = normalizeEmailList(fv.dailyReportEmail);
  if (daily.length) {
    fd.append("daily_report_emails", JSON.stringify(daily));
  }

  const billingInst = normalizeEmailList(fv.billingInstructionEmails);
  if (billingInst.length) {
    fd.append("billing_instruction_emails", JSON.stringify(billingInst));
  }

  const entityFields = Array.isArray(fv.entity_fields) ? fv.entity_fields : [];
  if (entityFields.length) {
    fd.append("entity_fields", JSON.stringify(entityFields));
  }

  return fd;
}
