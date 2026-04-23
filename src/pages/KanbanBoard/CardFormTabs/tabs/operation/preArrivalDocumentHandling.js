/**
 * Pre-Arrival "Document Handling" state (GRO / Custom Clearance).
 * Rows are API-friendly: { id, name, is_required, file } where file matches attachment shape or null.
 */

export const DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING = {
  selectedProcesses: {
    gro: false,
    customClearance: false,
  },
  documents: {
    gro: [
      { id: "pre-gro-1", name: "GRO appointment confirmation", is_required: true, file: null },
      { id: "pre-gro-2", name: "Berthing allocation (GRO)", is_required: false, file: null },
    ],
    customClearance: [
      { id: "pre-cc-1", name: "Customs import declaration", is_required: true, file: null },
      { id: "pre-cc-2", name: "Bill of lading / cargo manifest", is_required: true, file: null },
      { id: "pre-cc-3", name: "Delivery order", is_required: false, file: null },
    ],
  },
};

/**
 * @param {object} apiPayload — future: e.g. { gro: [...], custom_clearance: [...] }
 * @returns {typeof DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING}
 */
export function mapPreArrivalDocumentsFromApi(apiPayload) {
  if (!apiPayload || typeof apiPayload !== "object") {
    return { ...DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING, documents: { ...DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.documents } };
  }
  const groRaw = apiPayload.gro ?? apiPayload.gro_documents;
  const ccRaw = apiPayload.custom_clearance ?? apiPayload.customClearance ?? apiPayload.custom_clearance_documents;

  const mapRows = (rows) =>
    (Array.isArray(rows) ? rows : []).map((row, i) => ({
      id: row.id != null ? String(row.id) : `api-row-${i}`,
      name: row.name || row.document_name || row.label || "Document",
      is_required: Boolean(row.is_required ?? row.required),
      file: row.file ?? null,
    }));

  return {
    selectedProcesses: {
      gro: Boolean(apiPayload.selectedProcesses?.gro ?? apiPayload.gro_enabled),
      customClearance: Boolean(apiPayload.selectedProcesses?.customClearance ?? apiPayload.custom_clearance_enabled),
    },
    documents: {
      gro: mapRows(groRaw).length ? mapRows(groRaw) : DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.documents.gro.map((d) => ({ ...d, file: null })),
      customClearance: mapRows(ccRaw).length
        ? mapRows(ccRaw)
        : DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.documents.customClearance.map((d) => ({ ...d, file: null })),
    },
  };
}

export function collectPreArrivalProcessAttachments(documentHandling) {
  if (!documentHandling?.documents) return [];
  const out = [];
  ["gro", "customClearance"].forEach((key) => {
    (documentHandling.documents[key] || []).forEach((row) => {
      if (row?.file) out.push(row.file);
    });
  });
  return out;
}
