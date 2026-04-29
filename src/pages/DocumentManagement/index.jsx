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
        sortBy: "document_name",
        sortOrder: 1,
    });

    const { getDocumentManagement, documentManagement, isLoadingGet, totalCount } = useDocumentManagementReducer(
        (state) => state
    );

    const [showDocumentManagementModal, setShowDocumentManagementModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        getDocumentManagement?.();
    }, [getDocumentManagement]);

    const filteredData = useMemo(() => {
        const allDocs = Array.isArray(documentManagement) ? documentManagement : [];
        const search = params.searchTerm?.trim()?.toLowerCase() ?? "";
        if (!search) return allDocs;
        return allDocs.filter((doc) =>
            (doc?.document_name ?? "").toLowerCase().includes(search)
        );
    }, [documentManagement, params.searchTerm]);

    const sortedData = useMemo(() => {
        const list = [...filteredData];
        const direction = params.sortOrder === 1 ? 1 : -1;
        if (!params.sortBy) return list;

        return list.sort((a, b) => {
            const aVal = a?.[params.sortBy];
            const bVal = b?.[params.sortBy];
            const aNorm = (aVal ?? "").toString().toLowerCase();
            const bNorm = (bVal ?? "").toString().toLowerCase();
            if (aNorm < bNorm) return -1 * direction;
            if (aNorm > bNorm) return 1 * direction;
            return 0;
        });
    }, [filteredData, params.sortBy, params.sortOrder]);

    const paginatedData = useMemo(() => {
        const start = (params.page - 1) * params.limit;
        return sortedData.slice(start, start + params.limit);
    }, [sortedData, params.page, params.limit]);

    const cols = [
        {
            name: "Document Name",
            selector: "document_name",
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
            onEditClick: (row) => { setShowDocumentManagementModal(row) },
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
                            tableTitle="Document Management"
                            isAddEnabled
                            addModalLabel="Add Document"
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowDocumentManagementModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={filteredData.length ?? totalCount ?? 0}
                        columns={cols}
                        data={paginatedData}
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

                    {showDocumentManagementModal && (
                        <DocumentManagementModal
                            showModal={showDocumentManagementModal}
                            closeModal={() => setShowDocumentManagementModal(false)}
                            onSuccess={() => getDocumentManagement?.()}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => setShowDeleteModal(false)}
                            deleteText="Delete API is not integrated for documents yet."
                        // isLoading={isBeingUpdated}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default DocumentManagement;
