/**
 * Normalizes API list payloads to a plain array.
 */
export function unwrapListResponse(payload) {
  const raw = payload?.data ?? payload ?? [];
  return Array.isArray(raw) ? raw : [];
}

export function mapOperatorsToOptions(rows) {
  return (rows || []).map((r) => ({
    value: String(r.user_id),
    label: r.user_name ?? '',
  }));
}

export function mapPortsToOptions(rows) {
  return (rows || []).map((r) => ({
    value: String(r.port_id),
    label: r.port ?? '',
  }));
}

export function mapCallTypesToOptions(rows) {
  return (rows || []).map((r) => ({
    value: String(r.call_type_id),
    label: r.call_type ?? '',
  }));
}

export function mapBillingEntitiesToOptions(rows) {
  return (rows || []).map((r) => {
    const code = r.customer_code ?? '';
    const name = r.billing_entity ?? '';
    const label = code && name ? `${code} - ${name}` : name || code || String(r.entity_id ?? '');
    return {
      value: String(r.entity_id),
      label,
    };
  });
}

export function mapVesselTypesToOptions(rows) {
  return (rows || []).map((r) => ({
    value: String(r.vessel_type_id),
    label: r.vessel_type ?? '',
  }));
}

export function mapBargeTypesToOptions(rows) {
  return (rows || []).map((r) => ({
    value: String(r.barge_type_id),
    label: r.barge_type ?? '',
  }));
}

/** Ensures the current form value appears in the dropdown when edit payload has an id not returned in the list. */
export function mergeOptionIfMissing(options, rawValue, fallbackLabel) {
  if (rawValue === undefined || rawValue === null || rawValue === '') return options;
  const v = String(rawValue);
  if (options.some((o) => String(o.value) === v)) return options;
  return [...options, { value: v, label: fallbackLabel ?? `(${v})` }];
}
