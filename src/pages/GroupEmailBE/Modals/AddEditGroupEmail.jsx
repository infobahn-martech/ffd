import { useForm, useFieldArray, Controller } from "react-hook-form";
import { FiPlus, FiX } from "react-icons/fi";
import CustomModal from "../../../components/CustomModal";
import useGroupEmailBEReducer from "../../../store/GroupEmailBEReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function GroupEmailBEModal({ showModal, closeModal, onSuccess }) {
    const { addGroupEmailBE, updateGroupEmailBE, isBeingUpdated } =
        useGroupEmailBEReducer((state) => state);

    const isEdit = !!showModal?.entity_id;

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: isEdit
            ? {
                emails:
                    showModal?.emails?.length > 0
                        ? showModal.emails.map((e) => ({
                            email_id: e.email_id,
                            value: e.email,
                            is_active: e.is_active ?? true,
                        }))
                        : [{ email_id: "", value: "", is_active: true }],
            }
            : {
                emails: [{ email_id: "", value: "", is_active: true }],
            },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "emails",
    });

    const onSubmit = (data) => {
        if (isEdit) {
            const payload = {
                entity_id: showModal.entity_id,
                emails: data.emails.map((e) => ({
                    email_id: e.email_id,
                    email: e.value?.trim(),
                    is_active: e.is_active,
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
                entity_id: showModal?.entity_id,
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
                <form id="groupEmailForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* EMAIL LIST */}
                    <div className="mt-3">
                        {fields.map((field, index) => (
                            <div className="row align-items-center mb-2" key={field.id}>
                                <div className={isEdit ? "col-9 col-md-10" : "col-12"}>
                                    <div className="form-floating desig-inp position-relative">
                                        <input
                                            type="email"
                                            className={`form-control email-input-no-validation ${errors.emails?.[index]?.value ? "is-invalid" : ""
                                                }`}
                                            placeholder="email@example.com"
                                            style={{
                                                paddingRight:
                                                    !isEdit && index === fields.length - 1
                                                        ? "80px"
                                                        : "45px",
                                            }}
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

                                        {/* Add / Remove buttons — only shown outside edit mode */}
                                        {!isEdit && (
                                            <>
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
                                                            onClick={() =>
                                                                append({ email_id: "", value: "", is_active: true })
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
                                                )}
                                            </>
                                        )}

                                        {errors.emails?.[index]?.value && (
                                            <span className="error text-danger">
                                                {errors.emails[index].value.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Active checkbox — only shown in edit mode */}
                                {isEdit && (
                                    <div className="col-3 col-md-2 d-flex align-items-center justify-content-center">
                                        <Controller
                                            control={control}
                                            name={`emails.${index}.is_active`}
                                            render={({ field: { value, onChange } }) => (
                                                <div className="form-check d-flex flex-column align-items-center gap-1 mb-0">
                                                    <input
                                                        type="checkbox"
                                                        id={`active-${field.id}`}
                                                        className="form-check-input"
                                                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                                                        checked={!!value}
                                                        onChange={(e) => onChange(e.target.checked)}
                                                    />
                                                    <label
                                                        htmlFor={`active-${field.id}`}
                                                        className="form-check-label"
                                                        style={{ fontSize: "11px", cursor: "pointer" }}
                                                    >
                                                        Active
                                                    </label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                )}
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
                disabled={isBeingUpdated}
            >
                Close
            </button>
            <button
                type="submit"
                form="groupEmailForm"
                className="btn btn-primary"
                disabled={isBeingUpdated}
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
