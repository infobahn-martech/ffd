import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { EditKPITaskModal } from "./Modals/EditKPITask";
import { RenderEditAction } from "./RenderCells";

import useKPITasksReducer from "../../store/KPITasksReducer";

const KPITasks = () => {
    const { fetchAllKPITasks, kpiTasksList, isLoadingGet } = useKPITasksReducer((state) => state);

    const [editModal, setEditModal] = useState(null);

    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        searchTerm: "",
        sortBy: "task_name",
        sortOrder: -1,
    });

    useEffect(() => {
        fetchAllKPITasks();
    }, [fetchAllKPITasks]);

    const filteredRows = useMemo(() => {
        const list = Array.isArray(kpiTasksList) ? kpiTasksList : [];
        const q = (params.searchTerm || "").trim().toLowerCase();
        if (!q) return list;
        return list.filter((row) => {
            const name = String(row?.task_name ?? "").toLowerCase();
            const role = String(row?.role ?? "").toLowerCase();
            return name.includes(q) || role.includes(q);
        });
    }, [kpiTasksList, params.searchTerm]);

    const sortedRows = useMemo(() => {
        const key = params.sortBy || "task_name";
        const dir = params.sortOrder === 1 ? 1 : -1;
        const copy = [...filteredRows];
        const sortVal = (row) => {
            const v = row[key];
            if (key === "points" || key === "time_duration") {
                const n = Number(v);
                return Number.isNaN(n) ? v : n;
            }
            return String(v ?? "").toLowerCase();
        };
        copy.sort((a, b) => {
            const av = sortVal(a);
            const bv = sortVal(b);
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
        return copy;
    }, [filteredRows, params.sortBy, params.sortOrder]);

    const tableData = useMemo(() => {
        const total = sortedRows.length;
        const start = (params.page - 1) * params.limit;
        const rows = sortedRows.slice(start, start + params.limit).map((row) => ({
            ...row,
            id: row.kpi_id ?? row.id,
        }));
        return { rows, total };
    }, [sortedRows, params.page, params.limit]);

    const cols = [
        {
            name: "Task Name",
            selector: "task_name",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "260",
        },
        {
            name: "User Role",
            selector: "role",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "160",
        },
        {
            name: "Time",
            // selector: "time_duration",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "120",
            cell: ({ row }) => {
                return <span>{`${row.time_duration || 0} minutes`}</span>;
            },
        },
        {
            name: "Point",
            selector: "points",
            tableClasses: "table-striped",
            contentClass: "table-content",
            sort: true,
            thclass: "tb-head",
            width: "100",
        },
        {
            name: "Actions",
            selector: "actions",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            notView: true,
            onEditClick: (row) => setEditModal(row),
            cell: RenderEditAction,
            width: "100",
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="KPI Tasks"
                            isAddEnabled={false}
                            addModalLabel=""
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1, limit: params.limit })
                            }
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={tableData.total}
                        columns={cols}
                        data={tableData.rows}
                        onPageChange={(currentPage) =>
                            setParams({ ...params, page: currentPage })
                        }
                        onSorting={(sortBy) =>
                            setParams({
                                ...params,
                                sortBy,
                                sortOrder: params.sortOrder === -1 ? 1 : -1,
                                page: 1,
                            })
                        }
                    />
                </div>
            </div>

            {!!editModal && (
                <EditKPITaskModal
                    showModal={editModal}
                    closeModal={() => setEditModal(null)}
                    onSuccess={() => {
                        setEditModal(null);
                        fetchAllKPITasks();
                    }}
                />
            )}
        </>
    );
};

export default KPITasks;
