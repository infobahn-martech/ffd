import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";
import { PORT_OPTIONS } from "../../../constants/ports";

// TODO: Replace with actual billing entities from API or constants
const BILLING_ENTITY_OPTIONS = [
    "Sedres Maritime Co.",
    "Al Fajr Shipping LLC",
    "Global Port Services",
    "Ocean Waves Logistics",
    "Blue Horizon Freight",
    "Desert Star Logistics",
    "PortLink Arabia",
    "CargoMax Trading",
];

// Common currency options
const CURRENCY_OPTIONS = ["USD", "SAR", "AED", "EUR", "GBP", "INR"];

export function AddEditCustomerPricing({ showModal, closeModal, onSuccess }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: showModal?._id
            ? {
                customerName: showModal?.customerName,
                port: showModal?.port || "",
                billingEntity: showModal?.billingEntity || "",
                currency: showModal?.currency || "",
            }
            : {},
    });

    console.log("errors", errors);

    const onSubmit = (data) => {
        console.log("CUSTOMER PRICING FORM SUBMITTED:", data);
        onSuccess?.();
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Customer Pricing" : "Add Customer Pricing"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="customerPricingForm" onSubmit={handleSubmit(onSubmit)}>

                    {/* ROW 1 — Customer Name + Port */}
                    <div className="permInputs row mb-lg-3">

                        {/* Customer Name */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.customerName ? "is-invalid" : ""}`}
                                    placeholder="Customer Name"
                                    {...register("customerName", { required: "Customer Name is required" })}
                                />
                                <label>Customer Name <span className="text-danger">*</span></label>
                                {errors.customerName && (
                                    <span className="error text-danger">{errors.customerName.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Port */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-control ${errors.port ? "is-invalid" : ""}`}
                                    {...register("port", { required: "Port is required" })}
                                >
                                    <option value="">Select Port</option>
                                    {PORT_OPTIONS.map((port) => (
                                        <option key={port} value={port}>
                                            {port}
                                        </option>
                                    ))}
                                </select>
                                <label>Port <span className="text-danger">*</span></label>
                                {errors.port && (
                                    <span className="error text-danger">{errors.port.message}</span>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* ROW 2 — Billing Entity + Currency */}
                    <div className="permInputs row mb-lg-3">

                        {/* Billing Entity */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-control ${errors.billingEntity ? "is-invalid" : ""}`}
                                    {...register("billingEntity", { required: "Billing Entity is required" })}
                                >
                                    <option value="">Select Billing Entity</option>
                                    {BILLING_ENTITY_OPTIONS.map((entity) => (
                                        <option key={entity} value={entity}>
                                            {entity}
                                        </option>
                                    ))}
                                </select>
                                <label>Billing Entity <span className="text-danger">*</span></label>
                                {errors.billingEntity && (
                                    <span className="error text-danger">{errors.billingEntity.message}</span>
                                )}
                            </div>
                        </div>

                        {/* Currency */}
                        <div className="col-lg-6 col-sm-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-control ${errors.currency ? "is-invalid" : ""}`}
                                    {...register("currency", { required: "Currency is required" })}
                                >
                                    <option value="">Select Currency</option>
                                    {CURRENCY_OPTIONS.map((currency) => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </select>
                                <label>Currency <span className="text-danger">*</span></label>
                                {errors.currency && (
                                    <span className="error text-danger">{errors.currency.message}</span>
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
            <button type="button" className="btn btn-outline" onClick={closeModal}>
                Close
            </button>
            <button type="submit" form="customerPricingForm" className="btn btn-primary">
                Save
            </button>
        </div>
    );

    return (
        <CustomModal
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
