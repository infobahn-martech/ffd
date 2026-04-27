import { useForm } from "react-hook-form";
import { useEffect } from "react";
import CustomModal from "../../../components/CustomModal";
import useCoordinatesReducer from "../../../store/CoordinatesReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function CoordinatesModal({ showModal, closeModal, onSuccess }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            coordinate_type_id: "",
            coordinates: "",
        },
    });

    const {
        addCoordinates,
        updateCoordinates,
        isBeingUpdated,
        coordinateTypes,
        getCoordinateTypes,
    } = useCoordinatesReducer((state) => state);

    const isEdit =
        showModal &&
        typeof showModal === "object" &&
        (showModal.coordinates_id ?? showModal._id);
    const coordinatesId = isEdit ? (showModal.coordinates_id ?? showModal._id) : null;

    useEffect(() => {
        getCoordinateTypes?.();
    }, [getCoordinateTypes]);

    useEffect(() => {
        if (isEdit) {
            reset({
                coordinate_type_id: String(showModal?.coordinate_type_id ?? ""),
                coordinates: showModal?.coordinates ?? "",
            });
        } else {
            reset({
                coordinate_type_id: "",
                coordinates: "",
            });
        }
    }, [showModal, isEdit, reset]);

    const onSubmit = async (data) => {
        const formData = {
            coordinate_type_id: Number(data.coordinate_type_id),
            coordinates: data.coordinates?.trim() ?? "",
        };

        const cb = () => {
            closeModal();
            onSuccess?.();
        };

        if (isEdit) {
            await updateCoordinates({
                formData: { coordinates_id: coordinatesId, ...formData },
                cb,
            });
        } else {
            await addCoordinates({ formData, cb });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Coordinates" : "Add Coordinates"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="coordinatesForm" onSubmit={handleSubmit(onSubmit)}>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-select ${errors.coordinate_type_id ? "is-invalid" : ""
                                    }`}
                                {...register("coordinate_type_id", {
                                    required: "Coordinate type is required",
                                })}
                            >
                                <option value="">Select Coordinate Type</option>
                                {coordinateTypes?.map((option) => (
                                    <option
                                        key={option.coordinate_type_id}
                                        value={option.coordinate_type_id}
                                    >
                                        {option.coordinate_type}
                                    </option>
                                ))}
                            </select>
                            <label>
                                Coordinate Type <span className="text-danger">*</span>
                            </label>
                            {errors.coordinate_type_id && (
                                <span className="error text-danger">
                                    {errors.coordinate_type_id.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.coordinates ? "is-invalid" : ""
                                    }`}
                                placeholder="Coordinates"
                                {...register("coordinates", {
                                    required: "Coordinates is required",
                                })}
                            />
                            <label>
                                Coordinates <span className="text-danger">*</span>
                            </label>
                            {errors.coordinates && (
                                <span className="error text-danger">
                                    {errors.coordinates.message}
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
            <button type="submit" form="coordinatesForm" className="btn btn-primary" disabled={isBeingUpdated}>
                {isBeingUpdated ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="fade role-modal-sm modal show"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
