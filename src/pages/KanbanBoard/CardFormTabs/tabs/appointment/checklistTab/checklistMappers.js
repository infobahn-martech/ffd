/** Splits checklist labels into title + requirement suffix for hierarchy (display only). */
export const CHECKLIST_LABEL_SUFFIX_RE =
  /^(.+?)\s+(ORIGINAL REQUIRED|REQUIRE COPY ONLY|COPY ONLY FORMAT ATTACHED)$/i;

export const parseChecklistLabel = (label) => {
  if (!label || typeof label !== "string") {
    return { primary: "", badge: null };
  }
  const m = label.match(CHECKLIST_LABEL_SUFFIX_RE);
  if (!m) {
    return { primary: label.trim(), badge: null };
  }
  return { primary: m[1].trim(), badge: m[2] };
};

/** Sort key for string/number order fields (sort_order, item_order, etc.) */
export const sortByOrderKey = (a, b, key) => {
  const va = a?.[key];
  const vb = b?.[key];
  const na = Number(va);
  const nb = Number(vb);
  if (va != null && vb != null && !Number.isNaN(na) && !Number.isNaN(nb)) {
    return na - nb;
  }
  return String(va ?? "").localeCompare(String(vb ?? ""), undefined, { numeric: true, sensitivity: "base" });
};

/** Normalize GET checklist/get_checklist_by_id — supports { status, checklist_details, data } */
export const mapGetChecklistByIdResponse = (apiData) => {
  if (!apiData) return { checklistDetails: null, sections: [] };
  const raw = apiData.checklist_details;
  const sections = Array.isArray(apiData.data)
    ? apiData.data
    : Array.isArray(raw?.sections)
      ? raw.sections
      : [];
  const base = raw && typeof raw === "object" ? raw : {};
  const checklistDetails = {
    ...base,
    checklist_name: base?.checklist_name ?? apiData.checklist_name ?? "",
  };
  return { checklistDetails, sections };
};

/**
 * Normalize various API list shapes to an array of checklist type rows.
 * Supports: { data: [...] }, { data: {...} }, [...], { checklist_type_id, ... }.
 */
export const extractChecklistTypeRows = (payload) => {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];

  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data != null && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return [payload.data];
  }

  const hasChecklistTypeId = payload?.checklist_type_id != null && String(payload.checklist_type_id).trim() !== "";
  if (hasChecklistTypeId) {
    return [payload];
  }

  if (Array.isArray(payload.checklists)) return payload.checklists;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
};

