import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const LOCATION_TYPE_OPTIONS = [
    { value: "material_transport", label: "Material Transport" },
    { value: "warehouse", label: "Warehouse" },
];

export function LogisticsWarehouseModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: showModal?._id
            ? {
                location: showModal?.location || "",
                location_type: showModal?.location_type || "",
            }
            : {
                location: "",
                location_type: "",
            }
    });

    const onSubmit = (data) => {
        console.log("LOGISTICS WAREHOUSE FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Logistics Warehouse" : "Add Logistics Warehouse"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="logisticsWarehouseForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* LOCATION */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                type="text"
                                className={`form-control ${errors.location ? "is-invalid" : ""
                                    }`}
                                placeholder="Location"
                                {...register("location", {
                                    required: "Location is required"
                                })}
                            />
                            <label>
                                Location <span className="text-danger">*</span>
                            </label>
                            {errors.location && (
                                <span className="error text-danger">
                                    {errors.location.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* LOCATION TYPE */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-select ${errors.location_type ? "is-invalid" : ""
                                    }`}
                                {...register("location_type", {
                                    required: "Location type is required"
                                })}
                            >
                                <option value="">Select Location Type</option>
                                {LOCATION_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Location Type <span className="text-danger">*</span>
                            </label>
                            {errors.location_type && (
                                <span className="error text-danger">
                                    {errors.location_type.message}
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
            <button type="submit" form="logisticsWarehouseForm" className="btn btn-primary">
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
