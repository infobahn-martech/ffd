import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useThirdPartyServiceReducer from "../../../store/ThirdPartyServiceReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function AddEditThirdPartyServiceModal({ showModal, closeModal, onSuccess }) {
    const { addThirdPartyService, updateThirdPartyService, isBeingUpdated } = useThirdPartyServiceReducer(
        (state) => state
    );

    const isEdit = showModal && typeof showModal === "object" && showModal?.third_party_service_id;
    const thirdPartyServiceId = isEdit ? showModal?.third_party_service_id : null;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: { third_party_service: "" },
    });

    useEffect(() => {
        if (isEdit) {
            reset({ third_party_service: showModal?.third_party_service ?? showModal?.name ?? "" });
        } else {
            reset({ third_party_service: "" });
        }
    }, [showModal, isEdit, reset]);

    const onSubmit = async (data) => {
        const cb = () => {
            closeModal();
            onSuccess?.();
        };

        if (isEdit) {
            await updateThirdPartyService({
                formData: { third_party_service_id: thirdPartyServiceId, third_party_service: data.third_party_service.trim() },
                cb,
            });
        } else {
            await addThirdPartyService({
                formData: { third_party_service: data.third_party_service.trim() },
                cb,
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Third Party Service" : "Add Third Party Service"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="thirdPartyServiceForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.third_party_service ? "is-invalid" : ""}`}
                                placeholder="Third Party Service"
                                {...register("third_party_service", {
                                    required: "Third party service is required",
                                })}
                            />
                            <label>
                                Third Party Service <span className="text-danger">*</span>
                            </label>
                            {errors.third_party_service && (
                                <span className="error text-danger">
                                    {errors.third_party_service.message}
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
            <button type="submit" form="thirdPartyServiceForm" className="btn btn-primary" disabled={isBeingUpdated}>
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
