import React from 'react';
import './TaskCompletionSpeedCard.scss';

const ThreeDotsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <g clipPath="url(#clip0_7_1519)">
      <path d="M6 10C4.9 10 4 10.9 4 12C4 13.1 4.9 14 6 14C7.1 14 8 13.1 8 12C8 10.9 7.1 10 6 10ZM18 10C16.9 10 16 10.9 16 12C16 13.1 16.9 14 18 14C19.1 14 20 13.1 20 12C20 10.9 19.1 10 18 10ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="#007AFF" />
    </g>
    <defs>
      <clipPath id="clip0_7_1519">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const TaskCompletionSpeedCard = () => {
  const score = 9.3;
  const scorePercentage = (score / 10) * 100;
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="kpi-task-speed-card">
      <div className="kpi-task-speed-card__header">
        <h3 className="kpi-task-speed-card__title">Task completion speed</h3>
        <button className="kpi-task-speed-card__menu">
          <ThreeDotsIcon />
        </button>
      </div>
      <div className="kpi-task-speed-card__content">
        <div className="kpi-task-speed-card__metrics">
          <div className="kpi-task-speed-card__metric">
            <div className="kpi-task-speed-card__metric-label">Ongoing</div>
            <div className="kpi-task-speed-card__metric-value">145 Tasks</div>
          </div>
          <div className="kpi-task-speed-card__metric">
            <div className="kpi-task-speed-card__metric-label">Bonus Points</div>
            <div className="kpi-task-speed-card__metric-value">36</div>
          </div>
        </div>
        <div className="kpi-task-speed-card__gauge">
          <svg className="kpi-task-speed-card__gauge-svg" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r="50"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="70"
              cy="70"
              r="50"
              fill="none"
              stroke="#4ADE80"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="kpi-task-speed-card__gauge-content">
            <div className="kpi-task-speed-card__gauge-label">Good</div>
            <div className="kpi-task-speed-card__gauge-score">{score}</div>
            <div className="kpi-task-speed-card__gauge-subtitle">Total Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionSpeedCard;