export const mergeChecklistTypeOptions = (lists) => {
  const map = new Map();
  lists.flat().forEach((row) => {
    const id = row?.checklist_type_id ?? row?.id;
    if (id == null || id === "") return;
    const key = String(id);
    if (!map.has(key)) {
      map.set(key, {
        value: key,
        label: String(row.checklist_name ?? row.name ?? `Checklist ${key}`).trim() || `Checklist ${key}`,
      });
    }
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Map document_details + item to requirement badge + row fields.
 * Matches expected API: require_copy_only, description, item_name, etc.
 */
export const mapDocumentDetailsToRequirement = (item) => {
  const dd = item?.document_details ?? {};
  const desc = dd.description != null && String(dd.description).trim() ? String(dd.description).trim() : "";
  const copyOnly = dd.require_copy_only ?? dd.required_copy_only ?? dd.is_copy_required;

  if (copyOnly) {
    return { variant: "copy_only", label: "Require Copy Only" };
  }
  if (/format\s*attached|copy\s*only\s*format/i.test(desc)) {
    return { variant: "format", label: "Copy Only Format Attached" };
  }
  if (/require\s*copy\s*only|^copy\s*only$/i.test(desc) || /copy\s*only/i.test(desc)) {
    return { variant: "copy_only", label: "Require Copy Only" };
  }
  if (/original\s*required/i.test(desc) || (/\boriginal\b/i.test(desc) && /required/i.test(desc))) {
    return { variant: "original", label: "Original Required" };
  }
  if (desc) {
    return { variant: "custom", label: desc.length > 48 ? `${desc.slice(0, 45)}…` : desc };
  }
  return { variant: "none", label: null };
};

export const buildLabelFromApiItem = (item) => {
  const name = (item?.item_name ?? "").trim();
  const dd = item?.document_details ?? {};
  const copyOnly = dd.require_copy_only ?? dd.required_copy_only ?? dd.is_copy_required;
  let suffix = "";
  if (copyOnly) suffix = "REQUIRE COPY ONLY";
  else if (dd.description) {
    const d = String(dd.description).trim();
    if (/copy\s*only/i.test(d)) suffix = "REQUIRE COPY ONLY";
    else if (/original/i.test(d)) suffix = "ORIGINAL REQUIRED";
    else if (/format attached/i.test(d)) suffix = "COPY ONLY FORMAT ATTACHED";
    else suffix = d.toUpperCase();
  }
  return suffix ? `${name} ${suffix}` : name;
};

const mapItemToRow = (it, i, sectionId) => {
  const iid = it.checklist_item_id ?? i;
  const itemId = `${sectionId}_item_${iid}`;
  const fullLabel = buildLabelFromApiItem(it);
  const { primary: title, badge: parsedBadge } = parseChecklistLabel(fullLabel);
  const dd = it?.document_details ?? {};
  const rawCopyOnly = dd.require_copy_only;
  const requireCopyOnlyFromApi =
    rawCopyOnly === true
    || rawCopyOnly === 1
    || String(rawCopyOnly) === "1"
    || String(rawCopyOnly).toLowerCase() === "true";
  const req = mapDocumentDetailsToRequirement(it);
  let requirement =
    req.variant !== "none" && req.label
      ? { variant: req.variant, label: req.label }
      : parsedBadge
        ? { variant: "custom", label: parsedBadge }
        : { variant: "none", label: null };

  const itemDesc =
    (it.item_description != null && String(it.item_description).trim()) ||
    (it.description != null && String(it.description).trim()) ||
    (dd.notes != null && String(dd.notes).trim()) ||
    "";

  const uploadedFromApi = [];
  const rawFiles = dd.uploaded_files ?? it.uploaded_files;
  if (Array.isArray(rawFiles)) {
    rawFiles.forEach((f, fi) => {
      const fileName = f.file_name ?? f.name ?? f.filename ?? "File";
      const fileUrl = f.file_url ?? f.url ?? f.link ?? null;
      uploadedFromApi.push({
        id: f.id ?? f.file_id ?? `api_${itemId}_${fi}`,
        name: fileName,
        fileName,
        size: f.size,
        url: fileUrl,
        link: fileUrl,
        fromApi: true,
      });
    });
  }

  return {
    id: itemId,
    title: title || (it?.item_name ?? "").trim() || "Item",
    description: itemDesc,
    fullLabel: fullLabel || title,
    requirement,
    requireCopyOnlyFromApi,
    expiryDateRequired: String(it.expiry_date_reqd) === "1" || it.expiry_date_reqd === 1,
    uploadedFromApi,
  };
};

const mapItems = (items, sectionId) => {
  if (!Array.isArray(items)) return [];
  const sorted = [...items].sort((a, b) => sortByOrderKey(a, b, "item_order"));
  return sorted.map((it, i) => mapItemToRow(it, i, sectionId));
};

/**
 * Nested tree: main sections with sub_sections[]; items[] on each node.
 * Preserves API shape for UI accordions.
 */
export const mapApiSectionsToTree = (sections, checklistTypeIdStr, checklistName) => {
  const result = [];

  const mapNested = (sub, j, parentSectionId, depth) => {
    const ssid = sub.checklist_section_id ?? `sub_${j}`;
    const subId = `${parentSectionId}_sub_${ssid}`;
    const subItems = mapItems(sub.items, subId);
    const deeperRaw = sub.sub_sections;
    const sortedDeeper = Array.isArray(deeperRaw) && deeperRaw.length
      ? [...deeperRaw].sort((a, b) => sortByOrderKey(a, b, "sort_order"))
      : [];
    const deeper = sortedDeeper.length ? sortedDeeper.map((s, k) => mapNested(s, k, subId, depth + 1)) : [];
    return {
      id: subId,
      title: sub.title || "",
      items: subItems,
      subSections: deeper,
      checklistType: checklistTypeIdStr,
      checklistTypeTitle: checklistName,
      depth,
      parentId: parentSectionId,
    };
  };

  const walk = (secList) => {
    if (!Array.isArray(secList)) return;
    const rootSorted = [...secList].sort((a, b) => sortByOrderKey(a, b, "sort_order"));
    rootSorted.forEach((sec, idx) => {
      const sid = sec.checklist_section_id ?? `idx_${idx}`;
      const sectionId = `ct_${checklistTypeIdStr}_sec_${sid}`;
      const items = mapItems(sec.items, sectionId);
      const subRaw = sec.sub_sections;
      const subSorted = Array.isArray(subRaw) && subRaw.length
        ? [...subRaw].sort((a, b) => sortByOrderKey(a, b, "sort_order"))
        : [];
      const subSections = subSorted.length ? subSorted.map((sub, j) => mapNested(sub, j, sectionId, 1)) : [];
      result.push({
        id: sectionId,
        title: sec.title || "",
        items,
        subSections,
        checklistType: checklistTypeIdStr,
        checklistTypeTitle: checklistName,
        depth: 0,
        parentId: null,
      });
    });
  };

  walk(sections);
  return result;
};

/** Flatten all item rows in tree for state initialization / report (DFS). */
export const flattenTreeItems = (nodes) => {
  const out = [];
  const walk = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((node) => {
      node.items?.forEach((it) => out.push(it));
      if (node.subSections?.length) walk(node.subSections);
    });
  };
  walk(nodes);
  return out;
};

/**
 * @deprecated use mapApiSectionsToTree — kept for reference during migration
 */
export const flattenApiSectionsToUi = (sections, checklistTypeIdStr, checklistName) => {
  const tree = mapApiSectionsToTree(sections, checklistTypeIdStr, checklistName);
  const flat = [];
  const walk = (list) => {
    list.forEach((node) => {
      flat.push({
        id: node.id,
        title: node.title,
        items: node.items,
        checklistType: node.checklistType,
        checklistTypeTitle: node.checklistTypeTitle,
      });
      if (node.subSections?.length) walk(node.subSections);
    });
  };
  walk(tree);
  return flat;
};

const itemIsDone = (itemId, itemsData) => {
  const d = itemsData[itemId] || {};
  return d.checked === true;
};

export const countTreeItems = (nodes) => {
  let n = 0;
  const walk = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((node) => {
      n += node.items?.length ?? 0;
      if (node.subSections?.length) walk(node.subSections);
    });
  };
  walk(nodes);
  return n;
};

export const countTreeCompleted = (nodes, itemsData) => {
  let c = 0;
  const walk = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((node) => {
      (node.items || []).forEach((it) => {
        if (itemIsDone(it.id, itemsData)) c += 1;
      });
      if (node.subSections?.length) walk(node.subSections);
    });
  };
  walk(nodes);
  return c;
};

