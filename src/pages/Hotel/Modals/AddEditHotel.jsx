import { useForm, Controller, useFieldArray } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
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
                contact_email:
                    showModal?.contact_email
                        ? Array.isArray(showModal.contact_email)
                            ? showModal.contact_email.length > 0
                                ? showModal.contact_email.map((e) => ({ value: e || "" }))
                                : [{ value: "" }]
                            : [{ value: showModal.contact_email }]
                        : [{ value: "" }],
                hotel_address: showModal?.hotel_address || "",
            }
            : {
                hotel_name: "",
                contact_name: "",
                contact_no: "",
                contact_email: [{ value: "" }],
                hotel_address: "",
            },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contact_email",
    });

    const onSubmit = (data) => {
        const payload = {
            ...data,
            contact_email: data.contact_email
                .map((e) => e.value?.trim())
                .filter(Boolean),
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

                    {/* ===== Contact No + Contact Email ===== */}
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

                            {/* CONTACT EMAIL - First Email */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="email"
                                        className={`form-control ${errors.contact_email?.[0]?.value ? "is-invalid" : ""
                                            }`}
                                        placeholder="Contact Email"
                                        {...register("contact_email.0.value", {
                                            required: "Contact email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email address",
                                            },
                                        })}
                                    />
                                    <label>
                                        Contact Email <span className="text-danger">*</span>
                                    </label>
                                    {errors.contact_email?.[0]?.value && (
                                        <span className="error text-danger">
                                            {errors.contact_email[0].value.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Contact Emails */}
                    {fields.length > 1 && (
                        <div className="mb-lg-3 mb-sm-0">
                            {fields.slice(1).map((field, index) => (
                                <div className="mb-2" key={field.id}>
                                    <div className="permInputs row">
                                        <div className="col-lg-6 col-sm-12">
                                            <div className="form-floating desig-inp">
                                                <input
                                                    type="email"
                                                    className={`form-control ${errors.contact_email?.[index + 1]?.value ? "is-invalid" : ""
                                                        }`}
                                                    placeholder="Contact Email"
                                                    {...register(`contact_email.${index + 1}.value`, {
                                                        required: "Contact email is required",
                                                        pattern: {
                                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: "Enter a valid email address",
                                                        },
                                                    })}
                                                />
                                                <label>
                                                    Contact Email <span className="text-danger">*</span>
                                                </label>
                                                {errors.contact_email?.[index + 1]?.value && (
                                                    <span className="error text-danger">
                                                        {errors.contact_email[index + 1].value.message}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-sm-12 d-flex align-items-end">
                                            <button
                                                type="button"
                                                className="btn btn-link text-danger p-0"
                                                onClick={() => remove(index + 1)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Email Button */}
                    <div className="mb-lg-3 mb-sm-0">
                        <button
                            type="button"
                            className="btn btn-link p-0"
                            onClick={() => append({ value: "" })}
                        >
                            + Add Another Email
                        </button>
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
