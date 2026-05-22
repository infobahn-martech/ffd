import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import PremiumSelect from "../../../components/form/PremiumSelect";
import useTaskManagementReducer from "../../../store/TaskManagementReducer";
import usePortReducer from "../../../store/PortReducer";
import useCommonReducer from "../../../store/CommonReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

const resolvePortId = (row, ports) => {
    if (row?.port_id != null && String(row.port_id) !== "") {
        return String(row.port_id);
    }
    const label = row?.port;
    if (!label || !Array.isArray(ports)) return "";
    const match = ports.find(
        (p) => String(p?.port ?? p?.name ?? p?.port_name ?? "") === String(label)
    );
    const id = match?.port_id ?? match?._id ?? match?.id;
    return id != null ? String(id) : "";
};

const resolveCallTypeId = (row, callTypes) => {
    if (row?.call_type_id != null && String(row.call_type_id) !== "") {
        return String(row.call_type_id);
    }
    const label = row?.call_type ?? row?.callType;
    if (!label || !Array.isArray(callTypes)) return "";
    const match = callTypes.find(
        (ct) => String(ct?.call_type ?? ct?.callType ?? "") === String(label)
    );
    const id = match?.call_type_id;
    return id != null ? String(id) : "";
};

export function TaskManagementModal({ showModal, closeModal, onSuccess }) {
    const { addTaskManagement, updateTaskManagement, isBeingUpdated } = useTaskManagementReducer(
        (state) => state
    );
    const { ports, getPorts } = usePortReducer((state) => state);
    const { callTypes, getCallTypes } = useCommonReducer((state) => state);

    const isEdit = showModal && typeof showModal === "object" && !!(showModal?.task_id ?? showModal?._id);
    const taskManagementId = isEdit ? showModal?.task_id ?? showModal?._id : null;

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            task_name: "",
            port_id: "",
            call_type_id: "",
        },
    });

    useEffect(() => {
        getPorts({ params: { limit: 1000 } });
        getCallTypes();
    }, [getPorts, getCallTypes]);

    useEffect(() => {
        if (!showModal) return;
        if (isEdit) {
            reset({
                task_name: showModal?.task_name ?? showModal?.name ?? "",
                port_id: resolvePortId(showModal, ports),
                call_type_id: resolveCallTypeId(showModal, callTypes),
            });
        } else {
            reset({ task_name: "", port_id: "", call_type_id: "" });
        }
    }, [showModal, isEdit, reset, ports, callTypes]);

    const portSelectOptions = useMemo(() => {
        const rows = (ports ?? []).map((p) => {
            const id = String(p?.port_id ?? p?._id ?? p?.id ?? "");
            return {
                value: id,
                label: String(p?.port ?? p?.name ?? p?.port_name ?? id),
            };
        });
        const portId = resolvePortId(showModal, ports);
        if (
            isEdit &&
            portId &&
            !rows.some((r) => r.value === portId)
        ) {
            rows.unshift({
                value: portId,
                label: String(showModal?.port ?? showModal?.port_name ?? `Port ${portId}`),
            });
        }
        return rows;
    }, [ports, isEdit, showModal]);

    const callTypeSelectOptions = useMemo(() => {
        const rows = (callTypes ?? []).map((ct) => ({
            value: String(ct?.call_type_id ?? ""),
            label: String(ct?.call_type ?? ct?.callType ?? ""),
        }));
        const callTypeId = resolveCallTypeId(showModal, callTypes);
        if (
            isEdit &&
            callTypeId &&
            !rows.some((r) => r.value === callTypeId)
        ) {
            rows.unshift({
                value: callTypeId,
                label: String(
                    showModal?.call_type ?? showModal?.callType ?? `Call Type ${callTypeId}`
                ),
            });
        }
        return rows;
    }, [callTypes, isEdit, showModal]);

    const onSubmit = async (data) => {
        const trimmed = (data?.task_name || "").trim();
        if (!trimmed) return;

        const payload = {
            task_name: trimmed,
            port_id: data.port_id ? Number(data.port_id) : undefined,
            call_type_id: data.call_type_id ? Number(data.call_type_id) : undefined,
        };

        const cb = () => {
            closeModal();
            onSuccess?.();
        };

        if (isEdit) {
            await updateTaskManagement({
                formData: { task_id: taskManagementId, ...payload },
                cb,
            });
        } else {
            await addTaskManagement({ formData: payload, cb });
        }
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Task Management" : "Add Task Management"}
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
                <form id="taskManagementForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="permInputs row mb-lg-3">
                        <div className="col-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.task_name ? "is-invalid" : ""}`}
                                    placeholder="Task Name"
                                    {...register("task_name", { required: "Task Name is required" })}
                                />
                                <label>
                                    Task Name <span className="text-danger">*</span>
                                </label>
                                {errors.task_name && (
                                    <span className="error text-danger">{errors.task_name.message}</span>
                                )}
                            </div>
                        </div>
                        <div className="col-12 mb-3">
                            <div className="phone-wrapper">
                                <label className="phone-label">
                                    Call type <span className="text-danger">*</span>
                                </label>
                                <Controller
                                    name="call_type_id"
                                    control={control}
                                    rules={{ required: "Call type is required" }}
                                    render={({ field }) => (
                                        <PremiumSelect
                                            value={field.value != null ? String(field.value) : ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            options={callTypeSelectOptions}
                                            placeholder="Select call type"
                                            searchPlaceholder="Search call type..."
                                            disabled={isBeingUpdated}
                                            hasError={Boolean(errors.call_type_id)}
                                        />
                                    )}
                                />
                                {errors.call_type_id && (
                                    <span className="error text-danger">
                                        {errors.call_type_id.message}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="col-12 mb-3">
                            <div className="phone-wrapper">
                                <label className="phone-label">
                                    Port <span className="text-danger">*</span>
                                </label>
                                <Controller
                                    name="port_id"
                                    control={control}
                                    rules={{ required: "Port is required" }}
                                    render={({ field }) => (
                                        <PremiumSelect
                                            value={field.value != null ? String(field.value) : ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            options={portSelectOptions}
                                            placeholder="Select port"
                                            searchPlaceholder="Search port..."
                                            disabled={isBeingUpdated}
                                            hasError={Boolean(errors.port_id)}
                                        />
                                    )}
                                />
                                {errors.port_id && (
                                    <span className="error text-danger">{errors.port_id.message}</span>
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
            <button type="submit" form="taskManagementForm" className="btn btn-primary" disabled={isBeingUpdated}>
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
