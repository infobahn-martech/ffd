import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import useHospitalReducer from "../../../store/HospitalReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function HospitalModal({ showModal, closeModal, onSuccess }) {
    const { addHospital, updateHospital, getHospitalDetail, isBeingUpdated } =
        useHospitalReducer((state) => state);

    const hospitalId =
        showModal && typeof showModal === "object"
            ? showModal.hospital_id ?? showModal._id
            : null;
    const isEdit = !!(hospitalId);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: isEdit
            ? {
                  hospital_name: showModal?.hospital_name ?? "",
                  location: showModal?.location ?? "",
                  contact_person: showModal?.contact_person ?? "",
                  contact_number: showModal?.contact_number ?? "",
                  email: showModal?.email ?? "",
              }
            : {
                  hospital_name: "",
                  location: "",
                  contact_person: "",
                  contact_number: "",
                  email: "",
              },
    });

    useEffect(() => {
        if (!isEdit || !hospitalId) return;
        let cancelled = false;
        (async () => {
            const detail = await getHospitalDetail(hospitalId);
            if (cancelled || !detail) return;
            reset({
                hospital_name: detail.hospital_name ?? "",
                location: detail.location ?? "",
                contact_person: detail.contact_person ?? "",
                contact_number: detail.contact_number ?? "",
                email: detail.email ?? "",
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [isEdit, hospitalId, getHospitalDetail, reset]);

    const onSubmit = (data) => {
        const payload = {
            hospital_name: data.hospital_name.trim(),
            location: data.location.trim(),
            contact_person: data.contact_person.trim(),
            contact_number: (data.contact_number || "").trim(),
            email: data.email.trim(),
        };

        if (isEdit) {
            updateHospital({
                formData: { ...payload, hospital_id: hospitalId },
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
            <h1 className="modal-title">{isEdit ? "Edit Hospital" : "Add Hospital"}</h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="hospitalForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.hospital_name ? "is-invalid" : ""}`}
                                        placeholder="Hospital Name"
                                        {...register("hospital_name", {
                                            required: "Hospital name is required",
                                            minLength: {
                                                value: 2,
                                                message: "Hospital name must be at least 2 characters",
                                            },
                                        })}
                                    />
                                    <label>
                                        Hospital Name <span className="text-danger">*</span>
                                    </label>
                                    {errors.hospital_name && (
                                        <span className="error text-danger">
                                            {errors.hospital_name.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.contact_person ? "is-invalid" : ""}`}
                                        placeholder="Contact Person"
                                        {...register("contact_person", {
                                            required: "Contact person is required",
                                            pattern: {
                                                value: /^[A-Za-z\s]+$/,
                                                message: "Contact person cannot contain numbers or special characters",
                                            },
                                            onChange: (e) => {
                                                e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                                            },
                                        })}
                                    />
                                    <label>
                                        Contact Person <span className="text-danger">*</span>
                                    </label>
                                    {errors.contact_person && (
                                        <span className="error text-danger">
                                            {errors.contact_person.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                <div className="phone-wrapper">
                                    <label className="phone-label">
                                        Contact Number
                                    </label>

                                    <Controller
                                        name="contact_number"
                                        control={control}
                                        rules={{
                                            validate: (value) => {
                                                if (!value) return true;
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

                                    {errors.contact_number && (
                                        <span className="error text-danger">
                                            {errors.contact_number.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                        placeholder="email@example.com"
                                        {...register("email", {
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

                                    {errors.email && (
                                        <span className="error text-danger">{errors.email.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                <div className="form-floating desig-inp">
                                    <textarea
                                        className={`form-control ${errors.location ? "is-invalid" : ""}`}
                                        placeholder="Location"
                                        style={{ minHeight: "80px" }}
                                        {...register("location", {
                                            required: "Location is required",
                                            minLength: {
                                                value: 3,
                                                message: "Location must be at least 3 characters",
                                            },
                                        })}
                                    />
                                    <label>
                                        Location <span className="text-danger">*</span>
                                    </label>
                                    {errors.location && (
                                        <span className="error text-danger">{errors.location.message}</span>
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
                form="hospitalForm"
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
