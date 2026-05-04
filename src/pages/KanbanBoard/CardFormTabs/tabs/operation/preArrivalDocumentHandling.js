/**
 * Pre-Arrival "Document Handling" state (GRO / Custom Clearance).
 * Rows are API-friendly: { id, name, is_required, files } where files is an attachment array.
 */

export const DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING = {
  selectedProcesses: {
    gro: false,
    customClearance: false,
  },
  documents: {
    gro: [
      { id: "pre-gro-1", name: "GRO appointment confirmation", is_required: true, files: [] },
      { id: "pre-gro-2", name: "Berthing allocation (GRO)", is_required: false, files: [] },
    ],
    customClearance: [
      { id: "pre-cc-1", name: "Customs import declaration", is_required: true, files: [] },
      { id: "pre-cc-2", name: "Bill of lading / cargo manifest", is_required: true, files: [] },
      { id: "pre-cc-3", name: "Delivery order", is_required: false, files: [] },
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
      files: Array.isArray(row.files)
        ? row.files
        : row.file
          ? [row.file]
          : [],
    }));

  return {
    selectedProcesses: {
      gro: Boolean(apiPayload.selectedProcesses?.gro ?? apiPayload.gro_enabled),
      customClearance: Boolean(apiPayload.selectedProcesses?.customClearance ?? apiPayload.custom_clearance_enabled),
    },
    documents: {
      gro: mapRows(groRaw).length ? mapRows(groRaw) : DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.documents.gro.map((d) => ({ ...d, files: [] })),
      customClearance: mapRows(ccRaw).length
        ? mapRows(ccRaw)
        : DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.documents.customClearance.map((d) => ({ ...d, files: [] })),
    },
  };
}

function cloneDefaultDocumentHandling() {
  return {
    selectedProcesses: { ...DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.selectedProcesses },
    documents: {
      gro: DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.documents.gro.map((row) => ({ ...row, files: [...(row.files || [])] })),
      customClearance: DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING.documents.customClearance.map((row) => ({ ...row, files: [...(row.files || [])] })),
    },
  };
}

export function mergePreArrivalDocumentHandling(currentHandling, apiPayload) {
  const baseCurrent = currentHandling && typeof currentHandling === "object" ? currentHandling : cloneDefaultDocumentHandling();
  const mappedFromApi = mapPreArrivalDocumentsFromApi(apiPayload);

  const mergeRows = (apiRows = [], currentRows = []) =>
    (apiRows || []).map((apiRow, index) => {
      const byId = (currentRows || []).find((row) => String(row?.id) === String(apiRow?.id));
      const byName = (currentRows || []).find(
        (row) => String(row?.name || "").trim().toLowerCase() === String(apiRow?.name || "").trim().toLowerCase()
      );
      const matched = byId || byName;

      return {
        ...apiRow,
        id: apiRow?.id != null ? String(apiRow.id) : `api-row-${index}`,
        files: Array.isArray(matched?.files) ? matched.files : Array.isArray(apiRow?.files) ? apiRow.files : [],
      };
    });

  const nextGroRows = mergeRows(mappedFromApi?.documents?.gro || [], baseCurrent?.documents?.gro || []);
  const nextCustomClearanceRows = mergeRows(
    mappedFromApi?.documents?.customClearance || [],
    baseCurrent?.documents?.customClearance || []
  );

  return {
    selectedProcesses: {
      gro:
        typeof baseCurrent?.selectedProcesses?.gro === "boolean"
          ? baseCurrent.selectedProcesses.gro
          : Boolean(mappedFromApi?.selectedProcesses?.gro),
      customClearance:
        typeof baseCurrent?.selectedProcesses?.customClearance === "boolean"
          ? baseCurrent.selectedProcesses.customClearance
          : Boolean(mappedFromApi?.selectedProcesses?.customClearance),
    },
    documents: {
      gro: nextGroRows.length ? nextGroRows : cloneDefaultDocumentHandling().documents.gro,
      customClearance: nextCustomClearanceRows.length
        ? nextCustomClearanceRows
        : cloneDefaultDocumentHandling().documents.customClearance,
    },
  };
}

export function collectPreArrivalProcessAttachments(documentHandling) {
  if (!documentHandling?.documents) return [];
  const out = [];
  ["gro", "customClearance"].forEach((key) => {
    (documentHandling.documents[key] || []).forEach((row) => {
      (row?.files || []).forEach((file) => {
        if (file) out.push(file);
      });
    });
  });
  (documentHandling.stageFiles || []).forEach((file) => {
    if (file) out.push(file);
  });
  return out;
}
