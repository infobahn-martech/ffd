import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { DocumentChecklistModal } from "./Modals/AddEditDocumentChecklist";
import { RenderAction } from "./RenderCells";
import useDocumentChecklistReducer from "../../store/DocumentChecklistReducer";

const DocumentChecklist = () => {
    const {
        getDocumentChecklists,
        documentChecklists,
        totalCount,
        isLoadingGet,
    } = useDocumentChecklistReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "role",
        sortOrder: 1,
    });

    const [showDocumentChecklistModal, setShowDocumentChecklistModal] =
        useState(false);

    useEffect(() => {
        getDocumentChecklists({
            page: params.page,
            limit: params.limit,
            search: params.searchTerm,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    }, [
        params.page,
        params.limit,
        params.searchTerm,
        params.sortBy,
        params.sortOrder,
        getDocumentChecklists,
    ]);

    const tableData = useMemo(() => {
        const rows = Array.isArray(documentChecklists) ? documentChecklists : [];
        return { rows, total: totalCount || rows.length };
    }, [documentChecklists, totalCount]);

    const cols = [
        {
            name: "Role",
            selector: "role",
            sort: true,
            width: "250",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Documents",
            selector: "documents",
            width: "400",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: ({ row }) =>
                Array.isArray(row?.documents) && row.documents.length
                    ? row.documents.map((doc) => doc?.document_name).join(", ")
                    : "-",
        },
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            width: "100",
            onEditClick: (row) => setShowDocumentChecklistModal(row),
            cell: RenderAction,
        },
    ];

    const refreshList = () => {
        getDocumentChecklists({
            page: params.page,
            limit: params.limit,
            search: params.searchTerm,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    };

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Document Checklist"
                            isAddEnabled
                            addModalLabel="Add Document Checklist"
                            setSearch={(e) => setParams({ ...params, searchTerm: e, page: 1 })}
                            onAddModalClick={() => setShowDocumentChecklistModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={tableData.total}
                        columns={cols}
                        data={tableData.rows}
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

                    {!!showDocumentChecklistModal && (
                        <DocumentChecklistModal
                            showModal={showDocumentChecklistModal}
                            closeModal={() => setShowDocumentChecklistModal(false)}
                            onSuccess={() => {
                                setShowDocumentChecklistModal(false);
                                refreshList();
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default DocumentChecklist;