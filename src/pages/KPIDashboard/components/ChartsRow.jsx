import React from 'react';
import ImportExportCallChart from './ImportExportCallChart';
import MonthlyTasksChart from './MonthlyTasksChart';
import OurTeam from './OurTeam';
import EarningTransactions from './EarningTransactions';
import './ChartsRow.scss';

const ChartsRow = () => {
  return (
    <>
      <div className="kpi-charts-row">
        <div className="kpi-charts-row__import-export">
          <ImportExportCallChart />
        </div>
        <div className="kpi-charts-row__monthly-tasks">
          <MonthlyTasksChart />
        </div>
      </div>
      <div className="kpi-charts-row kpi-charts-row--bottom">
        <div className="kpi-charts-row__our-team">
          <OurTeam />
        </div>
        <div className="kpi-charts-row__earning-transactions">
          <EarningTransactions />
        </div>
      </div>
    </>
  );
};

export default ChartsRow;

