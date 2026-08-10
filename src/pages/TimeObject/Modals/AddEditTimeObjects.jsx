import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useTimeObjectReducer from "../../../store/TimeObjectReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function TimeObjectModal({ showModal, closeModal, onSuccess }) {
    const { addTimeObject, updateTimeObject, isBeingUpdated } = useTimeObjectReducer((state) => state);

    const isEdit = showModal && typeof showModal === "object" && !!(showModal?.time_object_id ?? showModal?._id);
    const timeObjectId = isEdit ? showModal?.time_object_id ?? showModal?._id : null;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: { name: "" },
    });

    useEffect(() => {
        if (!showModal) return;
        if (isEdit) {
            reset({ name: showModal?.time_object ?? showModal?.name ?? "" });
        } else {
            reset({ name: "" });
        }
    }, [showModal, isEdit, reset]);

    const onSubmit = async (data) => {
        const trimmed = (data?.name || "").trim();
        if (!trimmed) return;

        const cb = () => {
            closeModal();
            onSuccess?.();
        };

        if (isEdit) {
            await updateTimeObject({
                formData: { time_object_id: timeObjectId, time_object: trimmed },
                cb,
            });
        } else {
            await addTimeObject({
                formData: { time_object: trimmed },
                cb,
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Time Object" : "Add Time Object"}
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
                <form id="timeObjectForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="permInputs row mb-lg-3">
                        <div className="col-12 mb-3">
                            <div className="form-field">
                                <div className="form-floating desig-inp">
                                    <input
                                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                        placeholder="Name"
                                        {...register("name", { required: "Name is required" })}
                                    />
                                    <label>
                                        Name <span className="text-danger">*</span>
                                    </label>
                                </div>
                                {errors.name && (
                                    <span className="field-error">{errors.name.message}</span>
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
            <button type="submit" form="timeObjectForm" className="btn btn-primary" disabled={isBeingUpdated}>
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
