import { useState, useMemo, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { debounce } from 'lodash';
import CustomTable from '../../components/customTable';
import { Tooltip } from 'react-tooltip';
import { FiX, FiChevronLeft, FiChevronRight, FiSearch, FiFileText, FiDollarSign, FiList } from 'react-icons/fi';
import useOnStationReducer from '../../store/OnStationReducer';
import '../../design/scss/common.scss';
import '../../design/scss/structure/header/DocumentsModal.scss';

const HEADER_TRUNCATE_LENGTH = 9;

const getRowId = (row) => row?.call_id ?? row?._id;

// Column header: truncate after 9 chars with "..." and tooltip
const HeaderLabel = ({ label, tooltipId }) => {
    const isTruncated = label.length > HEADER_TRUNCATE_LENGTH;
    const displayText = isTruncated ? label.substring(0, HEADER_TRUNCATE_LENGTH) + '..' : label;
    return (
        <>
            <span
                data-tooltip-id={isTruncated ? tooltipId : undefined}
                data-tooltip-content={isTruncated ? label : undefined}
                className="table-header-label"
            >
                {displayText}
            </span>
            {isTruncated && <Tooltip id={tooltipId} place="top" />}
        </>
    );
};

// Helper component for truncated text with tooltip (data cells: 11 chars)
const TruncatedCell = ({ text, maxLength = 11, tooltipId }) => {
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
            name: <HeaderLabel label="Vessel Name" tooltipId="th-vessel-name" />,
            selector: 'vesselName',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '200',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.vessel_name ?? props.row.vesselName}
                    maxLength={11}
                    tooltipId={`vessel-${getRowId(props.row)}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="Client" tooltipId="th-client" />,
            selector: 'client',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '180',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.client}
                    maxLength={11}
                    tooltipId={`client-${getRowId(props.row)}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="Owner Name" tooltipId="th-owner-name" />,
            selector: 'ownerName',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '180',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.owner_name ?? props.row.ownerName}
                    maxLength={11}
                    tooltipId={`owner-${getRowId(props.row)}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="Vessel Manager" tooltipId="th-vessel-manager" />,
            selector: 'vesselManager',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '140',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.vessel_manager ?? props.row.vesselManager}
                    maxLength={11}
                    tooltipId={`manager-${getRowId(props.row)}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="Import Date" tooltipId="th-import-date" />,
            selector: 'importDate',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '140',
            cell: (props) => <span>{props.row.import_date ?? props.row.importDate ?? '-'}</span>,
        },
        {
            name: <HeaderLabel label="Export Date" tooltipId="th-export-date" />,
            selector: 'exportDate',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '140',
            cell: (props) => <span>{props.row.export_date ?? props.row.exportDate ?? '-'}</span>,
        },
        {
            name: <HeaderLabel label="On Station" tooltipId="th-on-station" />,
            selector: 'actions',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '420',
            cell: (props) => {
                const row = props.row;
                const rowId = getRowId(row);
                const isEnabled = !!row.is_enabled;
                const onStationId = row.on_station_id ?? null;
                const salesOrderId = row.sales_order_id ?? null;
                const salesOrderNo = row.sales_order_no ?? null;
                const taxInvoiceId = row.tax_invoice_id ?? null;
                const taxInvoiceNo = row.tax_invoice_no ?? null;
                const taxInvoiceSent = !!row.tax_invoice_sent;
                const loading = rowActionLoading[rowId] || {};

                // Button 1: Enable On Station -> Create Sales Order (once enabled)
                let btn1Tooltip = 'Enable On Station';
                let btn1Disabled = false;
                let btn1OnClick = () => toggleOnStation({ call_id: rowId, is_enabled: true });

                if (isEnabled && !salesOrderId) {
                    btn1Tooltip = 'Create Sales Order';
                    btn1OnClick = () => createSalesOrder({ call_id: rowId, on_station_id: onStationId });
                } else if (salesOrderId) {
                    btn1Disabled = true;
                    btn1Tooltip = `Sales Order: ${salesOrderNo ?? salesOrderId}`;
                }

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
                            loading={loading.toggle || loading.createSalesOrder}
                            tooltip={btn1Tooltip}
                            tooltipId={`so-${rowId}`}
                            onClick={btn1OnClick}
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
            className="documents-modal"
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
