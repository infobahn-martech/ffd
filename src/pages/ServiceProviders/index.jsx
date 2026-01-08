import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { ServiceProviderModal } from "./Modals/AddEditServiceProviders";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";

const dummyServiceProviders = [
    {
        _id: "1",
        name: "Service Provider 1",
        createdAt: "2024-01-15T10:30:00Z"
    },
    {
        _id: "2",
        name: "Service Provider 2",
        createdAt: "2024-01-16T11:20:00Z"
    },
    {
        _id: "3",
        name: "Service Provider 3",
        createdAt: "2024-01-17T09:15:00Z"
    },
    {
        _id: "4",
        name: "Service Provider 4",
        createdAt: "2024-01-18T14:45:00Z"
    },
];

const ServiceProviders = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showServiceProviderModal, setShowServiceProviderModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const cols = [
        {
            name: "Service Provider",
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
            onEditClick: (row) => { setShowServiceProviderModal(row) },
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
                            tableTitle="Service Providers"
                            isAddEnabled
                            addModalLabel="Add Service Provider"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowServiceProviderModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={dummyServiceProviders.length}
                        columns={cols}
                        data={dummyServiceProviders}
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

                    {showServiceProviderModal && (
                        <ServiceProviderModal
                            showModal={showServiceProviderModal}
                            closeModal={() => setShowServiceProviderModal(false)}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this service provider?"
                        // isLoading={isBeingUpdated}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default ServiceProviders;
