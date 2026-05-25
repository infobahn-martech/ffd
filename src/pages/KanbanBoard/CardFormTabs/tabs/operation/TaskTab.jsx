import PropTypes from "prop-types";
import "../../../../../design/scss/operations.scss";

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

const STATUS_PROGRESS_MAP = {
  [TASK_STATUS.PENDING]: 0,
  [TASK_STATUS.IN_PROGRESS]: 50,
  [TASK_STATUS.COMPLETED]: 100,
  [TASK_STATUS.REJECTED]: 0,
};

function getStatusProgress(status) {
  return STATUS_PROGRESS_MAP[status] ?? 0;
}

export const dummyTaskSections = [
  {
    id: 1,
    title: "GRO",
    tasks: [
      {
        id: 101,
        title: "Vessel Registration",
        assignedTo: "Port Operations Team",
        status: TASK_STATUS.IN_PROGRESS,
        documentCount: 2,
      },
      {
        id: 102,
        title: "Inward Clearance",
        assignedTo: "Port Operations Team",
        status: TASK_STATUS.PENDING,
        documentCount: 0,
      },
      {
        id: 103,
        title: "CG Pass",
        assignedTo: "Port Security Office",
        status: TASK_STATUS.COMPLETED,
        documentCount: 4,
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
        documentCount: 1,
      },
      {
        id: 202,
        title: "Bayan Document",
        assignedTo: "Customs Liaison Unit",
        status: TASK_STATUS.IN_PROGRESS,
        documentCount: 3,
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
        documentCount: 2,
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

function TaskProgressIndicator({ status, progress }) {
  const percent =
    typeof progress === "number" && !Number.isNaN(progress)
      ? Math.min(100, Math.max(0, Math.round(progress)))
      : getStatusProgress(status);
  const progressClass =
    percent === 100
      ? "operation-task-progress-fill--completed"
      : percent > 0
        ? "operation-task-progress-fill--in-progress"
        : "operation-task-progress-fill--pending";

  return (
    <div className="operation-task-progress" aria-label={`Task progress ${percent}%`}>
      <span className="operation-task-detail-label">Progress:</span>
      <div className="operation-task-progress-body">
        <div
          className="operation-task-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div
            className={`operation-task-progress-fill ${progressClass}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="operation-task-progress-pct">{percent}%</span>
      </div>
    </div>
  );
}

TaskProgressIndicator.propTypes = {
  status: PropTypes.string.isRequired,
  progress: PropTypes.number,
};

function OperationTasksPanel({
  cardColor,
  isViewOnly = false,
  embedded = false,
  taskSections = dummyTaskSections,
  isLoading = false,
  error = "",
  className = "",
}) {
  const panelClassName = [
    embedded ? "operation-tasks-panel--embedded" : "operation-task-tab-body",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={panelClassName}
      style={cardColor ? { "--card-color": cardColor } : undefined}
    >
      <div className="operation-task-card">
        <div className="operation-task-card-header">
          <span className="operation-task-card-title">Operation Tasks</span>
        </div>

        <ul className="operation-task-list" role="list">
          {isLoading ? (
            <li className="operation-task-empty">
              <p>Loading operation tasks...</p>
            </li>
          ) : error ? (
            <li className="operation-task-empty">
              <p>{error}</p>
            </li>
          ) : taskSections.length === 0 ? (
            <li className="operation-task-empty">
              <p>No operation tasks available.</p>
            </li>
          ) : null}
          {!isLoading && !error && taskSections.map((section) => (
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
                    <div className="operation-task-row-details">
                      <p className="operation-task-detail-line">
                        <span className="operation-task-detail-label">Assigned User:</span>{" "}
                        <span className="operation-task-detail-value">
                          {task.assignedTo || "Unassigned"}
                        </span>
                      </p>
                      <p className="operation-task-detail-line">
                        <span className="operation-task-detail-label">Documents:</span>{" "}
                        <span className="operation-task-detail-value">
                          {task.documentCount ?? 0}
                        </span>
                      </p>
                      <TaskProgressIndicator status={task.status} progress={task.progress} />
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

OperationTasksPanel.propTypes = {
  cardColor: PropTypes.string,
  isViewOnly: PropTypes.bool,
  embedded: PropTypes.bool,
  taskSections: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      tasks: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          title: PropTypes.string.isRequired,
          assignedTo: PropTypes.string,
          status: PropTypes.string,
          documentCount: PropTypes.number,
          progress: PropTypes.number,
        })
      ).isRequired,
    })
  ),
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default OperationTasksPanel;
