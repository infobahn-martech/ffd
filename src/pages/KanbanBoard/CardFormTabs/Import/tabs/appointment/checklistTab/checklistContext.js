/**
 * Merges GET call_file/get_call_detail with formValues for checklist APIs and display.
 * Priority: cardDetail > formValues > contextLabels (labels only, where noted).
 */

const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

/** First defined non-blank value */
const coalesce = (...vals) => {
  for (const v of vals) {
    if (!isBlank(v)) return v;
  }
  return undefined;
};

/**
 * @param {object} [card] — open card (fallback for call_type_id)
 * @param {object} [cardDetail] — raw get_call_detail row (or null after load)
 * @param {object} [formValues] — card form
 * @param {object} [contextLabels] — optional human labels from parent
 * @param {boolean} [callDetailLoading] — when true, checklist APIs must wait
 * @param {boolean} [useChecklistMock] — mock mode bypasses call-detail gating
 */
export function buildChecklistDataContext({
  card = null,
  cardDetail = null,
  formValues = {},
  contextLabels = null,
  callDetailLoading = false,
  useChecklistMock = false,
} = {}) {
  const d = cardDetail && typeof cardDetail === "object" ? cardDetail : null;

  /** Backend `calltype` param = call_type_id (not call_id, not call_type label) */
  const callTypeIdForChecklist = coalesce(
    d?.call_type_id,
    formValues?.call_type_id,
    card?.call_type_id
  );
  const calltypePayload = isBlank(callTypeIdForChecklist) ? null : String(callTypeIdForChecklist).trim();

  const portIdForApi = coalesce(d?.port_id, formValues?.port);
  const vesselIdRaw = coalesce(d?.vessel_type_id, formValues?.vesselType);
  const bargeIdRaw = coalesce(d?.barge_type_id, formValues?.bargeType);

  const numOrNaN = (v) => {
    if (isBlank(v)) return NaN;
    const n = Number(v);
    return Number.isNaN(n) ? NaN : n;
  };

  const vesselNum = numOrNaN(vesselIdRaw);
  const bargeNum = numOrNaN(bargeIdRaw);
  const hasVessel = !isBlank(vesselIdRaw) && !Number.isNaN(vesselNum) && vesselNum !== 0;
  const hasBarge = !isBlank(bargeIdRaw) && !Number.isNaN(bargeNum) && bargeNum !== 0;

  const displayCallType = coalesce(
    contextLabels?.callType,
    d?.call_type != null && String(d.call_type).trim() !== "" ? String(d.call_type) : undefined,
    formValues?.typeOfCall != null ? String(formValues.typeOfCall) : undefined
  );

  const displayPort = coalesce(
    contextLabels?.port,
    d?.port,
    d?.port_id != null ? String(d.port_id) : undefined,
    formValues?.port != null ? String(formValues.port) : undefined
  );

  const displayVessel = coalesce(
    contextLabels?.vesselType,
    d?.vessel_type,
    !isBlank(vesselIdRaw) ? String(vesselIdRaw) : undefined,
    formValues?.vesselType != null ? String(formValues.vesselType) : undefined
  );

  const displayBarge = coalesce(
    contextLabels?.bargeType,
    d?.barge_type,
    !isBlank(bargeIdRaw) ? String(bargeIdRaw) : undefined,
    formValues?.bargeType != null ? String(formValues.bargeType) : undefined
  );

  const portPayload = (() => {
    if (isBlank(portIdForApi)) return {};
    const n = Number(portIdForApi);
    return Number.isNaN(n) ? { port_id: portIdForApi } : { port_id: n };
  })();

  return {
    /** Same as `calltype` sent to checklist list APIs (call_type_id as string) */
    callTypeIdForChecklist: calltypePayload,
    calltypePayload,
    portIdForApi,
    portPayload,
    vesselIdRaw: hasVessel ? vesselIdRaw : undefined,
    bargeIdRaw: hasBarge ? bargeIdRaw : undefined,
    /** Prefer raw id for API (backend accepts string or number) */
    vesselTypeIdForApi: hasVessel ? vesselIdRaw : undefined,
    bargeTypeIdForApi: hasBarge ? bargeIdRaw : undefined,
    hasVessel,
    hasBarge,
    callDetailLoading: !!callDetailLoading,
    useChecklistMock: !!useChecklistMock,
    displayCallType: displayCallType != null ? String(displayCallType) : "",
    displayPort: displayPort != null ? String(displayPort) : "",
    displayVessel: displayVessel != null ? String(displayVessel) : "",
    displayBarge: displayBarge != null ? String(displayBarge) : "",
  };
}
