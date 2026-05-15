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
 * Expects data.cg and data.zawil (possibly nested under response.data.data).
 */
export const extractPassRequestsFromEnvelope = (responseEnvelope) => {
  const envelope =
    responseEnvelope?.data?.data ?? responseEnvelope?.data ?? {};
  const cg = Array.isArray(envelope.cg) ? envelope.cg : [];
  const zawil = Array.isArray(envelope.zawil) ? envelope.zawil : [];
  return { cg, zawil };
};

/**
 * Flatten work-order pass requests (each with nested `crew[]`) into table rows.
 */
export const flattenPassRequestRows = (workOrders) => {
  if (!Array.isArray(workOrders) || workOrders.length === 0) return [];

  const hasNestedCrew = workOrders.some((item) => Array.isArray(item?.crew));
  if (!hasNestedCrew) return workOrders;

  const rows = [];
  workOrders.forEach((wo) => {
    const woNumber = wo?.wo_number ?? wo?.woNumber ?? "";
    const woId = wo?.wo_id ?? wo?.id;
    const crewList = Array.isArray(wo?.crew) ? wo.crew : [];

    if (crewList.length === 0) {
      rows.push({
        wo_number: woNumber,
        wo_id: woId,
        crew_pass_id: null,
      });
      return;
    }

    crewList.forEach((crew) => {
      rows.push({
        ...crew,
        wo_number: woNumber || crew?.wo_number,
        wo_id: woId ?? crew?.wo_id,
        crew_pass_id: crew?.crew_pass_id ?? crew?.crewPassId,
        id: crew?.crew_pass_id ?? crew?.crewPassId ?? crew?.id,
      });
    });
  });

  return rows;
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
