import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { VehicleModal } from "./Modals/AddEditVehicle";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";

// ✅ CHANGE THIS IMPORT PATH based on your project structure
import useVehicleReducer from "../../store/VehicleReducer";
// If your store path is different, update it like your other modules:
// import useVehicleReducer from "../../stores/VehicleReducer";

const Vehicle = () => {
    // ✅ Store / API
    const {
        vehicles,
        getVehicles,
        isLoading,
        totalCount,
        deleteVehicle,
    } = useVehicleReducer((state) => state);

    // ✅ Table params (API params)
    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "vehicle_type",
        sortOrder: 1, // 1 = ASC, -1 = DESC (keep as your backend expects)
    });

    // ✅ Modals
    const [showVehicleModal, setShowVehicleModal] = useState(false); // boolean OR row object
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // ✅ Fetch list (whenever params change)
    useEffect(() => {
        // adjust payload keys if your backend expects different names
        getVehicles?.({
            search: params.searchTerm || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    }, [params.page, params.limit, params.searchTerm, params.sortBy, params.sortOrder, getVehicles]);

    // ✅ Debounced search
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

    // ✅ Data mapping (depends on your API response)
    // Supports both:
    // 1) { data: [...], total: 100 }
    // 2) { data: { data: [...], total: 100 } }

    const cols = [
        {
            name: "Vehicle Type",
            selector: "vehicle_type",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Vehicle Purpose",
            selector: "vehicle_purpose",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        {
            name: "Seater",
            selector: "seater",
            width: "220",
            thclass: "tb-head",
            contentClass: "table-content",
            sort: true,
        },
        // {
        //     name: "Status",
        //     selector: "status",
        //     width: "220",
        //     thclass: "tb-head",
        //     contentClass: "table-content",
        //     sort: true,
        //     cell: ({ row }) => (
        //         <span
        //             className={
        //                 row.status === "Active"
        //                     ? "status-active"
        //                     : row.status === "Inactive"
        //                         ? "status-inactive"
        //                         : "status-pending"
        //             }
        //         >
        //             {row.status}
        //         </span>
        //     ),
        // },
        {
            name: "Actions",
            selector: "linksInfo",
            width: "100",
            thclass: "tb-head",
            contentClass: "table-content",
            cell: (props) =>
                RenderAction({
                    ...props,
                    onEditClick: (row) => setShowVehicleModal(row),
                    onDeleteClick: (row) => {
                        setSelectedRow(row);
                        setShowDeleteModal(true);
                    },
                }),
        },
    ];

    const handleRefresh = () => {
        getVehicles?.({
            search: params.searchTerm || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    };

    const handleDelete = async () => {
        if (!selectedRow?._id) return;

        // ✅ adjust key if your backend expects something else
        const payload = { vehicle_id: selectedRow._id };

        // If your deleteData expects just id, use: await deleteData(selectedRow._id);
        await deleteVehicle?.(payload);

        setShowDeleteModal(false);
        setSelectedRow(null);

        // ✅ optional refresh
        handleRefresh();
    };

    return (
        <div className="page-body">
            <div className="prospect employee">
                <div className="container-fluid">
                    <CommonHeader
                        // showFilter
                        tableTitle="Vehicle Management"
                        isAddEnabled
                        addModalLabel="Add Vehicle"
                        setSearch={(value) => debouncedSearch(value)}
                        onAddModalClick={() => setShowVehicleModal(true)}
                        exportTitle="Export"
                        exportLoader={false}
                    />
                </div>

                <CustomTable
                    loading={isLoading}
                    pagination={{ currentPage: params.page, limit: params.limit }}
                    tableClasses="px-start"
                    columns={cols}
                    data={vehicles}
                    count={totalCount}
                    onPageChange={(currentPage) =>
                        setParams((prev) => ({ ...prev, page: currentPage }))
                    }
                    setLimit={(newLimit) =>
                        setParams((prev) => ({ ...prev, limit: newLimit, page: 1 }))
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

                {!!showVehicleModal && (
                    <VehicleModal
                        showModal={showVehicleModal} // boolean OR row object (edit)
                        closeModal={() => setShowVehicleModal(false)}
                        onSuccess={() => {
                            setShowVehicleModal(false);
                            handleRefresh();
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
                        isLoading={isLoading}
                        deleteText="Are you sure you want to delete this vehicle?"
                    />
                )}
            </div>
        </div>
    );
};

export default Vehicle;