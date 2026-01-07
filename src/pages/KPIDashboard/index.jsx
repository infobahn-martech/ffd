import React from 'react';
import KIPBackground from '../../assets/images/KIP-BG.png';
import SideNav from './components/SideNav';
import HeaderBar from './components/HeaderBar';
import CounterCards from './components/CounterCards';
import './KPIDashboard.scss';

const KPIDashboard = () => {
    return (
        <div className="kpi-dashboard">
            <div
                className="kpi-dashboard__background"
                style={{ backgroundImage: `url(${KIPBackground})` }}
            >
                <SideNav />
                <div className="kpi-dashboard__content">
                    <HeaderBar />
                    <CounterCards />
                </div>
            </div>
        </div>
    );
};

export default KPIDashboard;

