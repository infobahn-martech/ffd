export const TASK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

function isDocumentCompleted(doc) {
  return String(doc?.status ?? "") === "1";
}

function getTaskProgress(documents) {
  if (!Array.isArray(documents) || documents.length === 0) return 0;
  const completedCount = documents.filter(isDocumentCompleted).length;
  return Math.round((completedCount / documents.length) * 100);
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
    const progress = getTaskProgress(documents);

    sectionMap.get(roleKey).tasks.push({
      id: String(task?.task_id ?? task?.card_id ?? task?.task_name ?? ""),
      title: String(task?.task_name ?? "Untitled task"),
      assignedTo: String(task?.assigned_user ?? ""),
      status: getTaskStatusFromProgress(progress),
      documentCount: documents.length,
      progress,
    });
  });

  return sectionOrder.map((key) => sectionMap.get(key));
}
