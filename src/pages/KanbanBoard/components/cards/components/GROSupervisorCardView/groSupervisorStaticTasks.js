/** Static task rows for GRO Supervisor assign tab (until API is wired). */
export const GRO_SUPERVISOR_STATIC_TASKS = [
  { id: "inward-clearance", title: "Inward clearance", statusKey: "pending" },
  { id: "cg-pass", title: "CG pass requests", statusKey: "in_progress" },
  { id: "zawil-pass", title: "Zawil pass requests", statusKey: "pending" },
  { id: "custom-docs", title: "Custom clearance documents", statusKey: "pending" },
  { id: "crew-immigration", title: "Crew immigration batches", statusKey: "overdue" },
  { id: "port-clearance", title: "Port clearance follow-up", statusKey: "assigned" },
  { id: "immigration-batch", title: "Immigration batch review", statusKey: "completed" },
];

export const GRO_SUPERVISOR_TASK_STATUS_META = {
  pending: { label: "Pending", badgeClass: "gro-supervisor-task-status--neutral" },
  assigned: { label: "Assigned", badgeClass: "gro-supervisor-task-status--info" },
  in_progress: { label: "In progress", badgeClass: "gro-supervisor-task-status--warning" },
  completed: { label: "Completed", badgeClass: "gro-supervisor-task-status--success" },
  overdue: { label: "Overdue", badgeClass: "gro-supervisor-task-status--danger" },
};

export const getGroSupervisorTasksForCard = (card) => {
  const cardTitle =
    [card?.task_name, card?.taskName, card?.raw?.task_name, card?.title, card?.cardName, card?.card_name]
      .map((c) => (c != null ? String(c).trim() : ""))
      .find(Boolean) || "";

  const base = [...GRO_SUPERVISOR_STATIC_TASKS];
  if (cardTitle && !base.some((t) => t.title.toLowerCase() === cardTitle.toLowerCase())) {
    return [{ id: "card-primary", title: cardTitle, statusKey: "pending" }, ...base];
  }
  if (cardTitle) {
    return base.map((t, i) =>
      i === 0 && t.id === "inward-clearance" ? { ...t, title: cardTitle } : t
    );
  }
  return base;
};

export const createEmptyTaskAssignment = () => ({
  assignedUserId: "",
  dueDate: "",
  dueTime: "",
  remarks: "",
});

/** Derive display status from static key + assignment progress. */
export const resolveGroSupervisorTaskStatus = (task, assignment) => {
  const hasUser = Boolean(String(assignment?.assignedUserId ?? "").trim());
  const hasDue = Boolean(String(assignment?.dueDate ?? "").trim());

  if (hasUser && hasDue) {
    return GRO_SUPERVISOR_TASK_STATUS_META.assigned;
  }
  if (hasUser) {
    return GRO_SUPERVISOR_TASK_STATUS_META.in_progress;
  }

  const key = task?.statusKey ?? "pending";
  return GRO_SUPERVISOR_TASK_STATUS_META[key] ?? GRO_SUPERVISOR_TASK_STATUS_META.pending;
};
