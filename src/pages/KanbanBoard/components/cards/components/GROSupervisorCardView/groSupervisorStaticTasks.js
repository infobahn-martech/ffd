/** Static task rows for GRO Supervisor assign tab (until API is wired). */
export const GRO_SUPERVISOR_STATIC_TASKS = [
  { id: "inward-clearance", title: "Inward clearance", remarks: "Verify inward documents before port entry", statusKey: "pending" },
  { id: "cg-pass", title: "CG pass requests", remarks: "Coordinate with immigration for crew passes", statusKey: "in_progress" },
  { id: "zawil-pass", title: "Zawil pass requests", remarks: "Pending work order confirmation", statusKey: "pending" },
  { id: "custom-docs", title: "Custom clearance documents", remarks: "Bayan upload required from operator", statusKey: "pending" },
  { id: "crew-immigration", title: "Crew immigration batches", remarks: "Batch #12 — overdue submission", statusKey: "overdue" },
  { id: "port-clearance", title: "Port clearance follow-up", remarks: "Assigned to GRO desk — awaiting reply", statusKey: "assigned" },
  { id: "immigration-batch", title: "Immigration batch review", remarks: "Completed and filed", statusKey: "completed" },
  { id: "registry-review", title: "Registry certificate review", remarks: "Document uploaded — pending verification", statusKey: "pending" },
  { id: "tonnage-cert", title: "Tonnage certificate", remarks: "Re-upload requested by supervisor", statusKey: "in_progress" },
  { id: "sanitation-cert", title: "Sanitation certificate", remarks: "Valid until next port call", statusKey: "assigned" },
  { id: "crew-list", title: "Crew list submission", remarks: "Final crew list due 48h before arrival", statusKey: "pending" },
  { id: "last-port-clearance", title: "Last port clearance", remarks: "—", statusKey: "pending" },
  { id: "health-declaration", title: "Maritime health declaration", remarks: "Awaiting signed copy from master", statusKey: "overdue" },
  { id: "radio-license", title: "Ship radio station license", remarks: "Not yet uploaded by operator", statusKey: "pending" },
  { id: "vessel-arrival", title: "Vessel arrival coordination", remarks: "ETA updated — notify customs", statusKey: "in_progress" },
];

export const GRO_SUPERVISOR_TASK_STATUS_META = {
  pending: { label: "Pending", badgeClass: "gro-supervisor-task-status--neutral" },
  assigned: { label: "Assigned", badgeClass: "gro-supervisor-task-status--info" },
  in_progress: { label: "In progress", badgeClass: "gro-supervisor-task-status--warning" },
  completed: { label: "Completed", badgeClass: "gro-supervisor-task-status--success" },
  overdue: { label: "Overdue", badgeClass: "gro-supervisor-task-status--danger" },
};

export const formatGroSupervisorTaskRemarks = (task) => {
  const raw = task?.remarks;
  if (raw == null || String(raw).trim() === "" || String(raw).trim() === "—") {
    return "—";
  }
  return String(raw).trim();
};

export const getGroSupervisorTasksForCard = (card) => {
  const cardTitle =
    [card?.task_name, card?.taskName, card?.raw?.task_name, card?.title, card?.cardName, card?.card_name]
      .map((c) => (c != null ? String(c).trim() : ""))
      .find(Boolean) || "";

  const base = [...GRO_SUPERVISOR_STATIC_TASKS];
  if (cardTitle && !base.some((t) => t.title.toLowerCase() === cardTitle.toLowerCase())) {
    return [
      {
        id: "card-primary",
        title: cardTitle,
        remarks: "Primary task from card",
        statusKey: "pending",
      },
      ...base,
    ];
  }
  if (cardTitle) {
    return base.map((t, i) =>
      i === 0 && t.id === "inward-clearance"
        ? { ...t, title: cardTitle, remarks: t.remarks || "Primary task from card" }
        : t
    );
  }
  return base;
};

export const createEmptyTaskAssignment = () => ({
  assignedUserId: "",
  dueDate: "",
  dueTime: "",
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
