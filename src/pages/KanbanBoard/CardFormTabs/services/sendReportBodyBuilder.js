/** Plain-text helpers for operation report email bodies (no HTML in message). */

export function stripHtml(html) {
  if (html == null || html === "") return "";
  if (typeof window === "undefined") {
    return String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

export function formatDateTimePair(date, time) {
  const d = date || "";
  const t = time || "";
  if (!d && !t) return "—";
  if (d && t) return `${d} ${t}`;
  return d || t;
}

export function buildPreArrivalReportBody(v) {
  const lines = [
    "Pre-Arrival report",
    "",
    `Expected time of arrival: ${formatDateTimePair(v.expectedArrivalDate, v.expectedArrivalTime)}`,
    `Expected commencement of custom inspection: ${formatDateTimePair(v.customsInspectionDate, v.customsInspectionTime)}`,
    `Expected commencement of Immigration clearance for crew: ${formatDateTimePair(v.immigrationClearanceDate, v.immigrationClearanceTime)}`,
    `Expected completion of inward clearance: ${formatDateTimePair(v.inwardClearanceDate, v.inwardClearanceTime)}`,
    `SABER status: ${v.saberUtStatus || "—"}`,
    "",
    "Remarks:",
    stripHtml(v.preArrivalDescription) || "—",
    "",
    `Weather forecast: ${v.weatherForecast || "—"}`,
    `Coordinates: ${v.coordinates || "—"}`,
  ];
  return lines.join("\n");
}

export function buildArrivalReportBody(v) {
  const lines = [
    "Arrival report",
    "",
    `Actual time of arrival: ${formatDateTimePair(v.actualArrivalDate, v.actualArrivalTime)}`,
    `Custom inspection commenced: ${formatDateTimePair(v.customInspectionCommencedDate, v.customInspectionCommencedTime)}`,
    `Custom inspection completed: ${formatDateTimePair(v.customInspectionCompletedDate, v.customInspectionCompletedTime)}`,
    `Custom inspection status: ${v.customInspectionStatus || "—"}`,
  ];
  if (v.customInspectionStatus === "Failed" && v.customInspectionFailReason) {
    lines.push(`Reason for fail: ${v.customInspectionFailReason}`);
  }
  lines.push(
    `Crew immigration commenced: ${formatDateTimePair(v.crewImmigrationCommencedDate, v.crewImmigrationCommencedTime)}`,
    `Crew immigration status: ${v.crewImmigrationStatus || "—"}`,
  );
  if (v.crewImmigrationStatus === "Completed") {
    lines.push(
      `Crew immigration completed: ${formatDateTimePair(v.crewImmigrationCompletedDate, v.crewImmigrationCompletedTime)}`,
    );
  }
  if (v.crewImmigrationStatus === "On Hold" && v.crewImmigrationHoldRemarks) {
    lines.push(`Reason for hold: ${v.crewImmigrationHoldRemarks}`);
  }
  lines.push(
    `Vessel inward formalities completed: ${formatDateTimePair(v.vesselInwardFormalitiesCompletedDate, v.vesselInwardFormalitiesCompletedTime)}`,
    `Marine work permit applied: ${formatDateTimePair(v.marineWorkPermitAppliedDate, v.marineWorkPermitAppliedTime)}`,
    `Marine work permit issued: ${formatDateTimePair(v.marineWorkPermitIssuedDate, v.marineWorkPermitIssuedTime)}`,
    `Marine work permit expires: ${formatDateTimePair(v.marineWorkPermitExpiresDate, v.marineWorkPermitExpiresTime)}`,
    "",
    "Remarks:",
    stripHtml(v.arrivalDescription) || "—",
  );
  return lines.join("\n");
}

export function buildArrivalDailyReportBody(v) {
  const lines = [
    "Daily report - Arrival",
    "",
    `Actual time of arrival: ${formatDateTimePair(v.actualArrivalDate, v.actualArrivalTime)}`,
    `Custom inspection commenced: ${formatDateTimePair(v.customInspectionCommencedDate, v.customInspectionCommencedTime)}`,
    `Custom inspection completed: ${formatDateTimePair(v.customInspectionCompletedDate, v.customInspectionCompletedTime)}`,
    `Custom inspection status: ${v.customInspectionStatus || "—"}`,
    `Crew immigration commenced: ${formatDateTimePair(v.crewImmigrationCommencedDate, v.crewImmigrationCommencedTime)}`,
    `Crew immigration status: ${v.crewImmigrationStatus || "—"}`,
    `Crew immigration completed: ${formatDateTimePair(v.crewImmigrationCompletedDate, v.crewImmigrationCompletedTime)}`,
    `Vessel inward formalities completed: ${formatDateTimePair(v.vesselInwardFormalitiesCompletedDate, v.vesselInwardFormalitiesCompletedTime)}`,
    `Marine work permit applied: ${formatDateTimePair(v.marineWorkPermitAppliedDate, v.marineWorkPermitAppliedTime)}`,
    `Marine work permit issued: ${formatDateTimePair(v.marineWorkPermitIssuedDate, v.marineWorkPermitIssuedTime)}`,
    `Marine work permit expires: ${formatDateTimePair(v.marineWorkPermitExpiresDate, v.marineWorkPermitExpiresTime)}`,
    "",
    "Remarks:",
    stripHtml(v.arrivalDescription) || "—",
  ];
  return lines.join("\n");
}

export function buildDepartureReportBody(v) {
  const lines = [
    "Departure report",
    "",
    `Request for outward clearance received: ${formatDateTimePair(v.outwardClearanceRequestReceivedDate, v.outwardClearanceRequestReceivedTime)}`,
    `Outward clearance issued: ${formatDateTimePair(v.outwardClearanceIssuedDate, v.outwardClearanceIssuedTime)}`,
    `Outward clearance delivered: ${formatDateTimePair(v.outwardClearanceDeliveredDate, v.outwardClearanceDeliveredTime)}`,
    `Vessel sailed: ${formatDateTimePair(v.vesselSailedDate, v.vesselSailedTime)}`,
    `Next port: ${v.nextPort || "—"}`,
    "",
    "Remarks:",
    stripHtml(v.departureDescription) || "—",
  ];
  return lines.join("\n");
}
