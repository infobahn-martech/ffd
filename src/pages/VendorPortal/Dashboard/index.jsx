import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiShoppingCart,
    FiFileText,
    FiClock,
    FiDollarSign,
    FiPlusCircle,
    FiList,
    FiPackage,
} from 'react-icons/fi';
import '../../Dashboard/dashboard-content.scss';
import '../../../design/scss/vendor-portal.scss';

// Mock data – replace with API later
const MOCK_SUMMARY = {
    totalOrders: 24,
    invoicesSubmitted: 18,
    pendingInvoices: 5,
    paidAmount: '£42,750',
};

const MOCK_INVOICE_STATUS = {
    pending: 5,
    approved: 4,
    rejected: 2,
    paid: 7,
};

const MOCK_RECENT_INVOICES = [
    { refNo: 'INV-2024-101', woNo: 'WO-8842', poNo: 'PO-2201', amount: '£3,200', date: '12 Mar 2025', status: 'Pending' },
    { refNo: 'INV-2024-100', woNo: 'WO-8839', poNo: 'PO-2198', amount: '£1,850', date: '10 Mar 2025', status: 'Approved' },
    { refNo: 'INV-2024-099', woNo: 'WO-8835', poNo: 'PO-2194', amount: '£5,100', date: '08 Mar 2025', status: 'Paid' },
    { refNo: 'INV-2024-098', woNo: 'WO-8830', poNo: 'PO-2189', amount: '£2,400', date: '05 Mar 2025', status: 'Rejected' },
    { refNo: 'INV-2024-097', woNo: 'WO-8828', poNo: 'PO-2187', amount: '£4,200', date: '03 Mar 2025', status: 'Paid' },
];

const MOCK_RECENT_ORDERS = [
    { orderNo: 'PO-2205', woNo: 'WO-8845', service: 'Launch hire – Port A', approvedAmount: '£2,500', remainingAmount: '£2,500', status: 'Open' },
    { orderNo: 'PO-2203', woNo: 'WO-8841', service: 'Transport – Crew transfer', approvedAmount: '£1,200', remainingAmount: '£0', status: 'Closed' },
    { orderNo: 'PO-2200', woNo: 'WO-8838', service: 'Provisions supply', approvedAmount: '£3,800', remainingAmount: '£1,900', status: 'Open' },
    { orderNo: 'PO-2197', woNo: 'WO-8834', service: 'Agency services', approvedAmount: '£950', remainingAmount: '£0', status: 'Closed' },
    { orderNo: 'PO-2195', woNo: 'WO-8832', service: 'Fresh water supply', approvedAmount: '£600', remainingAmount: '£600', status: 'Open' },
];

const Dashboard = () => {
    const navigate = useNavigate();

    const summaryCards = [
        {
            title: 'Total Orders',
            value: String(MOCK_SUMMARY.totalOrders),
            icon: <FiShoppingCart />,
            color: '#00368c',
        },
        {
            title: 'Invoices Submitted',
            value: String(MOCK_SUMMARY.invoicesSubmitted),
            icon: <FiFileText />,
            color: '#3b82f6',
        },
        {
            title: 'Pending Invoices',
            value: String(MOCK_SUMMARY.pendingInvoices),
            icon: <FiClock />,
            color: '#f59e0b',
        },
        {
            title: 'Paid Amount',
            value: MOCK_SUMMARY.paidAmount,
            icon: <FiDollarSign />,
            color: '#10b981',
        },
    ];

    const getStatusClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'pending') return 'status-pending';
        if (s === 'approved') return 'status-approved';
        if (s === 'rejected') return 'status-rejected';
        if (s === 'paid') return 'status-paid';
        if (s === 'open') return 'status-open';
        if (s === 'closed') return 'status-closed';
        return '';
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Vendor Dashboard</h2>
                <p className="dashboard-subtitle">
                    Overview of your orders and invoices.
                </p>
            </div>

            {/* 1. Top summary cards */}
            <div className="stats-grid">
                {summaryCards.map((card, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-card-content">
                            <div className="stat-icon" style={{ color: card.color }}>
                                {card.icon}
                            </div>
                            <div className="stat-info">
                                <p className="stat-title">{card.title}</p>
                                <h3 className="stat-value">{card.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. Invoice Status Overview */}
            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">Invoice Status Overview</h3>
                <div className="vendor-invoice-status-cards">
                    <div className="vendor-status-card status-pending">
                        <p className="vendor-status-label">Pending</p>
                        <p className="vendor-status-value">{MOCK_INVOICE_STATUS.pending}</p>
                    </div>
                    <div className="vendor-status-card status-approved">
                        <p className="vendor-status-label">Approved</p>
                        <p className="vendor-status-value">{MOCK_INVOICE_STATUS.approved}</p>
                    </div>
                    <div className="vendor-status-card status-rejected">
                        <p className="vendor-status-label">Rejected</p>
                        <p className="vendor-status-value">{MOCK_INVOICE_STATUS.rejected}</p>
                    </div>
                    <div className="vendor-status-card status-paid">
                        <p className="vendor-status-label">Paid</p>
                        <p className="vendor-status-value">{MOCK_INVOICE_STATUS.paid}</p>
                    </div>
                </div>
            </div>

            {/* 3. Recent Invoices table */}
            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">Recent Invoices</h3>
                <div className="vendor-table-wrapper">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="vendor-table">
                            <thead>
                                <tr>
                                    <th>Ref No</th>
                                    <th>WO No</th>
                                    <th>PO No</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_RECENT_INVOICES.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.refNo}</td>
                                        <td>{row.woNo}</td>
                                        <td>{row.poNo}</td>
                                        <td>{row.amount}</td>
                                        <td>{row.date}</td>
                                        <td>
                                            <span className={`vendor-status-badge ${getStatusClass(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 4. Recent Orders table */}
            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">Recent Orders</h3>
                <div className="vendor-table-wrapper">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="vendor-table">
                            <thead>
                                <tr>
                                    <th>Order No / PO No</th>
                                    <th>WO No</th>
                                    <th>Service / Subject</th>
                                    <th>Approved Amount</th>
                                    <th>Remaining Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_RECENT_ORDERS.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.orderNo}</td>
                                        <td>{row.woNo}</td>
                                        <td>{row.service}</td>
                                        <td>{row.approvedAmount}</td>
                                        <td>{row.remainingAmount}</td>
                                        <td>
                                            <span className={`vendor-status-badge ${getStatusClass(row.status)}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 5. Quick actions */}
            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">Quick Actions</h3>
                <div className="vendor-quick-actions">
                    <button
                        type="button"
                        className="vendor-quick-action-btn primary"
                        onClick={() => navigate('/vendor-portal/invoices')}
                    >
                        <FiPlusCircle /> Add Invoice
                    </button>
                    <button
                        type="button"
                        className="vendor-quick-action-btn"
                        onClick={() => navigate('/vendor-portal/invoices')}
                    >
                        <FiList /> View Invoices
                    </button>
                    <button
                        type="button"
                        className="vendor-quick-action-btn"
                        onClick={() => navigate('/vendor-portal/orders')}
                    >
                        <FiPackage /> View Orders
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
