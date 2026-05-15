import { useState, useMemo, useEffect, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import CustomTable from '../../components/customTable';
import { Tooltip } from 'react-tooltip';
import { FiX, FiChevronLeft, FiChevronRight, FiSearch, FiFileText, FiDollarSign, FiList } from 'react-icons/fi';
import '../../design/scss/common.scss';
import './DocumentsModal.scss';

// ✅ Updated Dummy data for On Station (as per image)
const initialOnStation = [
    {
        _id: '1',
        cardId: 95,
        vesselName: 'Chayari Tide',
        client: 'Tide Water',
        ownerName: 'Pacific Maritime Ltd',
        vesselManager: 'John Smith',
        importDate: '15th Feb 2026',
        exportDate: '-',
        salesOrderPrinted: true,
        salesOrderConverted: true,
        assignedTo: 'Operator',
        summaryReady: true,
    },
    {
        _id: '2',
        cardId: 99,
        vesselName: 'Ocean Star',
        client: 'Blue Marine',
        ownerName: 'Atlantic Shipping Co',
        vesselManager: 'Sarah Wilson',
        importDate: '16th Feb 2026',
        exportDate: '-',
        salesOrderPrinted: true,
        salesOrderConverted: false,
        assignedTo: null,
        summaryReady: false,
    },
    {
        _id: '3',
        cardId: 92,
        vesselName: 'Sea Falcon',
        client: 'Harbor Logistics',
        ownerName: 'Harbor Fleet Inc',
        vesselManager: 'Michael Brown',
        importDate: '18th Feb 2026',
        exportDate: '-',
        salesOrderPrinted: true,
        salesOrderConverted: true,
        assignedTo: 'Supervisor',
        summaryReady: false,
    },
    {
        _id: '4',
        cardId: 88,
        vesselName: 'Wave Rider',
        client: 'Port Co.',
        ownerName: 'Port Holdings',
        vesselManager: 'Emma Davis',
        importDate: '20th Feb 2026',
        exportDate: '-',
        salesOrderPrinted: false,
        salesOrderConverted: false,
        assignedTo: null,
        summaryReady: false,
    },
    {
        _id: '5',
        cardId: 85,
        vesselName: 'Neptune Voyager',
        client: 'Global Shipping',
        ownerName: 'Global Maritime Group',
        vesselManager: 'James Taylor',
        importDate: '22nd Feb 2026',
        exportDate: '-',
        salesOrderPrinted: true,
        salesOrderConverted: true,
        assignedTo: 'Operator',
        summaryReady: true,
    },
];

function OnStationModal({ show, onClose }) {
    const [onStation] = useState(initialOnStation);
    const [searchQuery, setSearchQuery] = useState('');

    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    const [params, setParams] = useState({
        page: 1,
        total: initialOnStation.length,
        limit: 10,
        sortBy: '',
        sortOrder: -1,
    });

    // ✅ keep total updated
    useEffect(() => {
        setParams((prev) => ({ ...prev, total: onStation.length }));
    }, [onStation]);

    // ✅ Filter based on search query (updated fields)
    const filteredDocuments = useMemo(() => {
        if (!searchQuery.trim()) return onStation;

        const query = searchQuery.toLowerCase();

        return onStation.filter((row) => {
            const assigned = row.assignedTo ? row.assignedTo.toLowerCase() : '';
            return (
                row.cardId.toString().includes(query) ||
                (row.vesselName || '').toLowerCase().includes(query) ||
                (row.client || '').toLowerCase().includes(query) ||
                (row.ownerName || '').toLowerCase().includes(query) ||
                (row.vesselManager || '').toLowerCase().includes(query) ||
                (row.importDate || '').toLowerCase().includes(query) ||
                (row.exportDate || '').toLowerCase().includes(query) ||
                assigned.includes(query)
            );
        });
    }, [onStation, searchQuery]);

    // ✅ Pagination
    const paginatedData = useMemo(() => {
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        return filteredDocuments.slice(startIndex, endIndex);
    }, [filteredDocuments, params.page, params.limit]);

    const totalPages = Math.ceil(filteredDocuments.length / params.limit);

    // Reset to page 1 when search changes
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setParams((prev) => ({ ...prev, page: 1 }));
    };

    const HEADER_TRUNCATE_LENGTH = 9;

    // Column header: truncate after 11 chars with "..." and tooltip
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

    // ✅ Helpers for Action buttons (icon-only with tooltip)
    const ActionButton = ({ icon: Icon, disabled, tooltip, onClick, tooltipId }) => {
        if (disabled) {
            return (
                <>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-2 on-station-action-btn"
                        disabled
                        data-tooltip-id={tooltipId}
                        data-tooltip-content={tooltip}
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        aria-label={tooltip}
                    >
                        <Icon size={18} />
                    </button>
                    <Tooltip id={tooltipId} place="top" />
                </>
            );
        }

        return (
            <>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary me-2 on-station-action-btn"
                    onClick={onClick}
                    data-tooltip-id={tooltipId}
                    data-tooltip-content={tooltip}
                    aria-label={tooltip}
                >
                    <Icon size={18} />
                </button>
                <Tooltip id={tooltipId} place="top" />
            </>
        );
    };

    const cols = [
        {
            name: <HeaderLabel label="VESSEL NAME" tooltipId="th-vessel-name" />,
            selector: 'vesselName',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '200',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.vesselName}
                    maxLength={11}
                    tooltipId={`vessel-${props.row._id}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="CLIENT" tooltipId="th-client" />,
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
                    tooltipId={`client-${props.row._id}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="OWNER NAME" tooltipId="th-owner-name" />,
            selector: 'ownerName',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '180',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.ownerName}
                    maxLength={11}
                    tooltipId={`owner-${props.row._id}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="VESSEL MANAGER" tooltipId="th-vessel-manager" />,
            selector: 'vesselManager',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '140',
            cell: (props) => (
                <TruncatedCell
                    text={props.row.vesselManager}
                    maxLength={11}
                    tooltipId={`manager-${props.row._id}`}
                />
            ),
        },
        {
            name: <HeaderLabel label="IMPORT DATE" tooltipId="th-import-date" />,
            selector: 'importDate',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '140',
            cell: (props) => <span>{props.row.importDate || '-'}</span>,
        },
        {
            name: <HeaderLabel label="EXPORT DATE" tooltipId="th-export-date" />,
            selector: 'exportDate',
            tableClasses: 'table-striped',
            sort: true,
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '140',
            cell: (props) => <span>{props.row.exportDate || '-'}</span>,
        },
        {
            name: <HeaderLabel label="ON STATION" tooltipId="th-on-station" />,
            selector: 'actions',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            width: '420',
            cell: (props) => {
                const row = props.row;
                const canPrintInvoice = !!row.salesOrderConverted && !!row.assignedTo;

                return (
                    <div className="d-flex flex-wrap align-items-center gap-2">
                        <ActionButton
                            icon={FiFileText}
                            disabled={!row.salesOrderPrinted}
                            tooltip={row.salesOrderPrinted ? 'Print Sales Order' : 'Sales Order not available yet'}
                            tooltipId={`so-${row._id}`}
                            onClick={() => console.log('Print Sales Order:', row.cardId)}
                        />
                        <ActionButton
                            icon={FiDollarSign}
                            disabled={!canPrintInvoice}
                            tooltip={canPrintInvoice ? 'Print Invoice' : 'Invoice will be reflected once Sales Order is converted by Assigned Operator/Supervisor'}
                            tooltipId={`inv-${row._id}`}
                            onClick={() => console.log('Print Invoice:', row.cardId)}
                        />
                        <ActionButton
                            icon={FiList}
                            disabled={!row.summaryReady}
                            tooltip={row.summaryReady ? 'Print Summary' : 'Summary Sheet not ready'}
                            tooltipId={`sum-${row._id}`}
                            onClick={() => console.log('Print Summary:', row.cardId)}
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
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="documents-table-wrapper">
                <CustomTable
                    tableClasses="documents-table"
                    count={filteredDocuments.length}
                    columns={cols}
                    data={paginatedData ?? []}
                    pagination={{ currentPage: params.page, limit: params.limit }}
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
                        {filteredDocuments.length === 0
                            ? 'Showing 0 entries'
                            : `Showing ${((params.page - 1) * params.limit) + 1} to ${Math.min(
                                params.page * params.limit,
                                filteredDocuments.length
                            )} of ${filteredDocuments.length} entries`}
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
