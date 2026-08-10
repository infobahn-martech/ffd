import { useForm, Controller } from "react-hook-form";
import PremiumSelect from "../../../components/form/PremiumSelect";
import CustomModal from "../../../components/CustomModal";
import useLogisticsWarehouseReducer from "../../../store/LogisticsWarehouseReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/master-modal-form.scss";

const LOCATION_TYPE_OPTIONS = [
    { value: "material_transport", label: "Material Transport" },
    { value: "warehouse", label: "Warehouse" },
];

export function LogisticsWarehouseModal({ showModal, closeModal, onSuccess }) {
    const addLogisticsWarehouse = useLogisticsWarehouseReducer((s) => s.addLogisticsWarehouse);
    const updateLogisticsWarehouse = useLogisticsWarehouseReducer((s) => s.updateLogisticsWarehouse);
    const isBeingUpdated = useLogisticsWarehouseReducer((s) => s.isBeingUpdated);

    const isEdit = !!showModal?.location_id;

    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: isEdit
            ? {
                location: showModal?.location || "",
                location_type: showModal?.location_type || "",
            }
            : {
                location: "",
                location_type: "",
            }
    });

    const onSubmit = async (data) => {
        if (isEdit) {
            await updateLogisticsWarehouse({
                formData: {
                    location_id: showModal.location_id,
                    location: data.location,
                    location_type: data.location_type,
                },
                cb: () => {
                    closeModal();
                    onSuccess?.();
                },
            });
        } else {
            await addLogisticsWarehouse({
                formData: {
                    location: data.location,
                    location_type: data.location_type,
                },
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
                {isEdit ? "Edit Logistics Warehouse" : "Add Logistics Warehouse"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="logisticsWarehouseForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* LOCATION */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-field">
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
                            </div>
                            {errors.location && (
                                <span className="field-error">
                                    {errors.location.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* LOCATION TYPE */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-field">
                            <div className="phone-wrapper">
                                <label className="phone-label">
                                    Location Type <span className="text-danger">*</span>
                                </label>
                                <Controller
                                    name="location_type"
                                    control={control}
                                    rules={{ required: "Location type is required" }}
                                    render={({ field }) => (
                                        <PremiumSelect
                                            value={field.value != null ? String(field.value) : ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            options={LOCATION_TYPE_OPTIONS}
                                            placeholder="Select Location Type"
                                            searchPlaceholder="Search location type..."
                                            hasError={Boolean(errors.location_type)}
                                            menuClassName="user-modal-premium-select-menu"
                                        />
                                    )}
                                />
                            </div>
                            {errors.location_type && (
                                <span className="field-error">
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
            <button
                type="submit"
                form="logisticsWarehouseForm"
                className="btn btn-primary"
                disabled={isBeingUpdated}
            >
                {isBeingUpdated ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="role-modal-sm master-modal-form"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
