import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function BillingInstructionModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: showModal?._id
            ? {
                instructionTitle: showModal?.name || "",
                instructionCode: showModal?.code || "",
                appliesTo: showModal?.appliesTo || "GLOBAL", // GLOBAL | BILLING_ENTITY
                type: showModal?.type || "INFO",             // INFO | MANDATORY | WARNING
                description: showModal?.description || "",
                isActive: showModal?.isActive ?? true,
            }
            : {
                instructionTitle: "",
                instructionCode: "",
                appliesTo: "GLOBAL",
                type: "INFO",
                description: "",
                isActive: true,
            },
    });

    const onSubmit = (data) => {
        console.log("BILLING INSTRUCTION FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Billing Instruction" : "Add Billing Instruction"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="billingInstructionForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* ROW 1 — Instruction Title + Code */}
                    <div className="permInputs row mb-lg-3">
                        {/* Instruction Title */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.instructionTitle ? "is-invalid" : ""
                                        }`}
                                    placeholder="Instruction Title"
                                    {...register("instructionTitle", {
                                        required: "Instruction title is required",
                                    })}
                                />
                                <label>
                                    Instruction Title <span className="text-danger">*</span>
                                </label>
                                {errors.instructionTitle && (
                                    <span className="error text-danger">
                                        {errors.instructionTitle.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Instruction Code */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.instructionCode ? "is-invalid" : ""
                                        }`}
                                    placeholder="Instruction Code"
                                    {...register("instructionCode", {
                                        required: "Instruction code is required",
                                    })}
                                />
                                <label>
                                    Instruction Code <span className="text-danger">*</span>
                                </label>
                                {errors.instructionCode && (
                                    <span className="error text-danger">
                                        {errors.instructionCode.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ROW 2 — Applies To + Type */}
                    <div className="permInputs row mb-lg-3">
                        {/* Applies To */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-select ${errors.appliesTo ? "is-invalid" : ""
                                        }`}
                                    {...register("appliesTo", {
                                        required: "Applies To is required",
                                    })}
                                >
                                    <option value="GLOBAL">Global</option>
                                    <option value="BILLING_ENTITY">Specific Billing Entity</option>
                                </select>
                                <label>
                                    Applies To <span className="text-danger">*</span>
                                </label>
                                {errors.appliesTo && (
                                    <span className="error text-danger">
                                        {errors.appliesTo.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Type */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-select ${errors.type ? "is-invalid" : ""
                                        }`}
                                    {...register("type", {
                                        required: "Type is required",
                                    })}
                                >
                                    <option value="INFO">Info</option>
                                    <option value="MANDATORY">Mandatory</option>
                                    <option value="WARNING">Warning</option>
                                </select>
                                <label>
                                    Type <span className="text-danger">*</span>
                                </label>
                                {errors.type && (
                                    <span className="error text-danger">
                                        {errors.type.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE FLAG */}
                    <div className="permInputs row mb-lg-3">
                        <div className="col-lg-6 col-sm-12 mb-3 d-flex align-items-center">
                            <div className="form-check mt-2">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="isActive"
                                    {...register("isActive")}
                                />
                                <label className="form-check-label" htmlFor="isActive">
                                    Active
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* DESCRIPTION — FULL ROW */}
                    <div className="mb-lg-3 mb-sm-0">
                        <label className="form-label mb-2">
                            Description
                        </label>
                        <textarea
                            className="form-control"
                            placeholder="Enter billing instruction details..."
                            rows={4}
                            {...register("description")}
                        ></textarea>
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
            <button
                type="submit"
                form="billingInstructionForm"
                className="btn btn-primary"
            >
                Save
            </button>
        </div>
    );

    return (
        <CustomModal
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
