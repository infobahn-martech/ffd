import { useMemo, useState } from "react";
import { AddEditInvoicesModal } from "./Modals/AddEditInvoicesModal";
import DeleteConfirmationModal from "../../../components/DeleteConfirmationModal";
import CommonHeader from "../../../components/CommonHeader";
import CustomTable from "../../../components/customTable";

// Optional: replace these with your actual table action renderers if already available
const RenderStatusBadge = ({ row }) => {
    const statusMap = {
        Pending: { bg: "#FFF3CD", color: "#856404" },
        Approved: { bg: "#DDEBFF", color: "#1D4ED8" },
        Paid: { bg: "#D1FAE5", color: "#047857" },
        Rejected: { bg: "#FEE2E2", color: "#DC2626" },
    };

    const style = statusMap[row.status] || { bg: "#E5E7EB", color: "#374151" };

    return (
        <span
            style={{
                background: style.bg,
                color: style.color,
                padding: "4px 10px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-block",
            }}
        >
            {row.status}
        </span>
    );
};

const RenderAction = ({ row, onEditClick, onDeleteClick }) => {
    return (
        <div style={{ display: "flex", gap: "8px" }}>
            <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => onEditClick(row)}
            >
                Edit
            </button>
            <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => onDeleteClick(row)}
            >
                Delete
            </button>
        </div>
    );
};

const initialMockInvoices = [
    {
        _id: "1",
        refNo: "INV-2024-101",
        woNo: "WO-8842",
        poNo: "PO-2201",
        amount: "£3,200",
        date: "12 Mar 2025",
        status: "Pending",
    },
    {
        _id: "2",
        refNo: "INV-2024-100",
        woNo: "WO-8839",
        poNo: "PO-2198",
        amount: "£1,850",
        date: "10 Mar 2025",
        status: "Approved",
    },
    {
        _id: "3",
        refNo: "INV-2024-099",
        woNo: "WO-8835",
        poNo: "PO-2194",
        amount: "£5,100",
        date: "08 Mar 2025",
        status: "Paid",
    },
    {
        _id: "4",
        refNo: "INV-2024-098",
        woNo: "WO-8830",
        poNo: "PO-2189",
        amount: "£2,400",
        date: "05 Mar 2025",
        status: "Rejected",
    },
    {
        _id: "5",
        refNo: "INV-2024-097",
        woNo: "WO-8828",
        poNo: "PO-2187",
        amount: "£4,200",
        date: "03 Mar 2025",
        status: "Paid",
    },
    {
        _id: "6",
        refNo: "INV-2024-096",
        woNo: "WO-8826",
        poNo: "PO-2185",
        amount: "£950",
        date: "01 Mar 2025",
        status: "Pending",
    },
];

