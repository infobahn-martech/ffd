import {
  getEventFieldKeyPrefix,
  mapApiSaberStatusToFormValue,
  mapApiWeatherForecastToFormValue,
  SABER_APPLIED_BY_SEDRES,
} from "./operationConstants";

export function parseApiDateTimeParts(raw) {
  if (raw == null || raw === "") return { date: "", time: "" };
  const s = String(raw).trim().replace("T", " ");
  const [datePart, timePart = ""] = s.split(/\s+/);
  const date = datePart && datePart.length >= 10 ? datePart.slice(0, 10) : datePart || "";
  const time = timePart && timePart.length >= 5 ? timePart.slice(0, 5) : "";
  return { date, time };
}

export function mergePreArrivalTaskDocuments(currentHandling, taskDocuments = []) {
  if (!currentHandling || typeof currentHandling !== "object" || !currentHandling.documents) {
    return currentHandling;
  }
  const dh = JSON.parse(JSON.stringify(currentHandling));

  const pushFile = (row, entry) => {
    if (!row || !entry?.name) return;
    const files = row.files || [];
    const dup = files.some(
      (f) =>
        f.name === entry.name &&
        (entry.url ? f.url === entry.url : !(f.file instanceof File))
    );
    if (!dup) row.files = [...files, entry];
  };

  for (const td of taskDocuments) {
    const docId = td?.document_id ?? td?.documentId;
    const fileName = td?.file_name || td?.fileName || "Document";
    if (docId == null) continue;
    const idStr = String(docId);
    for (const processKey of ["gro", "customClearance"]) {
      const row = (dh.documents[processKey] || []).find((r) => String(r.id) === idStr);
      if (row) {
        pushFile(row, { name: fileName });
        break;
      }
    }
  }

  return dh;
}

function stageDocumentUrlEntries(stageDocuments = []) {
  const out = [];
  for (const sd of stageDocuments) {
    const url = sd?.attachment ?? sd?.url ?? sd?.file_url;
    if (!url || typeof url !== "string") continue;
    let name = `Stage document ${sd?.stage_document_id ?? ""}`.trim();
    try {
      const seg = url.split("/").pop() || name;
      name = seg.includes("?") ? seg.split("?")[0] : seg;
    } catch {
      /* keep default name */
    }
    out.push({ name, url: String(url) });
  }
  return out;
}

/**
 * Applies `pre_arrival/get_prearrival_detail` payload into Operation / CardForm fields.
 * @returns {{ appliedAnyTime: boolean, coordinatesId: string|null }}
 */
export function applyPreArrivalGetDetailToForm({
  responseBody,
  eventFields,
  handleChange,
  currentForm,
}) {
  const root = responseBody?.data ?? responseBody ?? {};
  const pre = root.prearrival ?? root.preArrival;
  const timeObjects = root.time_objects ?? root.timeObjects ?? [];
  const taskDocuments = root.task_documents ?? root.taskDocuments ?? [];
  const stageDocuments = root.stage_documents ?? root.stageDocuments ?? [];
  const stageUrlAttachments = stageDocumentUrlEntries(stageDocuments);

  let appliedAnyTime = false;
  let coordinatesId = null;
  let saberFormFromApi = "";

  if (pre && typeof pre === "object") {
    saberFormFromApi = mapApiSaberStatusToFormValue(pre.saber_status);
    if (saberFormFromApi) handleChange("saberUtStatus")({ target: { value: saberFormFromApi } });

    const weatherForm = mapApiWeatherForecastToFormValue(pre.weather_forecast);
    if (weatherForm) {
      handleChange("weatherForecast")({ target: { value: weatherForm } });
      handleChange("preArrivalTimeObjectsNeedRecheck")({
        target: { value: weatherForm === "Bad weather" },
      });
    }

    if (pre.remarks != null && String(pre.remarks).trim() !== "") {
      handleChange("remarks")({ target: { value: String(pre.remarks) } });
    }

    if (pre.coordinates_id != null && String(pre.coordinates_id).trim() !== "") {
      coordinatesId = String(pre.coordinates_id).trim();
      handleChange("preArrivalCoordinatesId")({ target: { value: coordinatesId } });
    }
  }

  const saberDocAttachments = [];
  if (pre && typeof pre === "object") {
    const saberRaw = pre.saber_doc;
    if (saberRaw != null && saberRaw !== "") {
      const list = Array.isArray(saberRaw)
        ? saberRaw
        : String(saberRaw)
            .split(/[\s,;]+/)
            .map((s) => s.trim())
            .filter(Boolean);
      const parsed = list
        .map((item, i) => {
          if (typeof item === "string") {
            return item ? { name: `SABER document ${i + 1}`, url: item } : null;
          }
          const url = item?.url || item?.attachment || item?.path;
          const name = item?.file_name || item?.name || `SABER document ${i + 1}`;
          return url ? { name: String(name), url: String(url) } : null;
        })
        .filter(Boolean);
      if (parsed.length && saberFormFromApi === SABER_APPLIED_BY_SEDRES) {
        saberDocAttachments.push(...parsed);
      }
    }
  }

  const urlAttachmentsToAdd = [...saberDocAttachments, ...stageUrlAttachments];
  if (urlAttachmentsToAdd.length) {
    const existing = currentForm?.saberUtDocumentsAttachments || [];
    const merged = [...existing];
    for (const a of urlAttachmentsToAdd) {
      if (!merged.some((m) => m.name === a.name && m.url === a.url)) merged.push(a);
    }
    handleChange("saberUtDocumentsAttachments")({ target: { value: merged } });
  }

  const fields = Array.isArray(eventFields) ? eventFields : [];
  for (const to of timeObjects) {
    const rawValue = to?.time_object_value ?? to?.value;
    if (rawValue == null || String(rawValue).trim() === "") continue;

    const { date, time } = parseApiDateTimeParts(rawValue);
    if (!date || !time) continue;

    const toId = to?.time_object_id ?? to?.timeObjectId;
    const toName = to?.time_object ?? to?.event_name ?? "";

    let keyPrefix = "";
    const matched = fields.find((field) => {
      const fid = field?.time_object_id ?? field?.event_type_id ?? field?.id;
      if (toId != null && fid != null && Number(fid) === Number(toId)) return true;
      return (
        String(field?.event_name || "").trim().toLowerCase() === String(toName).trim().toLowerCase()
      );
    });
    if (matched?.keyPrefix) keyPrefix = matched.keyPrefix;
    else if (toName) keyPrefix = getEventFieldKeyPrefix(toName);
    if (!keyPrefix) continue;

    handleChange(`${keyPrefix}Date`)({ target: { value: date } });
    handleChange(`${keyPrefix}Time`)({ target: { value: time } });
    appliedAnyTime = true;
  }

  if (appliedAnyTime) {
    handleChange("preArrivalEtaAutofillDisabled")({ target: { value: true } });
  }

  const nextDh = mergePreArrivalTaskDocuments(currentForm?.preArrivalDocumentHandling, taskDocuments);
  if (nextDh && JSON.stringify(nextDh) !== JSON.stringify(currentForm?.preArrivalDocumentHandling)) {
    handleChange("preArrivalDocumentHandling")({ target: { value: nextDh } });
  }

  return { appliedAnyTime, coordinatesId };
}
