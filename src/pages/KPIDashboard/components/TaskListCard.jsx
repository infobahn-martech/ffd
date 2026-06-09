import React from 'react';
import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';
import useKPIDashboardReducer from '../../../store/KPIDashboard';
import '../../../design/scss/pages/kpi-dashboard/components/TaskListCard.scss';

const normalizeStatus = (statusLabel) => {
  const label = (statusLabel || '').toUpperCase().replace(/_/g, ' ');
  if (label === 'COMPLETED') return 'completed';
  if (label === 'IN PROGRESS') return 'in-progress';
  return 'pending';
};

const formatStatusLabel = (statusLabel) => {
  if (!statusLabel) return 'Pending';
  return statusLabel
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <FiCheckCircle className="task-list-item__icon task-list-item__icon--completed" />;
    case 'in-progress':
      return <FiClock className="task-list-item__icon task-list-item__icon--in-progress" />;
    case 'pending':
    default:
      return <FiCircle className="task-list-item__icon task-list-item__icon--pending" />;
  }
};

const getPriorityClass = (statusColor) => {
  const color = (statusColor || '').toLowerCase();
  if (color === 'red') return 'high';
  if (color === 'orange') return 'medium';
  if (color === 'green') return 'low';
  return null;
};

const TaskListCard = () => {
  const assignedTasks = useKPIDashboardReducer((state) => state.assignedTasks);
  const isLoadingTasks = useKPIDashboardReducer((state) => state.isLoadingTasks);

  return (
    <div className="kpi-task-list-card">
      <div className="kpi-task-list-card__header">
        <h3 className="kpi-task-list-card__title">Task List</h3>
        <span className="kpi-task-list-card__count">{assignedTasks.length} Tasks</span>
      </div>
      <div className="kpi-task-list-card__content">
        <div className="kpi-task-list-card__list">
          {isLoadingTasks && assignedTasks.length === 0 && (
            <div className="kpi-task-list-card__empty">Loading tasks...</div>
          )}
          {!isLoadingTasks && assignedTasks.length === 0 && (
            <div className="kpi-task-list-card__empty">No tasks assigned</div>
          )}
          {assignedTasks.map((task, index) => {
            const status = normalizeStatus(task.status_label);
            const priorityClass = getPriorityClass(task.status_color);

            return (
              <div
                key={`${task.call_id}-${task.task_name}-${task.call_initiated_date}-${index}`}
                className="task-list-item"
              >
                <div className="task-list-item__icon-wrapper">
                  {getStatusIcon(status)}
                </div>
                <div className="task-list-item__content">
                  <div className="task-list-item__title">{task.task_name}</div>
                  <div className="task-list-item__status">{formatStatusLabel(task.status_label)}</div>
                </div>
                {priorityClass === 'high' && (
                  <div className="task-list-item__priority task-list-item__priority--high">!</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskListCard;
