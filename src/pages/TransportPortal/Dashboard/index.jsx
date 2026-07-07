import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
    FiTruck,
    FiClock,
    FiFileText,
    FiDollarSign,
    FiList,
    FiUpload,
} from 'react-icons/fi';
import PortalDashboard from '../../../components/PortalDashboard';
import UploadInvoiceModal from '../../../components/UploadInvoiceModal';
import useVendorReducer from '../../../store/VendorReducer';
import '../../../design/scss/prospect-modal.scss';
import '../../../design/scss/modal-designs.scss';
import '../../../design/scss/form-designs.scss';

const PICKUP_STATUS_CLASS_MAP = {
    'pending': 'status-pending',
    'picked up': 'status-approved',
    'dropped off': 'status-completed',
    'completed': 'status-completed',
    'cancelled': 'status-rejected',
};

const getPickupStatusClass = (status) =>
    PICKUP_STATUS_CLASS_MAP[(status || '').toLowerCase()] || '';

const formatDate = (value) => {
    if (!value) return '—';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD MMM YYYY') : value;
};

const toDateTimeLocal = (value) => {
    if (!value) return '';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm') : '';
};

const isUploadDisabled = (status) => {
    const s = (status || '').toLowerCase();
    return s === 'closed' || s === 'completed' || s === 'paid';
};

function TransportDashboard() {
    const {
        isDashboardLoading,
        dashboardData,
        isOrdersLoading,
        ordersData,
        getVendorDashboard,
        getVendorOrders,
    } = useVendorReducer();

    const [orderOverrides, setOrderOverrides] = useState({});
    const [uploadOrder, setUploadOrder] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        getVendorDashboard();
        getVendorOrders();
    }, [getVendorDashboard, getVendorOrders]);

    const summaryCards = useMemo(
        () => [
            {
                title: 'Total Orders',
                value: String(dashboardData?.total_orders ?? 0),
                icon: <FiTruck />,
                color: '#00368c',
            },
            {
                title: 'Submitted Invoices',
                value: String(dashboardData?.invoices_submitted ?? 0),
                icon: <FiFileText />,
                color: '#3b82f6',
            },
            {
                title: 'Pending Invoices',
                value: String(dashboardData?.pending_invoices ?? 0),
                icon: <FiClock />,
                color: '#f59e0b',
            },
            {
                title: 'Paid Amount',
                value: String(dashboardData?.paid_amount ?? 0),
                icon: <FiDollarSign />,
                color: '#10b981',
            },
        ],
        [dashboardData]
    );

    const statusCards = useMemo(
        () => [
            { label: 'Pending', value: dashboardData?.invoice_status?.pending ?? 0, statusClass: 'status-pending' },
            { label: 'Approved', value: dashboardData?.invoice_status?.approved ?? 0, statusClass: 'status-approved' },
            { label: 'Rejected', value: dashboardData?.invoice_status?.rejected ?? 0, statusClass: 'status-rejected' },
            { label: 'Paid', value: dashboardData?.invoice_status?.paid ?? 0, statusClass: 'status-paid' },
        ],
        [dashboardData]
    );

    const quickActions = [
        { label: 'View Orders', icon: <FiList />, onClick: () => {} },
        { label: 'Manage Vehicles', icon: <FiTruck />, onClick: () => {} },
    ];

    const tableColumns = [
        { label: 'PO No', key: 'poNo' },
        { label: 'WO No', key: 'woNo' },
        { label: 'Subject', key: 'subject' },
        { label: 'Company', key: 'company' },
        { label: 'Order Date', key: 'orderDate' },
        { label: 'Purchaser', key: 'purchaser' },
        { label: 'Amount', key: 'amount' },
        { label: 'Currency', key: 'currency' },
        {
            label: 'Upload Invoice',
            key: 'uploadInvoice',
            render: (row) => (
                <button
                    type="button"
                    className="vendor-upload-btn"
                    disabled={isUploadDisabled(row.status)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setUploadOrder(row);
                        setShowUploadModal(true);
                    }}
                >
                    <FiUpload />
                    Upload
                </button>
            ),
        },
        { label: 'Status', key: 'status', isStatus: true },
    ];

    const tableRows = useMemo(
        () =>
            (ordersData || []).map((order) => {
                const override = orderOverrides[order.po_number];
                return {
                    poNo: order.po_number,
                    woNo: order.wo_number,
                    subject: `${order.vehicle_type || 'Transport'} - Crew transfer`,
                    company: order.company,
                    orderDate: formatDate(order.order_date),
                    purchaser: order.requested_by,
                    amount: order.amount,
                    currency: order.currency,
                    status: override?.status ?? order.status,
                    crew: order.crew || [],
                };
            }),
        [ordersData, orderOverrides]
    );

    return (
        <>
            <PortalDashboard
                title="Transport Company Dashboard"
                subtitle="Overview of trips, vehicles, and pending bookings."
                summaryCards={summaryCards}
                statusTitle="Invoice Status Overview"
                statusCards={statusCards}
                quickActions={quickActions}
                tableTitle="Recent Orders"
                tableColumns={tableColumns}
                tableRows={tableRows}
                isTableLoading={isDashboardLoading || isOrdersLoading}
                emptyMessage="No orders found"
                expandable
                rowKey={(row) => row.poNo}
                renderExpandedRow={(row) => (
                    <div className="vendor-table-scroll">
                        <table className="vendor-table" style={{ marginBottom: 0, minWidth: 960 }}>
                            <thead>
                                <tr>
                                    <th>Crew Name</th>
                                    <th>Rank</th>
                                    <th>Nationality</th>
                                    <th>Passport No</th>
                                    <th>Pickup Status</th>
                                    <th>CheckIn</th>
                                    <th>CheckOut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {row.crew.length ? (
                                    row.crew.map((crew, i) => (
                                        <tr key={`${row.poNo}-crew-${i}`}>
                                            <td>{crew.name}</td>
                                            <td>{crew.rank ?? '—'}</td>
                                            <td>{crew.nationality}</td>
                                            <td>{crew.passport}</td>
                                            <td>
                                                <span className={`vendor-status-badge ${getPickupStatusClass(crew.pickup_status)}`}>
                                                    {crew.pickup_status ?? '—'}
                                                </span>
                                            </td>
                                            <td>
                                                <input
                                                    type="datetime-local"
                                                    readOnly
                                                    tabIndex={-1}
                                                    className="form-control form-control-sm vendor-crew-datetime-input vendor-crew-datetime-input--readonly"
                                                    value={toDateTimeLocal(crew.pickup_datetime)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="datetime-local"
                                                    readOnly
                                                    tabIndex={-1}
                                                    className="form-control form-control-sm vendor-crew-datetime-input vendor-crew-datetime-input--readonly"
                                                    value={toDateTimeLocal(crew.drop_offdatetime)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ color: '#6b7280' }}>
                                            No crew details available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            />

            {!!showUploadModal && (
                <UploadInvoiceModal
                    show={showUploadModal}
                    orderNo={uploadOrder?.poNo}
                    closeModal={() => {
                        setShowUploadModal(false);
                        setUploadOrder(null);
                    }}
                    onUploadComplete={() => {
                        if (!uploadOrder?.poNo) return;
                        setOrderOverrides((prev) => ({
                            ...prev,
                            [uploadOrder.poNo]: { status: 'Completed' },
                        }));
                        setShowUploadModal(false);
                        setUploadOrder(null);
                    }}
                />
            )}
        </>
    );
}

export default TransportDashboard;
