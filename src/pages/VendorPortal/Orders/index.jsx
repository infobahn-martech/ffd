import { useMemo, useState } from "react";
import CommonHeader from "../../../components/CommonHeader";
import CustomTable from "../../../components/customTable";

const RenderStatusBadge = ({ row }) => {
    const statusMap = {
        Pending: { bg: "#FFF3CD", color: "#856404" },
        Approved: { bg: "#DDEBFF", color: "#1D4ED8" },
        Paid: { bg: "#D1FAE5", color: "#047857" },
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

const mockOrders = [
    {
        _id: "1",
        refNo: "ORD-2025-001",
        dateSubmitted: "12 Mar 2025",
        woPoNo: "WO-8842 / PO-2201",
        amount: "SAR3,200",
        status: "Pending",
    },
    {
        _id: "2",
        refNo: "ORD-2025-002",
        dateSubmitted: "10 Mar 2025",
        woPoNo: "WO-8839 / PO-2198",
        amount: "SAR1,850",
        status: "Approved",
    },
    {
        _id: "3",
        refNo: "ORD-2025-003",
        dateSubmitted: "08 Mar 2025",
        woPoNo: "WO-8835 / PO-2194",
        amount: "SAR5,100",
        status: "Paid",
    },
    {
        _id: "4",
        refNo: "ORD-2025-004",
        dateSubmitted: "05 Mar 2025",
        woPoNo: "WO-8830 / PO-2189",
        amount: "SAR2,400",
        status: "Pending",
    },
    {
        _id: "5",
        refNo: "ORD-2025-005",
        dateSubmitted: "03 Mar 2025",
        woPoNo: "WO-8828 / PO-2187",
        amount: "SAR4,200",
        status: "Approved",
    },
];

const Orders = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "refNo",
        sortOrder: 1,
    });

    const filteredOrders = useMemo(() => {
        let data = [...mockOrders];

        if (params.searchTerm) {
            const search = params.searchTerm.toLowerCase();
            data = data.filter((item) =>
                [item.refNo, item.dateSubmitted, item.woPoNo, item.amount, item.status]
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
    }, [params]);

    const paginatedOrders = useMemo(() => {
        const start = (params.page - 1) * params.limit;
        const end = start + params.limit;
        return filteredOrders.slice(start, end);
    }, [filteredOrders, params.page, params.limit]);

    const cols = [
        {
            name: "Ref No",
            selector: "refNo",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Date Submitted",
            selector: "dateSubmitted",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "WO/PO No",
            selector: "woPoNo",
            sort: true,
            width: "320",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Amount",
            selector: "amount",
            sort: true,
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Status",
            selector: "status",
            sort: true,
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: RenderStatusBadge,
        },
    ];

    return (
        <div className="page-body">
            <div className="prospect employee">
                <div className="container-fluid">
                    <CommonHeader
                        tableTitle="Invoice History"
                        setSearch={(e) =>
                            setParams((prev) => ({
                                ...prev,
                                searchTerm: e,
                                page: 1,
                            }))
                        }
                        searchValue={params.searchTerm}
                        exportTitle="Export"
                        exportLoader={false}
                        isAddEnabled={false}
                    />
                </div>
                <CustomTable
                    Sl
                    pagination={{ currentPage: params.page, limit: params.limit }}
                    tableClasses="px-start"
                    count={filteredOrders.length}
                    columns={cols}
                    data={paginatedOrders}
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
            </div>
        </div>
    );
};

export default Orders;