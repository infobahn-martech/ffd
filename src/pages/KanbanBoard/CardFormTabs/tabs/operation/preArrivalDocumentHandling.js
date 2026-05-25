/**
 * Pre-Arrival "Document Handling" state (GRO / Custom Clearance).
 * Rows are API-friendly: { id, name, is_required, files } where files is an attachment array.
 */

export const DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING = {
  selectedProcesses: {
    gro: false,
    customClearance: false,
  },
  roleGroups: [],
  documents: {
    gro: [],
    customClearance: [],
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
      name: row.document_name || row.documentName || row.label || row.name || "Document",
      document_name: row.document_name || row.documentName || row.label || row.name || "Document",
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

function roleNameToProcessKey(roleName) {
  const normalized = String(roleName || "").trim().toLowerCase();
  if (/gro/.test(normalized)) return "gro";
  if (/custom\s*clearance/.test(normalized)) return "customClearance";
  return null;
}

function mapChecklistItemRows(items) {
  return (Array.isArray(items) ? items : []).map((item, index) => {
    const checklistItemId = item?.checklist_item_id ?? item?.checklistItemId ?? item?.id;
    const label = String(item?.item_name || item?.itemName || item?.name || "Document").trim();
    const id =
      checklistItemId != null && String(checklistItemId).trim() !== ""
        ? String(checklistItemId)
        : `checklist-item-${index}`;
    return {
      id,
      checklist_item_id: checklistItemId != null ? Number(checklistItemId) : null,
      name: label,
      document_name: label,
      is_required: Boolean(item?.is_required ?? item?.required),
      files: [],
    };
  });
}

/**
 * Maps `pre_arrival/get_checklist_items_by_role` `data` into UI role groups (one card per role).
 * @param {Array} apiRoleGroups
 * @returns {Array<{ role_id: number|null, role_name: string, items: object[] }>}
 */
export function mapChecklistRoleGroupsFromApi(apiRoleGroups) {
  return (Array.isArray(apiRoleGroups) ? apiRoleGroups : [])
    .map((group) => ({
      role_id: group?.role_id ?? group?.roleId ?? null,
      role_name: String(group?.role_name || group?.role || "Documents").trim(),
      items: mapChecklistItemRows(group?.items),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * @deprecated Use {@link mapChecklistRoleGroupsFromApi}; kept for callers that bucket by process key.
 */
export function mapChecklistItemsByRoleToDocuments(roleGroups) {
  const out = { gro: [], customClearance: [] };
  for (const group of mapChecklistRoleGroupsFromApi(roleGroups)) {
    const processKey = roleNameToProcessKey(group.role_name);
    if (!processKey) continue;
    out[processKey] = group.items;
  }
  return out;
}

function syncDocumentsFromRoleGroups(roleGroups) {
  const documents = { gro: [], customClearance: [] };
  for (const group of Array.isArray(roleGroups) ? roleGroups : []) {
    const processKey = roleNameToProcessKey(group?.role_name);
    if (processKey) documents[processKey] = group.items || [];
  }
  return documents;
}

function mergeTemplateRowsWithCurrent(templateRows = [], currentRows = []) {
  return templateRows.map((templateRow, index) => {
    const templateId = templateRow?.id != null ? String(templateRow.id) : "";
    const byId = currentRows.find((row) => String(row?.id) === templateId);
    const byChecklistId = currentRows.find(
      (row) =>
        templateRow?.checklist_item_id != null &&
        Number(row?.checklist_item_id ?? row?.document_id) === Number(templateRow.checklist_item_id)
    );
    const byName = currentRows.find(
      (row) =>
        String(row?.document_name || row?.name || "")
          .trim()
          .toLowerCase() ===
        String(templateRow?.document_name || templateRow?.name || "")
          .trim()
          .toLowerCase()
    );
    const matched = byId || byChecklistId || byName;

    return {
      ...templateRow,
      id: templateId || `checklist-item-${index}`,
      files: Array.isArray(matched?.files) ? matched.files : [],
      status: matched?.status ?? templateRow?.status ?? null,
      remarks: matched?.remarks ?? templateRow?.remarks ?? null,
      call_task_document_id:
        matched?.call_task_document_id ?? templateRow?.call_task_document_id ?? null,
      document_id: matched?.document_id ?? templateRow?.document_id ?? templateRow?.checklist_item_id ?? null,
      file_url: matched?.file_url ?? templateRow?.file_url ?? null,
      file_name: matched?.file_name ?? templateRow?.file_name ?? null,
    };
  });
}

/**
 * Applies checklist template rows while preserving uploads/status from existing handling state.
 * @param {object} currentHandling
 * @param {Array} apiRoleGroups — raw `data` from `get_checklist_items_by_role`
 */
export function mergeChecklistItemsIntoDocumentHandling(currentHandling, apiRoleGroups) {
  const base =
    currentHandling && typeof currentHandling === "object"
      ? currentHandling
      : { ...DEFAULT_PRE_ARRIVAL_DOCUMENT_HANDLING };

  const mappedGroups = mapChecklistRoleGroupsFromApi(apiRoleGroups);
  const currentGroups = Array.isArray(base?.roleGroups) ? base.roleGroups : [];

  const roleGroups = mappedGroups.map((apiGroup) => {
    const roleId = apiGroup.role_id != null ? Number(apiGroup.role_id) : null;
    const nameKey = String(apiGroup.role_name || "").trim().toLowerCase();
    const currentGroup = currentGroups.find(
      (group) =>
        (roleId != null && !Number.isNaN(roleId) && Number(group?.role_id) === roleId) ||
        String(group?.role_name || "")
          .trim()
          .toLowerCase() === nameKey
    );
    return {
      role_id: apiGroup.role_id ?? currentGroup?.role_id ?? null,
      role_name: apiGroup.role_name || currentGroup?.role_name || "Documents",
      items: mergeTemplateRowsWithCurrent(apiGroup.items, currentGroup?.items || []),
    };
  });

  const documents = syncDocumentsFromRoleGroups(roleGroups);

  return {
    selectedProcesses: {
      gro: Boolean(base?.selectedProcesses?.gro) || documents.gro.length > 0,
      customClearance:
        Boolean(base?.selectedProcesses?.customClearance) || documents.customClearance.length > 0,
    },
    roleGroups,
    documents: {
      gro: documents.gro,
      customClearance: documents.customClearance,
    },
    stageFiles: Array.isArray(base?.stageFiles) ? base.stageFiles : [],
  };
}

export function collectPreArrivalProcessAttachments(documentHandling) {
  if (!documentHandling) return [];
  const out = [];
  const roleGroups = Array.isArray(documentHandling.roleGroups) ? documentHandling.roleGroups : [];
  if (roleGroups.length) {
    roleGroups.forEach((group) => {
      (group?.items || []).forEach((row) => {
        (row?.files || []).forEach((file) => {
          if (file) out.push(file);
        });
      });
    });
  } else if (documentHandling.documents) {
    ["gro", "customClearance"].forEach((key) => {
      (documentHandling.documents[key] || []).forEach((row) => {
        (row?.files || []).forEach((file) => {
          if (file) out.push(file);
        });
      });
    });
  }
  (documentHandling.stageFiles || []).forEach((file) => {
    if (file) out.push(file);
  });
  return out;
}
