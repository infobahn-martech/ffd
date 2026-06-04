import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileIconKPI from '../../../assets/images/ProfileIconKPI.png';
import '../../../design/scss/pages/kpi-dashboard/components/HeaderBar.scss';

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="33" viewBox="0 0 36 33" fill="none">
    <path d="M17.5946 0L24.119 9.26262L35.1891 12.4377L28.1513 21.3374L28.4686 32.5623L17.5946 28.8L6.72058 32.5623L7.03788 21.3374L5.91278e-05 12.4377L11.0702 9.26262L17.5946 0Z" fill="#FFE100" />
  </svg>
);

const ChevronIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeaderBar = ({ breadcrumbs = null, title = 'KPI Dashboard', onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const pointsLeft = 200;
  const currentLevel = 3;
  const nextLevel = 4;
  const progressPercentage = 60; // 60% filled

  // Use breadcrumbs if provided, otherwise fall back to title
  const displayContent = breadcrumbs ? (
    <div className="kpi-header-bar__breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="kpi-header-bar__breadcrumb-separator">
              <ChevronIcon />
            </span>
          )}
          {crumb.path ? (
            <button
              className="kpi-header-bar__breadcrumb-item kpi-header-bar__breadcrumb-item--link"
              onClick={() => navigate(crumb.path)}
            >
              {crumb.label}
            </button>
          ) : (
            <span className="kpi-header-bar__breadcrumb-item kpi-header-bar__breadcrumb-item--current">
              {crumb.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  ) : (
    <div className="kpi-header-bar__title">{title}</div>
  );

  return (
    <div className="kpi-header-bar">
      {onMobileMenuToggle && (
        <button
          className="kpi-header-bar__mobile-menu-toggle"
          onClick={onMobileMenuToggle}
          aria-label="Toggle menu"
        >
          <HamburgerIcon />
        </button>
      )}
      {displayContent}
      <div className="kpi-header-bar__left">
        <div className="kpi-header-bar__progress-section">
          <span
            className="kpi-header-bar__progress-text"
            title={`Level ${nextLevel} in ${pointsLeft} points`}
          >
            Level {nextLevel} in {pointsLeft} points
          </span>
          <div className="kpi-header-bar__progress-bar">
            <div
              className="kpi-header-bar__progress-fill"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="kpi-header-bar__star">
                <StarIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="kpi-header-bar__right">
        <div className="kpi-header-bar__greeting">
          <div className="kpi-header-bar__greeting-text">
            Hello, <span className="kpi-header-bar__name">Mohammed Rahman</span>
          </div>
          <div className="kpi-header-bar__level-text">Level {currentLevel}</div>
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

