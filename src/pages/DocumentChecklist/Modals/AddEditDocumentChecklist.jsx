import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import CommonSelect from "../../../components/CommonSelect";
import useDocumentChecklistReducer from "../../../store/DocumentChecklistReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/document-checklist-modal.scss";

export function DocumentChecklistModal({ showModal, closeModal, onSuccess }) {
    const {
        getChecklistOptions,
        roleOptions,
        documentOptions,
        saveDocumentChecklist,
        isBeingUpdated,
    } = useDocumentChecklistReducer((s) => s);

    const isEdit = showModal && typeof showModal === "object" && !!showModal?.role_id;

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            role_id: "",
            document_ids: [],
        },
    });

    useEffect(() => {
        getChecklistOptions();
    }, [getChecklistOptions]);

    useEffect(() => {
        if (!showModal) return;
        if (isEdit) {
            reset({
                role_id: String(showModal?.role_id ?? ""),
                document_ids: (showModal?.documents || []).map((doc) =>
                    String(doc?.document_id),
                ),
            });
            return;
        }
        reset({ role_id: "", document_ids: [] });
    }, [showModal, isEdit, reset]);

    const onSubmit = async (data) => {
        await saveDocumentChecklist({
            formData: {
                role_id: Number(data?.role_id),
                document_ids: (data?.document_ids || []).map((id) => Number(id)),
            },
            cb: () => {
                closeModal();
                onSuccess?.();
            },
        });
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Document Checklist" : "Add Document Checklist"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="documentChecklistForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-select ${errors.role_id ? "is-invalid" : ""}`}
                                {...register("role_id", {
                                    required: "Role is required",
                                })}
                                disabled={isBeingUpdated}
                            >
                                <option value="">Select Role</option>
                                {roleOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Select Role <span className="text-danger">*</span>
                            </label>
                            {errors.role_id && (
                                <span className="error text-danger">
                                    {errors.role_id.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="desig-inp document-checklist-select-wrap">
                            <label className="mb-2 d-block">
                                Select Document <span className="text-danger">*</span>
                            </label>
                            <Controller
                                name="document_ids"
                                control={control}
                                rules={{
                                    validate: (value) =>
                                        (Array.isArray(value) && value.length > 0) ||
                                        "At least one document is required",
                                }}
                                render={({ field }) => {
                                    const selectedDocumentOptions = documentOptions.filter((option) =>
                                        (field.value || []).map(String).includes(String(option.value)),
                                    );

                                    return (
                                        <CommonSelect
                                            isMulti
                                            options={documentOptions}
                                            value={selectedDocumentOptions}
                                            onChange={(selected) => {
                                                const values = Array.isArray(selected)
                                                    ? selected.map((item) => String(item.value))
                                                    : [];
                                                field.onChange(values);
                                            }}
                                            placeholder="Select Document(s)"
                                            className={`document-checklist-select ${errors.document_ids ? "is-invalid" : ""}`}
                                            classNamePrefix="react-select"
                                            isDisabled={isBeingUpdated}
                                            menuPosition="fixed"
                                            maxheight={220}
                                        />
                                    );
                                }}
                            />
                            {errors.document_ids && (
                                <span className="error text-danger">
                                    {errors.document_ids.message}
                                </span>
                            )}
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
            <button
                type="submit"
                form="documentChecklistForm"
                className="btn btn-primary"
                disabled={isBeingUpdated}
            >
                {isBeingUpdated ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="role-modal-sm document-checklist-modal"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
