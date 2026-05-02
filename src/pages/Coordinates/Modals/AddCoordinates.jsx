import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { FiPlus, FiX } from "react-icons/fi";
import CustomModal from "../../../components/CustomModal";
import useCoordinatesReducer from "../../../store/CoordinatesReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const emptyCoordinateRow = () => ({ value: "" });

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: 48,
        borderRadius: 8,
        boxShadow: "none",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    placeholder: (base) => ({
        ...base,
        color: "#9ca3af",
        fontSize: "0.9rem",
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor:
            state.isFocused || state.isSelected ? "#00368c" : base.backgroundColor,
        color: state.isFocused || state.isSelected ? "#fff" : base.color,
        fontWeight: state.isSelected ? 500 : base.fontWeight,
    }),
};

export function CoordinatesModal({ showModal, closeModal, onSuccess }) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setError,
    } = useForm({
        defaultValues: {
            coordinateType: null,
            coordinateRows: [emptyCoordinateRow()],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "coordinateRows",
    });

    const {
        addCoordinates,
        updateCoordinates,
        isBeingUpdated,
        coordinateTypes,
        getCoordinateTypes,
    } = useCoordinatesReducer((state) => state);

    const [coordinatesListError, setCoordinatesListError] = useState("");

    const isEdit =
        showModal &&
        typeof showModal === "object" &&
        !Array.isArray(showModal) &&
        (showModal.coordinate_type_id != null ||
            showModal.coordinates_id != null ||
            showModal._id != null);

    const typeOptions = useMemo(
        () =>
            (coordinateTypes ?? []).map((t) => ({
                value: String(t.coordinate_type_id ?? t.id ?? ""),
                label: t.coordinate_type ?? t.name ?? String(t.coordinate_type_id),
            })),
        [coordinateTypes],
    );

    const rowTypeKey = isEdit
        ? String(
              showModal?.coordinate_type_id ??
                  showModal?.coordinates_id ??
                  showModal?._id ??
                  "",
          )
        : "";

    useEffect(() => {
        getCoordinateTypes?.();
    }, [getCoordinateTypes]);

    useEffect(() => {
        if (!showModal) return;
        setCoordinatesListError("");
        if (isEdit) {
            const coords = showModal?.coordinates;
            const list = Array.isArray(coords)
                ? coords
                : coords
                  ? [String(coords)]
                  : [];
            reset({
                coordinateType: {
                    value: String(showModal?.coordinate_type_id ?? ""),
                    label:
                        showModal?.coordinate_type ??
                        `Type ${showModal?.coordinate_type_id ?? ""}`,
                },
                coordinateRows:
                    list.length > 0 ? list.map((c) => ({ value: String(c) })) : [emptyCoordinateRow()],
            });
        } else {
            reset({
                coordinateType: null,
                coordinateRows: [emptyCoordinateRow()],
            });
        }
    }, [showModal, isEdit, rowTypeKey, reset]);

    const buildSavePayload = (coordinateType, coordStrings) => {
        if (!coordinateType?.value && !coordinateType?.label) return null;
        const byId = (coordinateTypes ?? []).find(
            (t) => String(t.coordinate_type_id ?? t.id) === String(coordinateType.value),
        );
        if (byId) {
            return {
                coordinate_type_id: Number(byId.coordinate_type_id ?? byId.id),
                coordinates: coordStrings,
            };
        }
        const name = (coordinateType.label ?? coordinateType.value ?? "").trim();
        if (!name) return null;
        return {
            new_coordinate_type: name,
            coordinates: coordStrings,
        };
    };

    const onSubmit = async (data) => {
        setCoordinatesListError("");
        const coordStrings = (data.coordinateRows ?? [])
            .map((r) => r.value?.trim())
            .filter(Boolean);
        if (coordStrings.length === 0) {
            setCoordinatesListError("Add at least one coordinate (e.g. 25.5222,52.7677)");
            return;
        }

        const cb = () => {
            closeModal();
            onSuccess?.();
        };

        if (isEdit) {
            const typeId = Number(
                showModal?.coordinate_type_id ??
                    showModal?.coordinates_id ??
                    showModal?._id,
            );
            await updateCoordinates({
                formData: {
                    coordinate_type_id: typeId,
                    coordinates: coordStrings,
                    ...(showModal?.coordinates_id != null
                        ? { coordinates_id: showModal.coordinates_id }
                        : {}),
                },
                cb,
            });
        } else {
            const payload = buildSavePayload(data.coordinateType, coordStrings);
            if (!payload) {
                setError("coordinateType", {
                    type: "manual",
                    message: "Select or create a coordinate type",
                });
                return;
            }
            await addCoordinates({ formData: payload, cb });
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
                        <label className="form-label" htmlFor="coordinates-type-select">
                            Coordinate type <span className="text-danger">*</span>
                        </label>
                        <Controller
                            name="coordinateType"
                            control={control}
                            rules={{
                                validate: (v) =>
                                    isEdit ||
                                    (v && (v.value != null || v.label)) ||
                                    "Coordinate type is required",
                            }}
                            render={({ field }) => (
                                <CreatableSelect
                                    inputId="coordinates-type-select"
                                    classNamePrefix="react-select"
                                    className={`form-control form-select react-select-container ${
                                        errors.coordinateType ? "is-invalid" : ""
                                    }`}
                                    placeholder="Select a type or type a new name…"
                                    isClearable
                                    options={typeOptions}
                                    value={field.value}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                    isDisabled={isBeingUpdated || isEdit}
                                    isValidNewOption={() => !isEdit}
                                    formatCreateLabel={(input) => `Add new type: "${input}"`}
                                    styles={selectStyles}
                                    menuPortalTarget={
                                        typeof document !== "undefined" ? document.body : null
                                    }
                                    menuPosition="fixed"
                                    aria-label="Coordinate type"
                                />
                            )}
                        />
                        {errors.coordinateType && (
                            <span className="error text-danger d-block mt-1 small">
                                {errors.coordinateType.message}
                            </span>
                        )}
                    </div>

                    <div className="mt-2">
                        <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
                            <span className="form-label mb-0">
                                Coordinates <span className="text-danger">*</span>
                            </span>
                            <span className="text-muted small">
                                One pair per row (lat,lon). Use + to add more.
                            </span>
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {fields.map((field, index) => (
                                <div className="d-flex align-items-start gap-2" key={field.id}>
                                    <div className="form-floating desig-inp flex-grow-1">
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                errors.coordinateRows?.[index]?.value || coordinatesListError
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="e.g. 25.5222,52.7677"
                                            disabled={isBeingUpdated}
                                            {...register(`coordinateRows.${index}.value`, {
                                                maxLength: {
                                                    value: 120,
                                                    message: "Too long",
                                                },
                                            })}
                                        />
                                        <label>Latitude, longitude</label>
                                    </div>
                                    <div className="d-flex align-items-center gap-1 pt-2 flex-shrink-0">
                                        {fields.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => remove(index)}
                                                disabled={isBeingUpdated}
                                                title="Remove row"
                                                aria-label="Remove coordinate row"
                                            >
                                                <FiX size={18} />
                                            </button>
                                        )}
                                        {index === fields.length - 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => append(emptyCoordinateRow())}
                                                disabled={isBeingUpdated}
                                                title="Add coordinate"
                                                aria-label="Add coordinate row"
                                            >
                                                <FiPlus size={18} aria-hidden />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {coordinatesListError && (
                            <span className="error text-danger d-block mt-2 small">
                                {coordinatesListError}
                            </span>
                        )}
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
                form="coordinatesForm"
                className="btn btn-primary"
                disabled={isBeingUpdated}
            >
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
