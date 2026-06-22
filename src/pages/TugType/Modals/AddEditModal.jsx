import { useForm } from "react-hook-form";
import { useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useTugTypeReducer from "../../../store/TugTypeReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function TugTypeModal({ showModal, closeModal, onSuccess }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({ defaultValues: { name: "" } });

    const { createTugType, updateTugType, getTugTypeById, addEditLoader } =
        useTugTypeReducer((state) => state);

    const isEdit =
        showModal &&
        typeof showModal === "object" &&
        (showModal.tug_type_id ?? showModal._id);
    const tugTypeId = isEdit ? (showModal.tug_type_id ?? showModal._id) : null;

    useEffect(() => {
        if (isEdit) {
            reset({ name: showModal?.tug_type ?? showModal?.name ?? "" });
            getTugTypeById({
                tug_type_id: tugTypeId,
                cb: (details) => {
                    if (details) {
                        reset({ name: details?.tug_type ?? details?.name ?? "" });
                    }
                },
            });
        } else {
            reset({ name: "" });
        }
    }, [showModal, isEdit, tugTypeId, reset, getTugTypeById]);

    const onSubmit = async (data) => {
        const tug_type = data.name?.trim() ?? "";
        if (isEdit) {
            await updateTugType({
                tug_type_id: tugTypeId,
                tug_type,
                cb: () => {
                    closeModal();
                    onSuccess?.();
                },
            });
        } else {
            await createTugType({
                tug_type,
                cb: () => {
                    closeModal();
                    onSuccess?.();
                },
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Tug Type" : "Add Tug Type"}
            </h1>
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeModal}
            ></button>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="tugTypeForm" onSubmit={handleSubmit(onSubmit)}>
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
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={addEditLoader}>
                Close
            </button>
            <button
                type="submit"
                form="tugTypeForm"
                className="btn btn-primary"
                disabled={addEditLoader}
            >
                {addEditLoader ? "Saving..." : "Save"}
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
