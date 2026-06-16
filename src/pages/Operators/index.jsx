import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { RenderAction, RenderName } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { OperatorModal } from "./Modals/AddEditOperator";
import useOperatorReducer from "../../store/OperatorReducer";

const Operators = () => {
    const {
        getOperatorData,
        operatorData,
        isLoading,
        totalOperatorCount,
        deleteOperator,
    } = useOperatorReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "operator_name",
        sortOrder: 1,
    });

    const [showOperatorModal, setShowOperatorModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        getOperatorData?.({
            search: params.searchTerm || "",
            sort_by: params.sortBy,
            sort_order: params.sortOrder,
            page: params.page,
            limit: params.limit,
        });
    }, [
        params.page,
        params.limit,
        params.searchTerm,
        params.sortBy,
        params.sortOrder,
        getOperatorData,
    ]);

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                setParams((prev) => ({ ...prev, searchTerm: value, page: 1 }));
            }, 500),
        []
    );

    useEffect(() => {
        return () => debouncedSearch.cancel();
    }, [debouncedSearch]);

    const refreshList = () => {
        getOperatorData?.({
            search: params.searchTerm || "",
            sort_by: params.sortBy,
            sort_order: params.sortOrder,
            page: params.page,
            limit: params.limit,
        });
    };

    const cols = [
        {
            name: "Name",
            selector: "operator_name",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: RenderName,
            sort: true,
        },
        {
            name: "Contact Person",
            selector: "contact_person",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Email",
            selector: "email",
            width: "200",
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
            name: "License Expiry",
            selector: "license_expiry",
            width: "150",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
            cell: ({ row }) =>
                row?.license_expiry
                    ? new Date(row.license_expiry).toLocaleDateString()
                    : "-",
        },
        {
            name: "Actions",
            selector: "linksInfo",
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (props) =>
                RenderAction({
                    ...props,
                    onEditClick: (row) => setShowOperatorModal(row),
                    onDeleteClick: (row) => {
                        setSelectedRow(row);
                        setShowDeleteModal(true);
                    },
                }),
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Operators"
                            isAddEnabled
                            addModalLabel="Add Operator"
                            setSearch={(value) => debouncedSearch(value)}
                            onAddModalClick={() => setShowOperatorModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        isLoading={isLoading}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        columns={cols}
                        data={operatorData}
                        count={totalOperatorCount}
                        onPageChange={(currentPage) =>
                            setParams((prev) => ({ ...prev, page: currentPage }))
                        }
                        setLimit={(newLimit) =>
                            setParams((prev) => ({
                                ...prev,
                                limit: newLimit,
                                page: 1,
                            }))
                        }
                        onSorting={(sortBy) =>
                            setParams((prev) => ({
                                ...prev,
                                sortBy,
                                sortOrder: prev.sortOrder === 1 ? -1 : 1,
                                page: 1,
                            }))
                        }
                    />

                    {!!showOperatorModal && (
                        <OperatorModal
                            showModal={showOperatorModal}
                            closeModal={() => setShowOperatorModal(false)}
                            onSuccess={() => {
                                setShowOperatorModal(false);
                                refreshList();
                            }}
                        />
                    )}
                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setSelectedRow(null);
                            }}
                            onConfirm={() => {
                                if (selectedRow?.operator_id) {
                                    deleteOperator({
                                        operator_id: selectedRow.operator_id,
                                        cb: () => {
                                            setShowDeleteModal(false);
                                            setSelectedRow(null);
                                            refreshList();
                                        },
                                    });
                                }
                            }}
                            deleteText="Are you sure you want to delete this operator?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default Operators;