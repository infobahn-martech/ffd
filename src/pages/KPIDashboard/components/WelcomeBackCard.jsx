import React from 'react';
import GoldenIcon from '../../../assets/images/GoldenIcon.png';
import './WelcomeBackCard.scss';

const RightArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M6.80475 2.84375L10.461 6.5L6.80475 10.1562" stroke="white" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.95312 6.50024H2.53906" stroke="white" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WelcomeBackCard = () => {
  return (
    <div className="kpi-welcome-card">
      <div className="kpi-welcome-card__content">
        <div className="kpi-welcome-card__text-section">
          <div className="kpi-welcome-card__greeting">
            <span className="kpi-welcome-card__greeting-text">Welcome back,</span>
            <span className="kpi-welcome-card__name">Mohammed Rahman</span>
          </div>
          <p className="kpi-welcome-card__message">
            <span className="kpi-welcome-card__message-line1">Woohoo! You're incredible</span>
            <span className="kpi-welcome-card__message-line2">just 200 points away from level 4!</span>
          </p>
          <div className="kpi-welcome-card__action">
            <span>Tap to record</span>
            <RightArrowIcon />
          </div>
        </div>
        <div className="kpi-welcome-card__badge">
          <img src={GoldenIcon} alt="Level 3 Badge" className="kpi-welcome-card__badge-image" />
          <div className="kpi-welcome-card__level-text">Level 3</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackCard;

