import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const VEHICLE_PURPOSE_OPTIONS = [
    { value: "crew_transport", label: "Crew Transport" },
    { value: "material", label: "Material" },
];

export function VehicleModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: showModal?._id
            ? {
                vehicle_type: showModal?.vehicle_type || "",
                vehicle_purpose: showModal?.vehicle_purpose || "",
                seater: showModal?.seater || "",
            }
            : {
                vehicle_type: "",
                vehicle_purpose: "",
                seater: "",
            },
    });

    const vehiclePurpose = watch("vehicle_purpose");
    const showSeater = vehiclePurpose === "crew_transport";

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

                    {/* VEHICLE PURPOSE */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-select ${errors.vehicle_purpose ? "is-invalid" : ""
                                    }`}
                                {...register("vehicle_purpose", {
                                    required: "Vehicle purpose is required",
                                })}
                            >
                                <option value="">Select Vehicle Purpose</option>
                                {VEHICLE_PURPOSE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Vehicle Purpose <span className="text-danger">*</span>
                            </label>
                            {errors.vehicle_purpose && (
                                <span className="error text-danger">
                                    {errors.vehicle_purpose.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* SEATER - Only show when Crew Transport is selected */}
                    {showSeater && (
                        <div className="mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    type="number"
                                    className={`form-control ${errors.seater ? "is-invalid" : ""
                                        }`}
                                    placeholder="Seater"
                                    min={1}
                                    {...register("seater", {
                                        required: showSeater ? "Seater is required" : false,
                                        valueAsNumber: true,
                                        validate: (val) =>
                                            !showSeater || val > 0 || "Seater must be greater than 0",
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
                    )}


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
