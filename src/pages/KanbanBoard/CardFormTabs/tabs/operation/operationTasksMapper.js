export const TASK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const TASK_STATUS_VALUES = new Set(Object.values(TASK_STATUS));

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

export function mapCallTasksToSections(apiTasks) {
  if (!Array.isArray(apiTasks) || apiTasks.length === 0) return [];

  const sectionMap = new Map();
  const sectionOrder = [];

  apiTasks.forEach((task) => {
    const roleKey = String(task?.role_id ?? task?.role_name ?? "unknown");
    if (!sectionMap.has(roleKey)) {
      sectionMap.set(roleKey, {
        id: roleKey,
        title: String(task?.role_name ?? "Unassigned"),
        tasks: [],
      });
      sectionOrder.push(roleKey);
    }

    const documents = Array.isArray(task?.documents) ? task.documents : [];
    const progress =
      parsePercentage(task?.documents_uploaded_percentage) ??
      getTaskProgressFromDocuments(documents);

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
    });
  });

  return sectionOrder.map((key) => sectionMap.get(key));
}
