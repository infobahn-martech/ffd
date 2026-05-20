import React, { useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

import CommonHeader from "../../components/CommonHeader";
import CustomTable from "../../components/customTable";
import { VehicleModal } from "./Modals/AddEditVehicle";
import { RenderAction } from "./RenderCells";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import useVehicleReducer from "../../store/VehicleReducer";

const Vehicle = () => {
    const {
        vehicles,
        getVehicles,
        isLoading,
        totalCount,
        deleteVehicle,
        isDeleteLoading,
    } = useVehicleReducer((state) => state);

    const [params, setParams] = useState({
        page: 1,
        searchTerm: "",
        limit: 10,
        sortBy: "vehicle_type",
        sortOrder: 1,
    });

    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    useEffect(() => {
        getVehicles?.({
            search: params.searchTerm || "",
            page: params.page,
            limit: params.limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
        });
    }, [params.page, params.limit, params.searchTerm, params.sortBy, params.sortOrder, getVehicles]);

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
                    onDeleteClick: (row) => setVehicleToDelete(row),
                }),
        },
    ];

    return (
        <div className="page-body">
            <div className="prospect employee">
                <div className="container-fluid">
                    <CommonHeader
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
                        showModal={showVehicleModal}
                        closeModal={() => setShowVehicleModal(false)}
                        onSuccess={() => {
                            setShowVehicleModal(false);
                            getVehicles?.({ ...params, search: params.searchTerm || "" });
                        }}
                    />
                )}

                {!!vehicleToDelete && (
                    <DeleteConfirmationModal
                        show={!!vehicleToDelete}
                        onCancel={() => setVehicleToDelete(null)}
                        onConfirm={() =>
                            deleteVehicle({
                                id: vehicleToDelete?.vehicle_type_id,
                                cb: () => setVehicleToDelete(null),
                            })
                        }
                        deleteText="Are you sure you want to delete this vehicle type?"
                        isLoading={isDeleteLoading}
                    />
                )}
            </div>
        </div>
    );
};

export default Vehicle;