export const countNodeItems = (node) => {
  let n = node.items?.length ?? 0;
  (node.subSections || []).forEach((s) => {
    n += countNodeItems(s);
  });
  return n;
};

export const countNodeCompleted = (node, itemsData) => {
  let c = 0;
  (node.items || []).forEach((it) => {
    if (itemIsDone(it.id, itemsData)) c += 1;
  });
  (node.subSections || []).forEach((s) => {
    c += countNodeCompleted(s, itemsData);
  });
  return c;
};

export const collectItemIds = (nodes) => {
  const ids = [];
  const walk = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((node) => {
      (node.items || []).forEach((it) => ids.push(it.id));
      if (node.subSections?.length) walk(node.subSections);
    });
  };
  walk(nodes);
  return ids;
};

export const collectTreeSectionIds = (nodes) => {
  const ids = [];
  const walk = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach((node) => {
      ids.push(node.id);
      if (node.subSections?.length) walk(node.subSections);
    });
  };
  walk(nodes);
  return ids;
};

/** All checklist item ids under a section node (items on this node + descendant sections). */
export const collectNodeItemIds = (node) => {
  if (!node) return [];
  const out = [];
  (node.items || []).forEach((it) => out.push(it.id));
  (node.subSections || []).forEach((s) => out.push(...collectNodeItemIds(s)));
  return out;
};

/** Find a section by id in one or more trees and return all item ids under it. */
export const collectItemIdsUnderSectionInBlocks = (blocks, sectionId) => {
  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return undefined;
    for (const n of nodes) {
      if (n.id === sectionId) return collectNodeItemIds(n);
      const inner = walk(n.subSections);
      if (inner !== undefined) return inner;
    }
    return undefined;
  };
  for (const b of blocks || []) {
    const found = walk(b.tree);
    if (found !== undefined) return found;
  }
  return [];
};

export const buildChecklistReportLines = (blocks, itemsData) => {
  const lines = [];
  const fileLabel = (d) => d.uploadedFile?.name || d.uploadedFile?.fileName;
  const itemLine = (item) => {
    const d = itemsData[item.id] || {};
    const fn = fileLabel(d);
    const hasApi = Array.isArray(d.apiUploadedFiles) && d.apiUploadedFiles.length > 0;
    const markedDone = d.checked === true;
    lines.push(`  • ${item.fullLabel || item.title}`);
    lines.push(
      `    Done (manual): ${markedDone ? "Yes" : "No"} | New upload: ${fn || "—"} | Existing on file: ${hasApi ? "Yes" : "No"}`
    );
    if (d.expiryDate) lines.push(`    Expiry: ${d.expiryDate}`);
    if (d.remarks) lines.push(`    Remarks: ${d.remarks}`);
  };
  const walk = (nodes, depth) => {
    (nodes || []).forEach((n) => {
      const pad = "  ".repeat(Math.min(depth, 4));
      lines.push(`${pad}— ${n.title || "Section"}`);
      (n.items || []).forEach(itemLine);
      if (n.subSections?.length) walk(n.subSections, depth + 1);
    });
  };
  (blocks || []).forEach((b) => {
    lines.push(b.typeName || "Checklist", "");
    walk(b.tree, 0);
    lines.push("");
  });
  return lines;
};
