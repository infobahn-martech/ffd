import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { TimeObjectModal } from "./Modals/AddEditTimeObjects";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";
import useTimeObjectReducer from "../../store/TimeObjectReducer";

const TimeObjects = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "time_object",
        sortOrder: 1,
    });

    const { getTimeObjects, deleteTimeObject, timeObjects, isLoadingGet, isBeingUpdated, totalCount } = useTimeObjectReducer(
        (state) => state
    );

    const [showTimeObjectModal, setShowTimeObjectModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteRow, setDeleteRow] = useState(null);

    const apiParams = useMemo(
        () => ({
            searchTerm: params.searchTerm || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
        }),
        [params.page, params.limit, params.searchTerm, params.sortBy]
    );

    useEffect(() => {
        getTimeObjects?.(apiParams);
    }, [getTimeObjects, apiParams]);

    const cols = [
        {
            name: "Time Object",
            selector: "time_object",
            sort: true,
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        // {
        //     name: "Created At",
        //     selector: "createdAt",
        //     sort: true,
        //     width: "400",
        //     thclass: "tb-head",
        //     contentClass: "table-content",
        //     cell: DateFormat,
        // },
        {
            name: 'Actions',
            selector: 'linksInfo',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            onEditClick: (row) => { setShowTimeObjectModal(row) },
            onDeleteClick: (row) => {
                setDeleteRow(row);
                setShowDeleteModal(true);
            },
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
                            tableTitle="Time Objects"
                            isAddEnabled
                            addModalLabel="Add Time Object"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowTimeObjectModal(true)}
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
                        data={Array.isArray(timeObjects) ? timeObjects : []}
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

                    {showTimeObjectModal && (
                        <TimeObjectModal
                            showModal={showTimeObjectModal}
                            closeModal={() => setShowTimeObjectModal(false)}
                            onSuccess={() => getTimeObjects?.(apiParams)}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setDeleteRow(null);
                            }}
                            onConfirm={() => {
                                if (!deleteRow) {
                                    setShowDeleteModal(false);
                                    return;
                                }
                                deleteTimeObject({
                                    timeObjectId: deleteRow.time_object_id,
                                    cb: () => {
                                        setShowDeleteModal(false);
                                        setDeleteRow(null);
                                        getTimeObjects?.(apiParams);
                                    },
                                });
                            }}
                            deleteText="Are you sure you want to delete this time object?"
                            isLoading={isBeingUpdated}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default TimeObjects;