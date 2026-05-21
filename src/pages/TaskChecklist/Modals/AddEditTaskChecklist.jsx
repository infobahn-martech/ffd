import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import CommonSelect from "../../../components/CommonSelect";
import PremiumSelect from "../../../components/form/PremiumSelect";
import useTaskChecklistReducer from "../../../store/TaskChecklistReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/document-checklist-modal.scss";

export function TaskChecklistModal({ showModal, closeModal, onSuccess }) {
    const {
        getTaskChecklistOptions,
        roleOptions,
        taskOptions,
        saveTaskChecklist,
        isBeingUpdated,
    } = useTaskChecklistReducer((s) => s);

    const isEdit = showModal && typeof showModal === "object" && !!showModal?.role_id;

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            role_id: "",
            task_ids: [],
        },
    });

    useEffect(() => {
        getTaskChecklistOptions();
    }, [getTaskChecklistOptions]);

    useEffect(() => {
        if (!showModal) return;
        if (isEdit) {
            reset({
                role_id: String(showModal?.role_id ?? ""),
                task_ids: (showModal?.tasks || []).map((task) =>
                    String(task?.task_id),
                ),
            });
            return;
        }
        reset({ role_id: "", task_ids: [] });
    }, [showModal, isEdit, reset]);

    const onSubmit = async (data) => {
        await saveTaskChecklist({
            formData: {
                role_id: Number(data?.role_id),
                task_ids: (data?.task_ids || []).map((id) => Number(id)),
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
                {isEdit ? "Edit Task Checklist" : "Add Task Checklist"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="taskChecklistForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="phone-wrapper">
                            <label className="phone-label">
                                Select Role <span className="text-danger">*</span>
                            </label>
                            <Controller
                                name="role_id"
                                control={control}
                                rules={{ required: "Role is required" }}
                                render={({ field }) => (
                                    <PremiumSelect
                                        value={field.value != null ? String(field.value) : ""}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        options={roleOptions.map((option) => ({
                                            value: String(option.value),
                                            label: String(option.label ?? ""),
                                        }))}
                                        placeholder="Select Role"
                                        searchPlaceholder="Search role..."
                                        disabled={isBeingUpdated}
                                        hasError={Boolean(errors.role_id)}
                                    />
                                )}
                            />
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
                                Select Task <span className="text-danger">*</span>
                            </label>
                            <Controller
                                name="task_ids"
                                control={control}
                                rules={{
                                    validate: (value) =>
                                        (Array.isArray(value) && value.length > 0) ||
                                        "At least one task is required",
                                }}
                                render={({ field }) => {
                                    const selectedTaskOptions = taskOptions.filter((option) =>
                                        (field.value || []).map(String).includes(String(option.value)),
                                    );

                                    return (
                                        <CommonSelect
                                            isMulti
                                            options={taskOptions}
                                            value={selectedTaskOptions}
                                            onChange={(selected) => {
                                                const values = Array.isArray(selected)
                                                    ? selected.map((item) => String(item.value))
                                                    : [];
                                                field.onChange(values);
                                            }}
                                            placeholder="Select Task(s)"
                                            className={`document-checklist-select ${errors.task_ids ? "is-invalid" : ""}`}
                                            classNamePrefix="react-select"
                                            isDisabled={isBeingUpdated}
                                            menuPosition="fixed"
                                            maxheight={220}
                                        />
                                    );
                                }}
                            />
                            {errors.task_ids && (
                                <span className="error text-danger">
                                    {errors.task_ids.message}
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
                form="taskChecklistForm"
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
