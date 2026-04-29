import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import { RenderAction, DateFormat } from "./RenderCells";
import { DocumentManagementModal } from "./Modals/AddEditDocumentManagement";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import CustomTable from "../../components/customTable";
import useDocumentManagementReducer from "../../store/DocumentManagementReducer";

const DocumentManagement = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "document_management",
        sortOrder: 1,
    });

    const { getDocumentManagement, documentManagement, isLoadingGet, totalCount } = useDocumentManagementReducer(
        (state) => state
    );

    const [showDocumentManagementModal, setShowDocumentManagementModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const apiParams = useMemo(
        () => ({
            searchTerm: params.searchTerm || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
        }),
        [params.page, params.limit, params.searchTerm, params.sortBy]
    );

    useEffect(() => {
        getDocumentManagement?.(apiParams);
    }, [getDocumentManagement, apiParams]);

    const cols = [
        {
            name: "Waste Type",
            selector: "waste_type",
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
            onEditClick: (row) => { setShowWasteTypeModal(row) },
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
                            tableTitle="Waste Types"
                            isAddEnabled
                            addModalLabel="Add Waste Type"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowWasteTypeModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={totalCount ?? 0}
                        columns={cols}
                        data={Array.isArray(wasteTypes) ? wasteTypes : []}
                        Sl={true}
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

                    {showWasteTypeModal && (
                        <WasteTypeModal
                            showModal={showWasteTypeModal}
                            closeModal={() => setShowWasteTypeModal(false)}
                            onSuccess={() => getWasteTypes?.(apiParams)}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => setShowDeleteModal(false)}
                            deleteText="Are you sure you want to delete this waste type?"
                        // isLoading={isBeingUpdated}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default DocumentManagement;
