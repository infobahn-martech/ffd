import React, { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { GroupEmailBEModal } from "./Modals/AddEditGroupEmail";
import { RenderAction } from "./renderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// ✅ Create this reducer like your other modules (getData, deleteData, data, loaders)
import useGroupEmailBEReducer from "../../store/GroupEmailBEReducer";

const GroupEmailBE = () => {
    const {
        getGroupEmailBEs,
        groupEmailBEs,
        isLoading,
        deleteGroupEmailBE,
        isDeleteLoading,
        totalCount,
    } = useGroupEmailBEReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        search: "",
        limit: 10,
        sortBy: "billing_entity",
        sortOrder: 1, // 1 ASC, -1 DESC
    });

    const [showGroupEmailModal, setShowGroupEmailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // ✅ API params (adjust keys if your backend differs)
    const apiParams = useMemo(
        () => ({
            search: params.search || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder === 1 ? "ASC" : "DESC", // or params.sortOrder if backend expects 1/-1
        }),
        [params]
    );

    useEffect(() => {
        getGroupEmailBEs({ params: apiParams });
    }, [params]);

    // ✅ Normalize list + count (supports different backend response shapes)
    const list = groupEmailBEs || [];

    const handleOpenAdd = () => {
        setSelectedRow(null);
        setShowGroupEmailModal({}); // you used {} for add
    };

    const handleOpenEdit = (row) => {
        setSelectedRow(row);
        setShowGroupEmailModal(row);
    };

    const handleOpenDelete = (row) => {
        setSelectedRow(row);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRow?.entity_id) return;

        await deleteGroupEmailBE({
            groupEmailBE_id: selectedRow.entity_id,
            cb: () => {
                setShowDeleteModal(false);
                setSelectedRow(null);
                getGroupEmailBEs({ params: apiParams });
            },
        });
    };

    const cols = [
        {
            name: "Billing Entity",
            selector: "billing_entity",
            sort: true,
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Email Count",
            selector: "email_count",
            sort: false,
            width: "140",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        // {
        //     name: "Active",
        //     selector: "isActive",
        //     sort: true,
        //     width: "120",
        //     thclass: "tb-head",
        //     contentClass: "table-content",
        //     cell: (row) => (row?.isActive ? "Yes" : "No"),
        // },
        // {
        //     name: "Description",
        //     selector: "description",
        //     sort: true,
        //     width: "400",
        //     thclass: "tb-head",
        //     contentClass: "table-content",
        // },
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            onEditClick: (row) => handleOpenEdit(row),
            onDeleteClick: (row) => handleOpenDelete(row),
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
                            tableTitle="Billing Entity Group Email"
                            isAddEnabled
                            addModalLabel="Add Group Email"
                            setSearch={(e) => setParams({ ...params, search: e, page: 1 })}
                            onAddModalClick={handleOpenAdd}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        isLoading={isLoading}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={totalCount}
                        columns={cols}
                        data={list}
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

                    {!!showGroupEmailModal && (
                        <GroupEmailBEModal
                            showModal={showGroupEmailModal}
                            closeModal={() => {
                                setShowGroupEmailModal(false);
                                setSelectedRow(null);
                            }}
                            onSuccess={() => {
                                setShowGroupEmailModal(false);
                                setSelectedRow(null);
                                getGroupEmailBEs({ params: apiParams });
                            }}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            loading={isDeleteLoading}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setSelectedRow(null);
                            }}
                            onConfirm={handleConfirmDelete}
                            deleteText="Are you sure you want to delete this group email?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default GroupEmailBE;