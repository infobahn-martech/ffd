import { useState, useEffect } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { BargeTypeModal } from "./Modals/AddEditBargeTypeModal";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";
import useBargeTypeReducer from "../../store/BargeTypeReducer";

const BargeType = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showVesselTypeModal, setShowVesselTypeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRowForDelete, setSelectedRowForDelete] = useState(null);

    const {
        getBargeTypes,
        bargeTypes,
        totalCount,
        isLoading,
    } = useBargeTypeReducer((state) => state);

    useEffect(() => {
        const apiParams = {
            page: params.page,
            limit: params.limit,
            ...(params.searchTerm && { searchTerm: params.searchTerm }),
            ...(params.sortBy && { sortBy: params.sortBy }),
        };
        getBargeTypes({ params: apiParams });
    }, [params]);

    const cols = [
        {
            name: "Barge Type",
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
            onEditClick: (row) => setShowVesselTypeModal(row),
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
                            tableTitle="Barge Types"
                            isAddEnabled
                            addModalLabel="Add BargeType"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowVesselTypeModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={totalCount ?? 0}
                        columns={cols}
                        data={bargeTypes ?? []}
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

                    {!!showVesselTypeModal && (
                        <BargeTypeModal
                            showModal={showVesselTypeModal}
                            closeModal={() => setShowVesselTypeModal(false)}
                            onSuccess={() => getBargeTypes({ params })}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setSelectedRowForDelete(null);
                            }}
                            onConfirm={() => {
                                // TODO: Implement delete API when available
                                setShowDeleteModal(false);
                                setSelectedRowForDelete(null);
                            }}
                            deleteText="Are you sure you want to delete this barge type?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default BargeType;
