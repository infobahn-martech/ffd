import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import KIPBackground from '../../assets/images/KIP-BG.png';
import SideNav from './components/SideNav';
import HeaderBar from './components/HeaderBar';
import CounterCards from './components/CounterCards';
import MiddleRowCards from './components/MiddleRowCards';
import ChartsRow from './components/ChartsRow';
import Earnings from './components/Earnings';
import Tasks from './components/Tasks';
import './KPIDashboard.scss';

const KPIDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize activeMenu based on URL
    const getInitialMenu = () => {
        const path = location.pathname || location.hash.replace('#', '');
        if (path === '/earning-history') {
            return 'Earning History';
        }
        if (path === '/tasks') {
            return 'Tasks';
        }
        return 'Dashboard';
    };

    const [activeMenu, setActiveMenu] = useState(getInitialMenu());

    useEffect(() => {
        // Sync activeMenu with URL (hash router uses pathname)
        const path = location.pathname || location.hash.replace('#', '');
        if (path === '/earning-history') {
            setActiveMenu('Earning History');
        } else if (path === '/tasks') {
            setActiveMenu('Tasks');
        } else if (path === '/kpi-dashboard') {
            setActiveMenu('Dashboard');
        }
    }, [location]);

    const renderContent = () => {
        switch (activeMenu) {
            case 'Earning History':
                return <Earnings />;
            case 'Tasks':
                return <Tasks />;
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

    const getBreadcrumbs = () => {
        switch (activeMenu) {
            case 'Earning History':
                return [
                    { label: 'Dashboard', path: '/kpi-dashboard' },
                    { label: 'Earning History', path: null },
                ];
            case 'Tasks':
                return [
                    { label: 'Dashboard', path: '/kpi-dashboard' },
                    { label: 'Tasks', path: null },
                ];
            case 'Dashboard':
            default:
                return null; // No breadcrumbs for dashboard, show title instead
        }
    };

    const getPageTitle = () => {
        if (activeMenu === 'Dashboard') {
            return 'KPI Dashboard';
        }
        return null; // Use breadcrumbs for other pages
    };

    return (
        <div className="kpi-dashboard">
            <div
                className="kpi-dashboard__background"
                style={{ backgroundImage: `url(${KIPBackground})` }}
            >
                <SideNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
                <div className="kpi-dashboard__content">
                    <HeaderBar title={getPageTitle()} breadcrumbs={getBreadcrumbs()} />
                    <div className="kpi-dashboard__scrollable-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KPIDashboard;