const Invoices = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "refNo",
        sortOrder: 1,
    });

    const [mockInvoices, setMockInvoices] = useState(initialMockInvoices);
    const [showInvoicesModal, setShowInvoicesModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [selectedInvoiceForDelete, setSelectedInvoiceForDelete] = useState(null);

    const filteredInvoices = useMemo(() => {
        let data = [...mockInvoices];

        if (params.searchTerm) {
            const search = params.searchTerm.toLowerCase();
            data = data.filter((item) =>
                [item.refNo, item.woNo, item.poNo, item.status, item.amount, item.date]
                    .filter(Boolean)
                    .some((value) => String(value).toLowerCase().includes(search))
            );
        }

        if (params.sortBy) {
            data.sort((a, b) => {
                const aVal = a[params.sortBy];
                const bVal = b[params.sortBy];

                if (aVal < bVal) return -1 * params.sortOrder;
                if (aVal > bVal) return 1 * params.sortOrder;
                return 0;
            });
        }

        return data;
    }, [mockInvoices, params.searchTerm, params.sortBy, params.sortOrder]);

    const paginatedInvoices = useMemo(() => {
        const start = (params.page - 1) * params.limit;
        const end = start + params.limit;
        return filteredInvoices.slice(start, end);
    }, [filteredInvoices, params.page, params.limit]);

    const cols = [
        {
            name: "Ref No",
            selector: "refNo",
            sort: true,
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "WO No",
            selector: "woNo",
            sort: true,
            width: "160",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "PO No",
            selector: "poNo",
            sort: true,
            width: "160",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Amount",
            selector: "amount",
            sort: true,
            width: "140",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Date",
            selector: "date",
            sort: true,
            width: "160",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Status",
            selector: "status",
            sort: true,
            width: "160",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: RenderStatusBadge,
        },
        {
            name: "Actions",
            selector: "actions",
            width: "160",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (row) => (
                <RenderAction
                    row={row}
                    onEditClick={(invoice) => {
                        setSelectedInvoice(invoice);
                        setShowInvoicesModal(true);
                    }}
                    onDeleteClick={(invoice) => {
                        setSelectedInvoiceForDelete(invoice);
                    }}
                />
            ),
        },
    ];

    const handleAddInvoice = () => {
        setSelectedInvoice(null);
        setShowInvoicesModal(true);
    };

    const handleSaveMockInvoice = (formData) => {
        if (selectedInvoice?._id) {
            setMockInvoices((prev) =>
                prev.map((item) =>
                    item._id === selectedInvoice._id
                        ? { ...item, ...formData, _id: selectedInvoice._id }
                        : item
                )
            );
        } else {
            setMockInvoices((prev) => [
                {
                    _id: String(Date.now()),
                    ...formData,
                },
                ...prev,
            ]);
        }

        setShowInvoicesModal(false);
        setSelectedInvoice(null);
    };

    return (
        <div className="page-body">
            <div className="prospect employee">
                <div className="container-fluid">
                    <CommonHeader
                        tableTitle="Invoices"
                        isAddEnabled
                        addModalLabel="Add Invoice"
                        setSearch={(e) =>
                            setParams((prev) => ({
                                ...prev,
                                searchTerm: e,
                                page: 1,
                            }))
                        }
                        searchValue={params.searchTerm}
                        onAddModalClick={handleAddInvoice}
                        exportTitle="Export"
                        exportLoader={false}
                    />
                </div>

                <CustomTable
                    Sl
                    pagination={{ currentPage: params.page, limit: params.limit }}
                    tableClasses="px-start"
                    count={filteredInvoices.length}
                    columns={cols}
                    data={paginatedInvoices}
                    isLoading={false}
                    onPageChange={(currentPage) =>
                        setParams((prev) => ({ ...prev, page: currentPage }))
                    }
                    setLimit={(newLimit) =>
                        setParams((prev) => ({ ...prev, limit: newLimit, page: 1 }))
                    }
                    onSorting={(sortBy) =>
                        setParams((prev) => ({
                            ...prev,
                            sortBy,
                            sortOrder: prev.sortOrder === 1 ? -1 : 1,
                            page: 1,
                        }))
                    }
                />

                {!!showInvoicesModal && (
                    <AddEditInvoicesModal
                        showModal={showInvoicesModal}
                        closeModal={() => {
                            setShowInvoicesModal(false);
                            setSelectedInvoice(null);
                        }}
                        selectedData={selectedInvoice}
                        onSuccess={handleSaveMockInvoice}
                        isBeingUpdated={false}
                    />
                )}

                {!!selectedInvoiceForDelete && (
                    <DeleteConfirmationModal
                        show={!!selectedInvoiceForDelete}
                        onCancel={() => setSelectedInvoiceForDelete(null)}
                        onConfirm={() => {
                            setMockInvoices((prev) =>
                                prev.filter((item) => item._id !== selectedInvoiceForDelete._id)
                            );
                            setSelectedInvoiceForDelete(null);
                        }}
                        deleteText={`Are you sure you want to delete invoice "${selectedInvoiceForDelete?.refNo}"?`}
                        isLoading={false}
                    />
                )}
            </div>
        </div>
    );
};

export default Invoices;