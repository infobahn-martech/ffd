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
    paidAmount: '42,750 SAR',
};

const MOCK_INVOICE_STATUS = {
    pending: 5,
    approved: 4,
    rejected: 2,
    paid: 7,
};

const MOCK_RECENT_INVOICES = [
    { invoiceNo: 'INV-2024-101', refNo: 'WO-8842', company: 'Sedres Ltd', type: 'Service', amount: '3,200', currency: 'SAR', date: '12 Mar 2025', status: 'Approved' },
    { invoiceNo: 'INV-2024-100', refNo: 'WO-8839', company: 'Marine Services Co', type: 'Provisions', amount: '1,850', currency: 'SAR', date: '10 Mar 2025', status: 'Approved' },
    { invoiceNo: 'INV-2024-099', refNo: 'WO-8835', company: 'Sedres Ltd', type: 'Transport', amount: '5,100', currency: 'SAR', date: '08 Mar 2025', status: 'Paid' },
    { invoiceNo: 'INV-2024-098', refNo: 'WO-8830', company: 'Port Authority', type: 'Agency', amount: '2,400', currency: 'SAR', date: '05 Mar 2025', status: 'Rejected' },
    { invoiceNo: 'INV-2024-097', refNo: 'WO-8828', company: 'Marine Services Co', type: 'Launch hire', amount: '4,200', currency: 'SAR', date: '03 Mar 2025', status: 'Paid' },
];

const MOCK_RECENT_ORDERS = [
    { orderNo: 'PO-2205', company: 'Sedres Ltd', orderDate: '10 Mar 2025', purchaser: 'J. Smith', subject: 'Launch hire – Port A', amount: '2,500', currency: 'SAR', status: 'In progress' },
    { orderNo: 'PO-2203', company: 'Marine Services Co', orderDate: '08 Mar 2025', purchaser: 'M. Jones', subject: 'Transport – Crew transfer', amount: '1,200', currency: 'SAR', status: 'In progress' },
    { orderNo: 'PO-2200', company: 'Sedres Ltd', orderDate: '05 Mar 2025', purchaser: 'K. Brown', subject: 'Provisions supply', amount: '3,800', currency: 'SAR', status: 'In progress' },
    { orderNo: 'PO-2197', company: 'Port Authority', orderDate: '03 Mar 2025', purchaser: 'J. Smith', subject: 'Agency services', amount: '950', currency: 'SAR', status: 'Closed' },
    { orderNo: 'PO-2195', company: 'Marine Services Co', orderDate: '01 Mar 2025', purchaser: 'M. Jones', subject: 'Fresh water supply', amount: '600', currency: 'SAR', status: 'In progress' },
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
        if (s === 'in progress') return 'status-pending';
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

            {/* 5. Quick actions */}
            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">Quick Actions</h3>
                <div className="vendor-quick-actions">
                    {/* <button
                        type="button"
                        className="vendor-quick-action-btn primary"
                        onClick={() => navigate('/vendor-portal/invoices')}
                    >
                        <FiPlusCircle /> Add Invoice
                    </button> */}
                    <button
                        type="button"
                        className="vendor-quick-action-btn"
                        onClick={() => navigate('/vendor-portal/orders')}
                    >
                        <FiList /> View Invoices
                    </button>
                    {/* <button
                        type="button"
                        className="vendor-quick-action-btn"
                        onClick={() => navigate('/vendor-portal/orders')}
                    >
                        <FiPackage /> View Orders
                    </button> */}
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
                                    <th>PO No</th>
                                    <th>Subject</th>
                                    <th>Company</th>
                                    <th>Order date</th>
                                    <th>Purchaser</th>
                                    <th>Amount</th>
                                    <th>Currency</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_RECENT_ORDERS.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.orderNo}</td>
                                        <td>{row.subject}</td>
                                        <td>{row.company}</td>
                                        <td>{row.orderDate}</td>
                                        <td>{row.purchaser}</td>
                                        <td>{row.amount}</td>
                                        <td>{row.currency}</td>
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

            {/* 3. Recent Invoices table */}
            {/* <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">Recent Invoices</h3>
                <div className="vendor-table-wrapper">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="vendor-table">
                            <thead>
                                <tr>
                                    <th>Invoice No</th>
                                    <th>Ref No</th>
                                    <th>Company</th>
                                    <th>Type</th>
                                    <th>Invoice Date</th>
                                    <th>Amount</th>
                                    <th>Currency</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_RECENT_INVOICES.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.invoiceNo}</td>
                                        <td>{row.refNo}</td>
                                        <td>{row.company}</td>
                                        <td>{row.type}</td>
                                        <td>{row.date}</td>
                                        <td>{row.amount}</td>
                                        <td>{row.currency}</td>
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
            </div> */}



        </div>
    );
};

export default Dashboard;
