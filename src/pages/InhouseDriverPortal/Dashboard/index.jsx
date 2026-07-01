import { FiNavigation, FiCheckCircle, FiClock, FiMapPin, FiList } from 'react-icons/fi';
import PortalDashboard from '../../../components/PortalDashboard';

const summaryCards = [
    { title: 'Assigned Trips', value: '6', icon: <FiNavigation />, color: '#00368c' },
    { title: 'Completed Trips', value: '18', icon: <FiCheckCircle />, color: '#10b981' },
    { title: 'Pending Trips', value: '3', icon: <FiClock />, color: '#f59e0b' },
    { title: 'Total Distance (km)', value: '1,240', icon: <FiMapPin />, color: '#3b82f6' },
];

const statusCards = [
    { label: 'Pending', value: 3, statusClass: 'status-pending' },
    { label: 'In Progress', value: 2, statusClass: 'status-open' },
    { label: 'Completed', value: 18, statusClass: 'status-completed' },
    { label: 'Cancelled', value: 1, statusClass: 'status-rejected' },
];

const quickActions = [
    { label: 'View My Trips', icon: <FiList />, onClick: () => {} },
    { label: 'View Route Map', icon: <FiMapPin />, onClick: () => {} },
];

const tableColumns = [
    { label: 'Trip No', key: 'tripNo' },
    { label: 'From', key: 'from' },
    { label: 'To', key: 'to' },
    { label: 'Passenger', key: 'passenger' },
    { label: 'Date', key: 'date' },
    { label: 'Distance (km)', key: 'distance' },
    { label: 'Status', key: 'status', isStatus: true },
];

const tableRows = [
    { tripNo: 'DT-2025-041', from: 'Port Gate B', to: 'Marriott Hotel', passenger: 'Capt. Al-Farsi', date: '01 Jun 2025', distance: '24', status: 'Completed' },
    { tripNo: 'DT-2025-042', from: 'Jeddah Airport', to: 'Radisson Blu', passenger: 'Chief Eng. Liu', date: '02 Jun 2025', distance: '18', status: 'Completed' },
    { tripNo: 'DT-2025-043', from: 'Dammam Terminal', to: 'Aramco Camp', passenger: 'Second Officer Kim', date: '03 Jun 2025', distance: '32', status: 'In Progress' },
    { tripNo: 'DT-2025-044', from: 'Riyadh Office', to: 'King Khalid Airport', passenger: 'Chief Officer Patel', date: '04 Jun 2025', distance: '15', status: 'Pending' },
    { tripNo: 'DT-2025-045', from: 'Yanbu Harbour', to: 'Al Waha Hotel', passenger: 'Bosun Hassan', date: '05 Jun 2025', distance: '11', status: 'Pending' },
];

function InhouseDriverDashboard() {
    return (
        <PortalDashboard
            title="Inhouse Driver Dashboard"
            subtitle="Overview of your assigned, completed, and pending trips."
            summaryCards={summaryCards}
            statusTitle="Trip Status Overview"
            statusCards={statusCards}
            quickActions={quickActions}
            tableTitle="Recent Trips"
            tableColumns={tableColumns}
            tableRows={tableRows}
        />
    );
}

export default InhouseDriverDashboard;
