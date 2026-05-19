import PropTypes from "prop-types";

const TASK_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

const STATUS_CLASS_MAP = {
  [TASK_STATUS.PENDING]: "operation-task-status--pending",
  [TASK_STATUS.IN_PROGRESS]: "operation-task-status--in-progress",
  [TASK_STATUS.COMPLETED]: "operation-task-status--completed",
  [TASK_STATUS.REJECTED]: "operation-task-status--rejected",
};

const dummyTasks = [
  {
    id: 1,
    title: "GRO",
    assignedTo: "Port Operations Team",
    status: TASK_STATUS.IN_PROGRESS,
    remarks: "Berthing request submitted; awaiting terminal confirmation.",
  },
  {
    id: 2,
    title: "Custom Clearance",
    assignedTo: "Customs Liaison Unit",
    status: TASK_STATUS.PENDING,
    remarks: "Import declaration draft prepared; pending vessel ETA confirmation.",
  },
  {
    id: 3,
    title: "Marine Work Permit",
    assignedTo: "Marine Services Desk",
    status: TASK_STATUS.COMPLETED,
    remarks: "Permit issued and uploaded to vessel file; valid through departure.",
  },
  {
    id: 4,
    title: "Immigration Clearance",
    assignedTo: "Crew Affairs Team",
    status: TASK_STATUS.IN_PROGRESS,
    remarks: "Crew list verified; immigration appointment scheduled on arrival.",
  },
  {
    id: 5,
    title: "Port Entry Approval",
    assignedTo: "Harbor Master Office",
    status: TASK_STATUS.COMPLETED,
    remarks: "Port entry approval received and shared with agent and master.",
  },
  {
    id: 6,
    title: "Berth Allocation",
    assignedTo: "Terminal Coordination",
    status: TASK_STATUS.PENDING,
    remarks: "Preferred berth requested; terminal reviewing availability.",
  },
  {
    id: 7,
    title: "Cargo Documentation",
    assignedTo: "Documentation Control",
    status: TASK_STATUS.REJECTED,
    remarks: "Manifest mismatch on line items 12–14; revised B/L required from shipper.",
  },
  {
    id: 8,
    title: "Crew Transport Arrangement",
    assignedTo: "Logistics & Transport",
    status: TASK_STATUS.IN_PROGRESS,
    remarks: "Airport pickup and hotel transfer slots reserved for joining crew.",
  },
  {
    id: 9,
    title: "Medical Clearance",
    assignedTo: "Health & Safety Unit",
    status: TASK_STATUS.COMPLETED,
    remarks: "Port health declaration accepted; no quarantine restrictions applied.",
  },
  {
    id: 10,
    title: "Security Gate Pass",
    assignedTo: "Port Security Office",
    status: TASK_STATUS.REJECTED,
    remarks: "Visitor pass application declined; missing company authorization letter.",
  },
];

function TaskStatusBadge({ status }) {
  const statusClass = STATUS_CLASS_MAP[status] || STATUS_CLASS_MAP[TASK_STATUS.PENDING];

  return (
    <span className={`operation-task-status ${statusClass}`}>
      {status}
    </span>
  );
}

TaskStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

function TaskTab({
  card,
  formValues,
  handleChange,
  cardColor,
  isViewOnly = false,
  callId = "",
}) {
  const tasks = dummyTasks;

  return (
    <div className="cardform-left-full operation-task-tab" style={{ "--card-color": cardColor }}>
      <div className="operation-content-header">
        <h3 className="operation-content-title">Tasks</h3>
      </div>

      <div className="operation-task-tab-body">
        <div className="operation-task-card">
          <div className="operation-task-card-header">
            <span className="operation-task-card-title">Operation Tasks</span>
          </div>

          <ul className="operation-task-list" role="list">
            {tasks.map((task) => (
              <li key={task.id} className="operation-task-row" role="listitem">
                <div className="operation-task-row-main">
                  <span className="operation-task-name">{task.title}</span>
                  <TaskStatusBadge status={task.status} />
                </div>
                <div className="operation-task-row-meta">
                  <span className="operation-task-meta-item">
                    <span className="operation-task-meta-label">Assigned</span>
                    <span className="operation-task-meta-value">
                      {task.assignedTo || "Unassigned"}
                    </span>
                  </span>
                  <span className="operation-task-meta-item">
                    <span className="operation-task-meta-label">Remarks</span>
                    <span className="operation-task-meta-value operation-task-meta-value--remarks">
                      {task.remarks || "—"}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {isViewOnly ? (
          <p className="operation-task-view-only-note">Tasks are read-only in this view.</p>
        ) : null}
      </div>
    </div>
  );
}

TaskTab.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  callId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default TaskTab;
