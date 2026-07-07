import { FiHome, FiCalendar, FiClock, FiUsers, FiFileText } from 'react-icons/fi';
import PortalDashboard from '../../../components/PortalDashboard';

const summaryCards = [
    { title: 'Active Bookings', value: '18', icon: <FiHome />, color: '#00368c' },
    { title: "Check-ins Today", value: '6', icon: <FiCalendar />, color: '#3b82f6' },
    { title: 'Pending Requests', value: '4', icon: <FiClock />, color: '#f59e0b' },
    { title: 'Guests Hosted', value: '25', icon: <FiUsers />, color: '#10b981' },
];

const statusCards = [
    { label: 'Pending', value: 7, statusClass: 'status-pending' },
    { label: 'Confirmed', value: 12, statusClass: 'status-approved' },
    { label: 'Completed', value: 9, statusClass: 'status-completed' },
    { label: 'Cancelled', value: 1, statusClass: 'status-rejected' },
];

const quickActions = [
    { label: 'View Bookings', icon: <FiCalendar />, onClick: () => {} },
    { label: 'View Invoices', icon: <FiFileText />, onClick: () => {} },
];

const tableColumns = [
    { label: 'Booking No', key: 'bookingNo' },
    { label: 'Guest', key: 'guest' },
    { label: 'Check-in', key: 'checkIn' },
    { label: 'Hotel', key: 'hotel' },
    { label: 'Room Type', key: 'roomType' },
    { label: 'Status', key: 'status', isStatus: true },
];

const tableRows = [
    { bookingNo: 'HB-2025-001', guest: 'Ali Hassan', checkIn: '05 Jun 2025', hotel: 'Sedres Inn', roomType: 'Standard', status: 'Confirmed' },
    { bookingNo: 'HB-2025-002', guest: 'Sara Ahmed', checkIn: '06 Jun 2025', hotel: 'Sedres Inn', roomType: 'Deluxe', status: 'Pending' },
    { bookingNo: 'HB-2025-003', guest: 'Omar Khalid', checkIn: '07 Jun 2025', hotel: 'Port View Hotel', roomType: 'Suite', status: 'Completed' },
    { bookingNo: 'HB-2025-004', guest: 'Nora Abdulla', checkIn: '08 Jun 2025', hotel: 'Port View Hotel', roomType: 'Standard', status: 'Pending' },
    { bookingNo: 'HB-2025-005', guest: 'Fahad Al-Rashid', checkIn: '09 Jun 2025', hotel: 'Sedres Inn', roomType: 'Deluxe', status: 'Cancelled' },
];

function HotelDashboard() {
    return (
        <PortalDashboard
            title="Hotel Dashboard"
            subtitle="Overview of bookings, check-ins, and guest requests."
            summaryCards={summaryCards}
            statusTitle="Booking Status Overview"
            statusCards={statusCards}
            quickActions={quickActions}
            tableTitle="Recent Bookings"
            tableColumns={tableColumns}
            tableRows={tableRows}
        />
    );
}

export default HotelDashboard;
