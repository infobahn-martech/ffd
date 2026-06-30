export const TASK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export const DOCUMENT_STATUS = {
  PENDING: "Pending",
  UPLOADED: "Uploaded",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

const TASK_STATUS_VALUES = new Set(Object.values(TASK_STATUS));
const DOCUMENT_STATUS_VALUES = new Set(Object.values(DOCUMENT_STATUS));

function isDocumentCompleted(doc) {
  return String(doc?.status ?? "") === "1";
}

function getTaskProgressFromDocuments(documents) {
  if (!Array.isArray(documents) || documents.length === 0) return 0;
  const completedCount = documents.filter(isDocumentCompleted).length;
  return Math.round((completedCount / documents.length) * 100);
}

function parsePercentage(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function parseCount(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
}

function normalizeTaskStatus(status) {
  const trimmed = String(status ?? "").trim();
  if (TASK_STATUS_VALUES.has(trimmed)) return trimmed;

  const match = Object.values(TASK_STATUS).find(
    (value) => value.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? TASK_STATUS.PENDING;
}

function getTaskStatusFromProgress(progress) {
  if (progress >= 100) return TASK_STATUS.COMPLETED;
  if (progress > 0) return TASK_STATUS.IN_PROGRESS;
  return TASK_STATUS.PENDING;
}

export function mapDocumentStatus(status) {
  const key = String(status ?? "0").trim();

  if (DOCUMENT_STATUS_VALUES.has(key)) return key;

  switch (key) {
    case "1":
      return DOCUMENT_STATUS.UPLOADED;
    case "2":
      return DOCUMENT_STATUS.VERIFIED;
    case "3":
      return DOCUMENT_STATUS.REJECTED;
    default:
      return DOCUMENT_STATUS.PENDING;
  }
}

function mapDocuments(documents) {
  if (!Array.isArray(documents)) return [];

  return documents.map((doc, index) => ({
    id: String(doc?.document_id ?? doc?.id ?? `${doc?.document_name ?? "doc"}-${index}`),
    name: String(doc?.document_name ?? "Untitled document"),
    status: mapDocumentStatus(doc?.status),
  }));
}

export function mapTasksToSections(apiData) {
  if (!Array.isArray(apiData) || apiData.length === 0) return [];

  const sectionMap = new Map();
  const sectionOrder = [];

  apiData.forEach((task) => {
    const roleKey = String(task?.role_id ?? task?.role_name ?? "unknown");
    if (!sectionMap.has(roleKey)) {
      sectionMap.set(roleKey, {
        id: roleKey,
        title: String(task?.role_name ?? "Unassigned"),
        tasks: [],
      });
      sectionOrder.push(roleKey);
    }

    const documents = mapDocuments(task?.documents);
    const progress =
      parsePercentage(task?.documents_uploaded_percentage) ??
      getTaskProgressFromDocuments(Array.isArray(task?.documents) ? task.documents : []);

    const status = task?.task_status
      ? normalizeTaskStatus(task.task_status)
      : getTaskStatusFromProgress(progress);

    const documentCount = task?.documents_count != null
      ? parseCount(task.documents_count, documents.length)
      : documents.length;

    sectionMap.get(roleKey).tasks.push({
      id: String(task?.task_id ?? task?.card_id ?? task?.task_name ?? ""),
      title: String(task?.task_name ?? "Untitled task"),
      assignedTo: String(task?.assigned_user ?? ""),
      status,
      documentCount,
      progress,
      documents,
      sadadDocNo: task?.sadad_doc_no || "",
      sadadDocument: task?.sadad_doc || "",
      sadadExpiry: task?.sadad_expiry || "",
      mwpApplicationNo: task?.mwp_ticket_no || task?.mwp_application_no || "",
      sadadNo: task?.sadad_no || "",
      mwpSubscriptionSadadNo: task?.mwp_subscription_sadad_no || "",
      mwpSubscriptionSadadDoc: task?.mwp_subscription_sadad_doc_url || task?.mwp_subscription_sadad_doc || "",
      mwpCopy: task?.mwp_doc_url || task?.mwp_doc || task?.mwp_copy || "",
      mwpSubscriptionTaxInvoice: task?.mwp_subscription_tax_invoice_doc_url || task?.mwp_subscription_tax_invoice_doc || "",
    });
  });

  return sectionOrder.map((key) => sectionMap.get(key));
}

/** @deprecated Use mapTasksToSections */
export const mapCallTasksToSections = mapTasksToSections;
