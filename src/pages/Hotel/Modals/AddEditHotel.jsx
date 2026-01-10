import { useState } from "react";
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
    const [currentEmailInput, setCurrentEmailInput] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
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
                                : []
                            : [{ value: showModal.contact_email }]
                        : [],
                hotel_address: showModal?.hotel_address || "",
            }
            : {
                hotel_name: "",
                contact_name: "",
                contact_no: "",
                contact_email: [],
                hotel_address: "",
            },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contact_email",
    });

    // Register validation for contact_email array
    register("contact_email", {
        validate: (value) => {
            if (!value || value.length === 0) {
                return "At least one contact email is required";
            }
            return true;
        },
    });

    const handleAddEmail = () => {
        const email = currentEmailInput.trim();

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return;
        }

        if (!emailRegex.test(email)) {
            // Set error for the input field
            return;
        }

        // Check for duplicates
        const existingEmails = fields.map((f) => f.value);
        if (existingEmails.includes(email)) {
            return;
        }

        // Add email to the array
        append({ value: email });

        // Clear the input
        setCurrentEmailInput("");
    };

    const handleEmailInputKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddEmail();
        }
    };

    const onSubmit = (data) => {
        // Add current input if it exists and is valid
        if (currentEmailInput.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const email = currentEmailInput.trim();
            if (emailRegex.test(email)) {
                const existingEmails = data.contact_email.map((e) => e.value);
                if (!existingEmails.includes(email)) {
                    data.contact_email.push({ value: email });
                }
            }
        }

        const payload = {
            ...data,
            contact_email: data.contact_email
                .map((e) => e.value?.trim())
                .filter(Boolean),
        };

        // Validate at least one email exists
        if (payload.contact_email.length === 0) {
            setValue("contact_email", [], { shouldValidate: true });
            return;
        }

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

                            {/* CONTACT EMAIL */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp" style={{ position: "relative" }}>
                                    <input
                                        type="email"
                                        className={`form-control ${fields.length === 0 && errors.contact_email ? "is-invalid" : ""
                                            }`}
                                        placeholder="Contact Email"
                                        style={{ paddingRight: "35px" }}
                                        value={currentEmailInput}
                                        onChange={(e) => setCurrentEmailInput(e.target.value)}
                                        onKeyPress={handleEmailInputKeyPress}
                                    />
                                    <label>
                                        Contact Email <span className="text-danger">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="btn btn-link p-0"
                                        style={{
                                            position: "absolute",
                                            right: "10px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            zIndex: 10,
                                            border: "none",
                                            background: "none",
                                            color: "#37ADB5",
                                            cursor: "pointer",
                                        }}
                                        onClick={handleAddEmail}
                                    >
                                        <FiPlus size={18} />
                                    </button>
                                </div>
                                {fields.length === 0 && errors.contact_email && (
                                    <span className="error text-danger">
                                        {errors.contact_email.message || "At least one email is required"}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">

                            {/* CONTACT EMAIL */}
                            <div className="col-lg-6 col-sm-12">

                                {/* Email Chips/Tags */}
                                {fields.length > 0 && (
                                    <div className="mt-2 d-flex gap-2" style={{ gap: "8px" }}>
                                        {fields.map((field, index) => (
                                            <span
                                                key={field.id}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    padding: "4px 12px",
                                                    backgroundColor: "#e7f3ff",
                                                    border: "1px solid #b3d9ff",
                                                    borderRadius: "20px",
                                                    fontSize: "13px",
                                                    color: "#0066cc",
                                                    gap: "6px",
                                                }}
                                            >
                                                {field.value}
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    style={{
                                                        border: "none",
                                                        background: "none",
                                                        color: "#0066cc",
                                                        cursor: "pointer",
                                                        padding: 0,
                                                        marginLeft: "4px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
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
