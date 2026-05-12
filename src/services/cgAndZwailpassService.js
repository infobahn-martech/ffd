import Gateway from "../gateway/gateway";

/** GET — crew roster for pass forms by call_id */
export const getCrewListForPass = (callId) =>
  Gateway.get(`crew/get_crew_by_call/${callId}`);

/** POST multipart FormData — { call_id, request_email, crew_change_ids (JSON string), pass_type, remarks, documents[] } */
export const createPassRequest = (formData) =>
  Gateway.post("crew_pass/create_pass_request", formData);

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
