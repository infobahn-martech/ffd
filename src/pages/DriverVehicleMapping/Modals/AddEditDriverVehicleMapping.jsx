import { useForm } from "react-hook-form";
import { useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useDriverVehicleMappingReducer from "../../../store/DriverVehicleReducer";
import useDriverReducer from "../../../store/DriverReducer";
import useVehicleReducer from "../../../store/VehicleReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function DriverVehicleMappingModal({ showModal, closeModal, onSuccess }) {
    const isEdit = !!(showModal?._id || showModal?.driver_vehicle_id);
    const driverVehicleId = showModal?.driver_vehicle_id ?? showModal?._id;

    const { addDriverVehicleMapping, updateDriverVehicleMapping, isBeingUpdated } = useDriverVehicleMappingReducer((state) => state);
    const { drivers = [], fetchAllDrivers } = useDriverReducer((state) => state);
    const { vehicles = [], getVehicles } = useVehicleReducer((state) => state);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            transport_driver_id: "",
            vehicle_type_id: "",
            plate_no: "",
        },
    });

    useEffect(() => {
        if (showModal) {
            fetchAllDrivers?.({ params: {} });
            getVehicles?.({ params: {} });
        }
    }, [showModal]);

    useEffect(() => {
        if (showModal && typeof showModal === "object") {
            reset({
                transport_driver_id: showModal?.transport_driver_id ?? showModal?.driver_id ?? "",
                vehicle_type_id: showModal?.vehicle_type_id ?? showModal?.vehicle_id ?? "",
                plate_no: showModal?.plate_no ?? "",
            });
        } else if (showModal) {
            reset({
                transport_driver_id: "",
                vehicle_type_id: "",
                plate_no: "",
            });
        }
    }, [showModal, reset]);

    const onSubmit = async (data) => {
        const payload = {
            transport_driver_id: data.transport_driver_id,
            vehicle_type_id: data.vehicle_type_id,
            plate_no: data.plate_no?.trim() ?? "",
        };
        const cb = () => {
            closeModal();
            onSuccess?.();
        };
        if (isEdit) {
            await updateDriverVehicleMapping({ formData: { driver_vehicle_id: driverVehicleId, ...payload }, cb });
        } else {
            await addDriverVehicleMapping({ formData: payload, cb });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Driver Vehicle Mapping" : "Add Driver Vehicle Mapping"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="driverVehicleMappingForm" onSubmit={handleSubmit(onSubmit)}>

                    {/* DRIVER SELECT */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-control ${errors.transport_driver_id ? "is-invalid" : ""}`}
                                {...register("transport_driver_id", { required: "Driver is required" })}
                            >
                                <option value="">Select Driver</option>
                                {(drivers || []).map((d) => (
                                    <option key={d.driver_id ?? d.transport_driver_id ?? d._id} value={d.driver_id ?? d.transport_driver_id ?? d._id}>
                                        {d.driver_name ?? d.name ?? `Driver ${d.driver_id ?? d._id}`}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Driver <span className="text-danger">*</span>
                            </label>
                            {errors.transport_driver_id && (
                                <span className="error text-danger">{errors.transport_driver_id.message}</span>
                            )}
                        </div>
                    </div>

                    {/* VEHICLE SELECT */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-control ${errors.vehicle_type_id ? "is-invalid" : ""}`}
                                {...register("vehicle_type_id", { required: "Vehicle is required" })}
                            >
                                <option value="">Select Vehicle</option>
                                {(vehicles || []).map((v) => (
                                    <option key={v.vehicle_type_id ?? v._id} value={v.vehicle_type_id ?? v._id}>
                                        {v.vehicle_type ?? v.name ?? `Vehicle ${v.vehicle_type_id ?? v._id}`}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Vehicle <span className="text-danger">*</span>
                            </label>
                            {errors.vehicle_type_id && (
                                <span className="error text-danger">{errors.vehicle_type_id.message}</span>
                            )}
                        </div>
                    </div>

                    {/* PLATE NO */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                type="text"
                                className={`form-control ${errors.plate_no ? "is-invalid" : ""}`}
                                placeholder=" "
                                {...register("plate_no", { required: "Plate number is required" })}
                            />
                            <label>
                                Plate No <span className="text-danger">*</span>
                            </label>
                            {errors.plate_no && (
                                <span className="error text-danger">{errors.plate_no.message}</span>
                            )}
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );

    const renderFooter = () => (
        <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={closeModal}>
                Close
            </button>
            <button type="submit" form="driverVehicleMappingForm" className="btn btn-primary" disabled={isBeingUpdated}>
                {isBeingUpdated ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="fade role-modal-sm modal show"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
