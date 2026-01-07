import React, { useState } from 'react';
import KIPBackground from '../../assets/images/KIP-BG.png';
import SideNav from './components/SideNav';
import HeaderBar from './components/HeaderBar';
import CounterCards from './components/CounterCards';
import MiddleRowCards from './components/MiddleRowCards';
import ChartsRow from './components/ChartsRow';
import Earnings from './components/Earnings';
import './KPIDashboard.scss';

const KPIDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('Dashboard');

    const renderContent = () => {
        switch (activeMenu) {
            case 'Earning History':
                return <Earnings />;
            case 'Dashboard':
            default:
                return (
                    <>
                        <CounterCards />
                        <MiddleRowCards />
                        <ChartsRow />
                    </>
                );
        }
    };

    const getPageTitle = () => {
        switch (activeMenu) {
            case 'Earning History':
                return 'Pages / Earnings';
            case 'Dashboard':
            default:
                return 'KPI Dashboard';
        }
    };

    return (
        <div className="kpi-dashboard">
            <div
                className="kpi-dashboard__background"
                style={{ backgroundImage: `url(${KIPBackground})` }}
            >
                <SideNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                <div className="kpi-dashboard__content">
                    <HeaderBar title={getPageTitle()} />
                    <div className="kpi-dashboard__scrollable-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIDashboard;

