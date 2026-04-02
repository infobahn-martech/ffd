import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import Select from "react-select";
import CustomModal from "../../../components/CustomModal";
import useHospitalReducer from "../../../store/HospitalReducer";
import hospitalService from "../../../services/hospitalService";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import "../../../design/scss/operations.scss";
import "./hospital-service-modal.scss";

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
};

export function HospitalServiceModal({ showModal, closeModal, onSuccess }) {
    const { addUpdateHospitalService, getServicesByHospital, isBeingUpdated } = useHospitalReducer(
        (state) => state,
    );

    const isEdit =
        showModal && typeof showModal === "object" && !!(showModal.hospital_id ?? showModal.hospital_service_id);

    const [hospitalOptions, setHospitalOptions] = useState([]);
    const [serviceOptions, setServiceOptions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: {
            hospital_id: null,
            service_ids: [],
            remarks: "",
        },
    });

    const selectedServiceIds = useWatch({ control, name: "service_ids", defaultValue: [] });
    const selectedCount = useMemo(
        () => (Array.isArray(selectedServiceIds) ? selectedServiceIds.length : 0),
        [selectedServiceIds],
    );

    useEffect(() => {
        if (!showModal) return;
        let cancelled = false;
        setLoadingOptions(true);
        (async () => {
            try {
                const [hRes, sRes] = await Promise.all([
                    hospitalService.getHospitalData({
                        params: { page: 1, limit: 1000, searchTerm: "" },
                    }),
                    hospitalService.getMedicalServiceData({
                        params: { page: 1, limit: 1000, searchTerm: "" },
                    }),
                ]);
                if (cancelled) return;
                const hRaw = hRes.data?.data ?? hRes.data?.hospitals ?? [];
                const sRaw = sRes.data?.data ?? sRes.data?.medical_services ?? [];
                setHospitalOptions(
                    (Array.isArray(hRaw) ? hRaw : []).map((h) => {
                        const id = h.hospital_id ?? h._id;
                        return {
                            value: id != null ? Number(id) : id,
                            label: h.hospital_name ?? String(id ?? ""),
                        };
                    }),
                );
                setServiceOptions(
                    (Array.isArray(sRaw) ? sRaw : []).map((s) => ({
                        value: Number(s.service_id ?? s._id),
                        label: s.service_name ?? String(s.service_id ?? ""),
                    })),
                );
            } finally {
                if (!cancelled) setLoadingOptions(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [showModal]);

    useEffect(() => {
        if (!showModal) return;
        if (showModal === true) {
            reset({ hospital_id: null, service_ids: [], remarks: "" });
            return;
        }
        if (typeof showModal === "object") {
            const hid = showModal.hospital_id;
            reset({
                hospital_id: hid != null ? Number(hid) : null,
                service_ids: (showModal.services || [])
                    .map((s) => Number(s.service_id))
                    .filter((id) => !Number.isNaN(id)),
                remarks: showModal.remarks ?? "",
            });
        }
    }, [showModal, reset]);

    useEffect(() => {
        if (!isEdit || typeof showModal !== "object") return;
        const hid = showModal.hospital_id;
        if (!hid) return;
        let cancelled = false;
        (async () => {
            const detail = await getServicesByHospital(hid);
            if (cancelled || !detail) return;
            const ids = (detail.services || [])
                .map((s) => Number(s.service_id))
                .filter((id) => !Number.isNaN(id));
            const fallbackIds = (showModal.services || [])
                .map((s) => Number(s.service_id))
                .filter((id) => !Number.isNaN(id));
            const resolvedHid = detail.hospital_id ?? hid;
            reset({
                hospital_id: resolvedHid != null ? Number(resolvedHid) : null,
                service_ids: ids.length ? ids : fallbackIds,
                remarks: detail.remarks ?? showModal.remarks ?? "",
            });
        })();
        return () => {
            cancelled = true;
        };
    }, [isEdit, showModal, getServicesByHospital, reset]);

    const onSubmit = (data) => {
        const hospitalId = data.hospital_id;
        if (hospitalId == null) return;

        const payload = {
            hospital_id: hospitalId,
            service_ids: Array.isArray(data.service_ids) ? data.service_ids.map(Number) : [],
            remarks: (data.remarks || "").trim(),
        };

        addUpdateHospitalService({
            formData: payload,
            cb: () => {
                closeModal(null);
                onSuccess?.();
            },
        });
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {isEdit ? "Edit Hospital Services" : "Add Hospital Services"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="hospitalServiceForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="hospital-service-modal__field">
                        <label className="form-label" htmlFor="hospital-service-hospital">
                            Hospital <span className="text-danger">*</span>
                        </label>
                        <Controller
                            name="hospital_id"
                            control={control}
                            rules={{ required: "Hospital is required" }}
                            render={({ field }) => (
                                <Select
                                    inputId="hospital-service-hospital"
                                    classNamePrefix="react-select"
                                    className={`react-select-container ${errors.hospital_id ? "is-invalid" : ""
                                        }`}
                                    placeholder={loadingOptions ? "Loading…" : "Select a hospital"}
                                    isDisabled={loadingOptions || isBeingUpdated}
                                    isClearable
                                    options={hospitalOptions}
                                    value={
                                        hospitalOptions.find((o) => o.value === field.value) ?? null
                                    }
                                    onChange={(opt) => field.onChange(opt?.value ?? null)}
                                    styles={selectStyles}
                                    menuPortalTarget={
                                        typeof document !== "undefined" ? document.body : null
                                    }
                                    menuPosition="fixed"
                                    aria-label="Hospital"
                                />
                            )}
                        />
                        {errors.hospital_id && (
                            <span className="error text-danger d-block mt-1 small">
                                {errors.hospital_id.message}
                            </span>
                        )}
                    </div>

                    <div className="hospital-service-modal__field">
                        <label className="form-label" htmlFor="hospital-service-services">
                            <span>Services</span>
                            <span className="text-danger">*</span>
                            {selectedCount > 0 && (
                                <span className="hospital-service-modal__count">
                                    {selectedCount} selected
                                </span>
                            )}
                        </label>
                        <Controller
                            name="service_ids"
                            control={control}
                            rules={{
                                validate: (v) =>
                                    (Array.isArray(v) && v.length > 0) ||
                                    "Select at least one service",
                            }}
                            render={({ field }) => (
                                <Select
                                    inputId="hospital-service-services"
                                    isMulti
                                    classNamePrefix="react-select"
                                    className={`crew-multi-select react-select-container ${errors.service_ids ? "is-invalid" : ""
                                        }`}
                                    placeholder={
                                        loadingOptions
                                            ? "Loading…"
                                            : ""
                                    }
                                    isDisabled={loadingOptions || isBeingUpdated}
                                    options={serviceOptions}
                                    value={serviceOptions.filter((o) =>
                                        (field.value || []).includes(o.value),
                                    )}
                                    onChange={(opts) =>
                                        field.onChange(opts?.map((o) => o.value) ?? [])
                                    }
                                    styles={selectStyles}
                                    menuPortalTarget={
                                        typeof document !== "undefined" ? document.body : null
                                    }
                                    menuPosition="fixed"
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    aria-label="Services"
                                />
                            )}
                        />
                        {errors.service_ids && (
                            <span className="error text-danger d-block mt-1 small">
                                {errors.service_ids.message}
                            </span>
                        )}
                    </div>

                    <div className="hospital-service-modal__field">
                        <label className="form-label" htmlFor="hospital-service-remarks">
                            Remarks
                        </label>
                        <textarea
                            id="hospital-service-remarks"
                            className={`form-control hospital-service-modal__textarea ${errors.remarks ? "is-invalid" : ""
                                }`}
                            {...register("remarks")}
                        />
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
                Cancel
            </button>

            <button
                type="submit"
                form="hospitalServiceForm"
                className="btn btn-primary"
                disabled={isBeingUpdated || loadingOptions}
            >
                {isBeingUpdated ? "Saving…" : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="user-modal-sm hospital-service-modal"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
