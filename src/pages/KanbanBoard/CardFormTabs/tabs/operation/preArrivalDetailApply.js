import {
  getEventFieldKeyPrefix,
  mapApiSaberStatusToFormValue,
  mapApiWeatherForecastToFormValue,
  PRE_ARRIVAL_CUSTOM_CLEARANCE_ROLE_ID,
  PRE_ARRIVAL_GRO_ROLE_ID,
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

function roleIdToPreArrivalProcessKey(roleId) {
  const n = Number(roleId);
  if (n === PRE_ARRIVAL_GRO_ROLE_ID) return "gro";
  if (n === PRE_ARRIVAL_CUSTOM_CLEARANCE_ROLE_ID) return "customClearance";
  return null;
}

const stageFileKey = (f) => `${f?.stage_document_id ?? ""}:${f?.name ?? ""}:${f?.url ?? ""}`;

/**
 * Merges `task_documents` (by `role_id` → GRO vs Custom) and `stage_documents` into document handling.
 * GRO = role_id 4, Custom clearance = role_id 5 (same as user pickers in Pre Arrival).
 */
export function mergePreArrivalDetailDocuments(currentHandling, taskDocuments = [], stageDocuments = []) {
  if (!currentHandling || typeof currentHandling !== "object" || !currentHandling.documents) {
    return currentHandling;
  }
  const dh = JSON.parse(JSON.stringify(currentHandling));
  if (!Array.isArray(dh.stageFiles)) dh.stageFiles = [];

  const stageFromApi = (stageDocuments || [])
    .map((sd) => {
      const raw = sd?.attachment ?? sd?.url ?? sd?.file_url;
      if (raw == null || String(raw).trim() === "") return null;
      if (typeof raw !== "string") return null;
      const trimmed = raw.trim();
      let name = trimmed;
      if (/^https?:\/\//i.test(trimmed)) {
        try {
          const seg = trimmed.split("/").pop() || trimmed;
          name = seg.includes("?") ? seg.split("?")[0] : seg;
        } catch {
          name = trimmed;
        }
      }
      return {
        name,
        url: /^https?:\/\//i.test(trimmed) ? trimmed : undefined,
        stage_document_id: sd?.stage_document_id ?? sd?.stageDocumentId,
      };
    })
    .filter(Boolean);

  const existingStageKeys = new Set((dh.stageFiles || []).map(stageFileKey));
  for (const f of stageFromApi) {
    const k = stageFileKey(f);
    if (!existingStageKeys.has(k)) {
      dh.stageFiles.push(f);
      existingStageKeys.add(k);
    }
  }

  const taskRoles = new Set(
    (taskDocuments || []).map((t) => Number(t?.role_id)).filter((n) => !Number.isNaN(n))
  );
  if (!dh.selectedProcesses) dh.selectedProcesses = { gro: false, customClearance: false };
  if (taskRoles.has(PRE_ARRIVAL_GRO_ROLE_ID)) dh.selectedProcesses.gro = true;
  if (taskRoles.has(PRE_ARRIVAL_CUSTOM_CLEARANCE_ROLE_ID)) dh.selectedProcesses.customClearance = true;

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

  for (const td of taskDocuments || []) {
    const docId = td?.document_id ?? td?.documentId;
    const fileName = td?.file_name || td?.fileName || "Document";
    if (docId == null) continue;
    const idStr = String(docId);
    const processKey = roleIdToPreArrivalProcessKey(td?.role_id);
    if (!processKey) continue;
    const row = (dh.documents[processKey] || []).find((r) => String(r.id) === idStr);
    if (row) pushFile(row, { name: fileName });
  }

  return dh;
}

/**
 * Applies `pre_arrival/get_prearrival_detail` payload into Operation / CardForm fields.
 * Document handling rows are merged separately via `mergePreArrivalDetailDocuments` when rows are ready.
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

  if (saberDocAttachments.length) {
    const existing = currentForm?.saberUtDocumentsAttachments || [];
    const merged = [...existing];
    for (const a of saberDocAttachments) {
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

  return { appliedAnyTime, coordinatesId };
}
