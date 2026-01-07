import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { LogisticsWarehouseModal } from "./Modals/AddEditLogisticsWarehouse";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const dummyLogisticsWarehouses = [
    {
        _id: "1",
        name: "Logistics Warehouse 1",
        location: "Port A",
        location_type: "warehouse",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
    {
        _id: "2",
        name: "Logistics Warehouse 2",
        location: "Port B",
        location_type: "material_transport",
        createdAt: "2024-01-02",
        updatedAt: "2024-01-02",
    },
    {
        _id: "3",
        name: "Logistics Warehouse 3",
        location: "Port C",
        location_type: "warehouse",
        createdAt: "2024-01-03",
        updatedAt: "2024-01-03",
    },
];

const LogisticsWarehouse = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showLogisticsWarehouseModal, setShowLogisticsWarehouseModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Helper function to format location type
    const formatLocationType = (type) => {
        if (type === "material_transport") return "Material Transport";
        if (type === "warehouse") return "Warehouse";
        return type;
    };

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
            cell: ({ row }) => formatLocationType(row.location_type),
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
            onEditClick: (row) => {
                setShowLogisticsWarehouseModal(row);
            },
            onDeleteClick: () => {
                setShowDeleteModal(true);
            },
            cell: RenderAction,
            width: "100",
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Logistics Warehouses"
                            isAddEnabled
                            addModalLabel="Add Logistics Warehouse"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowLogisticsWarehouseModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={dummyLogisticsWarehouses.length}
                        columns={cols}
                        data={dummyLogisticsWarehouses}
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

                    {!!showLogisticsWarehouseModal && (
                        <LogisticsWarehouseModal
                            showModal={showLogisticsWarehouseModal}
                            closeModal={() => setShowLogisticsWarehouseModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this logistics warehouse?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default LogisticsWarehouse;
