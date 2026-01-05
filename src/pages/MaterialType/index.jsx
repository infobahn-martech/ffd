import { useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { MaterialTypeModal } from "./Modals/AddEditMaterialType";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

const dummyMaterialTypes = [
    {
        _id: "1",
        name: "Material Type 1",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
    {
        _id: "2",
        name: "Material Type 2",
        createdAt: "2024-01-02",
        updatedAt: "2024-01-02",
    },
    {
        _id: "3",
        name: "Material Type 3",
        createdAt: "2024-01-03",
        updatedAt: "2024-01-03",
    },
];

const MaterialType = () => {
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "name",
        sortOrder: 1,
    });

    const [showMaterialTypeModal, setShowMaterialTypeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            onEditClick: (row) => {
                setShowMaterialTypeModal(row);
            },
            onDeleteClick: () => {
                setShowDeleteModal(true);
            },
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
                            setSearch={(e) =>
                                setParams({ ...params, searchTerm: e, page: 1 })
                            }
                            onAddModalClick={() => setShowMaterialTypeModal(true)}
                            exportTitle="Export"
                            exportLoader={false}
                        />
                    </div>

                    <CustomTable
                        Sl
                        pagination={{ currentPage: params.page, limit: params.limit }}
                        tableClasses="px-start"
                        count={dummyMaterialTypes.length}
                        columns={cols}
                        data={dummyMaterialTypes}
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

                    {!!showMaterialTypeModal && (
                        <MaterialTypeModal
                            showModal={showMaterialTypeModal}
                            closeModal={() => setShowMaterialTypeModal(false)}
                        />
                    )}

                    {!!showDeleteModal && (
                        <DeleteConfirmationModal
                            show={showDeleteModal}
                            onCancel={() => setShowDeleteModal(false)}
                            onConfirm={() => { }}
                            deleteText="Are you sure you want to delete this material type?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default MaterialType;
