import React from 'react';
import ImportExportCallChart from './ImportExportCallChart';
import MonthlyTasksChart from './MonthlyTasksChart';
import './ChartsRow.scss';

const ChartsRow = () => {
  return (
    <div className="kpi-charts-row">
      <div className="kpi-charts-row__import-export">
        <ImportExportCallChart />
      </div>
      <div className="kpi-charts-row__monthly-tasks">
        <MonthlyTasksChart />
      </div>
    </div>
  );
};

export default ChartsRow;

