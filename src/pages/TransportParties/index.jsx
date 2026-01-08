import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { TransportPartyModal } from "./Modals/AddEditTransportParties";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";

const dummyTransportParties = [
    {
        _id: "1",
        name: "Transport Party 1",
        createdAt: "2024-01-15T10:30:00Z"
    },
    {
        _id: "2",
        name: "Transport Party 2",
        createdAt: "2024-01-16T11:20:00Z"
    },
    {
        _id: "3",
        name: "Transport Party 3",
        createdAt: "2024-01-17T09:15:00Z"
    },
    {
        _id: "4",
        name: "Transport Party 4",
        createdAt: "2024-01-18T14:45:00Z"
    },
];

const TransportParties = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showTransportPartyModal, setShowTransportPartyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Transport Party",
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
            onEditClick: (row) => { setShowTransportPartyModal(row) },
            onDeleteClick: () => { setShowDeleteModal(true) },
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
                            tableTitle="Transport Parties"
                            isAddEnabled
                            addModalLabel="Add Transport Party"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowTransportPartyModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={dummyTransportParties.length}
                        columns={cols}
                        data={dummyTransportParties}
                        Sl={true}
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

                    {showTransportPartyModal && (
                        <TransportPartyModal
                            showModal={showTransportPartyModal}
                            closeModal={() => setShowTransportPartyModal(false)}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this transport party?"
                        // isLoading={isBeingUpdated}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default TransportParties;
