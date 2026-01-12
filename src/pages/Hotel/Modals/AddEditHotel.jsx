import { useForm, Controller, useFieldArray } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import { FiPlus, FiX } from "react-icons/fi";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import userIcon from "../../../assets/images/user.png";
import edit from "../../../assets/images/edit.svg";

export function HotelModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: showModal?._id
            ? {
                hotel_name: showModal?.hotel_name || "",
                contact_name: showModal?.contact_name || "",
                contact_no: showModal?.contact_no || "",
                contact_emails:
                    showModal?.contact_email
                        ? Array.isArray(showModal.contact_email)
                            ? showModal.contact_email.map((e) => ({ value: e }))
                            : [{ value: showModal.contact_email }]
                        : [{ value: "" }],
                hotel_address: showModal?.hotel_address || "",
            }
            : {
                hotel_name: "",
                contact_name: "",
                contact_no: "",
                contact_emails: [{ value: "" }],
                hotel_address: "",
            },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contact_emails"
    });

    const onSubmit = (data) => {
        const payload = {
            ...data,
            contact_email: data.contact_emails.map((e) => e.value?.trim()).filter(Boolean)
        };
        console.log("HOTEL FORM SUBMITTED:", payload);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Hotel" : "Add Hotel"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="hotelForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* ===== Hotel Name + Contact Name ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* HOTEL NAME */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.hotel_name ? "is-invalid" : ""
                                            }`}
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
                                        className={`form-control ${errors.contact_name ? "is-invalid" : ""
                                            }`}
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
                            {/* CONTACT NO (PhoneInput) */}
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
                                                return (
                                                    digits.length >= 7 || "Enter a valid phone number"
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
                        </div>
                    </div>

                    {/* ===== Contact Email (Multiple) ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                {fields.map((field, index) => (
                                    <div className="row align-items-center mb-2" key={field.id}>
                                        <div className="col-12">
                                            <div className="form-floating desig-inp position-relative">
                                                <input
                                                    type="email"
                                                    className={`form-control email-input-no-validation ${errors.contact_emails?.[index]?.value ? "is-invalid" : ""
                                                        }`}
                                                    placeholder="email@example.com"
                                                    style={{ paddingRight: "45px" }}
                                                    {...register(`contact_emails.${index}.value`, {
                                                        required: "Email is required",
                                                        pattern: {
                                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: "Enter a valid email address",
                                                        },
                                                    })}
                                                />
                                                <label>Email <span className="text-danger">*</span></label>
                                                {index === fields.length - 1 ? (
                                                    <button
                                                        type="button"
                                                        className="email-action-btn email-add-btn"
                                                        onClick={() => append({ value: "" })}
                                                        title="Add Email"
                                                    >
                                                        <FiPlus size={18} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="email-action-btn email-remove-btn"
                                                        onClick={() => remove(index)}
                                                        title="Remove Email"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                )}
                                                {errors.contact_emails?.[index]?.value && (
                                                    <span className="error text-danger">
                                                        {errors.contact_emails[index].value.message}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ===== Hotel Address (Full Row) ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                <div className="form-floating desig-inp">
                                    <textarea
                                        className={`form-control ${errors.hotel_address ? "is-invalid" : ""
                                            }`}
                                        placeholder="Hotel Address"
                                        style={{ minHeight: "80px" }}
                                        {...register("hotel_address", {
                                            required: "Hotel address is required",
                                        })}
                                    />
                                    <label>
                                        Hotel Address <span className="text-danger">*</span>
                                    </label>
                                    {errors.hotel_address && (
                                        <span className="error text-danger">
                                            {errors.hotel_address.message}
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
            {/* 🔧 form id fixed to "hotelForm" */}
            <button type="submit" form="hotelForm" className="btn btn-primary">
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
