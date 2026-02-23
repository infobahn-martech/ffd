import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { FleetModal } from "./Modals/AddEditFleet";
import { RenderAction, RenderName } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// 👉 Dummy Fleet Data (replace with API later)
const dummyFleet = [
    {
        _id: "1",
        fleetName: "Sedres Crew Van 01",
        type: "Vehicle",
        code: "FLT-001",
        registrationNo: "ABC-1234",
        ownership: "Owned",
        capacity: "7 Seats",
        baseLocation: "Dammam Port",
        status: "Active",
    },
    {
        _id: "2",
        fleetName: "Sedres Launch 02",
        type: "Launch / Boat",
        code: "FLT-002",
        registrationNo: "BOAT-5678",
        ownership: "Owned",
        capacity: "30 Pax",
        baseLocation: "Jubail Port",
        status: "In Service",
    },
    {
        _id: "3",
        fleetName: "Contract Bus 01",
        type: "Vehicle",
        code: "FLT-003",
        registrationNo: "BUS-9012",
        ownership: "Third Party",
        capacity: "50 Seats",
        baseLocation: "Dammam City",
        status: "Active",
    },
];

const FleetManagement = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "fleetName",
        sortOrder: 1,
    });

    const [showFleetModal, setShowFleetModal] = useState(false); // false | row
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Fleet Name",
            selector: "fleetName",
            sort: true,
            width: "250",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: RenderName,
        },
        {
            name: "Fleet Type",
            selector: "type",
            sort: true,
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Fleet Code",
            selector: "code",
            sort: true,
            width: "150",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Registration No",
            selector: "registrationNo",
            sort: true,
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Ownership",
            selector: "ownership",
            sort: true,
            width: "170",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Capacity",
            selector: "capacity",
            sort: false,
            width: "150",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Base Location",
            selector: "baseLocation",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Status",
            selector: "status",
            sort: true,
            width: "150",
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
                setShowFleetModal(row); // edit
            },
            onDeleteClick: () => {
                setShowDeleteModal(true);
            },
            cell: RenderAction,
            width: "180",
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Fleet"
                            isAddEnabled
                            addModalLabel="Add Fleet"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowFleetModal(true)} // add mode
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={dummyFleet.length}
                        columns={cols}
                        data={dummyFleet}
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

                    {!!showFleetModal && (
                        <FleetModal
                            showModal={showFleetModal} // row | true
                            closeModal={() => setShowFleetModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this fleet item?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default FleetManagement;
