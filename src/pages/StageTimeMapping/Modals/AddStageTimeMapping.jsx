import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import useStageTimeMappingReducer from "../../../store/StageTimeMappingReducer";
import usePortReducer from "../../../store/PortReducer";
import useCommonReducer from "../../../store/CommonReducer";
import stageTimeMappingService from "../../../services/stageTimeMappingService";
import timeObjectService from "../../../services/timeObjectService";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const TIMEOBJECT_MASTER_LIMIT = 500;

export function StageTimeMappingModal({ showModal, closeModal, onSuccess }) {
    const { mapTimeObjectsToStage, isBeingUpdated } = useStageTimeMappingReducer((state) => state);
    const { ports, getPorts } = usePortReducer((state) => state);
    const { callTypes, getCallTypes } = useCommonReducer((state) => state);

    const [callStages, setCallStages] = useState([]);
    const [timeObjectMaster, setTimeObjectMaster] = useState([]);
    const [timeSelections, setTimeSelections] = useState({});

    const isEditMode =
        showModal &&
        typeof showModal === "object" &&
        !Array.isArray(showModal) &&
        (showModal.stage_id !== undefined && showModal.stage_id !== null && showModal.stage_id !== "");

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            stage_id: "",
            port_id: "",
            call_type_id: "",
        },
    });

    useEffect(() => {
        if (!showModal) return;
        getPorts({ params: { limit: 1000 } });
        getCallTypes();
        (async () => {
            try {
                const { data } = await stageTimeMappingService.getCallStages();
                const rows = data?.data ?? data;
                setCallStages(Array.isArray(rows) ? rows : []);
            } catch {
                setCallStages([]);
            }
        })();
        (async () => {
            try {
                const { data } = await timeObjectService.getAllTimeObjects({
                    params: { page: 1, limit: TIMEOBJECT_MASTER_LIMIT, sortBy: "time_object" },
                });
                const raw =
                    data?.data ??
                    data?.time_objects ??
                    data?.time_object ??
                    data?.results ??
                    [];
                setTimeObjectMaster(Array.isArray(raw) ? raw : []);
            } catch {
                setTimeObjectMaster([]);
            }
        })();
    }, [showModal, getPorts, getCallTypes]);

    useEffect(() => {
        if (!showModal) return;
        if (isEditMode) {
            reset({
                stage_id: String(showModal.stage_id ?? ""),
                port_id: String(showModal.port_id ?? ""),
                call_type_id: String(showModal.call_type_id ?? ""),
            });
            const init = {};
            (showModal.time_objects || []).forEach((t, idx) => {
                const id = String(t.time_object_id);
                init[id] = {
                    checked: true,
                    sort_order: Number(t.sort_order) || idx + 1,
                    is_required:
                        String(t.is_required) === "1" ||
                        t.is_required === 1 ||
                        t.is_required === true,
                };
            });
            setTimeSelections(init);
        } else {
            reset({ stage_id: "", port_id: "", call_type_id: "" });
            setTimeSelections({});
        }
    }, [showModal, isEditMode, reset]);

    const toggleTimeObject = (timeObjectId) => {
        const key = String(timeObjectId);
        setTimeSelections((prev) => {
            if (prev[key]?.checked) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            const orders = Object.values(prev)
                .filter((v) => v.checked)
                .map((v) => Number(v.sort_order) || 0);
            const nextOrder = orders.length ? Math.max(...orders) + 1 : 1;
            return {
                ...prev,
                [key]: {
                    checked: true,
                    sort_order: nextOrder,
                    is_required: true,
                },
            };
        });
    };

    const updateSelection = (timeObjectId, patch) => {
        const key = String(timeObjectId);
        setTimeSelections((prev) => {
            if (!prev[key]?.checked) return prev;
            return {
                ...prev,
                [key]: { ...prev[key], ...patch },
            };
        });
    };

    const buildPayload = (data) => {
        const time_objects = Object.entries(timeSelections)
            .filter(([, v]) => v.checked)
            .map(([id, v]) => ({
                time_object_id: Number(id),
                sort_order: Number(v.sort_order) || 1,
                is_required: v.is_required ? 1 : 0,
            }))
            .sort((a, b) => a.sort_order - b.sort_order);

        return {
            stage_id: Number(data.stage_id),
            port_id: Number(data.port_id),
            call_type_id: Number(data.call_type_id),
            time_objects,
        };
    };

    const onSubmit = async (data) => {
        const payload = buildPayload(data);
        await mapTimeObjectsToStage({
            payload,
            cb: () => {
                closeModal();
                onSuccess?.();
            },
        });
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEditMode ? "Edit Stage Time Mapping" : "Add Stage Time Mapping"}
            </h1>
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeModal}
                disabled={isBeingUpdated}
            ></button>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="stageTimeMappingForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="permInputs row mb-lg-3">
                        <div className="col-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-control form-select ${errors.stage_id ? "is-invalid" : ""}`}
                                    {...register("stage_id", { required: "Call stage is required" })}
                                >
                                    <option value="">Select call stage</option>
                                    {(callStages ?? []).map((s) => {
                                        const id = s?.stage_id ?? s?._id ?? s?.id;
                                        return (
                                            <option key={id} value={String(id)}>
                                                {s?.stage_name ?? s?.name ?? String(id)}
                                            </option>
                                        );
                                    })}
                                </select>
                                <label>
                                    Call stage <span className="text-danger">*</span>
                                </label>
                                {errors.stage_id && (
                                    <span className="error text-danger">{errors.stage_id.message}</span>
                                )}
                            </div>
                        </div>
                        <div className="col-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-control form-select ${errors.port_id ? "is-invalid" : ""}`}
                                    {...register("port_id", { required: "Port is required" })}
                                >
                                    <option value="">Select port</option>
                                    {(ports ?? []).map((p) => {
                                        const id = p?.port_id ?? p?._id ?? p?.id;
                                        const label = p?.port ?? p?.name ?? p?.port_name ?? String(id);
                                        return (
                                            <option key={id} value={String(id)}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                                <label>
                                    Port <span className="text-danger">*</span>
                                </label>
                                {errors.port_id && (
                                    <span className="error text-danger">{errors.port_id.message}</span>
                                )}
                            </div>
                        </div>
                        <div className="col-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-control form-select ${errors.call_type_id ? "is-invalid" : ""}`}
                                    {...register("call_type_id", { required: "Call type is required" })}
                                >
                                    <option value="">Select call type</option>
                                    {(callTypes ?? []).map((ct) => (
                                        <option key={ct?.call_type_id} value={String(ct?.call_type_id)}>
                                            {ct?.call_type ?? ct?.callType ?? ""}
                                        </option>
                                    ))}
                                </select>
                                <label>
                                    Call type <span className="text-danger">*</span>
                                </label>
                                {errors.call_type_id && (
                                    <span className="error text-danger">{errors.call_type_id.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-12 mb-2">
                            <label className="form-label mb-2">Time objects</label>
                            <p className="text-muted small mb-2">
                                Select time objects, set display order and whether each is required. Submitting with
                                none cleared removes all mappings for this stage, port, and call type.
                            </p>
                            <div
                                className="border rounded p-2"
                                style={{ maxHeight: 280, overflowY: "auto" }}
                            >
                                {!timeObjectMaster.length ? (
                                    <span className="text-muted small">No time objects loaded.</span>
                                ) : (
                                    timeObjectMaster.map((row) => {
                                        const id = row?.time_object_id ?? row?._id ?? row?.id;
                                        const key = String(id);
                                        const label = row?.time_object ?? row?.name ?? key;
                                        const sel = timeSelections[key];
                                        const checked = !!sel?.checked;
                                        return (
                                            <div
                                                key={key}
                                                className="d-flex align-items-center flex-wrap gap-2 py-2 border-bottom"
                                            >
                                                <div className="form-check mb-0 flex-grow-1" style={{ minWidth: 200 }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id={`to-${key}`}
                                                        checked={checked}
                                                        onChange={() => toggleTimeObject(id)}
                                                    />
                                                    <label className="form-check-label" htmlFor={`to-${key}`}>
                                                        {label}
                                                    </label>
                                                </div>
                                                {checked && (
                                                    <>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <label className="small text-muted mb-0">Order</label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                className="form-control form-control-sm"
                                                                style={{ width: 72 }}
                                                                value={sel.sort_order ?? ""}
                                                                onChange={(e) =>
                                                                    updateSelection(id, {
                                                                        sort_order:
                                                                            e.target.value === ""
                                                                                ? 1
                                                                                : Number(e.target.value),
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                        <div className="form-check mb-0">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input"
                                                                id={`req-${key}`}
                                                                checked={!!sel.is_required}
                                                                onChange={(e) =>
                                                                    updateSelection(id, {
                                                                        is_required: e.target.checked,
                                                                    })
                                                                }
                                                            />
                                                            <label className="form-check-label small" htmlFor={`req-${key}`}>
                                                                Required
                                                            </label>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
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
            <button type="submit" form="stageTimeMappingForm" className="btn btn-primary" disabled={isBeingUpdated}>
                {isBeingUpdated ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="role-modal-sm"
            dialgName="modal-dialog modal-dialog-centered modal-lg"
            show={!!showModal}
            closeModal={() => closeModal()}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
