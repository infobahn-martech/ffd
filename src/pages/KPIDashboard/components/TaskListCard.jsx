import React from 'react';
import { FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi';
import '../../../design/scss/pages/kpi-dashboard/components/TaskListCard.scss';

const TaskListCard = () => {
  // Sample task list data
  const tasks = [
    { id: 1, title: 'Port Clearance Documentation', status: 'in-progress', priority: 'high' },
    { id: 2, title: 'Vessel Arrival Report', status: 'completed', priority: 'medium' },
    { id: 3, title: 'Customs Declaration', status: 'in-progress', priority: 'high' },
    { id: 4, title: 'Crew Medical Check', status: 'pending', priority: 'low' },
    { id: 5, title: 'Transport Arrangement', status: 'completed', priority: 'medium' },
    { id: 6, title: 'Hotel Booking', status: 'pending', priority: 'low' },
  ];

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

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'pending':
      default:
        return 'Pending';
    }
  };

  return (
    <div className="kpi-task-list-card">
      <div className="kpi-task-list-card__header">
        <h3 className="kpi-task-list-card__title">Task List</h3>
        <span className="kpi-task-list-card__count">{tasks.length} Tasks</span>
      </div>
      <div className="kpi-task-list-card__content">
        <div className="kpi-task-list-card__list">
          {tasks.map((task) => (
            <div key={task.id} className="task-list-item">
              <div className="task-list-item__icon-wrapper">
                {getStatusIcon(task.status)}
              </div>
              <div className="task-list-item__content">
                <div className="task-list-item__title">{task.title}</div>
                <div className="task-list-item__status">{getStatusText(task.status)}</div>
              </div>
              {task.priority === 'high' && (
                <div className="task-list-item__priority task-list-item__priority--high">!</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskListCard;