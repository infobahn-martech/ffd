/**
 * Helpers for Transport Request save (multipart payload).
 */

/**
 * @param {string} [dateStr] YYYY-MM-DD
 * @param {string} [timeStr] HH:mm or HH:mm:ss
 * @returns {string} e.g. "2026-05-15 08:00:00", or "" if no date
 */
export function buildPickupDateTime(dateStr, timeStr) {
  const datePart = String(dateStr || "").trim();
  if (!datePart) return "";

  const rawTime = String(timeStr != null ? timeStr : "00:00").trim();
  let hh = "00";
  let mm = "00";
  let ss = "00";

  if (rawTime) {
    const segs = rawTime.split(":").map((s) => s.trim());
    if (segs.length >= 2) {
      hh = String(Number(segs[0]) || 0).padStart(2, "0");
      mm = String(Number(segs[1]) || 0).padStart(2, "0");
      ss =
        segs[2] != null && segs[2] !== ""
          ? String(Number(segs[2]) || 0).padStart(2, "0")
          : "00";
    }
  }

  return `${datePart} ${hh}:${mm}:${ss}`;
}

/**
 * @param {{ formValues: object; transportType: string; callDetails: object|null }} args
 * @returns {FormData}
 */
export function buildTransportRequestFormData({ formValues, transportType, callDetails }) {
  const formData = new FormData();

  formData.append("call_id", callDetails?.call_type_id != null ? String(callDetails.call_type_id) : "");
  formData.append("vessel_id", callDetails?.vessel_id != null ? String(callDetails.vessel_id) : "");
  formData.append(
    "request_type",
    transportType === "thirdparty" ? "Third Party" : "Inhouse"
  );

  const pickupDateTime = buildPickupDateTime(
    formValues.transportDateTime,
    formValues.transportTime
  );
  formData.append("pickup_datetime", pickupDateTime);
  formData.append("from_location", formValues.transportFrom || "");
  formData.append("to_location", formValues.transportTo || "");
  formData.append("remarks", formValues.transportDescription || "");

  const requestEmailFile = formValues.transportRequestEmail?.[0]?.file;
  if (requestEmailFile) {
    formData.append("request_email", requestEmailFile);
  }

  const crewPayload = (formValues.selectedCrew || []).map((id) => ({
    crew_change_id: Number(id),
  }));
  formData.append("crew", JSON.stringify(crewPayload));

  if (transportType === "inhouse") {
    formData.append("vehicle_id", formValues.transportVehicleTypeId || "");
    formData.append("driver_id", formValues.transportDriverId || "");
    formData.append("invoice_branch", formValues.invoiceBranch || "");
  }

  if (transportType === "thirdparty") {
    formData.append("transport_company_id", formValues.transportCompanyId || "");
    formData.append("transport_driver_id", formValues.transportThirdPartyDriverId || "");
  }

  return formData;
}
