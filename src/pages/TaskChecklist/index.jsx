import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { RenderAction } from "./RenderCells";
import useTaskChecklistReducer from "../../store/TaskChecklistReducer";
import { TaskChecklistModal } from "./Modals/AddEditTaskChecklist";

const TaskChecklist = () => {
    const {
        getTaskChecklists,
        taskChecklists,
        totalCount,
        isLoadingGet,
    } = useTaskChecklistReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "role",
        sortOrder: 1,
    });

    const [showTaskChecklistModal, setShowTaskChecklistModal] =
        useState(false);

    useEffect(() => {
        getTaskChecklists({
            page: params.page,
            limit: params.limit,
            search: params.searchTerm,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    }, [
        params.page,
        params.limit,
        params.searchTerm,
        params.sortBy,
        params.sortOrder,
        getTaskChecklists,
    ]);

    const tableData = useMemo(() => {
        const rows = Array.isArray(taskChecklists) ? taskChecklists : [];
        return { rows, total: totalCount || rows.length };
    }, [taskChecklists, totalCount]);

    const cols = [
        {
            name: "Task",
            selector: "role",
            sort: true,
            width: "250",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Checklist",
            selector: "checklists",
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: ({ row }) =>
                Array.isArray(row?.checklists) && row.checklists.length
                    ? row.checklists.map((checklist) => checklist?.checklist_name).join(", ")
                    : "-",
        },
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            width: "100",
            onEditClick: (row) => setShowTaskChecklistModal(row),
            cell: RenderAction,
        },
    ];

    const refreshList = () => {
        getTaskChecklists({
            page: params.page,
            limit: params.limit,
            search: params.searchTerm,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    };

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Task Checklist"
                            isAddEnabled
                            addModalLabel="Add Task Checklist"
                            setSearch={(e) => setParams({ ...params, searchTerm: e, page: 1 })}
                            onAddModalClick={() => setShowTaskChecklistModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={tableData.total}
                        columns={cols}
                        data={tableData.rows}
                        onPageChange={(currentPage) =>
                            setParams({ ...params, page: currentPage })
                        }
                        setLimit={(newLimit) =>
                            setParams({ ...params, limit: newLimit, page: 1 })
                        }
                        onSorting={(sortBy) =>
                            setParams({
                                ...params,
                                sortBy,
                                sortOrder: params.sortOrder === 1 ? -1 : 1,
                                page: 1,
                            })
                        }
                    />

                    {!!showTaskChecklistModal && (
                        <TaskChecklistModal
                            showModal={showTaskChecklistModal}
                            closeModal={() => setShowTaskChecklistModal(false)}
                            onSuccess={() => {
                                setShowTaskChecklistModal(false);
                                refreshList();
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default TaskChecklist;