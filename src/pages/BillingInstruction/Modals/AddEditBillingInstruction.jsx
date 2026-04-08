import { useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { FiPlus, FiX } from "react-icons/fi";
import CustomModal from "../../../components/CustomModal";
import useBillingInstructionReducer from "../../../store/BillingInstructionReducer";
import useBillingEntityReducer from "../../../store/BillingEntityReducer";
import useAlertReducer from "../../../store/AlertReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const INSTRUCTION_TYPES = [
    { value: "Email", label: "Email" },
    { value: "Client Portal", label: "Client Portal" },
    { value: "Hand Delivery", label: "Hand Delivery" },
];

export function BillingInstructionModal({ showModal, closeModal, onSuccess }) {
    const {
        addBillingInstruction,
        updateBillingInstruction,
        isBeingUpdated,
        getInstructionByEntity,
        instructionDetail,
        isLoadingDetail,
        clearInstructionDetail,
    } = useBillingInstructionReducer((state) => state);

    const { getBillingEntities, billingEntities, isLoading: billingLoading } =
        useBillingEntityReducer((state) => state);

    const { error: showError } = useAlertReducer();

    const isEdit = !!showModal?.entity_id;

    const {
        control,
        register,
        handleSubmit,
        reset,
        setError,
        clearErrors,
        formState: { errors },
    } = useForm({
        defaultValues: {
            entity_id: "",
            instruction_type: "Email",
            description: "",
            emails: [{ value: "" }],
        },
    });

    const instructionType = useWatch({ control, name: "instruction_type" });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "emails",
    });

    useEffect(() => {
        getBillingEntities({ params: { page: 1, limit: 1000 } });
    }, []);

    useEffect(() => {
        return () => clearInstructionDetail();
    }, [clearInstructionDetail]);

    useEffect(() => {
        if (!showModal?.entity_id) {
            clearInstructionDetail();
            reset({
                entity_id: "",
                instruction_type: "Email",
                description: "",
                emails: [{ value: "" }],
            });
            return;
        }
        getInstructionByEntity(showModal.entity_id);
    }, [showModal?.entity_id, getInstructionByEntity, reset, clearInstructionDetail]);

    useEffect(() => {
        if (!isEdit || !instructionDetail) return;
        const type = instructionDetail.instruction_type ?? "Email";
        const rawEmails = instructionDetail.emails;
        const emailList = Array.isArray(rawEmails)
            ? rawEmails.map((e) => ({
                  value: typeof e === "string" ? e : e?.email ?? "",
              }))
            : [];
        reset({
            entity_id: String(instructionDetail.entity_id ?? ""),
            instruction_type: type,
            description: instructionDetail.description ?? "",
            emails: emailList.length > 0 ? emailList : [{ value: "" }],
        });
    }, [instructionDetail, isEdit, reset]);

    const buildAddPayload = (data) => {
        const entity_id = Number(data.entity_id);
        const instruction_type = data.instruction_type;
        if (instruction_type === "Email") {
            const emails = data.emails.map((e) => e.value?.trim()).filter(Boolean);
            return { entity_id, instruction_type, emails };
        }
        return {
            entity_id,
            instruction_type,
            description: (data.description ?? "").trim(),
        };
    };

    const buildUpdatePayload = (data) => {
        const entity_id = Number(data.entity_id);
        const instruction_type = data.instruction_type;
        const emails =
            instruction_type === "Email"
                ? data.emails.map((e) => e.value?.trim()).filter(Boolean)
                : [];
        const description =
            instruction_type === "Email" ? "" : (data.description ?? "").trim();
        const payload = {
            entity_id,
            instruction_type,
            emails,
            description,
        };
        if (instructionDetail?.billing_instruction_id != null) {
            payload.billing_instruction_id = instructionDetail.billing_instruction_id;
        }
        return payload;
    };

    const onSubmit = (data) => {
        clearErrors();

        if (data.instruction_type === "Email") {
            const list = data.emails.map((e) => e.value?.trim()).filter(Boolean);
            if (list.length === 0) {
                showError("Add at least one email");
                return;
            }
            for (let i = 0; i < data.emails.length; i++) {
                const v = data.emails[i]?.value?.trim();
                if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                    setError(`emails.${i}.value`, {
                        type: "pattern",
                        message: "Enter a valid email address",
                    });
                    return;
                }
            }
        } else if (!(data.description ?? "").trim()) {
            showError("Description is required");
            return;
        }

        if (isEdit) {
            updateBillingInstruction({
                formData: buildUpdatePayload(data),
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        } else {
            addBillingInstruction({
                formData: buildAddPayload(data),
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        }
    };

    const renderHeader = () => (
        <h1 className="modal-title">
            {isEdit ? "Edit Billing Instruction" : "Add Billing Instruction"}
        </h1>
    );

    const showEmailFields = instructionType === "Email";
    const showDescription = instructionType === "Client Portal" || instructionType === "Hand Delivery";

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                {isEdit && isLoadingDetail && (
                    <div className="text-center py-4 text-muted">Loading...</div>
                )}
                <form
                    id="billingInstructionForm"
                    onSubmit={handleSubmit(onSubmit)}
                    style={{
                        display: isEdit && isLoadingDetail ? "none" : undefined,
                    }}
                >
                    <div className="mb-lg-3 mb-sm-0 mt-2">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-control form-select ${errors.entity_id ? "is-invalid" : ""}`}
                                disabled={isEdit || billingLoading}
                                {...register("entity_id", {
                                    required: "Billing entity is required",
                                })}
                            >
                                <option value="">
                                    {billingLoading ? "Loading..." : "Select Billing Entity"}
                                </option>
                                {(billingEntities ?? []).map((be) => (
                                    <option key={be.entity_id} value={be.entity_id}>
                                        {be.billing_entity}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Billing Entity <span className="text-danger">*</span>
                            </label>
                            {errors.entity_id && (
                                <span className="error text-danger">{errors.entity_id.message}</span>
                            )}
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-select ${errors.instruction_type ? "is-invalid" : ""}`}
                                {...register("instruction_type", {
                                    required: "Instruction type is required",
                                })}
                            >
                                {INSTRUCTION_TYPES.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Instruction Type <span className="text-danger">*</span>
                            </label>
                            {errors.instruction_type && (
                                <span className="error text-danger">
                                    {errors.instruction_type.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {showEmailFields && (
                        <div className="mt-3">
                            <label className="form-label mb-2">
                                Emails <span className="text-danger">*</span>
                            </label>
                            {fields.map((field, index) => (
                                <div className="row align-items-center mb-2 g-1" key={field.id}>
                                    <div className="col-12">
                                        <div className="form-floating desig-inp position-relative">
                                            <input
                                                type="email"
                                                className={`form-control email-input-no-validation ${errors.emails?.[index]?.value ? "is-invalid" : ""}`}
                                                placeholder="email@example.com"
                                                style={{
                                                    paddingRight:
                                                        index === fields.length - 1 ? "80px" : "45px",
                                                }}
                                                {...register(`emails.${index}.value`)}
                                            />
                                            <label>
                                                Email <span className="text-danger">*</span>
                                            </label>

                                            {index === fields.length - 1 ? (
                                                <>
                                                    {fields.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="email-action-btn email-remove-btn email-remove-btn-last"
                                                            onClick={() => remove(index)}
                                                            title="Remove Email"
                                                        >
                                                            <FiX size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="email-action-btn email-add-btn"
                                                        onClick={() => append({ value: "" })}
                                                        title="Add Email"
                                                    >
                                                        <FiPlus size={18} />
                                                    </button>
                                                </>
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

                                            {errors.emails?.[index]?.value && (
                                                <span className="error text-danger d-block">
                                                    {errors.emails[index].value.message}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showDescription && (
                        <div className="mb-lg-3 mb-sm-0 mt-2">
                            <label className="form-label mb-2">
                                Description <span className="text-danger">*</span>
                            </label>
                            <textarea
                                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                                placeholder="Enter instruction details..."
                                rows={4}
                                {...register("description")}
                            />
                            {errors.description && (
                                <span className="error text-danger">{errors.description.message}</span>
                            )}
                        </div>
                    )}
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
                disabled={isBeingUpdated || (isEdit && isLoadingDetail)}
            >
                Close
            </button>
            <button
                type="submit"
                form="billingInstructionForm"
                className="btn btn-primary"
                disabled={isBeingUpdated || (isEdit && isLoadingDetail)}
            >
                {isBeingUpdated ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="role-modal-sm"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
