import { FiTruck, FiSettings, FiClock, FiCheckCircle, FiList } from 'react-icons/fi';
import PortalDashboard from '../../../components/PortalDashboard';

const summaryCards = [
    { title: 'Total Trips', value: '47', icon: <FiTruck />, color: '#00368c' },
    { title: 'Active Vehicles', value: '12', icon: <FiSettings />, color: '#3b82f6' },
    { title: 'Pending Bookings', value: '9', icon: <FiClock />, color: '#f59e0b' },
    { title: 'Completed Today', value: '8', icon: <FiCheckCircle />, color: '#10b981' },
];

const statusCards = [
    { label: 'Pending', value: 9, statusClass: 'status-pending' },
    { label: 'Assigned', value: 15, statusClass: 'status-approved' },
    { label: 'In Progress', value: 14, statusClass: 'status-open' },
    { label: 'Completed', value: 9, statusClass: 'status-completed' },
];

const quickActions = [
    { label: 'View Trips', icon: <FiList />, onClick: () => {} },
    { label: 'Manage Vehicles', icon: <FiTruck />, onClick: () => {} },
];

const tableColumns = [
    { label: 'Trip No', key: 'tripNo' },
    { label: 'Vehicle', key: 'vehicle' },
    { label: 'Driver', key: 'driver' },
    { label: 'From', key: 'from' },
    { label: 'To', key: 'to' },
    { label: 'Date', key: 'date' },
    { label: 'Status', key: 'status', isStatus: true },
];

const tableRows = [
    { tripNo: 'TR-2025-101', vehicle: 'Toyota Coaster – 7894', driver: 'Khalid Mansour', from: 'Port Gate A', to: 'King Fahd Int. Airport', date: '01 Jun 2025', status: 'Completed' },
    { tripNo: 'TR-2025-102', vehicle: 'Ford Transit – 3321', driver: 'Saeed Al-Johani', from: 'Jeddah Harbour', to: 'Grand Hyatt Hotel', date: '02 Jun 2025', status: 'In Progress' },
    { tripNo: 'TR-2025-103', vehicle: 'Mercedes Sprinter – 5512', driver: 'Ahmed Nasser', from: 'Dammam Port', to: 'Dhahran Camp', date: '03 Jun 2025', status: 'Assigned' },
    { tripNo: 'TR-2025-104', vehicle: 'Toyota Coaster – 7895', driver: 'Faisal Al-Harbi', from: 'Yanbu Terminal', to: 'Madinah Hotel', date: '04 Jun 2025', status: 'Pending' },
    { tripNo: 'TR-2025-105', vehicle: 'Ford Transit – 3322', driver: 'Omar Al-Ghamdi', from: 'King Abdulaziz Port', to: 'Riyadh Office', date: '05 Jun 2025', status: 'Pending' },
];

function TransportDashboard() {
    return (
        <PortalDashboard
            title="Transport Company Dashboard"
            subtitle="Overview of trips, vehicles, and pending bookings."
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

export default TransportDashboard;
