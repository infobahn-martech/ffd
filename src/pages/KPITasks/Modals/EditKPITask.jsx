import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useKPITasksReducer from "../../../store/KPITasksReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const TIME_TYPES = {
    DURATION: "DURATION",
    FIXED_TIME: "FIXED_TIME",
    BEFORE_EVENT: "BEFORE_EVENT",
};

const normalizeTimeType = (v) => {
    if (v == null || v === "") return TIME_TYPES.DURATION;
    return String(v).toUpperCase();
};

export function EditKPITaskModal({ showModal, closeModal, onSuccess }) {
    const { updateKpiPointTime, isBeingUpdated } = useKPITasksReducer((state) => state);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            time_type: TIME_TYPES.DURATION,
            points: "",
            minutes: "",
            time: "",
            hours: "",
        },
    });

    const timeType = watch("time_type");

    useEffect(() => {
        if (!showModal) return;
        reset({
            time_type: normalizeTimeType(showModal.time_type),
            points: showModal.points ?? "",
            minutes: showModal.time_duration ?? "",
            time: showModal.time ?? "",
            hours: showModal.hours ?? "",
        });
    }, [showModal, reset]);

    const onSubmit = async (data) => {
        const tt = normalizeTimeType(data.time_type);
        const payload = {
            kpi_id: String(showModal.kpi_id),
            time_type: tt,
            points: String(data.points).trim(),
        };

        if (tt === TIME_TYPES.DURATION) {
            payload.minutes = Number(data.minutes);
        } else if (tt === TIME_TYPES.FIXED_TIME) {
            payload.time = data.time;
        } else if (tt === TIME_TYPES.BEFORE_EVENT) {
            payload.hours = Number(data.hours);
        }

        await updateKpiPointTime({
            payload,
            cb: () => {
                closeModal();
                onSuccess?.();
            },
        });
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">Edit KPI task</h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="kpiTaskEditForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label text-muted small">Task name</label>
                        <div className="form-control-plaintext">{showModal?.task_name ?? "—"}</div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-muted small">User role</label>
                        <div className="form-control-plaintext">{showModal?.role ?? "—"}</div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className={`form-select ${errors.time_type ? "is-invalid" : ""}`}
                                {...register("time_type", { required: true })}
                            >
                                <option value={TIME_TYPES.DURATION}>Duration (minutes)</option>
                                <option value={TIME_TYPES.FIXED_TIME}>Fixed time</option>
                                <option value={TIME_TYPES.BEFORE_EVENT}>Before event (hours)</option>
                            </select>
                            <label>
                                Time type <span className="text-danger">*</span>
                            </label>
                        </div>
                    </div>

                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.points ? "is-invalid" : ""}`}
                                placeholder="Points"
                                type="number"
                                min="0"
                                step="1"
                                {...register("points", { required: "Points are required" })}
                            />
                            <label>
                                Points <span className="text-danger">*</span>
                            </label>
                            {errors.points && (
                                <span className="error text-danger">{errors.points.message}</span>
                            )}
                        </div>
                    </div>

                    {timeType === TIME_TYPES.DURATION && (
                        <div className="mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.minutes ? "is-invalid" : ""}`}
                                    placeholder="Minutes"
                                    type="number"
                                    min="0"
                                    step="1"
                                    {...register("minutes", {
                                        required: "Minutes are required",
                                        validate: (v) => {
                                            const n = Number(v);
                                            return (!Number.isNaN(n) && n >= 0) || "Enter a valid number";
                                        },
                                    })}
                                />
                                <label>
                                    Minutes <span className="text-danger">*</span>
                                </label>
                                {errors.minutes && (
                                    <span className="error text-danger">{errors.minutes.message}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {timeType === TIME_TYPES.FIXED_TIME && (
                        <div className="mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.time ? "is-invalid" : ""}`}
                                    type="time"
                                    {...register("time", { required: "Time is required" })}
                                />
                                <label>
                                    Time <span className="text-danger">*</span>
                                </label>
                                {errors.time && (
                                    <span className="error text-danger">{errors.time.message}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {timeType === TIME_TYPES.BEFORE_EVENT && (
                        <div className="mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.hours ? "is-invalid" : ""}`}
                                    placeholder="Hours"
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    {...register("hours", {
                                        required: "Hours are required",
                                        validate: (v) => {
                                            const n = Number(v);
                                            return (!Number.isNaN(n) && n >= 0) || "Enter a valid number";
                                        },
                                    })}
                                />
                                <label>
                                    Hours before event <span className="text-danger">*</span>
                                </label>
                                {errors.hours && (
                                    <span className="error text-danger">{errors.hours.message}</span>
                                )}
                            </div>
                        </div>
                    )}
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
                form="kpiTaskEditForm"
                className="btn btn-primary"
                disabled={isBeingUpdated}
            >
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
