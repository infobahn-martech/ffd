import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function VehicleModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: showModal?._id
            ? {
                vehicle_type: showModal?.vehicle_type || "",
                seater: showModal?.seater || "",
            }
            : {},
    });

    const onSubmit = (data) => {
        console.log("VEHICLE FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Vehicle" : "Add Vehicle"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="vehicleForm" onSubmit={handleSubmit(onSubmit)}>

                    {/* VEHICLE TYPE */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.vehicle_type ? "is-invalid" : ""
                                    }`}
                                placeholder="Vehicle Type"
                                {...register("vehicle_type", {
                                    required: "Vehicle type is required",
                                })}
                            />
                            <label>
                                Vehicle Type <span className="text-danger">*</span>
                            </label>
                            {errors.vehicle_type && (
                                <span className="error text-danger">
                                    {errors.vehicle_type.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* SEATER */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                type="number"
                                className={`form-control ${errors.seater ? "is-invalid" : ""
                                    }`}
                                placeholder="Seater"
                                min={1}
                                {...register("seater", {
                                    required: "Seater is required",
                                    valueAsNumber: true,
                                    validate: (val) =>
                                        val > 0 || "Seater must be greater than 0",
                                })}
                            />
                            <label>
                                Seater <span className="text-danger">*</span>
                            </label>
                            {errors.seater && (
                                <span className="error text-danger">
                                    {errors.seater.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* VEHICLE PURPOSE */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <textarea
                                className={`form-control ${errors.vehicle_purpose ? "is-invalid" : ""
                                    }`}
                                placeholder="Vehicle Purpose"
                                {...register("vehicle_purpose", {
                                    required: "Vehicle purpose is required",
                                })}
                            ></textarea>
                            <label style={{ marginBottom: "0px" }} className="mb-0">
                                Vehicle Purpose <span className="text-danger">*</span>
                            </label>
                            {errors.vehicle_purpose && (
                                <span className="error text-danger">
                                    {errors.vehicle_purpose.message}
                                </span>
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
            <button type="submit" form="vehicleForm" className="btn btn-primary">
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
