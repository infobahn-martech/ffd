import { useEffect, useMemo, useState } from "react";
import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { PackingTypeModal } from "./Modals/AddEditPackingType";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// ✅ Change this import based on your project store name
import usePackingTypeReducer from "../../store/PackingTypeReducer";

const PackingType = () => {
    const {
        getPackingTypes,
        packingTypes,
        isLoadingGet,
        deletePackingType,
        isLoadingDelete,
    } = usePackingTypeReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "package_type",
        sortOrder: 1,
    });

    const [showPackingTypeModal, setShowPackingTypeModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // Fetch packing types on mount
    useEffect(() => {
        getPackingTypes();
    }, []);

    // ✅ Safe fallback
    const tableData = useMemo(() => {
        // You might have: { data: [], total: 0 } OR { docs: [], totalDocs: 0 }
        if (!packingTypes) return { rows: [], total: 0 };

        const rows =
            packingTypes?.data ||
            packingTypes?.docs ||
            packingTypes?.results ||
            [];

        const total =
            packingTypes?.total ||
            packingTypes?.count ||
            packingTypes?.totalDocs ||
            rows.length;

        return { rows, total };
    }, [packingTypes]);

    // 👉 Columns (API: package_type_id, package_type, created_date)
    const cols = [
        {
            name: "Packing Type",
            selector: "package_type",
            sort: true,
            width: "200",
            thclass: "tb-head",
            contentClass: "table-content",
        },
        {
            name: "Created Date",
            selector: "created_date",
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
            width: "100",
            onEditClick: (row) => {
                setShowPackingTypeModal(row); // pass row to modal for edit
            },
            onDeleteClick: (row) => {
                setSelectedRow(row);
                setShowDeleteModal(true);
            },
            cell: RenderAction,
        },
    ];

    const handleDelete = async () => {
        if (!selectedRow?.package_type_id) return;

        await deletePackingType(selectedRow.package_type_id);

        setShowDeleteModal(false);
        setSelectedRow(null);

        getPackingTypes();
    };

    return (
        <>
            <div className="page-body">
                <div className="prospect employee">
                    <div className="container-fluid">
                        <CommonHeader
                            tableTitle="Packing Types"
                            isAddEnabled
                            addModalLabel="Add Packing Type"
                            setSearch={(e) => setParams({ ...params, searchTerm: e, page: 1 })}
                            onAddModalClick={() => setShowPackingTypeModal(true)}
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
                        onPageChange={(currentPage) => setParams({ ...params, page: currentPage })}
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

                    {!!showPackingTypeModal && (
                        <PackingTypeModal
                            showModal={showPackingTypeModal}
                            closeModal={() => setShowPackingTypeModal(false)}
                            onSuccess={() => {
                                setShowPackingTypeModal(false);
                                getPackingTypes();
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
                            onConfirm={handleDelete}
                            isLoading={isLoadingDelete}
                            deleteText="Are you sure you want to delete this packing type?"
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default PackingType;