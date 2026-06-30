import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import PremiumSelect from "../../../components/form/PremiumSelect";
import { FiPlus, FiX } from "react-icons/fi";
import CustomModal from "../../../components/CustomModal";
import useGroupEmailBEReducer from "../../../store/GroupEmailBEReducer";
import useBillingEntityReducer from "../../../store/BillingEntityReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function GroupEmailBEModal({ showModal, closeModal, onSuccess }) {
    const {
        addGroupEmailBE,
        updateGroupEmailBE,
        isBeingUpdated,
        getGroupEmailBEByEntity,
        groupEmailBEDetail,
        isLoadingDetail,
        clearGroupEmailBEDetail,
    } = useGroupEmailBEReducer((state) => state);

    const { getBillingEntities, billingEntities, isLoading: billingLoading } =
        useBillingEntityReducer((state) => state);

    const isEdit = !!showModal?.entity_id;

    useEffect(() => {
        getBillingEntities({ params: { page: 1, limit: 1000 } });
    }, []);

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            entity_id: "",
            emails: [{ value: "", email_id: "" }],
        },
    });

    useEffect(() => {
        return () => clearGroupEmailBEDetail();
    }, [clearGroupEmailBEDetail]);

    useEffect(() => {
        if (!showModal?.entity_id) {
            clearGroupEmailBEDetail();
            reset({
                entity_id: "",
                emails: [{ value: "", email_id: "" }],
            });
            return;
        }
        getGroupEmailBEByEntity(showModal.entity_id);
    }, [showModal?.entity_id, getGroupEmailBEByEntity, reset, clearGroupEmailBEDetail]);

    useEffect(() => {
        if (!isEdit || !groupEmailBEDetail) return;
        const rawEmails = groupEmailBEDetail.emails;
        const emailList = Array.isArray(rawEmails)
            ? rawEmails.map((e) => {
                if (typeof e === "string") {
                    return { value: e, email_id: "" };
                }
                const id = e?.email_id ?? e?.id;
                return {
                    value: e?.email ?? "",
                    email_id: id != null && id !== "" ? id : "",
                };
            })
            : [];
        reset({
            entity_id: String(groupEmailBEDetail.entity_id ?? ""),
            emails: emailList.length > 0 ? emailList : [{ value: "", email_id: "" }],
        });
    }, [groupEmailBEDetail, isEdit, reset]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: "emails",
    });

    const normalizeEmailIdForPayload = (rawId) => {
        if (rawId === "" || rawId == null || rawId === undefined) return "";
        const n = Number(rawId);
        return Number.isFinite(n) ? n : rawId;
    };

    const onSubmit = (data) => {
        if (isEdit) {
            const payload = {
                entity_id: Number(data.entity_id) || data.entity_id,
                emails: data.emails
                    .filter((e) => e.value?.trim())
                    .map((e) => ({
                        email_id: normalizeEmailIdForPayload(e.email_id),
                        email: e.value.trim(),
                    })),
            };
            updateGroupEmailBE({
                formData: payload,
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        } else {
            const payload = {
                entity_id: data.entity_id,
                emails: data.emails.map((e) => e.value?.trim()).filter(Boolean),
            };
            addGroupEmailBE({
                formData: payload,
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        }
    };

    const renderHeader = () => (
        <h1 className="modal-title">
            {isEdit ? "Edit Group Email" : "Add Group Email"}
        </h1>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                {isEdit && isLoadingDetail && (
                    <div className="text-center py-4 text-muted">Loading...</div>
                )}
                <form
                    id="groupEmailForm"
                    onSubmit={handleSubmit(onSubmit)}
                    style={{
                        display: isEdit && isLoadingDetail ? "none" : undefined,
                    }}
                >
                    {/* BILLING ENTITY SELECT */}
                    <div className="mb-lg-3 mb-sm-0 mt-2">
                        <div className="phone-wrapper">
                            <label className="phone-label">
                                Billing Entity <span className="text-danger">*</span>
                            </label>
                            {isEdit ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    value={showModal?.billing_entity ?? ""}
                                    disabled
                                    readOnly
                                />
                            ) : (
                                <Controller
                                    name="entity_id"
                                    control={control}
                                    rules={{ required: "Billing entity is required" }}
                                    render={({ field }) => (
                                        <PremiumSelect
                                            value={field.value != null ? String(field.value) : ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            options={(billingEntities ?? []).map((be) => ({
                                                value: String(be.entity_id ?? ""),
                                                label: String(be.billing_entity ?? ""),
                                            }))}
                                            placeholder={
                                                billingLoading ? "Loading..." : "Select Billing Entity"
                                            }
                                            searchPlaceholder="Search billing entity..."
                                            hasError={Boolean(errors.entity_id)}
                                        />
                                    )}
                                />
                            )}
                            {errors.entity_id && (
                                <span className="error text-danger">
                                    {errors.entity_id.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* EMAIL LIST */}
                    <div className="mt-3">
                        {fields.map((field, index) => (
                            <div className="row align-items-center mb-2 g-1" key={field.id}>
                                <div className="col-12">
                                    <div className="form-floating desig-inp position-relative">
                                        <input
                                            type="hidden"
                                            {...register(`emails.${index}.email_id`)}
                                        />
                                        <input
                                            type="email"
                                            className={`form-control email-input-no-validation ${errors.emails?.[index]?.value ? "is-invalid" : ""
                                                }`}
                                            placeholder="email@example.com"
                                            disabled={isEdit}
                                            {...register(`emails.${index}.value`, {
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

                                        {!isEdit && (index === fields.length - 1 ? (
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
                                                    onClick={() =>
                                                        append({
                                                            value: "",
                                                            email_id: "",
                                                        })
                                                    }
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
                                        ))}

                                        {errors.emails?.[index]?.value && (
                                            <span className="error text-danger">
                                                {errors.emails[index].value.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
                disabled={isBeingUpdated || (isEdit && isLoadingDetail)}
            >
                Close
            </button>
            <button
                type="submit"
                form="groupEmailForm"
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
