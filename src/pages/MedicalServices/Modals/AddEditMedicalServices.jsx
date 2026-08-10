import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useHospitalReducer from "../../../store/HospitalReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function MedicalServiceModal({ showModal, closeModal, onSuccess }) {
    const { addMedicalService, updateMedicalService, getMedicalServiceDetail, isBeingUpdated } =
        useHospitalReducer((state) => state);

    const serviceId =
        showModal && typeof showModal === "object"
            ? showModal.service_id ?? showModal._id
            : null;
    const isEdit = !!serviceId;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: isEdit
            ? {
                service_code: showModal?.service_code ?? "",
                service_name: showModal?.service_name ?? "",
                description: showModal?.description ?? "",
            }
            : {
                service_code: "",
                service_name: "",
                description: "",
            },
    });

    useEffect(() => {
        if (!isEdit || !serviceId) return;
        let cancelled = false;
        (async () => {
            const detail = await getMedicalServiceDetail(serviceId);
            if (cancelled || !detail) return;
            reset({
                service_code: detail.service_code ?? "",
                service_name: detail.service_name ?? "",
                description: detail.description ?? "",
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [isEdit, serviceId, getMedicalServiceDetail, reset]);

    const onSubmit = (data) => {
        const payload = {
            service_code: data.service_code.trim(),
            service_name: data.service_name.trim(),
            description: data.description.trim(),
        };

        if (isEdit) {
            updateMedicalService({
                formData: { ...payload, service_id: serviceId },
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        } else {
            addMedicalService({
                formData: payload,
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">{isEdit ? "Edit Medical Service" : "Add Medical Service"}</h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="medicalServiceForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-field">
                                    <div className="form-floating desig-inp">
                                        <input
                                            type="text"
                                            className={`form-control ${errors.service_code ? "is-invalid" : ""}`}
                                            placeholder="Service Code"
                                            {...register("service_code", {
                                                required: "Service code is required",
                                                minLength: {
                                                    value: 2,
                                                    message: "Service code must be at least 2 characters",
                                                },
                                            })}
                                        />
                                        <label>
                                            Service Code <span className="text-danger">*</span>
                                        </label>
                                    </div>
                                    {errors.service_code && (
                                        <span className="field-error">
                                            {errors.service_code.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="col-lg-6 col-sm-12">
                                <div className="form-field">
                                    <div className="form-floating desig-inp">
                                        <input
                                            type="text"
                                            className={`form-control ${errors.service_name ? "is-invalid" : ""}`}
                                            placeholder="Service Name"
                                            {...register("service_name", {
                                                required: "Service name is required",
                                                minLength: {
                                                    value: 2,
                                                    message: "Service name must be at least 2 characters",
                                                },
                                            })}
                                        />
                                        <label>
                                            Service Name <span className="text-danger">*</span>
                                        </label>
                                    </div>
                                    {errors.service_name && (
                                        <span className="field-error">
                                            {errors.service_name.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-12">
                                <div className="form-field">
                                    <div className="form-floating desig-inp">
                                        <textarea
                                            className={`form-control ${errors.description ? "is-invalid" : ""}`}
                                            placeholder="Description"
                                            style={{ minHeight: "80px" }}
                                            {...register("description", {
                                                required: "Description is required",
                                                minLength: {
                                                    value: 3,
                                                    message: "Description must be at least 3 characters",
                                                },
                                            })}
                                        />
                                        <label>
                                            Description <span className="text-danger">*</span>
                                        </label>
                                    </div>
                                    {errors.description && (
                                        <span className="field-error">{errors.description.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>
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
                onClick={closeModal}
                disabled={isBeingUpdated}
            >
                Close
            </button>

            <button
                type="submit"
                form="medicalServiceForm"
                className="btn btn-primary"
                disabled={isBeingUpdated}
            >
                {isBeingUpdated ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="user-modal-sm"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
