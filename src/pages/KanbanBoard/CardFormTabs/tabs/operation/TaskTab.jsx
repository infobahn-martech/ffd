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

const dummyTaskSections = [
  {
    id: 1,
    title: "GRO",
    tasks: [
      {
        id: 101,
        title: "Vessel Registration",
        assignedTo: "Port Operations Team",
        status: TASK_STATUS.IN_PROGRESS,
        remarks: "Registration documents submitted.",
      },
      {
        id: 102,
        title: "Inward Clearance",
        assignedTo: "Port Operations Team",
        status: TASK_STATUS.PENDING,
        remarks: "Awaiting vessel ETA and cargo manifest finalization.",
      },
      {
        id: 103,
        title: "CG Pass",
        assignedTo: "Port Security Office",
        status: TASK_STATUS.COMPLETED,
        remarks: "Coast guard passes issued for listed crew and visitors.",
      },
    ],
  },
  {
    id: 2,
    title: "Custom Clearance",
    tasks: [
      {
        id: 201,
        title: "Import Declaration",
        assignedTo: "Customs Liaison Unit",
        status: TASK_STATUS.PENDING,
        remarks: "Declaration draft prepared; pending vessel arrival confirmation.",
      },
      {
        id: 202,
        title: "Bayan Document",
        assignedTo: "Customs Liaison Unit",
        status: TASK_STATUS.IN_PROGRESS,
        remarks: "Bayan filing in progress with supporting invoices attached.",
      },
    ],
  },
  {
    id: 3,
    title: "Marine Work Permit",
    tasks: [
      {
        id: 301,
        title: "Permit Application",
        assignedTo: "Marine Services Desk",
        status: TASK_STATUS.COMPLETED,
        remarks: "Permit issued and uploaded to vessel file; valid through departure.",
      },
    ],
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
  const taskSections = dummyTaskSections;

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
            {taskSections.map((section) => (
              <li key={section.id} className="operation-task-section">
                <div className="operation-task-section-head">
                  <h4 className="operation-task-section-title" id={`operation-task-section-${section.id}`}>
                    {section.title}
                  </h4>
                </div>

                <ul
                  className="operation-task-section-list"
                  role="list"
                  aria-labelledby={`operation-task-section-${section.id}`}
                >
                  {section.tasks.map((task) => (
                    <li key={task.id} className="operation-task-row operation-task-row--nested" role="listitem">
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
