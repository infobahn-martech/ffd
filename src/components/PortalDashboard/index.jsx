import '../../design/scss/pages/dashboard/dashboard-content.scss';
import '../../design/scss/vendor-portal.scss';

const STATUS_CLASS_MAP = {
    'pending': 'status-pending',
    'approved': 'status-approved',
    'rejected': 'status-rejected',
    'paid': 'status-paid',
    'completed': 'status-completed',
    'in progress': 'status-pending',
    'assigned': 'status-approved',
    'cancelled': 'status-rejected',
    'open': 'status-open',
    'closed': 'status-closed',
};

function PortalDashboard({
    title,
    subtitle,
    summaryCards,
    statusTitle,
    statusCards,
    quickActions,
    tableTitle,
    tableColumns,
    tableRows,
}) {
    const getStatusClass = (status) =>
        STATUS_CLASS_MAP[(status || '').toLowerCase()] || '';

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">{title}</h2>
                <p className="dashboard-subtitle">{subtitle}</p>
            </div>

            <div className="stats-grid">
                {summaryCards.map((card, i) => (
                    <div key={i} className="stat-card">
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

            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">{statusTitle}</h3>
                <div className="vendor-invoice-status-cards">
                    {statusCards.map((card, i) => (
                        <div key={i} className={`vendor-status-card ${card.statusClass}`}>
                            <p className="vendor-status-label">{card.label}</p>
                            <p className="vendor-status-value">{card.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">Quick Actions</h3>
                <div className="vendor-quick-actions">
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            type="button"
                            className="vendor-quick-action-btn"
                            onClick={action.onClick}
                        >
                            {action.icon} {action.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="vendor-dashboard-section">
                <h3 className="vendor-section-title">{tableTitle}</h3>
                <div className="vendor-table-wrapper">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="vendor-table">
                            <thead>
                                <tr>
                                    {tableColumns.map((col, i) => (
                                        <th key={i}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.map((row, rowIdx) => (
                                    <tr key={rowIdx}>
                                        {tableColumns.map((col, colIdx) => (
                                            <td key={colIdx}>
                                                {col.isStatus ? (
                                                    <span className={`vendor-status-badge ${getStatusClass(row[col.key])}`}>
                                                        {row[col.key]}
                                                    </span>
                                                ) : (
                                                    row[col.key]
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PortalDashboard;
