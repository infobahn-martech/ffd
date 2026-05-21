import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useTaskManagementReducer from "../../../store/TaskManagementReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function TaskManagementModal({ showModal, closeModal, onSuccess }) {
    const { addTaskManagement, updateTaskManagement, isBeingUpdated } = useTaskManagementReducer((state) => state);

    const isEdit = showModal && typeof showModal === "object" && !!(showModal?.task_id ?? showModal?._id);
    const taskManagementId = isEdit ? showModal?.task_id ?? showModal?._id : null;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: { task_name: "" },
    });

    useEffect(() => {
        if (!showModal) return;
        if (isEdit) {
            reset({ task_name: showModal?.task_name ?? showModal?.name ?? "" });
        } else {
            reset({ task_name: "" });
        }
    }, [showModal, isEdit, reset]);

    const onSubmit = async (data) => {
        const trimmed = (data?.task_name || "").trim();
        if (!trimmed) return;

        const cb = () => {
            closeModal();
            onSuccess?.();
        };

        if (isEdit) {
            await updateTaskManagement({
                formData: { task_id: taskManagementId, task_name: trimmed },
                cb,
            });
        } else {
            await addTaskManagement({
                formData: { task_name: trimmed },
                cb,
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Task Management" : "Add Task Management"}
            </h1>
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeModal}
                disabled={isBeingUpdated}
            ></button>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="taskManagementForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="permInputs row mb-lg-3">
                        <div className="col-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.task_name ? "is-invalid" : ""}`}
                                    placeholder="Task Name"
                                    {...register("task_name", { required: "Task Name is required" })}
                                />
                                <label>
                                    Task Name <span className="text-danger">*</span>
                                </label>
                                {errors.task_name && (
                                    <span className="error text-danger">{errors.task_name.message}</span>
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
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={isBeingUpdated}>
                Close
            </button>
            <button type="submit" form="taskManagementForm" className="btn btn-primary" disabled={isBeingUpdated}>
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
