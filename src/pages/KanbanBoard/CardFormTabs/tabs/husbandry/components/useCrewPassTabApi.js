import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { notify } from "../../../../../../components/Toaster";
import {
  createPassRequest,
  getCrewListForPass,
  mapAxiosResponseToCrewOptions,
} from "../../../../../../services/cgAndZwailpassService";

export const resolvePassCallId = (formValues, card, routeParams) => {
  const raw =
    formValues?.call_id ??
    formValues?.callId ??
    card?.call_id ??
    card?.callId ??
    routeParams?.call_id;
  if (raw === undefined || raw === null) return "";
  return String(raw).trim();
};

export const resolvePassVesselId = (formValues, card, routeParams) => {
  const raw =
    formValues?.vessel_id ??
    formValues?.vesselId ??
    card?.vessel_id ??
    card?.vesselId ??
    routeParams?.vessel_id;
  if (raw === undefined || raw === null) return "";
  return String(raw).trim();
};

const mergeCrewOptions = (apiOptions, crewList) => {
  const map = new Map();
  apiOptions.forEach((opt) => map.set(opt.value, opt));
  if (Array.isArray(crewList)) {
    crewList.forEach((crew) => {
      const id =
        crew.crew_change_id ??
        crew.crewChangeId ??
        crew.crew_id ??
        crew.id ??
        crew.crewId;
      if (id === undefined || id === null) return;
      const val = String(id);
      if (!map.has(val)) {
        map.set(val, {
          value: val,
          label:
            crew.crew_name ||
            crew.crewName ||
            crew.name ||
            `Crew Member ${crew.crew_id ?? crew.id ?? ""}`,
          crew_id: crew.crew_id ?? crew.id,
          crew_change_id: crew.crew_change_id ?? crew.crewChangeId,
          movement_type: crew.movement_type ?? crew.movementType,
          nationality: crew.nationality,
          rank: crew.rank,
          raw: crew,
        });
      }
    });
  }
  return [...map.values()];
};

const pickBackendErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (data?.message && typeof data.message === "string") return data.message;
  if (data?.error && typeof data.error === "string") return data.error;
  if (error?.message && typeof error.message === "string") return error.message;
  return "Something went wrong. Please try again.";
};

/**
 * Shared crew load + save for CG Pass and Zawil Pass tabs.
 */
export function useCrewPassTabApi({
  passType,
  formValues,
  card,
  selectedCrewField,
  remarksField,
  documentsField,
}) {
  const routeParams = useParams();
  const [apiCrewOptions, setApiCrewOptions] = useState([]);
  const [crewLoading, setCrewLoading] = useState(false);
  const [crewLoadError, setCrewLoadError] = useState(null);
  const [crewLoadState, setCrewLoadState] = useState("idle");
  const [saving, setSaving] = useState(false);
  const callId = resolvePassCallId(formValues, card, routeParams);
  const vesselId = resolvePassVesselId(formValues, card, routeParams);

  useEffect(() => {
    if (!callId) {
      setApiCrewOptions([]);
      setCrewLoadError(null);
      setCrewLoadState("missing_call_id");
      setCrewLoading(false);
      return undefined;
    }

    if (!vesselId) {
      setApiCrewOptions([]);
      setCrewLoadError(null);
      setCrewLoadState("missing_vessel_id");
      setCrewLoading(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      setCrewLoading(true);
      setCrewLoadError(null);
      setCrewLoadState("loading");
      try {
        const response = await getCrewListForPass({
          call_id: callId,
          vessel_id: vesselId,
        });
        const opts = mapAxiosResponseToCrewOptions(response);
        if (!cancelled) {
          setApiCrewOptions(opts);
          setCrewLoadState(opts.length > 0 ? "success" : "empty");
        }
      } catch (err) {
        console.error("Failed to load crew list for pass tab", err);
        if (!cancelled) {
          setApiCrewOptions([]);
          setCrewLoadError(pickBackendErrorMessage(err));
          setCrewLoadState("api_error");
        }
      } finally {
        if (!cancelled) setCrewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [callId, vesselId]);

  const crewOptions = useMemo(
    () => mergeCrewOptions(apiCrewOptions, formValues?.crewList),
    [apiCrewOptions, formValues?.crewList]
  );

  const crewEmpty = !crewLoading && crewLoadState === "empty";

  const crewPlaceholder = crewLoading
    ? "Loading crew..."
    : crewLoadState === "missing_call_id"
      ? "Call id is required"
      : crewLoadState === "missing_vessel_id"
        ? "Vessel id is required"
        : crewLoadState === "api_error" || crewLoadError
          ? "Unable to load crew"
          : crewLoadState === "empty"
            ? "No crew found"
            : "Select crew members...";

  const handleSave = useCallback(async () => {
    const callId = resolvePassCallId(formValues, card, routeParams);
    if (!callId) {
      notify("Call ID is required before saving.", "error", "top-center");
      return;
    }

    const selectedCrewIds = formValues?.[selectedCrewField];
    if (!Array.isArray(selectedCrewIds) || selectedCrewIds.length === 0) {
      notify("Select at least one crew member.", "error", "top-center");
      return;
    }

    const remarksRaw = formValues?.[remarksField];
    const remarks =
      remarksRaw === undefined || remarksRaw === null
        ? ""
        : String(remarksRaw);

    const documents = Array.isArray(formValues?.[documentsField])
      ? formValues[documentsField]
      : [];

    const formData = new FormData();
    formData.append("call_id", callId);
    selectedCrewIds.forEach((id) => {
      if (id !== undefined && id !== null && String(id).trim() !== "") {
        formData.append("crew_change_ids[]", String(id).trim());
      }
    });
    formData.append("pass_type", passType);
    formData.append("remarks", remarks || "");

    documents.forEach((attachment) => {
      const file = attachment?.file ?? attachment;
      if (file instanceof File) {
        formData.append("documents[]", file);
      }
    });

    setSaving(true);
    try {
      await createPassRequest(formData);
      notify("Pass request saved successfully.", "success", "top-center");
    } catch (err) {
      console.error("create_pass_request failed", err);
      notify(pickBackendErrorMessage(err), "error", "top-center");
    } finally {
      setSaving(false);
    }
  }, [
    card,
    documentsField,
    formValues,
    passType,
    remarksField,
    routeParams,
    selectedCrewField,
  ]);

  return {
    crewOptions,
    crewLoading,
    crewLoadError,
    crewLoadState,
    crewEmpty,
    crewPlaceholder,
    saving,
    handleSave,
  };
}
