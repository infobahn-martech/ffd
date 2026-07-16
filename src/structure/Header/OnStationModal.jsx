import { useState, useMemo, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { debounce } from 'lodash';
import CustomTable from '../../components/customTable';
import { Tooltip } from 'react-tooltip';
import { FiX, FiChevronLeft, FiChevronRight, FiSearch, FiFileText, FiDollarSign, FiList } from 'react-icons/fi';
import useOnStationReducer from '../../store/OnStationReducer';
import '../../design/scss/common.scss';
import '../../design/scss/structure/header/DocumentsModal.scss';

const getRowId = (row) => row?.call_id ?? row?._id;

// Helper component for truncated text with tooltip (falls back to "-" when empty)
const TruncatedCell = ({ text, maxLength = 30, tooltipId }) => {
    if (!text) return <span>-</span>;
    const isTruncated = text.length > maxLength;
    const displayText = isTruncated ? text.substring(0, maxLength) + '...' : text;

    return (
        <>
            <span
                data-tooltip-id={isTruncated ? tooltipId : undefined}
                data-tooltip-content={isTruncated ? text : undefined}
                className="truncated-cell-text"
            >
                {displayText}
            </span>
            {isTruncated && <Tooltip id={tooltipId} place="top" />}
        </>
    );
};

// On Station enable/disable switch (pill toggle, row-wise loading state)
const OnStationSwitch = ({ isEnabled, loading, onChange, tooltipId }) => (
    <>
        <button
            type="button"
            role="switch"
            aria-checked={isEnabled}
            aria-label={isEnabled ? 'Disable On Station' : 'Enable On Station'}
            className={`on-station-pill-toggle${isEnabled ? ' on-station-pill-toggle--on' : ''}`}
            disabled={loading}
            onClick={loading ? undefined : onChange}
            data-tooltip-id={tooltipId}
            data-tooltip-content={loading ? 'Processing...' : isEnabled ? 'Enabled' : 'Disabled'}
            style={loading ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
        >
            <span className="on-station-pill-toggle__thumb" />
        </button>
        <Tooltip id={tooltipId} place="top" />
    </>
);

// Helper for Action buttons (icon-only with tooltip, row-wise loading spinner)
const ActionButton = ({ icon: Icon, disabled, loading, tooltip, onClick, tooltipId }) => {
    const isDisabled = disabled || loading;

    return (
        <>
            <button
                type="button"
                className={`btn btn-sm ${isDisabled ? 'btn-outline-secondary' : 'btn-outline-primary'} me-2 on-station-action-btn`}
                disabled={isDisabled}
                onClick={isDisabled ? undefined : onClick}
                data-tooltip-id={tooltipId}
                data-tooltip-content={loading ? 'Processing...' : tooltip}
                style={isDisabled ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                aria-label={tooltip}
            >
                {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                    <Icon size={18} />
                )}
            </button>
            <Tooltip id={tooltipId} place="top" />
        </>
    );
};

function OnStationModal({ show, onClose }) {
    const {
        list,
        total,
        isLoadingList,
        rowActionLoading,
        getOnStationList,
        toggleOnStation,
        createSalesOrder,
        convertToTaxInvoice,
        sendTaxInvoice,
    } = useOnStationReducer();

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        sortBy: '',
        sortOrder: -1,
    });

    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    // 500ms debounced search -> backend query
    const debouncedSetSearch = useMemo(
        () =>
            debounce((value) => {
                setParams((prev) => ({ ...prev, page: 1 }));
                setDebouncedSearch(value);
            }, 500),
        []
    );

    useEffect(() => () => debouncedSetSearch.cancel(), [debouncedSetSearch]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        debouncedSetSearch(value);
    };

    // Fetch list on modal open and whenever page/limit/search change
    useEffect(() => {
        if (!show) return;
        getOnStationList({ page: params.page, limit: params.limit, search: debouncedSearch });
    }, [show, params.page, params.limit, debouncedSearch, getOnStationList]);

    const totalPages = Math.ceil(total / params.limit) || 0;

    const cols = [
        {
            name: 'Vessel Name',
            selector: 'vessel_name',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '200',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.vessel_name}
                    maxLength={30}
                    tooltipId={`vessel-${getRowId(props.row)}`}
                />
            ),
        },
        {
            name: 'Client',
            selector: 'billing_entity',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '180',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.billing_entity}
                    maxLength={30}
                    tooltipId={`client-${getRowId(props.row)}`}
                />
            ),
        },
        {
            name: 'Owner Name',
            selector: 'vessel_owner',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '180',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.vessel_owner}
                    maxLength={30}
                    tooltipId={`owner-${getRowId(props.row)}`}
                />
            ),
        },
        {
            name: 'Vessel Manager',
            selector: 'vessel_manager',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '170',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.vessel_manager}
                    maxLength={30}
                    tooltipId={`manager-${getRowId(props.row)}`}
                />
            ),
        },
        {
            // Import Port Call Custom Clearance Date (backend-derived, not computed here)
            name: 'Import Date',
            selector: 'import_custom_clearance_date',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '150',
            cell: (props) => <span>{props.row.import_custom_clearance_date ?? '-'}</span>,
        },
        {
            // Export Port Call ATD (backend-derived, not computed here)
            name: 'Export Date',
            selector: 'export_atd',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '150',
            cell: (props) => <span>{props.row.export_atd ?? '-'}</span>,
        },
        {
            name: 'On Station',
            selector: 'is_enabled',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '130',
            cell: (props) => {
                const row = props.row;
                const rowId = getRowId(row);
                const isEnabled = Number(row.is_enabled) === 1;
                const loading = rowActionLoading[rowId] || {};

                return (
                    <OnStationSwitch
                        isEnabled={isEnabled}
                        loading={!!loading.toggle}
                        tooltipId={`switch-${rowId}`}
                        onChange={() => toggleOnStation({ call_id: rowId, is_enabled: !isEnabled })}
                    />
                );
            },
        },
        {
            name: 'Actions',
            selector: 'actions',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '340',
            cell: (props) => {
                const row = props.row;
                const rowId = getRowId(row);
                const isEnabled = Number(row.is_enabled) === 1;
                const onStationId = row.on_station_id ?? null;
                const salesOrderId = row.sales_order_id ?? null;
                const salesOrderNo = row.sales_order_no ?? null;
                const taxInvoiceId = row.tax_invoice_id ?? null;
                const taxInvoiceNo = row.tax_invoice_no ?? null;
                const taxInvoiceSent = Number(row.tax_invoice_sent) === 1;
                const loading = rowActionLoading[rowId] || {};

                // Button 1: Create Sales Order (only once On Station is enabled)
                const btn1Disabled = !isEnabled || !!salesOrderId;
                const btn1Tooltip = salesOrderId
                    ? `Sales Order: ${salesOrderNo ?? salesOrderId}`
                    : isEnabled
                        ? 'Create Sales Order'
                        : 'Enable On Station first';

                // Button 2: Convert to Tax Invoice
                const btn2Disabled = !salesOrderId || !!taxInvoiceId;
                const btn2Tooltip = taxInvoiceId
                    ? `Tax Invoice: ${taxInvoiceNo ?? taxInvoiceId}`
                    : salesOrderId
                        ? 'Convert to Tax Invoice'
                        : 'Create Sales Order first';

                // Button 3: Send Tax Invoice
                const btn3Disabled = !taxInvoiceId || taxInvoiceSent;
                const btn3Tooltip = taxInvoiceSent
                    ? 'Tax Invoice Sent'
                    : taxInvoiceId
                        ? 'Send Tax Invoice'
                        : 'Convert to Tax Invoice first';

                return (
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <ActionButton
                            icon={FiFileText}
                            disabled={btn1Disabled}
                            loading={loading.createSalesOrder}
                            tooltip={btn1Tooltip}
                            tooltipId={`so-${rowId}`}
                            onClick={() => createSalesOrder({ call_id: rowId, on_station_id: onStationId })}
                        />
                        <ActionButton
                            icon={FiDollarSign}
                            disabled={btn2Disabled}
                            loading={loading.convertTaxInvoice}
                            tooltip={btn2Tooltip}
                            tooltipId={`inv-${rowId}`}
                            onClick={() => convertToTaxInvoice({ call_id: rowId, sales_order_id: salesOrderId })}
                        />
                        <ActionButton
                            icon={FiList}
                            disabled={btn3Disabled}
                            loading={loading.sendTaxInvoice}
                            tooltip={btn3Tooltip}
                            tooltipId={`sum-${rowId}`}
                            onClick={() => sendTaxInvoice({ call_id: rowId, tax_invoice_id: taxInvoiceId })}
                        />
                    </div>
                );
            },
        },
    ];

    const renderBody = () => (
        <>
            {/* Search Section */}
            <div className="documents-search">
                <div className="search-group">
                    <div className="search-input-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            className="form-control search-input"
                            placeholder="Search by Card ID, Vessel Name, Client, Owner, Vessel Manager, Import/Export Date, Assigned..."
                            value={searchInput}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="documents-table-wrapper">
                <CustomTable
                    tableClasses="documents-table"
                    count={total}
                    columns={cols}
                    data={list ?? []}
                    isLoading={isLoadingList}
                    pagination={{ currentPage: params.page, limit: params.limit }}
                    getRowKey={(row, idx) => getRowId(row) ?? idx}
                    onSorting={(sortBy) => {
                        setParams((prev) => ({
                            ...prev,
                            sortBy,
                            sortOrder: prev?.sortOrder === -1 ? 1 : -1,
                            page: 1,
                        }));
                    }}
                />
            </div>

            {/* Footer with Pagination */}
            <div className="documents-footer">
                <div className="footer-left">
                    <span className="results-info">
                        {total === 0
                            ? 'Showing 0 entries'
                            : `Showing ${((params.page - 1) * params.limit) + 1} to ${Math.min(
                                params.page * params.limit,
                                total
                            )} of ${total} entries`}
                    </span>
                </div>

                <div className="footer-right">
                    <div className="simple-pagination">
                        <button
                            className="pagination-btn prev-btn"
                            onClick={() => setParams((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={params.page === 1}
                            aria-label="Previous page"
                        >
                            <FiChevronLeft />
                        </button>

                        <button className="pagination-btn page-number-btn active">
                            {params.page}
                        </button>

                        <button
                            className="pagination-btn next-btn"
                            onClick={() => setParams((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                            disabled={params.page >= totalPages || totalPages === 0}
                            aria-label="Next page"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <Modal
            show={show}
            onHide={handleClose}
            className="documents-modal on-station-modal"
            dialogClassName="modal-dialog modal-dialog-centered modal-xl"
            centered
            backdrop="static"
            size="xl"
        >
            <Modal.Header className="documents-modal-header" closeButton={false}>
                <Modal.Title className="modal-title">On Station</Modal.Title>
                <button
                    type="button"
                    className="modal-close-btn"
                    onClick={handleClose}
                    aria-label="Close modal"
                >
                    <FiX size={20} />
                </button>
            </Modal.Header>
            <Modal.Body className="documents-modal-body">{renderBody()}</Modal.Body>
        </Modal>
    );
}

export default OnStationModal;
