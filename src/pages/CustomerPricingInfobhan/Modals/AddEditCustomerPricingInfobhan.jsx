import { useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import PremiumSelect from "../../../components/form/PremiumSelect";
import CustomModal from "../../../components/CustomModal";
import useCustomerPricingInfobhanReducer from "../../../store/CustomerPricingInfobhanReducer";
import useBillingEntityReducer from "../../../store/BillingEntityReducer";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function AddEditCustomerPricingInfobhan({ showModal, closeModal, onSuccess }) {
    const {
        serviceCodes,
        isLoadingServiceCodes,
        getAllServiceCodes,
        isSaving,
        savePricing,
    } = useCustomerPricingInfobhanReducer((state) => state);

    const {
        billingEntities,
        isLoading: billingLoading,
        getBillingEntities,
    } = useBillingEntityReducer((state) => state);

    useEffect(() => {
        getAllServiceCodes();
        getBillingEntities({ params: { page: 1, limit: 1000 } });
    }, []);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            service_code_id: "",
            item_code: "",
            item_name: "",
            default_price: "",
            entities: [],
        },
    });

    const { fields, replace } = useFieldArray({
        control,
        name: "entities",
    });

    const hasInitializedEntities = useRef(false);
    useEffect(() => {
        if (hasInitializedEntities.current) return;
        if (!billingEntities || billingEntities.length === 0) return;
        replace(
            billingEntities.map((be) => ({
                entity_id: be.entity_id,
                billing_entity: be.billing_entity,
                customer_code: be.customer_code,
                custom_price: "",
                default_line_item: false,
            }))
        );
        hasInitializedEntities.current = true;
    }, [billingEntities, replace]);

    const serviceCodeOptions = (serviceCodes ?? []).map((s) => {
        const id = s.id ?? s.service_code_id;
        return {
            value: id != null ? String(id) : "",
            label: `${s.service_code ?? ""} - ${s.service_name ?? ""}`,
        };
    });

    const onSubmit = (data) => {
        const payload = {
            service_code_id: Number(data.service_code_id),
            item_code: data.item_code.trim(),
            item_name: data.item_name.trim(),
            default_price: Number(data.default_price),
            entities: (data.entities ?? []).map((e) => ({
                entity_id: Number(e.entity_id),
                custom_price:
                    e.custom_price === "" || e.custom_price == null
                        ? null
                        : Number(e.custom_price),
                default_line_item: e.default_line_item ? 1 : 0,
            })),
        };
        savePricing({
            payload,
            cb: () => {
                closeModal(null);
                onSuccess?.();
            },
        });
    };

    const renderHeader = () => (
        <h1 className="modal-title">Add Customer Pricing</h1>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="customerPricingInfobhanForm" onSubmit={handleSubmit(onSubmit)}>

                    {/* Service Details */}
                    <h6 className="mb-3">Service Details</h6>
                    <div className="permInputs row mb-lg-3">

                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="phone-wrapper">
                                <label className="phone-label">
                                    Service Code <span className="text-danger">*</span>
                                </label>
                                <Controller
                                    name="service_code_id"
                                    control={control}
                                    rules={{ required: "Service Code is required" }}
                                    render={({ field }) => (
                                        <PremiumSelect
                                            value={field.value != null ? String(field.value) : ""}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            options={serviceCodeOptions}
                                            placeholder={
                                                isLoadingServiceCodes ? "Loading..." : "Select Service Code"
                                            }
                                            searchPlaceholder="Search service code..."
                                            hasError={Boolean(errors.service_code_id)}
                                        />
                                    )}
                                />
                                {errors.service_code_id && (
                                    <span className="error text-danger">
                                        {errors.service_code_id.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.item_code ? "is-invalid" : ""}`}
                                    placeholder="Item Code"
                                    {...register("item_code", { required: "Item Code is required" })}
                                />
                                <label>Item Code <span className="text-danger">*</span></label>
                                {errors.item_code && (
                                    <span className="error text-danger">{errors.item_code.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.item_name ? "is-invalid" : ""}`}
                                    placeholder="Item Name"
                                    {...register("item_name", { required: "Item Name is required" })}
                                />
                                <label>Item Name <span className="text-danger">*</span></label>
                                {errors.item_name && (
                                    <span className="error text-danger">{errors.item_name.message}</span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Pricing */}
                    <h6 className="mb-3">Pricing</h6>
                    <div className="permInputs row mb-lg-3">

                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.default_price ? "is-invalid" : ""}`}
                                    placeholder="Default Price"
                                    {...register("default_price", {
                                        required: "Default Price is required",
                                        validate: (v) =>
                                            (v !== "" && !isNaN(Number(v))) || "Default Price must be numeric",
                                    })}
                                />
                                <label>Default Price <span className="text-danger">*</span></label>
                                {errors.default_price && (
                                    <span className="error text-danger">{errors.default_price.message}</span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Client Price */}
                    <h6 className="mb-3">Client Price</h6>
                    <div className="mb-lg-3">
                        {billingLoading ? (
                            <div className="text-center py-3 text-muted">Loading billing entities...</div>
                        ) : fields.length === 0 ? (
                            <div className="text-center py-3 text-muted">No billing entities found</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle">
                                    <thead>
                                        <tr>
                                            <th>Billing Entity</th>
                                            <th>Customer Code</th>
                                            <th style={{ width: "180px" }}>Custom Price</th>
                                            <th style={{ width: "140px" }}>Default Line Item</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((field, index) => (
                                            <tr key={field.id}>
                                                <td>{field.billing_entity}</td>
                                                <td>{field.customer_code}</td>
                                                <td>
                                                    <input
                                                        type="hidden"
                                                        {...register(`entities.${index}.entity_id`)}
                                                    />
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        className={`form-control form-control-sm ${errors.entities?.[index]?.custom_price ? "is-invalid" : ""
                                                            }`}
                                                        placeholder="Custom Price"
                                                        {...register(`entities.${index}.custom_price`, {
                                                            validate: (v) =>
                                                                v === "" ||
                                                                v == null ||
                                                                !isNaN(Number(v)) ||
                                                                "Must be numeric",
                                                        })}
                                                    />
                                                    {errors.entities?.[index]?.custom_price && (
                                                        <span className="error text-danger d-block">
                                                            {errors.entities[index].custom_price.message}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        {...register(`entities.${index}.default_line_item`)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                disabled={isSaving}
            >
                Close
            </button>
            <button
                type="submit"
                form="customerPricingInfobhanForm"
                className="btn btn-primary"
                disabled={isSaving}
            >
                {isSaving ? "Saving..." : "Save"}
            </button>
        </div>
    );

    return (
        <CustomModal
            dialgName="modal-dialog modal-dialog-centered modal-lg"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
