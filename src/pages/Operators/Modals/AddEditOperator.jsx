import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import CustomModal from "../../../components/CustomModal";
import useOperatorReducer from "../../../store/OperatorReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import { PORT_OPTIONS_WITH_ID } from "../../../constants/ports";

const DEFAULT_PORT_ID = 3;

export function OperatorModal({ showModal, closeModal, onSuccess }) {
    const {
        addOperator,
        updateOperator,
        getOperatorById,
        operatorDetail,
        isBeingUpdated,
        isDetailLoading,
        clearOperatorDetail,
    } = useOperatorReducer((state) => state);

    const isEdit = !!showModal?.operator_id;
    const operatorId = showModal?.operator_id;

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm({
        defaultValues: {
            operator_name: "",
            port_id: DEFAULT_PORT_ID,
            contact_person: "",
            contact_no: "",
            email: "",
            license_no: "",
            license_expiry: "",
            contract_start_date: "",
            contract_expiry_date: "",
            status: "Active",
        },
    });

    useEffect(() => {
        if (isEdit && operatorId) {
            getOperatorById(operatorId);
        } else {
            clearOperatorDetail?.();
            reset({
                operator_name: "",
                port_id: DEFAULT_PORT_ID,
                contact_person: "",
                contact_no: "",
                email: "",
                license_no: "",
                license_expiry: "",
                contract_start_date: "",
                contract_expiry_date: "",
                status: "Active",
            });
        }
    }, [isEdit, operatorId]);

    useEffect(() => {
        if (operatorDetail && isEdit) {
            reset({
                operator_name: operatorDetail?.operator_name ?? "",
                port_id: operatorDetail?.port_id ?? DEFAULT_PORT_ID,
                contact_person: operatorDetail?.contact_person ?? "",
                contact_no: operatorDetail?.contact_no ?? "",
                email: operatorDetail?.email ?? "",
                license_no: operatorDetail?.license_no ?? "",
                license_expiry: operatorDetail?.license_expiry
                    ? operatorDetail.license_expiry.split("T")[0]
                    : "",
                contract_start_date: operatorDetail?.contract_start_date
                    ? operatorDetail.contract_start_date.split("T")[0]
                    : "",
                contract_expiry_date: operatorDetail?.contract_expiry_date
                    ? operatorDetail.contract_expiry_date.split("T")[0]
                    : "",
                status: operatorDetail?.status ?? "Active",
            });
        }
    }, [operatorDetail, isEdit, reset]);

    const onSubmit = (data) => {
        const basePayload = {
            operator_name: data.operator_name,
            port_id: Number(data.port_id) || DEFAULT_PORT_ID,
            contact_person: data.contact_person,
            contact_no: data.contact_no,
            email: data.email?.trim(),
            license_no: data.license_no,
            license_expiry: data.license_expiry,
            contract_start_date: data.contract_start_date,
            contract_expiry_date: data.contract_expiry_date,
        };

        if (isEdit) {
            updateOperator({
                formData: {
                    ...basePayload,
                    operator_id: operatorId,
                    status: data.status,
                },
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        } else {
            addOperator({
                formData: basePayload,
                cb: () => {
                    closeModal(null);
                    onSuccess?.();
                },
            });
        }
    };

    const renderHeader = () => (
        <h1 className="modal-title">
            {isEdit ? "Edit Operator" : "Add Operator"}
        </h1>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="operatorForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* Name + Contact Person */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.operator_name ? "is-invalid" : ""}`}
                                        placeholder="Operator Name"
                                        {...register("operator_name", {
                                            required: "Operator name is required",
                                        })}
                                    />
                                    <label>Operator Name <span className="text-danger">*</span></label>
                                    {errors.operator_name && (
                                        <span className="error text-danger">{errors.operator_name.message}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className={`form-control ${errors.contact_person ? "is-invalid" : ""}`}
                                        placeholder="Contact Person"
                                        {...register("contact_person", {
                                            required: "Contact person is required",
                                        })}
                                    />
                                    <label>Contact Person <span className="text-danger">*</span></label>
                                    {errors.contact_person && (
                                        <span className="error text-danger">{errors.contact_person.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Email + Contact No */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                                        placeholder="Email"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Enter a valid email",
                                            },
                                        })}
                                    />
                                    <label>Email <span className="text-danger">*</span></label>
                                    {errors.email && (
                                        <span className="error text-danger">{errors.email.message}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-6 col-sm-12">
                                <div className="phone-wrapper">
                                    <label className="phone-label">Contact No <span className="text-danger">*</span></label>
                                    <Controller
                                        name="contact_no"
                                        control={control}
                                        rules={{
                                            required: "Contact no is required",
                                            validate: (value) => {
                                                const digits = (value || "").replace(/\D/g, "");
                                                return digits.length >= 7 || "Enter a valid phone number";
                                            },
                                        }}
                                        render={({ field }) => (
                                            <PhoneInput
                                                {...field}
                                                country="sa"
                                                enableSearch
                                                inputClass="phone-input"
                                                buttonClass="phone-flag"
                                            />
                                        )}
                                    />
                                    {errors.contact_no && (
                                        <span className="error text-danger">{errors.contact_no.message}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Port + License No */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <select
                                        className={`form-control ${errors.port_id ? "is-invalid" : ""}`}
                                        {...register("port_id", { required: "Port is required" })}
                                    >
                                        {PORT_OPTIONS_WITH_ID.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label>Port <span className="text-danger">*</span></label>
                                    {errors.port_id && (
                                        <span className="error text-danger">{errors.port_id.message}</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="License No"
                                        {...register("license_no")}
                                    />
                                    <label>License No</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* License Expiry + Status (edit only) */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="License Expiry"
                                        {...register("license_expiry")}
                                    />
                                    <label>License Expiry</label>
                                </div>
                            </div>
                            {isEdit && (
                                <div className="col-lg-6 col-sm-12">
                                    <div className="form-floating desig-inp">
                                        <select className="form-control" {...register("status")}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                        <label>Status</label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contract Start + Contract Expiry */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="permInputs row">
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Contract Start"
                                        {...register("contract_start_date")}
                                    />
                                    <label>Contract Start Date</label>
                                </div>
                            </div>
                            <div className="col-lg-6 col-sm-12">
                                <div className="form-floating desig-inp">
                                    <input
                                        type="date"
                                        className="form-control"
                                        placeholder="Contract Expiry"
                                        {...register("contract_expiry_date")}
                                    />
                                    <label>Contract Expiry Date</label>
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
                form="operatorForm"
                className="btn btn-primary"
                disabled={isBeingUpdated || (isEdit && isDetailLoading)}
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
