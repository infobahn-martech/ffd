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
import CustomModal from '../../../components/CustomModal';
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

function UploadInvoiceModal({ show, closeModal, orderNo, onUploadComplete }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!show) return;
        setSelectedFiles([]);
        setIsUploading(false);
        setIsDragging(false);
        setError('');
    }, [show, orderNo]);

    const handleAddFiles = (filesLike) => {
        const files = Array.from(filesLike || []);
        if (!files.length) return;
        setSelectedFiles((prev) => [...prev, ...files]);
        setError('');
    };

    const handleRemoveIndex = (idx) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const renderSelected = useMemo(() => {
        if (!selectedFiles.length) return null;
        return (
            <div className="file-drop-zone__selected">
                {selectedFiles.slice(0, 3).map((f, idx) => (
                    <span key={`${f.name}-${idx}`} className="d-inline-flex align-items-center gap-2">
                        <span className="file-drop-zone__name">{f.name}</span>
                        <button
                            type="button"
                            className="file-drop-zone__clear"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveIndex(idx);
                            }}
                            aria-label={`Remove ${f.name}`}
                        >
                            Remove
                        </button>
                    </span>
                ))}
                {selectedFiles.length > 3 && (
                    <small className="text-muted" style={{ marginLeft: 8 }}>
                        +{selectedFiles.length - 3} more
                    </small>
                )}
            </div>
        );
    }, [selectedFiles]);

    const renderHeader = () => <h1 className="modal-title">Upload Invoice</h1>;

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <div className="row">
                    <div className="col-md-12 mb-lg-3 mb-sm-0">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <label className="form-label mb-0">
                                Attach invoices <span className="text-danger">*</span>
                            </label>
                            <small className="text-muted">Order: {orderNo}</small>
                        </div>

                        <div className="file-drop-zone-wrapper">
                            <div
                                className={`file-drop-zone ${isDragging ? 'file-drop-zone--active' : ''} ${error ? 'file-drop-zone--error' : ''}`}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(false);
                                    handleAddFiles(e.dataTransfer?.files);
                                }}
                                onClick={() => document.getElementById('transport-upload-invoice-input').click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        document.getElementById('transport-upload-invoice-input').click();
                                    }
                                }}
                            >
                                <input
                                    id="transport-upload-invoice-input"
                                    type="file"
                                    className="d-none"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.jpe"
                                    onChange={(e) => handleAddFiles(e.target?.files)}
                                />

                                {selectedFiles.length ? (
                                    <>
                                        <span className="file-drop-zone__icon">✓</span>
                                        <span className="file-drop-zone__text">Files selected ({selectedFiles.length})</span>
                                        {renderSelected}
                                    </>
                                ) : (
                                    <>
                                        <span className="file-drop-zone__icon">📎</span>
                                        <span className="file-drop-zone__text">
                                            {isDragging ? 'Drop your files here' : 'Drag and drop your files here'}
                                        </span>
                                        <span className="file-drop-zone__hint">or click to browse</span>
                                        <span className="file-drop-zone__formats">PDF, JPG, JPEG</span>
                                    </>
                                )}
                            </div>

                            {error && <span className="error text-danger d-block mt-1">{error}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="modal-footer">
            <button
                type="button"
                className="btn btn-outline"
                onClick={() => closeModal(null)}
                disabled={isUploading}
            >
                Close
            </button>
            <button
                type="button"
                className="btn btn-primary"
                disabled={isUploading}
                onClick={() => {
                    if (!selectedFiles.length) {
                        setError('Please select at least one invoice file');
                        return;
                    }

                    setIsUploading(true);
                    setTimeout(() => {
                        onUploadComplete?.(selectedFiles);
                        closeModal(null);
                    }, 1500);
                }}
            >
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="invoice-modal-sm"
            dialgName="modal-dialog modal-dialog-centered modal-lg"
            show={show}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}

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
