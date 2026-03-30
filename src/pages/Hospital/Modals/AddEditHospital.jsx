import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import useHospitalReducer from "../../../store/HospitalReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import userIcon from "../../../assets/images/user.png";
import edit from "../../../assets/images/edit.svg";

export function HospitalModal({ showModal, closeModal, onSuccess }) {
    const { addHospital, updateHospital, isBeingUpdated } = useHospitalReducer(
        (state) => state
    );
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: showModal?.hospital_id
            ? {
                hospital_name: showModal?.hospital_name || "",
                contact_name: showModal?.contact_name || "",
                contact_no: showModal?.contact_no || "",
                contact_email: showModal?.contact_email || "", // ✅ single email
                hospital_address: showModal?.hospital_address || "",
            }
            : {
                hospital_name: "",
                contact_name: "",
                contact_no: "",
                contact_email: "", // ✅ single email
                hospital_address: "",
            },
    });

    const onSubmit = (data) => {
        const payload = {
            hospital_name: data.hospital_name,
            contact_name: data.contact_name,
            contact_no: data.contact_no,
            contact_email: data.contact_email?.trim(), // ✅ single email string
            hospital_address: data.hospital_address,
        };

        const isEdit = !!showModal?.hospital_id;

        if (isEdit) {
            updateHospital({
                formData: { ...payload, hospital_id: showModal.hospital_id },
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        } else {
            addHospital({
                formData: payload,
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">{showModal?.hospital_id ? "Edit Hospital" : "Add Hospital"}</h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="hospitalForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* ===== Hotel Name + Contact Name ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* HOTEL NAME */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.hotel_name ? "is-invalid" : ""}`}
                                        placeholder="Hotel Name"
                                        {...register("hotel_name", {
                                            required: "Hotel name is required",
                                        })}
                                    />
                                    <label>
                                        Hotel Name <span className="text-danger">*</span>
                                    </label>
                                    {errors.hotel_name && (
                                        <span className="error text-danger">
                                            {errors.hotel_name.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* CONTACT NAME */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.contact_name ? "is-invalid" : ""}`}
                                        placeholder="Contact Name"
                                        {...register("contact_name", {
                                            required: "Contact name is required",
                                        })}
                                    />
                                    <label>
                                        Contact Name <span className="text-danger">*</span>
                                    </label>
                                    {errors.contact_name && (
                                        <span className="error text-danger">
                                            {errors.contact_name.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Contact No ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
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

                                    {errors.contact_no && (
                                        <span className="error text-danger">
                                            {errors.contact_no.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Contact Email (Single) ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="email"
                                        className={`form-control ${errors.contact_email ? "is-invalid" : ""
                                            }`}
                                        placeholder="email@example.com"
                                        {...register("contact_email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email address",
                                            },
                                        })}
                                    />
                                    <label>
                                        Email <span className="text-danger">*</span>
                                    </label>

                                    {errors.contact_email && (
                                        <span className="error text-danger">
                                            {errors.contact_email.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== Hotel Address (Full Row) ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                <div className="form-floating desig-inp">
                                    <textarea
                                        className={`form-control ${errors.hospital_address ? "is-invalid" : ""
                                            }`}
                                        placeholder="Hospital Address"
                                        style={{ minHeight: "80px" }}
                                        {...register("hospital_address", {
                                            required: "Hospital address is required",
                                        })}
                                    />
                                    <label>
                                        Hospital Address <span className="text-danger">*</span>
                                    </label>
                                    {errors.hospital_address && (
                                        <span className="error text-danger">
                                            {errors.hospital_address.message}
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
            <button
                type="button"
                className="btn btn-outline"
                onClick={closeModal}
                disabled={isBeingUpdated}
            >
                Close
            </button>

            <button
                type="submit"
                form="hotelForm"
                className="btn btn-primary"
                disabled={isBeingUpdated}
            >
                {isBeingUpdated ? "Saving..." : "Save"}
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