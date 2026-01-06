import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function PackingTypeModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: showModal?._id
            ? {
                packingTypeName: showModal?.name
            }
            : {}
    });

    const onSubmit = (data) => {
        console.log("PACKING TYPE FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Packing Type" : "Add Packing Type"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="packingTypeForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.packingTypeName ? "is-invalid" : ""
                                    }`}
                                placeholder="Packing Type Name"
                                {...register("packingTypeName", {
                                    required: "Packing type name is required"
                                })}
                            />
                            <label>
                                Packing Type <span className="text-danger">*</span>
                            </label>

                            {errors.packingTypeName && (
                                <span className="error text-danger">
                                    {errors.packingTypeName.message}
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
            <button type="submit" form="packingTypeForm" className="btn btn-primary">
                Save
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
