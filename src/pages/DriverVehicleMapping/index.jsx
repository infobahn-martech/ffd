import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { DriverVehicleMappingModal } from "./Modals/AddEditDriverVehicleMapping";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { PORT_DETAILS } from "../../constants/ports";

// DUMMY DRIVER–VEHICLE MAPPING DATA
const dummyDriverVehicleMappings = [
    {
        _id: "1",
        driver_id: "1",
        driver_name: "Ajay Ullas",
        driver_no: "EMP-001",
        vehicle_id: "V1",
        vehicle_name: "Hiace 14 Seater",
        location: PORT_DETAILS[0].city,
        status: "Active",
    },
    {
        _id: "2",
        driver_id: "2",
        driver_name: "Nikhil Varma",
        driver_no: "EMP-002",
        vehicle_id: "V2",
        vehicle_name: "Coaster 30 Seater",
        location: PORT_DETAILS[1].city,
        status: "Inactive",
    },
    {
        _id: "3",
        driver_id: "3",
        driver_name: "Sangeeth Babu",
        driver_no: "EMP-003",
        vehicle_id: "V3",
        vehicle_name: "Van 7 Seater",
        location: PORT_DETAILS[2].city,
        status: "Pending",
    },
    {
        _id: "4",
        driver_id: "4",
        driver_name: "Vishnu Menon",
        driver_no: "EMP-004",
        vehicle_id: "V4",
        vehicle_name: "Pickup",
        location: PORT_DETAILS[3].city,
        status: "Active",
    },
    {
        _id: "5",
        driver_id: "5",
        driver_name: "Riya Thomas",
        driver_no: "EMP-005",
        vehicle_id: "V5",
        vehicle_name: "Bus 50 Seater",
        location: PORT_DETAILS[4].city,
        status: "Inactive",
    },
];

const DriverVehicleMapping = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "driver_name",
        sortOrder: 1,
    });

    const [showDriverVehicleMappingModal, setShowDriverVehicleMappingModal] =
        useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Driver",
            selector: "driver_name",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Driver No",
            selector: "driver_no",
            width: "160",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Vehicle",
            selector: "vehicle_name",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Location",
            selector: "location",
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Status",
            selector: "status",
            width: "150",
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
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: RenderAction,
            onEditClick: (row) => setShowDriverVehicleMappingModal(row),
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
                            tableTitle="Driver Vehicle Mapping"
                            isAddEnabled
                            addModalLabel="Add Driver Vehicle Mapping"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowDriverVehicleMappingModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        columns={cols}
                        data={dummyDriverVehicleMappings}
                        count={dummyDriverVehicleMappings.length}
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

                    {!!showDriverVehicleMappingModal && (
                        <DriverVehicleMappingModal
                            showModal={showDriverVehicleMappingModal}
                            closeModal={() => setShowDriverVehicleMappingModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this driver vehicle mapping?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default DriverVehicleMapping;
