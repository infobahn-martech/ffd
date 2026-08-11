import Gateway from "../gateway/gateway";

/** GET — crew roster for pass forms by call_id */
export const getCrewListForPass = (callId) =>
  Gateway.get(`crew/get_crew_by_call/${callId}`);

/** POST multipart FormData — { call_id, request_email, crew_change_ids (JSON string), pass_type, remarks, documents[0], documents[1], … } */
export const createPassRequest = (formData) =>
  Gateway.post("crew_pass/create_pass_request", formData);

/** GET — pass request history for a call; response body includes cg + zawil arrays */
export const getPassRequests = (callId) =>
  Gateway.get(`crew_pass/get_pass_requests/${callId}`);

/**
 * Normalize pass requests from axios response.
 * Supports both response shapes: a flat array of work orders each carrying
 * its own `pass_type` ("CG" / "Zawil"), and the older { cg: [...], zawil: [...] }
 * object (possibly nested under response.data.data).
 */
export const extractPassRequestsFromEnvelope = (responseEnvelope) => {
  const envelope =
    responseEnvelope?.data?.data ?? responseEnvelope?.data ?? {};

  if (Array.isArray(envelope)) {
    const cg = [];
    const zawil = [];
    envelope.forEach((workOrder) => {
      const type = String(workOrder?.pass_type ?? "").trim().toLowerCase();
      if (type === "cg") cg.push(workOrder);
      else if (type === "zawil") zawil.push(workOrder);
    });
    return { cg, zawil };
  }

  const cg = Array.isArray(envelope.cg) ? envelope.cg : [];
  const zawil = Array.isArray(envelope.zawil) ? envelope.zawil : [];
  return { cg, zawil };
};

/**
 * Group work-order pass requests (each with nested `crew[]`) into
 * expand/collapse-friendly groups for CrewPassRequestsTable. Falls back to
 * treating each item as its own single-crew group when the response isn't
 * grouped by work order (legacy flat row shape, no nested `crew`).
 */
export const groupPassRequestRows = (workOrders) => {
  if (!Array.isArray(workOrders) || workOrders.length === 0) return [];

  return workOrders.map((wo, index) => {
    const woNumber = wo?.wo_number ?? wo?.woNumber ?? "";
    const woId = wo?.wo_id ?? wo?.id ?? `wo-${index}`;
    const crewList = Array.isArray(wo?.crew) ? wo.crew : null;

    if (crewList) {
      return {
        woId,
        woNumber,
        woStatus: wo?.wo_status ?? wo?.status,
        crew: crewList.map((crew) => ({
          ...crew,
          wo_number: woNumber || crew?.wo_number,
          wo_id: woId ?? crew?.wo_id,
          crew_pass_id: crew?.crew_pass_id ?? crew?.crewPassId,
          id: crew?.crew_pass_id ?? crew?.crewPassId ?? crew?.id,
        })),
      };
    }

    // Legacy flat row — no nested crew[], the row itself is the only entry.
    return {
      woId,
      woNumber,
      woStatus: wo?.status,
      crew: [
        {
          ...wo,
          wo_number: woNumber,
          wo_id: woId,
          id: wo?.crew_pass_id ?? wo?.id ?? `row-${index}`,
        },
      ],
    };
  });
};

/**
 * Normalize crew array from axios response.
 * Mirrors: response.data.data.crew, response.data.crew, response.data.data, response.data
 */
export const extractCrewArrayFromEnvelope = (responseEnvelope) => {
  const crewArray =
    responseEnvelope?.data?.data?.crew ??
    responseEnvelope?.data?.crew ??
    responseEnvelope?.data?.data ??
    responseEnvelope?.data ??
    [];
  const safeCrewArray = Array.isArray(crewArray) ? crewArray : [];
  return safeCrewArray;
};

export const mapCrewRecordsToOptions = (crewArray) => {
  const safeCrewArray = Array.isArray(crewArray) ? crewArray : [];
  return safeCrewArray
    .map((crew) => {
      const id = crew.crew_change_id ?? crew.crew_id ?? crew.id;
      if (id === undefined || id === null) return null;
      return {
        value: String(id),
        label:
          crew.crew_name ||
          crew.crewName ||
          `Crew Member ${crew.crew_id ?? crew.id ?? ""}`,
        crew_id: crew.crew_id,
        crew_change_id: crew.crew_change_id,
        movement_type: crew.movement_type,
        nationality: crew.nationality,
        rank: crew.rank,
        raw: crew,
      };
    })
    .filter(Boolean);
};

export const mapAxiosResponseToCrewOptions = (response) =>
  mapCrewRecordsToOptions(extractCrewArrayFromEnvelope(response));

/** POST — immigration crew list grouped by batch, for a call (paginated: page, limit; optionally scoped to one batch via immigrationBatch) */
export const getImmigrationCrewList = (callId, { page, limit, immigrationBatch } = {}) =>
  Gateway.post("crew/get_immigration_crew_list", {
    call_id: Number(callId),
    ...(page != null ? { page } : {}),
    ...(limit != null ? { limit } : {}),
    ...(immigrationBatch ? { immigration_batch: immigrationBatch } : {}),
  });

/**
 * Normalize get_immigration_crew_list pagination metadata.
 */
export const normalizeImmigrationCrewPagination = (data) => {
  const p = data?.pagination ?? {};
  const limit = Number(p.limit) || 10;
  const total = Number(p.total) || 0;
  const page = Number(p.page) || 1;
  const totalPages = Number(p.total_pages) || Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
};

/**
 * Flatten get_immigration_crew_list batches into row objects for CrewImmigrationPanel's table.
 */
export const normalizeImmigrationCrewRows = (data) => {
  const batches = Array.isArray(data?.batches) ? data.batches : [];
  const rows = [];
  batches.forEach((b, bi) => {
    const batch = b?.batch || `Batch ${bi + 1}`;
    (Array.isArray(b?.crew) ? b.crew : []).forEach((item, i) => {
      rows.push({
        id: item.crew_id ?? `${bi}-${i}`,
        crewName: item.crew_name ?? "",
        dateOfBirth: item.date_of_birth ?? "",
        nationality: item.nationality ?? "",
        rank: item.rank ?? "",
        passportIqama: [item.passport_no, item.iqama_no].filter(Boolean).join(" / "),
        visa: item.visa_no ?? "",
        batch,
      });
    });
  });
  return rows;
};

/**
 * Distinct batch names from a get_immigration_crew_list response, for the batch tab list.
 */
export const extractImmigrationBatchOptions = (data) => {
  const batches = Array.isArray(data?.batches) ? data.batches : [];
  return batches.map((b) => b?.batch).filter(Boolean);
};

/**
 * Crew count per batch from a get_immigration_crew_list response, for the batch tab labels.
 */
export const extractImmigrationBatchCounts = (data) => {
  const batches = Array.isArray(data?.batches) ? data.batches : [];
  const counts = {};
  batches.forEach((b) => {
    if (!b?.batch) return;
    counts[b.batch] = Array.isArray(b?.crew) ? b.crew.length : 0;
  });
  return counts;
};
