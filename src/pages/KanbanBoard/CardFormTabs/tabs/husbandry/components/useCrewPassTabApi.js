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

const mergeCrewOptions = (apiOptions, crewList) => {
  const map = new Map();
  apiOptions.forEach((opt) => map.set(opt.value, opt));
  if (Array.isArray(crewList)) {
    crewList.forEach((crew) => {
      const id = crew.crew_id ?? crew.id ?? crew.crewId;
      if (id === undefined || id === null) return;
      const val = String(id);
      if (!map.has(val)) {
        map.set(val, {
          value: val,
          label:
            crew.crew_name ||
            crew.crewName ||
            `Crew Member ${crew.crew_id ?? crew.id}`,
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCrewLoading(true);
      setCrewLoadError(null);
      try {
        const response = await getCrewListForPass();
        const opts = mapAxiosResponseToCrewOptions(response);
        if (!cancelled) setApiCrewOptions(opts);
      } catch (err) {
        console.error("Failed to load crew list for pass tab", err);
        if (!cancelled) {
          setApiCrewOptions([]);
          setCrewLoadError(pickBackendErrorMessage(err));
        }
      } finally {
        if (!cancelled) setCrewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const crewOptions = useMemo(
    () => mergeCrewOptions(apiCrewOptions, formValues?.crewList),
    [apiCrewOptions, formValues?.crewList]
  );

  const crewEmpty =
    !crewLoading && !crewLoadError && crewOptions.length === 0;

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
    crewEmpty,
    saving,
    handleSave,
  };
}
