import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { LogisticsWarehouseModal } from "./Modals/AddEditLogisticsWarehouse";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// ✅ change this import based on your actual store file
import useLogisticsWarehouseReducer from "../../store/LogisticsWarehouseReducer";

const LogisticsWarehouse = () => {
    const {
        getData,
        logisticsWarehouseData,
        isLoadingGet,
        deleteData,
        isLoadingDelete,
    } = useLogisticsWarehouseReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showLogisticsWarehouseModal, setShowLogisticsWarehouseModal] =
        useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // ✅ Helper function to format location type
    const formatLocationType = (type) => {
        if (type === "material_transport") return "Material Transport";
        if (type === "warehouse") return "Warehouse";
        return type || "-";
    };

    // ✅ Fetch when params change
    useEffect(() => {
        getData({
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
    ]);

    // ✅ Normalize API response shape safely
    const tableData = useMemo(() => {
        if (!logisticsWarehouseData) return { rows: [], total: 0 };

        const rows =
            logisticsWarehouseData?.data ||
            logisticsWarehouseData?.docs ||
            logisticsWarehouseData?.results ||
            [];

        const total =
            logisticsWarehouseData?.total ||
            logisticsWarehouseData?.count ||
            logisticsWarehouseData?.totalDocs ||
            rows.length;

        return { rows, total };
    }, [logisticsWarehouseData]);

    const cols = [
        {
            name: "Name",
            selector: "name",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Location",
            selector: "location",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Location Type",
            selector: "location_type",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: ({ row }) => formatLocationType(row?.location_type),
        },
        {
            name: "Created At",
            selector: "createdAt",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Updated At",
            selector: "updatedAt",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            width: "100",
            onEditClick: (row) => {
                setShowLogisticsWarehouseModal(row); // edit mode
            },
            onDeleteClick: (row) => {
                setSelectedRow(row);
                setShowDeleteModal(true);
            },
            cell: RenderAction,
        },
    ];

    const refreshList = () => {
        getData({
            page: params.page,
            limit: params.limit,
            search: params.searchTerm,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    };

    const handleDelete = async () => {
        if (!selectedRow?._id) return;

        await deleteData(selectedRow._id);

        setShowDeleteModal(false);
        setSelectedRow(null);

        refreshList();
    };

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Logistics Warehouses"
                            isAddEnabled
                            addModalLabel="Add Logistics Warehouse"
                            setSearch={(e) => setParams({ ...params, searchTerm: e, page: 1 })}
                            onAddModalClick={() => setShowLogisticsWarehouseModal(true)}
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

                    {!!showLogisticsWarehouseModal && (
                        <LogisticsWarehouseModal
                            showModal={showLogisticsWarehouseModal}
                            closeModal={() => setShowLogisticsWarehouseModal(false)}
                            onSuccess={() => {
                                setShowLogisticsWarehouseModal(false);
                                refreshList();
                            }}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setSelectedRow(null);
                            }}
                            onConfirm={handleDelete}
                            isLoading={isLoadingDelete}
                            deleteText="Are you sure you want to delete this logistics warehouse?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default LogisticsWarehouse;