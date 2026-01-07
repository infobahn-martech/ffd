import React from 'react';
import ProfileIconKPI from '../../../assets/images/ProfileIconKPI.png';
import './HeaderBar.scss';

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="33" viewBox="0 0 36 33" fill="none">
    <path d="M17.5946 0L24.119 9.26262L35.1891 12.4377L28.1513 21.3374L28.4686 32.5623L17.5946 28.8L6.72058 32.5623L7.03788 21.3374L5.91278e-05 12.4377L11.0702 9.26262L17.5946 0Z" fill="#FFE100"/>
  </svg>
);

const HeaderBar = () => {
  const pointsLeft = 200;
  const currentLevel = 3;
  const nextLevel = 4;
  const progressPercentage = 60; // 60% filled

  return (
    <div className="kpi-header-bar">
      <div className="kpi-header-bar__left">
        <div className="kpi-header-bar__progress-section">
          <span className="kpi-header-bar__progress-text">
            Only {pointsLeft} points left to hit level {nextLevel}
          </span>
          <div className="kpi-header-bar__progress-bar">
            <div 
              className="kpi-header-bar__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="kpi-header-bar__star">
          <StarIcon />
        </div>
      </div>
      <div className="kpi-header-bar__right">
        <div className="kpi-header-bar__greeting">
          <span className="kpi-header-bar__greeting-text">
            Hello, <span className="kpi-header-bar__name">Mohammed Rahman</span>, Level {currentLevel}
          </span>
        </div>
        <div className="kpi-header-bar__profile">
          <img 
            src={ProfileIconKPI} 
            alt="Profile" 
            className="kpi-header-bar__profile-image"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderBar;

