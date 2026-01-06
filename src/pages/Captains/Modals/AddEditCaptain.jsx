import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import userIcon from "../../../assets/images/user.png";
import edit from "../../../assets/images/edit.svg";
import { PORT_OPTIONS } from "../../../constants/ports";

export function CaptainModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: showModal?._id
            ? {
                name: showModal?.captainName,
                email: showModal?.email,
                port: showModal?.port,
                phone: showModal?.phone || "",
                address: showModal?.address,
            }
            : {
                phone: "",
            },
    });

    const onSubmit = (data) => {
        console.log("CAPTAIN FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Captain" : "Add Captain"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="captainForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* ===== Avatar Upload ===== */}
                    <div className="d-flex justify-content-center mb-4">
                        <div className="avatar-wrapper" style={{ position: "relative" }}>
                            <img
                                src={showModal?.avatar || userIcon}
                                alt="User Avatar"
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

                    {/* ===== Name + Email ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* NAME */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                        placeholder="Name"
                                        {...register("name", {
                                            required: "Name is required",
                                        })}
                                    />
                                    <label>
                                        Name <span className="text-danger">*</span>
                                    </label>
                                    {errors.name && (
                                        <span className="error text-danger">{errors.name.message}</span>
                                    )}
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? "is-invalid" : ""
                                            }`}
                                        placeholder="Email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email",
                                            },
                                        })}
                                    />
                                    <label>
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    {errors.email && (
                                        <span className="error text-danger">{errors.email.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Port ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* PORT */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <select
                                        className={`form-control ${errors.port ? "is-invalid" : ""}`}
                                        {...register("port", { required: "Port is required" })}
                                    >
                                        <option value="">Select Port</option>
                                        {PORT_OPTIONS.map((port) => (
                                            <option key={port} value={port}>
                                                {port}
                                            </option>
                                        ))}
                                    </select>
                                    <label>
                                        Port <span className="text-danger">*</span>
                                    </label>
                                    {errors.port && (
                                        <span className="error text-danger">{errors.port.message}</span>
                                    )}
                                </div>
                            </div>
                            {/* PHONE */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="phone-wrapper">
                                    <label className="phone-label">
                                        Phone <span className="text-danger">*</span>
                                    </label>

                                    <Controller
                                        name="phone"
                                        control={control}
                                        rules={{
                                            required: "Phone is required",
                                            validate: (value) => {
                                                const digits = (value || "").replace(/\D/g, "");
                                                return digits.length >= 7 || "Enter a valid phone number";
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

                                    {errors.phone && (
                                        <span className="error text-danger">
                                            {errors.phone.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Phone + Address ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* ADDRESS (optional) */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <textarea
                                        className="form-control"
                                        placeholder="Address"
                                        style={{ height: "100px" }}
                                        {...register("address")}
                                    ></textarea>
                                    <label>Address</label>
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
            <button type="submit" form="captainForm" className="btn btn-primary">
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
