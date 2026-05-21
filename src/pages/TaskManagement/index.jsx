import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { TaskManagementModal } from "./Modals/AddEditTaskManagement";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";
import useTaskManagementReducer from "../../store/TaskManagementReducer";

const TaskManagement = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "task_name",
        sortOrder: 1,
    });

    const { getTaskManagement, taskManagement, isLoadingGet, totalCount } = useTaskManagementReducer(
        (state) => state
    );

    const [showTaskManagementModal, setShowTaskManagementModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const apiParams = useMemo(
        () => ({
            searchTerm: params.searchTerm || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        }),
        [params.searchTerm, params.page, params.limit, params.sortBy, params.sortOrder]
    );

    useEffect(() => {
        getTaskManagement?.(apiParams);
    }, [getTaskManagement, apiParams]);

    const cols = [
        {
            name: "Task Name",
            selector: "task_name",
            sort: true,
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: 'Actions',
            selector: 'linksInfo',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            onEditClick: (row) => { setShowTaskManagementModal(row) },
            onDeleteClick: () => { setShowDeleteModal(true) },
            cell: RenderAction,
            width: '200',
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Task Management"
                            isAddEnabled
                            addModalLabel="Add Task"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowTaskManagementModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={totalCount ?? 0}
                        columns={cols}
                        data={Array.isArray(taskManagement) ? taskManagement : []}
                        Sl={true}
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

                    {showTaskManagementModal && (
                        <TaskManagementModal
                            showModal={showTaskManagementModal}
                            closeModal={() => setShowTaskManagementModal(false)}
                            onSuccess={() => getTaskManagement?.(apiParams)}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => setShowDeleteModal(false)}
                            deleteText="Delete API is not integrated for tasks yet."
                        // isLoading={isBeingUpdated}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default TaskManagement;
