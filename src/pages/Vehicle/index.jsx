import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { VehicleModal } from "./Modals/AddEditVehicle";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const dummyVehicles = [
    {
        _id: "1",
        vehicle_type: "Sedan",
        seater: 4,
        vehicle_purpose: "Personal",
        status: "Active",
    },
    {
        _id: "2",
        vehicle_type: "SUV",
        seater: 7,
        vehicle_purpose: "Personal",
        status: "Inactive",
    },
    {
        _id: "3",
        vehicle_type: "Minivan",
        seater: 8,
        vehicle_purpose: "Personal",
        status: "Pending",
    },
    {
        _id: "4",
        vehicle_type: "Bus",
        seater: 30,
        vehicle_purpose: "Personal",
        status: "Active",
    },
    {
        _id: "5",
        vehicle_type: "Pickup",
        seater: 5,
        vehicle_purpose: "Personal",
        status: "Inactive",
    },
    {
        _id: "6",
        vehicle_type: "Hatchback",
        seater: 4,
        vehicle_purpose: "Personal",
        status: "Pending",
    },
    {
        _id: "7",
        vehicle_type: "Coaster",
        seater: 22,
        vehicle_purpose: "Personal",
        status: "Active",
    },
    {
        _id: "8",
        vehicle_type: "Luxury SUV",
        seater: 7,
        vehicle_purpose: "Personal",
        status: "Inactive",
    },
    {
        _id: "9",
        vehicle_type: "Hiace",
        seater: 14,
        vehicle_purpose: "Crew",
        status: "Pending",
    },
    {
        _id: "10",
        vehicle_type: "Crew Bus",
        seater: 40,
        vehicle_purpose: "Crew",
        status: "Active",
    },
];

const Vehicle = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "vehicle_type",
        sortOrder: 1,
    });

    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Vehicle Type",
            selector: "vehicle_type",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Vehicle Purpose",
            selector: "vehicle_purpose",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Seater",
            selector: "seater",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Status",
            selector: "status",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
            cell: ({ row }) => (
                <span
                    className={
                        row.status === "Active"
                            ? "status-active"
                            : row.status === "Inactive"
                                ? "status-inactive"
                                : "status-pending"
                    }
                >
                    {row.status}
                </span>
            ),
        },
        {
            name: "Actions",
            selector: "linksInfo",
            width: "100",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: RenderAction,
            onEditClick: (row) => setShowVehicleModal(row),
            onDeleteClick: () => setShowDeleteModal(true),
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            showFilter
                            tableTitle="Vehicle Management"
                            isAddEnabled
                            addModalLabel="Add Vehicle"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowVehicleModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        columns={cols}
                        data={dummyVehicles}
                        count={dummyVehicles.length}
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

                    {!!showVehicleModal && (
                        <VehicleModal
                            showModal={showVehicleModal}
                            closeModal={() => setShowVehicleModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this vehicle?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Vehicle;
