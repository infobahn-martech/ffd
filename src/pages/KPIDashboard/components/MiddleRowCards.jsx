import React from 'react';
import WelcomeBackCard from './WelcomeBackCard';
import SatisfactionRateCard from './SatisfactionRateCard';
import TaskCompletionSpeedCard from './TaskCompletionSpeedCard';
import '../../../design/scss/pages/kpi-dashboard/components/MiddleRowCards.scss';

const MiddleRowCards = () => {
  return (
    <div className="kpi-middle-row">
      <div className="kpi-middle-row__welcome">
        <WelcomeBackCard />
      </div>
      <div className="kpi-middle-row__satisfaction">
        <SatisfactionRateCard />
      </div>
      <div className="kpi-middle-row__task-speed">
        <TaskCompletionSpeedCard />
      </div>
    </div>
  );
};

export default MiddleRowCards;

