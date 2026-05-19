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

const DEFAULT_TASKS = [
  {
    id: "gro",
    name: "GRO",
    status: TASK_STATUS.PENDING,
    assignedTo: "",
    remarks: "",
  },
  {
    id: "custom-clearance",
    name: "Custom Clearance",
    status: TASK_STATUS.IN_PROGRESS,
    assignedTo: "Operations Team",
    remarks: "Documentation under review",
  },
  {
    id: "marine-work-permit",
    name: "Marine Work Permit",
    status: TASK_STATUS.COMPLETED,
    assignedTo: "Port Agent",
    remarks: "Permit issued and verified",
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
  const tasks = DEFAULT_TASKS;

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
                  <span className="operation-task-name">{task.name}</span>
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
