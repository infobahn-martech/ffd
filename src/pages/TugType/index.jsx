import { useState, useEffect } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { TugTypeModal } from "./Modals/AddEditModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";
import useTugTypeReducer from "../../store/TugTypeReducer";

const TugType = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showTugTypeModal, setShowTugTypeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);

    const {
        getTugTypes,
        deleteTugType,
        tugTypes,
        totalCount,
        isLoading,
        deleteLoader,
    } = useTugTypeReducer((state) => state);

    useEffect(() => {
        const apiParams = {
            page: params.page,
            limit: params.limit,
            ...(params.searchTerm && { searchTerm: params.searchTerm }),
            ...(params.sortBy && { sortBy: params.sortBy }),
        };
        getTugTypes({ params: apiParams });
    }, [params]);

    const cols = [
        {
            name: "Tug Type",
            selector: "name",
            sort: true,
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Created At",
            selector: "createdAt",
            sort: true,
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: DateFormat,
        },
        {
            name: 'Actions',
            selector: 'linksInfo',
            tableClasses: 'table-striped',
            contentClass: 'table-content',
            thclass: 'tb-head',
            onEditClick: (row) => setShowTugTypeModal(row),
            onDeleteClick: (row) => {
                setSelectedRowForDelete(row);
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
                            tableTitle="Tug Types"
                            isAddEnabled
                            addModalLabel="Add Tug Type"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowTugTypeModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={totalCount ?? 0}
                        columns={cols}
                        data={tugTypes ?? []}
                        Sl={true}
                        isLoading={isLoading}
                        onPageChange={(currentPage) =>
                            setParams({ ...params, page: currentPage })
                        }
                        setLimit={(newLimit) =>
                            setParams({ ...params, limit: newLimit })
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

                    {!!showTugTypeModal && (
                        <TugTypeModal
                            showModal={showTugTypeModal}
                            closeModal={() => setShowTugTypeModal(false)}
                            onSuccess={() => getTugTypes({ params })}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            isLoading={deleteLoader}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setSelectedRowForDelete(null);
                            }}
                            onConfirm={() => {
                                const tug_type_id =
                                    selectedRowForDelete?.tug_type_id ??
                                    selectedRowForDelete?._id;
                                if (!tug_type_id) return;
                                deleteTugType({
                                    tug_type_id,
                                    cb: () => {
                                        setShowDeleteModal(false);
                                        setSelectedRowForDelete(null);
                                        getTugTypes({ params });
                                    },
                                });
                            }}
                            deleteText="Are you sure you want to delete this tug type?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default TugType;
