import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

// You can later move these to a constants file if needed
const MODULE_OPTIONS = [
    { label: "Husbandry", value: "husbandry" },
    { label: "Crew Management", value: "crew_management" },
    { label: "Transport", value: "transport" },
    { label: "Warehouse", value: "warehouse" },
    { label: "Hotel", value: "hotel" },
    { label: "Billing", value: "billing" },
];

const FIELD_TYPE_OPTIONS = [
    { label: "Text", value: "text" },
    { label: "Textarea", value: "textarea" },
    { label: "Number", value: "number" },
    { label: "Decimal", value: "decimal" },
    { label: "Email", value: "email" },
    { label: "Phone", value: "phone" },
    { label: "Date", value: "date" },
    { label: "Date & Time", value: "datetime" },
    { label: "Dropdown", value: "dropdown" },
    { label: "Multi Select", value: "multi_select" },
    { label: "Checkbox", value: "checkbox" },
    { label: "Toggle / Switch", value: "toggle" },
    { label: "Radio", value: "radio" },
    { label: "File Upload", value: "file" },
    { label: "Image Upload", value: "image" },
];

export function CustomFieldModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        defaultValues: showModal?._id
            ? {
                customFieldName: showModal?.name || "",
                fieldKey: showModal?.key || "",
                description: showModal?.description || "",
                module: showModal?.module || "",
                type: showModal?.type || "",
                order: showModal?.order || 1,
                isRequired: !!showModal?.isRequired,
                isActive: showModal?.isActive ?? true,
            }
            : {
                customFieldName: "",
                fieldKey: "",
                description: "",
                module: "",
                type: "",
                order: 1,
                isRequired: false,
                isActive: true,
            },
    });

    const customFieldName = watch("customFieldName");
    const fieldKey = watch("fieldKey");

    // Auto-generate fieldKey from label for ADD mode only (and when fieldKey is empty)
    useEffect(() => {
        if (!showModal?._id && customFieldName && !fieldKey) {
            const generatedKey = customFieldName
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "");
            setValue("fieldKey", generatedKey);
        }
    }, [customFieldName, fieldKey, setValue, showModal]);

    const onSubmit = (data) => {
        console.log("CUSTOM FIELD FORM SUBMITTED:", data);
        // You can transform data here before sending to API if needed
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Custom Field" : "Add Custom Field"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="customFieldForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* SECTION: BASIC DETAILS */}
                    <div className="row">
                        {/* MODULE */}
                        <div className="col-lg-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-select ${errors.module ? "is-invalid" : ""
                                        }`}
                                    {...register("module", {
                                        required: "Module is required",
                                    })}
                                >
                                    <option value="">Select Module</option>
                                    {MODULE_OPTIONS.map((mod) => (
                                        <option key={mod.value} value={mod.value}>
                                            {mod.label}
                                        </option>
                                    ))}
                                </select>
                                <label>
                                    Module <span className="text-danger">*</span>
                                </label>
                                {errors.module && (
                                    <span className="error text-danger">
                                        {errors.module.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* FIELD LABEL */}
                        <div className="col-lg-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.customFieldName ? "is-invalid" : ""
                                        }`}
                                    placeholder="Custom Field Name"
                                    {...register("customFieldName", {
                                        required: "Custom field name is required",
                                    })}
                                />
                                <label>
                                    Custom Field Name <span className="text-danger">*</span>
                                </label>
                                {errors.customFieldName && (
                                    <span className="error text-danger">
                                        {errors.customFieldName.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        {/* FIELD KEY */}
                        <div className="col-lg-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.fieldKey ? "is-invalid" : ""
                                        }`}
                                    placeholder="field_key"
                                    {...register("fieldKey", {
                                        required: "Field key is required",
                                    })}
                                // If you want it fully readonly, uncomment:
                                // readOnly
                                />
                                <label>
                                    Field Key <span className="text-danger">*</span>
                                </label>
                                {errors.fieldKey && (
                                    <span className="error text-danger">
                                        {errors.fieldKey.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* FIELD TYPE */}
                        <div className="col-lg-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-select ${errors.type ? "is-invalid" : ""
                                        }`}
                                    {...register("type", {
                                        required: "Field type is required",
                                    })}
                                >
                                    <option value="">Select Type</option>
                                    {FIELD_TYPE_OPTIONS.map((ft) => (
                                        <option key={ft.value} value={ft.value}>
                                            {ft.label}
                                        </option>
                                    ))}
                                </select>
                                <label>
                                    Field Type <span className="text-danger">*</span>
                                </label>
                                {errors.type && (
                                    <span className="error text-danger">
                                        {errors.type.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DESCRIPTION — FULL ROW TEXTAREA */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <textarea
                                className="form-control"
                                placeholder="Description"
                                style={{ height: "120px" }}
                                {...register("description")}
                            ></textarea>
                            <label>Description</label>
                        </div>
                    </div>

                    {/* SECTION: VALIDATION & BEHAVIOR */}
                    <div className="modal-section-title mt-3">
                        Validation &amp; Behavior
                    </div>
                    <div className="row">
                        {/* REQUIRED */}
                        <div className="col-lg-4 mb-lg-3 mb-sm-0">
                            <div className="form-check mt-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="isRequired"
                                    {...register("isRequired")}
                                />
                                <label className="form-check-label" htmlFor="isRequired">
                                    Required Field
                                </label>
                            </div>
                        </div>

                        {/* STATUS */}
                        <div className="col-lg-4 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-select ${errors.isActive ? "is-invalid" : ""
                                        }`}
                                    {...register("isActive", {
                                        required: "Status is required",
                                    })}
                                >
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                                <label>
                                    Status <span className="text-danger">*</span>
                                </label>
                                {errors.isActive && (
                                    <span className="error text-danger">
                                        {errors.isActive.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ORDER */}
                        <div className="col-lg-4 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    type="number"
                                    className={`form-control ${errors.order ? "is-invalid" : ""
                                        }`}
                                    placeholder="Order"
                                    {...register("order", {
                                        required: "Display order is required",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Order must be at least 1",
                                        },
                                    })}
                                />
                                <label>
                                    Display Order <span className="text-danger">*</span>
                                </label>
                                {errors.order && (
                                    <span className="error text-danger">
                                        {errors.order.message}
                                    </span>
                                )}
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
                onClick={() => closeModal(null)}
            >
                Close
            </button>
            <button type="submit" form="customFieldForm" className="btn btn-primary">
                Save
            </button>
        </div>
    );

    return (
        <CustomModal
            className="role-modal-sm" // you can change to a larger class if needed
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
