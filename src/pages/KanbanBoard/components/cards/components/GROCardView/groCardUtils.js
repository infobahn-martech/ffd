// GRO Board card view helpers (no JSX)

/** Document type labels used when API returns no list */
export const GRO_DOCUMENT_TYPES = [
  "Registry",
  "Tonnage",
  "Ship Radio Station License",
  "Maritime Health Declaration",
  "Sanitation Certificate",
  "Last Port clearance",
  "Crew List",
  "Immigration Batches",
];

export const GRO_MAIN_VIEWS = {
  inward: "inward",
  cg: "cg",
  zawil: "zawil",
};

export const splitInwardDateTimeString = (value) => {
  if (value == null || String(value).trim() === "") return { date: "", time: "" };
  const normalized = String(value).trim().includes("T") ? String(value).trim().replace("T", " ") : String(value).trim();
  const [datePart = "", timeRaw = ""] = normalized.split(/\s+/);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return { date: "", time: "" };
  const timeMatch = String(timeRaw).match(/^(\d{1,2}):(\d{2})/);
  const timePart = timeMatch ? `${String(timeMatch[1]).padStart(2, "0")}:${timeMatch[2]}` : "00:00";
  return { date: datePart, time: timePart };
};

export const resolveGroCallId = (card) => {
  const raw = card?.call_id ?? card?.callId ?? card?.id;
  if (raw == null || raw === "") return null;
  return raw;
};

export const buildGroFallbackDocuments = () =>
  GRO_DOCUMENT_TYPES.map((document_name) => ({
    document_name,
    document_id: null,
    call_task_document_id: null,
    is_uploaded: false,
    status: 0,
    file_name: null,
    file_url: null,
    uploaded_by: null,
    uploaded_by_name: null,
    uploaded_at: null,
  }));

export const enrichGroDocWithRowKey = (doc, index) => ({
  ...doc,
  __rowKey:
    doc.call_task_document_id != null
      ? `ctd-${doc.call_task_document_id}`
      : doc.document_id != null
        ? `did-${doc.document_id}-${index}`
        : `fb-${index}`,
});

/** GET task_card/get_gro_custom_docs — documents live on first group: response.data.data[0].documents */
export const parseGroDocumentsResponse = (res) => {
  const body = res?.data;
  const group = Array.isArray(body?.data) ? body.data[0] : body?.data;
  const docs = Array.isArray(group?.documents) ? group.documents : [];
  return docs;
};

export const groApiErrorMessage = (err, fallback) =>
  err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? fallback;

/** @returns {"pdf"|"excel"|"word"|"image"|"default"} */
export const getGroFileType = (fileNameOrUrl) => {
  if (fileNameOrUrl == null || typeof fileNameOrUrl !== "string") return "default";
  const trimmed = fileNameOrUrl.trim();
  if (!trimmed) return "default";
  const noQuery = trimmed.split("?")[0].split("#")[0];
  const segment = noQuery.includes("/") ? noQuery.slice(noQuery.lastIndexOf("/") + 1) : noQuery;
  const dot = segment.lastIndexOf(".");
  const ext = dot >= 0 ? segment.slice(dot + 1).toLowerCase() : "";
  if (ext === "pdf") return "pdf";
  if (ext === "xls" || ext === "xlsx" || ext === "csv") return "excel";
  if (ext === "doc" || ext === "docx") return "word";
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") return "image";
  return "default";
};

export const GRO_FILE_BADGE = { pdf: "PDF", excel: "XLS", word: "DOC", image: "IMG", default: "" };

export const firstNonEmptyGroDisplay = (...candidates) => {
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    const s = String(c).trim();
    if (s !== "") return s;
  }
  return "-";
};

/** Title-case all-caps API labels (e.g. "CREW LIST"); leave mixed-case strings unchanged. */
export const formatGroDocumentDisplayName = (raw) => {
  if (raw == null) return "";
  const t = String(raw).trim();
  if (!t) return "";
  if (/[a-z]/.test(t)) return t;
  return t.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

export const parseGroPassRequestsResponse = (res) => {
  const data = res?.data?.data ?? res?.data ?? {};
  return {
    cg: Array.isArray(data.cg) ? data.cg : [],
    zawil: Array.isArray(data.zawil) ? data.zawil : [],
  };
};

/** Plain text for table cells; safe for strings that may contain HTML fragments. */
export const stripGroHtmlToPlainText = (value) => {
  if (value == null) return "";
  const s = String(value);
  if (s.trim() === "") return "";
  if (typeof window !== "undefined" && typeof DOMParser !== "undefined") {
    try {
      const doc = new DOMParser().parseFromString(`<div>${s}</div>`, "text/html");
      const text = doc.body.textContent ?? "";
      return text.replace(/\s+/g, " ").trim();
    } catch {
      /* fall through */
    }
  }
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
};

export const groPassCrewRowFields = (crew) => {
  let remarks = firstNonEmptyGroDisplay(crew.remarks, crew.remark, crew.note);
  if (remarks !== "-") {
    const plain = stripGroHtmlToPlainText(remarks);
    remarks = plain !== "" ? plain : "-";
  }
  return {
    crewName: firstNonEmptyGroDisplay(crew.crew_name, crew.name, crew.full_name, crew.crewName),
    passport: firstNonEmptyGroDisplay(
      crew.passport_no,
      crew.passport_number,
      crew.passport,
      crew.passportNo
    ),
    nationality: firstNonEmptyGroDisplay(crew.nationality, crew.nationality_name),
    rank: firstNonEmptyGroDisplay(crew.rank, crew.rank_name, crew.crew_rank),
    movementType: firstNonEmptyGroDisplay(crew.movement_type, crew.movement, crew.movementType),
    status: firstNonEmptyGroDisplay(crew.status, crew.pass_status, crew.request_status, crew.state),
    requestedDate: firstNonEmptyGroDisplay(
      crew.requested_date,
      crew.request_date,
      crew.created_at,
      crew.date_requested
    ),
    remarks,
    documentUrl:
      crew.document_url != null && String(crew.document_url).trim() !== ""
        ? String(crew.document_url).trim()
        : "",
  };
};

export const groPassStatusBadgeTone = (raw) => {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s || s === "-") return "neutral";
  const n = Number(s);
  if (n === 1) return "success";
  if (n === 2) return "danger";
  if (/reject|denied|failed|fail|cancel/.test(s)) return "danger";
  if (/approv|accept|verified|complete|done|clear|issued|pass/.test(s)) return "success";
  if (/pend|wait|submitted|progress|open|draft|review/.test(s)) return "warning";
  return "neutral";
};

export const groPassTaskDocUrl = (td) =>
  firstNonEmptyGroDisplay(td?.file_url, td?.document_url, td?.url, td?.download_url);

export const groPassTaskDocLabel = (td, index) =>
  firstNonEmptyGroDisplay(td?.document_name, td?.file_name, td?.name, td?.title, `File ${index + 1}`);
