import React, { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { MaterialTypeModal } from "./Modals/AddEditMaterialType";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// ✅ reducer (create this like your other reducers: RoleReducer, OptionalServiceReducer, etc.)
import useMaterialTypeReducer from "../../store/MaterialTypeReducer";

const MaterialType = () => {
    const { getMaterialTypes, materialTypes, isLoadingGet, deleteData, isLoadingDelete } =
        useMaterialTypeReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1, // 1 = ASC, -1 = DESC
    });

    const [showMaterialTypeModal, setShowMaterialTypeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // ✅ Build API params (adjust keys if your backend expects different names)
    const apiParams = useMemo(
        () => ({
            search: params.searchTerm || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder === 1 ? "ASC" : "DESC", // change if your API expects 1/-1
        }),
        [params]
    );

    // ✅ Fetch list (dynamic)
    useEffect(() => {
        getMaterialTypes(apiParams);
    }, [getMaterialTypes, apiParams]);

    const list = materialTypes || [];
    const totalCount =
        materialTypes?.total ||
        materialTypes?.count ||
        materialTypes?.pagination?.total ||
        list.length;

    const handleOpenAdd = () => {
        setSelectedRow(null);
        setShowMaterialTypeModal(true);
    };

    const handleOpenEdit = (row) => {
        setSelectedRow(row);
        setShowMaterialTypeModal(row); // keep your current modal behavior
    };

    const handleOpenDelete = (row) => {
        setSelectedRow(row);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRow?._id) return;

        // ✅ delete API
        await deleteData(selectedRow._id);

        // ✅ refresh
        setShowDeleteModal(false);
        setSelectedRow(null);
        getMaterialTypes(apiParams);
    };

    // 👉 ONLY NAME + ACTIONS
    const cols = [
        {
            name: "Name",
            selector: "name",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Created At",
            selector: "createdAt",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Updated At",
            selector: "updatedAt",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Actions",
            selector: "linksInfo",
            tableClasses: "table-striped",
            contentClass: "table-content",
            thclass: "tb-head",
            onEditClick: (row) => handleOpenEdit(row),
            onDeleteClick: (row) => handleOpenDelete(row),
            cell: RenderAction,
            width: "100",
        },
    ];

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Material Types"
                            isAddEnabled
                            addModalLabel="Add Material Type"
                            setSearch={(e) => setParams({ ...params, searchTerm: e, page: 1 })}
                            onAddModalClick={handleOpenAdd}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        isLoading={isLoadingGet}
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={totalCount}
                        columns={cols}
                        data={list}
                        onPageChange={(currentPage) =>
                            setParams({ ...params, page: currentPage })
                        }
                        setLimit={(newLimit) => setParams({ ...params, limit: newLimit, page: 1 })}
                        onSorting={(sortBy) =>
                            setParams({
                                ...params,
                                sortBy,
                                sortOrder: params.sortOrder === 1 ? -1 : 1,
                                page: 1,
                            })
                        }
                    />

                    {!!showMaterialTypeModal && (
                        <MaterialTypeModal
                            showModal={showMaterialTypeModal} // true or row (same as your pattern)
                            closeModal={() => {
                                setShowMaterialTypeModal(false);
                                setSelectedRow(null);
                            }}
                            onSuccess={() => {
                                setShowMaterialTypeModal(false);
                                setSelectedRow(null);
                                getMaterialTypes(apiParams);
                            }}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            loading={isLoadingDelete}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setSelectedRow(null);
                            }}
                            onConfirm={handleConfirmDelete}
                            deleteText="Are you sure you want to delete this material type?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default MaterialType;