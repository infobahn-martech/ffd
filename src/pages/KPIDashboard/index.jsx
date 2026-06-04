import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SideNav from './components/SideNav';
import HeaderBar from './components/HeaderBar';
import CounterCards from './components/CounterCards';
import MiddleRowCards from './components/MiddleRowCards';
import ChartsRow from './components/ChartsRow';
import Earnings from './components/Earnings';
import Tasks from './components/Tasks';
import TeamLeaderboard from './components/TeamLeaderboard';
import ProfileModal from './components/ProfileModal';
import SignOutModal from './components/SignOutModal';
import useAuthReducer from '../../store/AuthReducer';
import '../../design/scss/pages/kpi-dashboard/KPIDashboard.scss';

const KPIDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const doLogout = useAuthReducer((state) => state.doLogout);

    // Initialize activeMenu based on URL
    const getInitialMenu = () => {
        const path = location.pathname || location.hash.replace('#', '');
        if (path === '/earning-history') {
            return 'Earning History';
        }
        if (path === '/tasks') {
            return 'Tasks';
        }
        if (path === '/team-leaderboard') {
            return 'Team Leaderboard';
        }
        return 'Dashboard';
    };

    const [activeMenu, setActiveMenu] = useState(getInitialMenu());
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Sync activeMenu with URL (hash router uses pathname)
        const path = location.pathname || location.hash.replace('#', '');
        if (path === '/earning-history') {
            setActiveMenu('Earning History');
        } else if (path === '/tasks') {
            setActiveMenu('Tasks');
        } else if (path === '/team-leaderboard') {
            setActiveMenu('Team Leaderboard');
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
            case 'Team Leaderboard':
                return <TeamLeaderboard />;
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
            case 'Team Leaderboard':
                return [
                    { label: 'Dashboard', path: '/kpi-dashboard' },
                    { label: 'Team Leaderboard', path: null },
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

    const handleSignOut = () => {
        setIsLoggingOut(true);
        try {
            doLogout();
            // Navigate to login page after logout
            setTimeout(() => {
                navigate('/');
                setIsLoggingOut(false);
                setShowSignOutModal(false);
            }, 500);
        } catch (error) {
            console.error('Error during logout:', error);
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="kpi-dashboard">
            {isMobileMenuOpen && (
                <div
                    className="kpi-dashboard__overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            <div className="kpi-dashboard__background">
                <SideNav
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    onProfileClick={() => setShowProfileModal(true)}
                    onSignOutClick={() => setShowSignOutModal(true)}
                    isMobileMenuOpen={isMobileMenuOpen}
                    onMobileMenuClose={() => setIsMobileMenuOpen(false)}
                />
                <div className="kpi-dashboard__content">
                    <HeaderBar
                        title={getPageTitle()}
                        breadcrumbs={getBreadcrumbs()}
                        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    />
                    <div className="kpi-dashboard__scrollable-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
            <ProfileModal
                show={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
            <SignOutModal
                show={showSignOutModal}
                onClose={() => setShowSignOutModal(false)}
                onConfirm={handleSignOut}
                isLoading={isLoggingOut}
            />
        </div>
    );
};

export default KPIDashboard;

