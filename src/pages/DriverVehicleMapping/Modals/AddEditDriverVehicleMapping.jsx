import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function DriverVehicleMappingModal({ showModal, closeModal }) {

    // You can pass drivers & vehicles via props later if needed
    const drivers = [
        { id: 1, name: "Driver 1" },
        { id: 2, name: "Driver 2" },
    ];

    const vehicles = [
        { id: 1, name: "Bus 14 Seater" },
        { id: 2, name: "Van 7 Seater" },
    ];

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: showModal?._id
            ? {
                driver_id: showModal?.driver_id || "",
                vehicle_id: showModal?.vehicle_id || "",
            }
            : {},
    });

    const onSubmit = (data) => {
        console.log("DRIVER VEHICLE MAPPING FORM SUBMITTED:", data);
        closeModal();
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
                                className={`form-control ${errors.driver_id ? "is-invalid" : ""}`}
                                {...register("driver_id", { required: "Driver is required" })}
                            >
                                <option value="">Select Driver</option>
                                {drivers.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                            <label>
                                Driver <span className="text-danger">*</span>
                            </label>
                            {errors.driver_id && (
                                <span className="error text-danger">{errors.driver_id.message}</span>
                            )}
                        </div>
                    </div>

                    {/* VEHICLE SELECT */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-control ${errors.vehicle_id ? "is-invalid" : ""}`}
                                {...register("vehicle_id", { required: "Vehicle is required" })}
                            >
                                <option value="">Select Vehicle</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                            <label>
                                Vehicle <span className="text-danger">*</span>
                            </label>
                            {errors.vehicle_id && (
                                <span className="error text-danger">{errors.vehicle_id.message}</span>
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
            <button type="submit" form="driverVehicleMappingForm" className="btn btn-primary">
                Save
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
