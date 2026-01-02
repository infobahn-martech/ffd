import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { DriverModal } from "./Modals/AddEditDriver";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { PORT_DETAILS } from "../../constants/ports";

const dummyDrivers = [
    {
        _id: "1",
        driver_name: "Ajay Ullas",
        driver_no: "EMP-001",
        contact_no: "+971500000001",
        iqama_no: "IQM-784512",
        joining_date: "2022-03-15",
        location: PORT_DETAILS[0].city,
        nationality: "Indian",
        status: "Active",
    },
    {
        _id: "2",
        driver_name: "Nikhil Varma",
        driver_no: "EMP-002",
        contact_no: "+971500000002",
        iqama_no: "IQM-784513",
        joining_date: "2021-11-20",
        location: PORT_DETAILS[1].city,
        nationality: "Indian",
        status: "Inactive",
    },
    {
        _id: "3",
        driver_name: "Sangeeth Babu",
        driver_no: "EMP-003",
        contact_no: "+971500000003",
        iqama_no: "IQM-784514",
        joining_date: "2023-01-10",
        location: PORT_DETAILS[2].city,
        nationality: "Indian",
        status: "Pending",
    },
    {
        _id: "4",
        driver_name: "Vishnu Menon",
        driver_no: "EMP-004",
        contact_no: "+971500000004",
        iqama_no: "IQM-784515",
        joining_date: "2020-08-05",
        location: PORT_DETAILS[3].city,
        nationality: "Indian",
        status: "Active",
    },
    {
        _id: "5",
        driver_name: "Riya Thomas",
        driver_no: "EMP-005",
        contact_no: "+971500000005",
        iqama_no: "IQM-784516",
        joining_date: "2024-02-01",
        location: PORT_DETAILS[4].city,
        nationality: "Indian",
        status: "Inactive",
    },
    {
        _id: "6",
        driver_name: "Deepak Kumar",
        driver_no: "EMP-006",
        contact_no: "+971500000006",
        iqama_no: "IQM-784517",
        joining_date: "2023-06-12",
        location: PORT_DETAILS[0].city,
        nationality: "Indian",
        status: "Pending",
    },
    {
        _id: "7",
        driver_name: "Meera Suresh",
        driver_no: "EMP-007",
        contact_no: "+971500000007",
        iqama_no: "IQM-784518",
        joining_date: "2022-09-30",
        location: PORT_DETAILS[1].city,
        nationality: "Indian",
        status: "Active",
    },
    {
        _id: "8",
        driver_name: "Arun Joseph",
        driver_no: "EMP-008",
        contact_no: "+971500000008",
        iqama_no: "IQM-784519",
        joining_date: "2021-04-18",
        location: PORT_DETAILS[2].city,
        nationality: "Indian",
        status: "Inactive",
    },
    {
        _id: "9",
        driver_name: "Joel Sunny",
        driver_no: "EMP-009",
        contact_no: "+971500000009",
        iqama_no: "IQM-784520",
        joining_date: "2024-01-05",
        location: PORT_DETAILS[3].city,
        nationality: "Indian",
        status: "Pending",
    },
    {
        _id: "10",
        driver_name: "Sandra Mathew",
        driver_no: "EMP-010",
        contact_no: "+971500000010",
        iqama_no: "IQM-784521",
        joining_date: "2020-12-22",
        location: PORT_DETAILS[4].city,
        nationality: "Indian",
        status: "Active",
    },
];





const Driver = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showDriverModal, setShowDriverModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


    // 👉 ONLY TWO COLUMNS (Name + Description)
    const cols = [
        {
            name: "Driver Name",
            selector: "driver_name",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Driver No",
            selector: "driver_no",
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Contact No",
            selector: "contact_no",
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Iqama No",
            selector: "iqama_no",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Joining Date",
            selector: "joining_date",
            width: "180",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
            // optional: format date
            // cell: ({ row }) => formatDate(row.joining_date),
        },
        {
            name: "Location",
            selector: "location",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Nationality",
            selector: "nationality",
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
            onEditClick: (row) => setShowDriverModal(row),
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
                            tableTitle="Driver Management"
                            isAddEnabled
                            addModalLabel="Add Driver"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowDriverModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        columns={cols}
                        data={dummyDrivers}
                        count={dummyDrivers.length}
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

                    {!!showDriverModal && (
                        <DriverModal
                            showModal={showDriverModal}
                            closeModal={() => setShowDriverModal(false)}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this driver?"
                        // isLoading={isBeingUpdated}
                        />
                    )}

                </div>
            </div>
        </>
    );
};

export default Driver;
