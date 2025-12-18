import React from 'react';
import KIPBackground from '../../assets/images/KIP-BG.png';
import './KPIDashboard.scss';

const KPIDashboard = () => {
    return (
        <div className="kpi-dashboard">
            <div
                className="kpi-dashboard__background"
                style={{ backgroundImage: `url(${KIPBackground})` }}
            >
                <div className="kpi-dashboard__content">
                    {/* KPI Dashboard content will be added here */}
                </div>
            </div>
        </div>
    );
};

export default KPIDashboard;

