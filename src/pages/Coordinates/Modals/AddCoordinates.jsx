import { useEffect, useMemo, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Select, { components as SelectComponents } from "react-select";
import { FiPlus, FiX, FiCheck } from "react-icons/fi";
import CustomModal from "../../../components/CustomModal";
import useCoordinatesReducer from "../../../store/CoordinatesReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const emptyCoordinateRow = () => ({ value: "" });

/** Form value for types created via “+ Add new” inline UI (not from API list). */
const NEW_COORDINATE_TYPE_VALUE = "__NEW_COORDINATE_TYPE__";

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
    const [newTypeInlineOpen, setNewTypeInlineOpen] = useState(false);
    const [newTypeDraft, setNewTypeDraft] = useState("");
    const [typeMenuIsOpen, setTypeMenuIsOpen] = useState(false);
    const newTypeInputRef = useRef(null);

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
        if (!newTypeInlineOpen) return;
        const id = requestAnimationFrame(() => {
            newTypeInputRef.current?.focus();
        });
        return () => cancelAnimationFrame(id);
    }, [newTypeInlineOpen]);

    useEffect(() => {
        if (!showModal) return;
        setCoordinatesListError("");
        setNewTypeInlineOpen(false);
        setNewTypeDraft("");
        setTypeMenuIsOpen(false);
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
        if (String(coordinateType.value) === NEW_COORDINATE_TYPE_VALUE) {
            const name = (coordinateType.label ?? "").trim();
            if (!name) return null;
            return {
                new_coordinate_type: name,
                coordinates: coordStrings,
            };
        }
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
                            render={({ field }) => {
                                const applyNewTypeFromDraft = () => {
                                    const name = newTypeDraft.trim();
                                    if (!name) return;
                                    field.onChange({
                                        value: NEW_COORDINATE_TYPE_VALUE,
                                        label: name,
                                    });
                                    setNewTypeInlineOpen(false);
                                    setNewTypeDraft("");
                                    setTypeMenuIsOpen(false);
                                };

                                const MenuListWithFooter = (menuProps) => (
                                    <SelectComponents.MenuList {...menuProps}>
                                        {menuProps.children}
                                        {!isEdit && (
                                            <div
                                                className="coordinates-type-select-footer border-top"
                                                style={{
                                                    marginTop: 2,
                                                    padding: "0 2px 4px",
                                                    background: "#fff",
                                                }}
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm text-start w-100 py-2 rounded-0 text-decoration-none coordinates-type-select-footer__add"
                                                    style={{ color: "#0d6efd", fontWeight: 500 }}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => {
                                                        setNewTypeDraft("");
                                                        setNewTypeInlineOpen(true);
                                                        setTypeMenuIsOpen(false);
                                                    }}
                                                >
                                                    + Add new coordinate type
                                                </button>
                                            </div>
                                        )}
                                    </SelectComponents.MenuList>
                                );

                                return (
                                    <>
                                        <Select
                                            inputId="coordinates-type-select"
                                            classNamePrefix="react-select"
                                            className={`form-control form-select react-select-container ${errors.coordinateType ? "is-invalid" : ""
                                                }`}
                                            placeholder="Select coordinate type…"
                                            isClearable
                                            isSearchable
                                            options={typeOptions}
                                            value={field.value}
                                            onChange={(opt) => {
                                                field.onChange(opt);
                                                setNewTypeInlineOpen(false);
                                                setNewTypeDraft("");
                                                setTypeMenuIsOpen(false);
                                            }}
                                            onBlur={field.onBlur}
                                            isDisabled={isBeingUpdated || isEdit}
                                            styles={selectStyles}
                                            components={{ MenuList: MenuListWithFooter }}
                                            menuPortalTarget={
                                                typeof document !== "undefined"
                                                    ? document.body
                                                    : null
                                            }
                                            menuPosition="fixed"
                                            closeMenuOnSelect
                                            menuIsOpen={typeMenuIsOpen}
                                            onMenuOpen={() => setTypeMenuIsOpen(true)}
                                            onMenuClose={() => {
                                                setTypeMenuIsOpen(false);
                                            }}
                                            aria-label="Coordinate type"
                                        />
                                        {newTypeInlineOpen && !isEdit && (
                                            <div
                                                className="coordinates-new-type-inline mt-2 p-2 rounded-2 bg-white"
                                                style={{
                                                    border: "1px solid #0d2772",
                                                    boxShadow: "0 1px 4px rgba(13, 39, 114, 0.12)",
                                                }}
                                            >
                                                <div className="d-flex align-items-stretch gap-2">
                                                    <input
                                                        ref={newTypeInputRef}
                                                        type="text"
                                                        className="form-control form-control-sm flex-grow-1"
                                                        placeholder="Enter new coordinate type…"
                                                        value={newTypeDraft}
                                                        onChange={(e) =>
                                                            setNewTypeDraft(e.target.value)
                                                        }
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                applyNewTypeFromDraft();
                                                            }
                                                            if (e.key === "Escape") {
                                                                e.preventDefault();
                                                                setNewTypeInlineOpen(false);
                                                                setNewTypeDraft("");
                                                            }
                                                        }}
                                                        aria-label="New coordinate type name"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-primary d-flex align-items-center justify-content-center px-2 flex-shrink-0 rounded-2"
                                                        style={{
                                                            minWidth: 40,
                                                            minHeight: 38,
                                                            backgroundColor: "#7c9eff",
                                                            border: "none",
                                                        }}
                                                        title="Save"
                                                        onClick={applyNewTypeFromDraft}
                                                    >
                                                        <FiCheck
                                                            size={18}
                                                            color="#fff"
                                                            aria-hidden
                                                        />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm d-flex align-items-center justify-content-center px-2 flex-shrink-0 rounded-2 border-0"
                                                        style={{
                                                            minWidth: 40,
                                                            minHeight: 38,
                                                            backgroundColor: "#e9ecef",
                                                            color: "#495057",
                                                        }}
                                                        title="Cancel"
                                                        onClick={() => {
                                                            setNewTypeInlineOpen(false);
                                                            setNewTypeDraft("");
                                                        }}
                                                    >
                                                        <FiX size={18} aria-hidden />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            }}
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
                            {/* <span className="text-muted small">
                                One pair per row (lat,lon). Use + to add more.
                            </span> */}
                        </div>
                        <div className="d-flex flex-column gap-2">
                            {fields.map((field, index) => (
                                <div className="d-flex align-items-start gap-2" key={field.id}>
                                    <div className="form-floating desig-inp flex-grow-1">
                                        <input
                                            type="text"
                                            className={`form-control ${errors.coordinateRows?.[index]?.value || coordinatesListError
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
