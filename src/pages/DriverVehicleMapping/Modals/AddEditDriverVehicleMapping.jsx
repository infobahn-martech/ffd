import { useForm, Controller } from "react-hook-form";
import PremiumSelect from "../../../components/form/PremiumSelect";
import { useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useDriverVehicleMappingReducer from "../../../store/DriverVehicleReducer";
import useDriverReducer from "../../../store/DriverReducer";
import useVehicleReducer from "../../../store/VehicleReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function DriverVehicleMappingModal({ showModal, closeModal, onSuccess }) {
    const isEdit = !!(showModal?.driver_vehicle_id || showModal?.driver_vehicle_id);
    const driverVehicleId = showModal?.driver_vehicle_id ?? showModal?._id;

    const { addDriverVehicleMapping, updateDriverVehicleMapping, isBeingUpdated } = useDriverVehicleMappingReducer((state) => state);
    const { drivers = [], fetchAllDrivers } = useDriverReducer((state) => state);
    const { vehicles = [], getVehicles } = useVehicleReducer((state) => state);

    const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
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
        if (showModal?.driver_vehicle_id) {
            reset({
                transport_driver_id: showModal?.transport_driver_id ?? showModal?.driver_id ?? "",
                vehicle_type_id: showModal?.vehicle_type_id ?? "",
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
                {showModal?.driver_vehicle_id ? "Edit Driver Vehicle Mapping" : "Add Driver Vehicle Mapping"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="driverVehicleMappingForm" onSubmit={handleSubmit(onSubmit)}>

                    {/* DRIVER SELECT */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="phone-wrapper">
                            <label className="phone-label">
                                Driver <span className="text-danger">*</span>
                            </label>
                            <Controller
                                name="transport_driver_id"
                                control={control}
                                rules={{ required: "Driver is required" }}
                                render={({ field }) => (
                                    <PremiumSelect
                                        value={field.value != null ? String(field.value) : ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        options={(drivers || []).map((d) => {
                                            const id = d.driver_id ?? d.transport_driver_id ?? d._id;
                                            return {
                                                value: String(id ?? ""),
                                                label: String(
                                                    d.driver_name ??
                                                        d.name ??
                                                        `Driver ${d.driver_id ?? d._id ?? ""}`,
                                                ),
                                            };
                                        })}
                                        placeholder="Select Driver"
                                        searchPlaceholder="Search driver..."
                                        hasError={Boolean(errors.transport_driver_id)}
                                    />
                                )}
                            />
                            {errors.transport_driver_id && (
                                <span className="error text-danger">{errors.transport_driver_id.message}</span>
                            )}
                        </div>
                    </div>

                    {/* VEHICLE SELECT */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="phone-wrapper">
                            <label className="phone-label">
                                Vehicle <span className="text-danger">*</span>
                            </label>
                            <Controller
                                name="vehicle_type_id"
                                control={control}
                                rules={{ required: "Vehicle is required" }}
                                render={({ field }) => (
                                    <PremiumSelect
                                        value={field.value != null ? String(field.value) : ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        options={(vehicles || []).map((v) => {
                                            const id = v.vehicle_type_id ?? v._id;
                                            return {
                                                value: String(id ?? ""),
                                                label: String(
                                                    v.vehicle_type ??
                                                        v.name ??
                                                        `Vehicle ${v.vehicle_type_id ?? v._id ?? ""}`,
                                                ),
                                            };
                                        })}
                                        placeholder="Select Vehicle"
                                        searchPlaceholder="Search vehicle..."
                                        hasError={Boolean(errors.vehicle_type_id)}
                                    />
                                )}
                            />
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
