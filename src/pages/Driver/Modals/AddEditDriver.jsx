import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import { PORT_OPTIONS } from "../../../constants/ports";
import useDriverReducer from "../../../store/DriverReducer";

export function DriverModal({ showModal, closeModal, onSuccess }) {
    const isEdit = !!showModal?.driver_id || !!showModal?.driver_id;
    const editId = showModal?.driver_id ?? showModal?.driver_id;

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm({
        defaultValues: {
            driver_name: "",
            employee_no: "",
            joining_date: "",
            contact_no: "",
            iqama_no: "",
            location: "",
            nationality: "",
        },
    });

    const { countries, fetchAllCountries, addDriver, updateDriver, isBeingUpdated } = useDriverReducer();

    useEffect(() => {
        if (showModal) {
            fetchAllCountries();
        }
    }, [showModal]);

    useEffect(() => {
        if (showModal && isEdit) {
            reset({
                driver_name: showModal?.driver_name || "",
                employee_no: showModal?.employee_no || "",
                joining_date: showModal?.joining_date || "",
                contact_no: showModal?.contact_no || "",
                iqama_no: showModal?.iqama_no || "",
                location: showModal?.location || "",
                nationality: showModal?.nationality ?? showModal?.country_id ?? "",
            });
        } else if (showModal && !isEdit) {
            reset({
                driver_name: "",
                employee_no: "",
                joining_date: "",
                contact_no: "",
                iqama_no: "",
                location: "",
                nationality: "",
            });
        }
    }, [showModal, isEdit, reset]);

    const onSubmit = (data) => {
        const payload = {
            driver_name: data.driver_name,
            employee_no: data.employee_no,
            contact_no: data.contact_no,
            iqama_no: data.iqama_no,
            nationality: data.nationality,
            location: data.location,
            joining_date: data.joining_date,
        };
        if (isEdit) {
            payload.id = editId;
            updateDriver({
                driver_id: editId,
                formData: payload,
                cb: () => {
                    closeModal();
                    onSuccess?.();
                },
            });
        } else {
            addDriver({
                formData: payload,
                cb: () => {
                    closeModal();
                    onSuccess?.();
                },
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Driver" : "Add Driver"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="driverForm" onSubmit={handleSubmit(onSubmit)}>
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

                    {/* ===== Joining Date + Location ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            {/* JOINING DATE */}
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

                    {/* ===== Nationality (from all_country API) ===== */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <select
                                        className={`form-control ${errors.nationality ? "is-invalid" : ""
                                            }`}
                                        {...register("nationality", {
                                            required: "Nationality is required",
                                        })}
                                    >
                                        <option value="">Select Nationality</option>
                                        {(countries || []).map((c) => (
                                            <option key={c.country_id} value={c.country_id}>
                                                {c.country || c.country_code || c.country_id}
                                            </option>
                                        ))}
                                    </select>
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
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={isBeingUpdated}>
                Close
            </button>
            <button type="submit" form="driverForm" className="btn btn-primary" disabled={isBeingUpdated}>
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
