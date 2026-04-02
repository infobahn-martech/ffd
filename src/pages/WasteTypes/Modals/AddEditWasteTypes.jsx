import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useWasteTypeReducer from "../../../store/WasteTypeReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function WasteTypeModal({ showModal, closeModal, onSuccess }) {
    const { addWasteType, updateWasteType, isBeingUpdated } = useWasteTypeReducer((state) => state);

    const isEdit = showModal && typeof showModal === "object" && !!(showModal?.waste_type_id ?? showModal?._id);
    const wasteTypeId = isEdit ? showModal?.waste_type_id ?? showModal?._id : null;

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
            reset({ name: showModal?.waste_type ?? showModal?.name ?? "" });
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
            await updateWasteType({
                formData: { waste_type_id: wasteTypeId, waste_type: trimmed },
                cb,
            });
        } else {
            await addWasteType({
                formData: { waste_type: trimmed },
                cb,
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Waste Type" : "Add Waste Type"}
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
                <form id="wasteTypeForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="permInputs row mb-lg-3">
                        <div className="col-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                    placeholder="Name"
                                    {...register("name", { required: "Name is required" })}
                                />
                                <label>
                                    Name <span className="text-danger">*</span>
                                </label>
                                {errors.name && (
                                    <span className="error text-danger">{errors.name.message}</span>
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
            <button type="submit" form="wasteTypeForm" className="btn btn-primary" disabled={isBeingUpdated}>
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
