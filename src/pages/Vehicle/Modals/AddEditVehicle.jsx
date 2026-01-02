import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import edit from "../../../assets/images/edit.svg";

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
                status: showModal?.status || "Active",
            }
            : {
                vehicle_type: "",
                seater: "",
                status: "Active",
            },
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
                    {/* ===== Avatar Upload ===== */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="avatar-wrapper" style={{ position: "relative" }}>
                            <label
                                htmlFor="avatarUpload"
                                className="avatar-edit-icon"
                                style={{
                                    position: "absolute",
                                    bottom: "0",
                                    right: "10px",
                                    background: "#e7e7e7",
                                    width: "30px",
                                    height: "30px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <img
                                    src={edit}
                                    alt="Edit"
                                    style={{ width: "14px", height: "18px", filter: "invert(1)" }}
                                />
                            </label>

                            <input type="file" id="avatarUpload" className="d-none" />
                        </div>
                    </div>

                    {/* ===== Vehicle Type + Seater ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* VEHICLE TYPE */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
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
                            <div className="col-lg-6 col-sm-12">
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
                                            validate: (value) =>
                                                value > 0 || "Seater must be greater than 0",
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
                        </div>
                    </div>

                    {/* ===== Status ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <select
                                        className={`form-control ${errors.status ? "is-invalid" : ""
                                            }`}
                                        {...register("status", {
                                            required: "Status is required",
                                        })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                    <label>
                                        Status <span className="text-danger">*</span>
                                    </label>
                                    {errors.status && (
                                        <span className="error text-danger">
                                            {errors.status.message}
                                        </span>
                                    )}
                                </div>
                            </div>
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
            className="user-modal-sm"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
