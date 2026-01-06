import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { HotelModal } from "./Modals/AddEditHotel";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const dummyHotels = [
    {
        _id: "1",
        hotel_name: "Sea View Hotel",
        contact_name: "Ajay Ullas",
        contact_no: "+971500000001",
        contact_email: "ajay@seaview.com",
        hotel_address: "Corniche Road, Jeddah, Saudi Arabia",
    },
    {
        _id: "2",
        hotel_name: "Palm Residency",
        contact_name: "Nikhil Varma",
        contact_no: "+971500000002",
        contact_email: "nikhil@palmresidency.com",
        hotel_address: "King Abdulaziz Street, Dammam, Saudi Arabia",
    },
    {
        _id: "3",
        hotel_name: "Desert Pearl Hotel",
        contact_name: "Sangeeth Babu",
        contact_no: "+971500000003",
        contact_email: "sangeeth@desertpearl.com",
        hotel_address: "Riyadh City Center, Riyadh, Saudi Arabia",
    },
    {
        _id: "4",
        hotel_name: "Harbor View Inn",
        contact_name: "Vishnu Menon",
        contact_no: "+971500000004",
        contact_email: "vishnu@harborview.com",
        hotel_address: "Port Area, Jubail, Saudi Arabia",
    },
    {
        _id: "5",
        hotel_name: "Golden Sands Hotel",
        contact_name: "Riya Thomas",
        contact_no: "+971500000005",
        contact_email: "riya@goldensands.com",
        hotel_address: "Beach Road, Yanbu, Saudi Arabia",
    },
    {
        _id: "6",
        hotel_name: "City Star Hotel",
        contact_name: "Deepak Kumar",
        contact_no: "+971500000006",
        contact_email: "deepak@citystar.com",
        hotel_address: "Business District, Riyadh, Saudi Arabia",
    },
    {
        _id: "7",
        hotel_name: "Blue Waves Hotel",
        contact_name: "Meera Suresh",
        contact_no: "+971500000007",
        contact_email: "meera@bluewaves.com",
        hotel_address: "Coastal Road, Dammam, Saudi Arabia",
    },
    {
        _id: "8",
        hotel_name: "Harbor Residency",
        contact_name: "Arun Joseph",
        contact_no: "+971500000008",
        contact_email: "arun@harborresidency.com",
        hotel_address: "Dockside Road, Jubail, Saudi Arabia",
    },
    {
        _id: "9",
        hotel_name: "Sunrise Hotel",
        contact_name: "Joel Sunny",
        contact_no: "+971500000009",
        contact_email: "joel@sunrisehotel.com",
        hotel_address: "Main Street, Yanbu, Saudi Arabia",
    },
    {
        _id: "10",
        hotel_name: "Grand Marina Hotel",
        contact_name: "Sandra Mathew",
        contact_no: "+971500000010",
        contact_email: "sandra@grandmarina.com",
        hotel_address: "Marina Road, Jeddah, Saudi Arabia",
    },
];

const Hotel = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "hotel_name",
        sortOrder: 1,
    });

    const [showHotelModal, setShowHotelModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Hotel Name",
            selector: "hotel_name",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Contact Name",
            selector: "contact_name",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Contact No",
            selector: "contact_no",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Contact Email",
            selector: "contact_email",
            width: "260",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Hotel Address",
            selector: "hotel_address",
            width: "350",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: false,
            // optional: truncate in UI if your table supports custom cell
            // cell: ({ row }) => <span title={row.hotel_address}>{row.hotel_address}</span>,
        },
        {
            name: "Actions",
            selector: "linksInfo",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: RenderAction,
            onEditClick: (row) => setShowHotelModal(row),
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
                            tableTitle="Hotel Management"
                            isAddEnabled
                            addModalLabel="Add Hotel"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowHotelModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        columns={cols}
                        data={dummyHotels}
                        count={dummyHotels.length}
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

                    {!!showHotelModal && (
                        <HotelModal
                            showModal={showHotelModal}
                            closeModal={() => setShowHotelModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this hotel?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Hotel;
