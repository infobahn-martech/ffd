import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { notify } from "../../../../../../components/Toaster";
import {
  createPassRequest,
  getCrewListForPass,
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
  const [crewOptions, setCrewOptions] = useState([]);
  const [crewLoading, setCrewLoading] = useState(false);
  const [crewLoadError, setCrewLoadError] = useState(null);
  const [crewLoadState, setCrewLoadState] = useState("idle");
  const [saving, setSaving] = useState(false);
  const callId = resolvePassCallId(formValues, card, routeParams);
  const vesselId = resolvePassVesselId(formValues, card, routeParams);

  useEffect(() => {
    if (!callId) {
      setCrewOptions([]);
      setCrewLoadError(null);
      setCrewLoadState("missing_call_id");
      setCrewLoading(false);
      return undefined;
    }

    if (!vesselId) {
      setCrewOptions([]);
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
        const crewArray = response?.data?.data?.crew || [];
        const mappedOptions = Array.isArray(crewArray)
          ? crewArray.map((crew) => ({
              value: String(crew.crew_change_id),
              label: crew.crew_name || `Crew Member ${crew.crew_id}`,
              crew_id: crew.crew_id,
              crew_change_id: crew.crew_change_id,
              crew_name: crew.crew_name,
              raw: crew,
            }))
          : [];
        if (!cancelled) {
          setCrewOptions(mappedOptions);
          setCrewLoadState(mappedOptions.length > 0 ? "success" : "empty");
        }
      } catch (err) {
        console.error("Failed to load crew list for pass tab", err);
        if (!cancelled) {
          setCrewOptions([]);
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
