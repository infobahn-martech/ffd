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
import PremiumDateField from "../../../components/PremiumDateField";
import PremiumSelect from "../../../components/form/PremiumSelect";

const DRIVER_LOCATION_OPTIONS = PORT_OPTIONS.map((port) => ({ value: port, label: port }));

/** API may return driver_for as 1/2, "1"/"2", or "Transport" / "Material". */
function normalizeDriverFor(value) {
    if (value === 2 || value === "2") return 2;
    if (value === 1 || value === "1") return 1;
    if (typeof value === "string") {
        const v = value.trim().toLowerCase();
        if (v === "material") return 2;
        if (v === "transport") return 1;
    }
    return 1;
}

export function DriverModal({ showModal, closeModal, onSuccess }) {
    const isEdit = !!showModal?.driver_id || !!showModal?.driver_id;
    const editId = showModal?.driver_id ?? showModal?.driver_id;

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        setValue,
    } = useForm({
        defaultValues: {
            driver_name: "",
            employee_no: "",
            joining_date: "",
            contact_no: "",
            iqama_no: "",
            location: "",
            nationality: "",
            driver_for: 1,
        },
    });

    const { countries, fetchAllCountries, addDriver, updateDriver, isBeingUpdated, isLoadingCountries } = useDriverReducer();

    useEffect(() => {
        if (showModal) {
            fetchAllCountries();
        }
    }, [showModal]);

    useEffect(() => {
        if (showModal && isEdit && !isLoadingCountries && countries) {
            reset({
                driver_name: showModal?.driver_name || "",
                employee_no: showModal?.employee_no || "",
                joining_date: showModal?.joining_date || "",
                contact_no: showModal?.contact_no || "",
                iqama_no: showModal?.iqama_no || "",
                location: showModal?.location || "",
                nationality: showModal?.nationality ?? showModal?.country_id ?? "",
                driver_for: normalizeDriverFor(showModal?.driver_for),
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
                driver_for: 1,
            });
        }
    }, [showModal, isEdit, reset, isLoadingCountries, countries]);

    // Ensure driver_for syncs for edit (row may load before/after main reset; radios are controlled).
    useEffect(() => {
        if (!showModal || !isEdit || !showModal?.driver_id) return;
        setValue("driver_for", normalizeDriverFor(showModal.driver_for), {
            shouldValidate: false,
            shouldDirty: false,
        });
    }, [showModal?.driver_id, showModal?.driver_for, isEdit, setValue]);

    const onSubmit = (data) => {
        const payload = {
            driver_name: data.driver_name,
            employee_no: data.employee_no,
            contact_no: data.contact_no,
            iqama_no: data.iqama_no,
            nationality: data.nationality,
            location: data.location,
            joining_date: data.joining_date,
            driver_for: normalizeDriverFor(data.driver_for),
        };
        if (isEdit) {
            updateDriver({
                formData: { driver_id: editId, ...payload },
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
                                        {...register("employee_no")}
                                    />
                                    <label>Driver No</label>
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
                                <PremiumDateField
                                    control={control}
                                    name="joining_date"
                                    label="Joining Date"
                                    error={errors.joining_date}
                                />
                            </div>

                            {/* LOCATION */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="phone-wrapper">
                                    <label className="phone-label">Location</label>
                                    <Controller
                                        name="location"
                                        control={control}
                                        render={({ field }) => (
                                            <PremiumSelect
                                                value={field.value != null ? String(field.value) : ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                options={DRIVER_LOCATION_OPTIONS}
                                                placeholder="Select Location"
                                                searchPlaceholder="Search location..."
                                                hasError={Boolean(errors.location)}
                                            />
                                        )}
                                    />
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
                                <div className="phone-wrapper">
                                    <label className="phone-label">Nationality</label>
                                    <Controller
                                        name="nationality"
                                        control={control}
                                        render={({ field }) => (
                                            <PremiumSelect
                                                value={field.value != null ? String(field.value) : ""}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                options={(countries || []).map((c) => ({
                                                    value: String(c.country_id ?? ""),
                                                    label: String(
                                                        c.country || c.country_code || c.country_id || "",
                                                    ),
                                                }))}
                                                placeholder={
                                                    isLoadingCountries || countries === null
                                                        ? "Loading..."
                                                        : "Select Nationality"
                                                }
                                                searchPlaceholder="Search nationality..."
                                                disabled={isLoadingCountries || countries === null}
                                                hasError={Boolean(errors.nationality)}
                                            />
                                        )}
                                    />
                                    {errors.nationality && (
                                        <span className="error text-danger">
                                            {errors.nationality.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* DRIVER FOR — Transport (1) / Material (2) */}
                            <div className="col-lg-6 col-sm-12">
                                <div className="phone-wrapper">
                                    <label className="phone-label">
                                        Driver For <span className="text-danger">*</span>
                                    </label>
                                    <div
                                        className="d-flex align-items-center flex-wrap gap-3 pt-2"
                                        style={{ minHeight: 50 }}
                                    >
                                        <Controller
                                            name="driver_for"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <>
                                                    <div className="form-check form-check-inline mb-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="driver_for_transport"
                                                            checked={Number(field.value) === 1}
                                                            onChange={() => field.onChange(1)}
                                                            onBlur={field.onBlur}
                                                            ref={field.ref}
                                                            name={field.name}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="driver_for_transport"
                                                        >
                                                            Transport
                                                        </label>
                                                    </div>
                                                    <div className="form-check form-check-inline mb-0">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            id="driver_for_material"
                                                            checked={Number(field.value) === 2}
                                                            onChange={() => field.onChange(2)}
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor="driver_for_material"
                                                        >
                                                            Material
                                                        </label>
                                                    </div>
                                                </>
                                            )}
                                        />
                                    </div>
                                    {errors.driver_for && (
                                        <span className="error text-danger d-block mt-1">
                                            Please select Driver For
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
