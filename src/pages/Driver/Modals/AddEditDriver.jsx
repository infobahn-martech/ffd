import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import userIcon from "../../../assets/images/user.png";
import edit from "../../../assets/images/edit.svg";
// import { ROLE_OPTIONS } from "../../../constants/roles"; // ❌ no longer needed
import { PORT_OPTIONS } from "../../../constants/ports";

export function DriverModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: showModal?._id
            ? {
                driver_name: showModal?.driver_name || "",
                employee_no: showModal?.employee_no || "",
                joining_date: showModal?.joining_date || "",
                contact_no: showModal?.contact_no || "",
                iqama_no: showModal?.iqama_no || "",
                location: showModal?.location || "",
                nationality: showModal?.nationality || "",
            }
            : {
                driver_name: "",
                employee_no: "",
                joining_date: "",
                contact_no: "",
                iqama_no: "",
                location: "",
                nationality: "",
            },
    });

    const onSubmit = (data) => {
        console.log("DRIVER FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Driver" : "Add Driver"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="driverForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* ===== Avatar Upload ===== */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="avatar-wrapper" style={{ position: "relative" }}>
                            <img
                                src={showModal?.avatar || userIcon}
                                alt="Driver Avatar"
                                className="avatar-image"
                                style={{
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "3px solid #e6e6e6",
                                }}
                            />

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

                    {/* ===== Driver Name + Driver No ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* DRIVER NAME */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.driver_name ? "is-invalid" : ""
                                            }`}
                                        placeholder="Driver Name"
                                        {...register("driver_name", {
                                            required: "Driver name is required",
                                        })}
                                    />
                                    <label>
                                        Driver Name <span className="text-danger">*</span>
                                    </label>
                                    {errors.driver_name && (
                                        <span className="error text-danger">
                                            {errors.driver_name.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* EMPLOYEE NO */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.employee_no ? "is-invalid" : ""
                                            }`}
                                        placeholder="Driver No"
                                        {...register("employee_no", {
                                            required: "Employee number is required",
                                        })}
                                    />
                                    <label>
                                        Driver No <span className="text-danger">*</span>
                                    </label>
                                    {errors.employee_no && (
                                        <span className="error text-danger">
                                            {errors.employee_no.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Joining Date ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="date"
                                        className={`form-control ${errors.joining_date ? "is-invalid" : ""
                                            }`}
                                        placeholder="Joining Date"
                                        {...register("joining_date", {
                                            required: "Joining date is required",
                                        })}
                                    />
                                    <label>
                                        Joining Date <span className="text-danger">*</span>
                                    </label>
                                    {errors.joining_date && (
                                        <span className="error text-danger">
                                            {errors.joining_date.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Contact No + Iqama No ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* CONTACT NO (PhoneInput) */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="phone-wrapper">
                                    <label className="phone-label">
                                        Contact No <span className="text-danger">*</span>
                                    </label>

                                    <Controller
                                        name="contact_no"
                                        control={control}
                                        rules={{
                                            required: "Contact no is required",
                                            validate: (value) => {
                                                const digits = (value || "").replace(/\D/g, "");
                                                return (
                                                    digits.length >= 7 ||
                                                    "Enter a valid phone number"
                                                );
                                            },
                                        }}
                                        render={({ field }) => (
                                            <PhoneInput
                                                {...field}
                                                country="sa"
                                                enableSearch
                                                inputClass="phone-input"
                                                buttonClass="phone-flag"
                                            />
                                        )}
                                    />

                                    {errors.contact_no && (
                                        <span className="error text-danger">
                                            {errors.contact_no.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* IQAMA NO */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.iqama_no ? "is-invalid" : ""
                                            }`}
                                        placeholder="Iqama No"
                                        {...register("iqama_no", {
                                            required: "Iqama number is required",
                                        })}
                                    />
                                    <label>
                                        Iqama No <span className="text-danger">*</span>
                                    </label>
                                    {errors.iqama_no && (
                                        <span className="error text-danger">
                                            {errors.iqama_no.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Location + Nationality ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* LOCATION */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <select
                                        className={`form-control ${errors.location ? "is-invalid" : ""
                                            }`}
                                        {...register("location", {
                                            required: "Location is required",
                                        })}
                                    >
                                        <option value="">Select Location</option>
                                        {PORT_OPTIONS.map((port) => (
                                            <option key={port} value={port}>
                                                {port}
                                            </option>
                                        ))}
                                    </select>
                                    <label>
                                        Location <span className="text-danger">*</span>
                                    </label>
                                    {errors.location && (
                                        <span className="error text-danger">
                                            {errors.location.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* NATIONALITY */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.nationality ? "is-invalid" : ""
                                            }`}
                                        placeholder="Nationality"
                                        {...register("nationality", {
                                            required: "Nationality is required",
                                        })}
                                    />
                                    <label>
                                        Nationality <span className="text-danger">*</span>
                                    </label>
                                    {errors.nationality && (
                                        <span className="error text-danger">
                                            {errors.nationality.message}
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
            <button type="submit" form="driverForm" className="btn btn-primary">
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
