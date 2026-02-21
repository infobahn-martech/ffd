import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useMaterialTypeReducer from "../../../store/MaterialTypeReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function MaterialTypeModal({ showModal, closeModal, onSuccess }) {
    const { addMaterialType, updateMaterialType, isBeingUpdated } = useMaterialTypeReducer(
        (state) => state
    );

    const isEdit = showModal && typeof showModal === "object" && showModal._id;
    const materialTypeId = isEdit ? showModal._id : null;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: { material_type: "" },
    });

    useEffect(() => {
        if (isEdit) {
            reset({ material_type: showModal?.material_type ?? showModal?.name ?? "" });
        } else {
            reset({ material_type: "" });
        }
    }, [showModal, isEdit, reset]);

    const onSubmit = async (data) => {
        const cb = () => {
            closeModal();
            onSuccess?.();
        };

        if (isEdit) {
            await updateMaterialType({
                formData: { material_type_id: materialTypeId, material_type: data.material_type.trim() },
                cb,
            });
        } else {
            await addMaterialType({
                formData: { material_type: data.material_type.trim() },
                cb,
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Material Type" : "Add Material Type"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="materialTypeForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.material_type ? "is-invalid" : ""}`}
                                placeholder="Material Type"
                                {...register("material_type", {
                                    required: "Material type is required",
                                })}
                            />
                            <label>
                                Material Type <span className="text-danger">*</span>
                            </label>
                            {errors.material_type && (
                                <span className="error text-danger">
                                    {errors.material_type.message}
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
            <button type="button" className="btn btn-outline" onClick={closeModal} disabled={isBeingUpdated}>
                Close
            </button>
            <button type="submit" form="materialTypeForm" className="btn btn-primary" disabled={isBeingUpdated}>
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
