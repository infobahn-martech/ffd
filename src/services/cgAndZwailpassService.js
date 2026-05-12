import Gateway from "../gateway/gateway";

/** GET — crew roster for pass forms */
export const getCrewListForPass = () => Gateway.get("crew/get_crew_list");

/** POST multipart FormData — { call_id, crew_change_ids[], pass_type, remarks, documents[] } */
export const createPassRequest = (formData) =>
  Gateway.post("crew_pass/create_pass_request", formData);

/**
 * Normalize crew array from API body (axios `response.data`).
 * Mirrors common envelope shapes: data.data.crew, data.crew, data.data, data.
 */
export const extractCrewArrayFromEnvelope = (envelope) => {
  const crewArray =
    envelope?.data?.crew ??
    envelope?.crew ??
    envelope?.data?.data ??
    envelope?.data ??
    envelope;
  return Array.isArray(crewArray) ? crewArray : [];
};

export const mapCrewRecordsToOptions = (crewArray) => {
  if (!Array.isArray(crewArray)) return [];
  return crewArray
    .map((crew) => {
      const id = crew.crew_id ?? crew.id ?? crew.crewId;
      if (id === undefined || id === null) return null;
      return {
        value: String(id),
        label:
          crew.crew_name ||
          crew.crewName ||
          `Crew Member ${crew.crew_id ?? crew.id ?? crew.crewId ?? ""}`,
      };
    })
    .filter(Boolean);
};

export const mapAxiosResponseToCrewOptions = (response) =>
  mapCrewRecordsToOptions(extractCrewArrayFromEnvelope(response?.data));
