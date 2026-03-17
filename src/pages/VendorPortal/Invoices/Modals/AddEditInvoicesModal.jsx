import { useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomModal from "../../../../components/CustomModal";
import "../../../../design/scss/prospect-modal.scss";
import "../../../../design/scss/modal-designs.scss";
import "../../../../design/scss/form-designs.scss";

export function AddEditInvoicesModal({
    showModal,
    closeModal,
    selectedData,
    onSuccess,
    isBeingUpdated = false,
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            refNo: "",
            woNo: "",
            poNo: "",
            amount: "",
            date: "",
            status: "Pending",
        },
    });

    useEffect(() => {
        if (selectedData?._id) {
            reset({
                refNo: selectedData.refNo || "",
                woNo: selectedData.woNo || "",
                poNo: selectedData.poNo || "",
                amount: selectedData.amount || "",
                date: selectedData.date || "",
                status: selectedData.status || "Pending",
            });
        } else {
            reset({
                refNo: "",
                woNo: "",
                poNo: "",
                amount: "",
                date: "",
                status: "Pending",
            });
        }
    }, [selectedData, reset]);

    const onSubmit = (data) => {
        onSuccess?.(data);
    };

    const renderHeader = () => (
        <h1 className="modal-title">
            {selectedData?._id ? "Edit Invoice" : "Add Invoice"}
        </h1>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="invoiceForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.refNo ? "is-invalid" : ""}`}
                                    placeholder="Reference No"
                                    {...register("refNo", {
                                        required: "Reference number is required",
                                        minLength: {
                                            value: 3,
                                            message: "Reference number must be at least 3 characters",
                                        },
                                    })}
                                />
                                <label>
                                    Ref No <span className="text-danger">*</span>
                                </label>
                                {errors.refNo && (
                                    <span className="error text-danger">{errors.refNo.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.woNo ? "is-invalid" : ""}`}
                                    placeholder="WO No"
                                    {...register("woNo", {
                                        required: "WO number is required",
                                    })}
                                />
                                <label>
                                    WO No <span className="text-danger">*</span>
                                </label>
                                {errors.woNo && (
                                    <span className="error text-danger">{errors.woNo.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.poNo ? "is-invalid" : ""}`}
                                    placeholder="PO No"
                                    {...register("poNo", {
                                        required: "PO number is required",
                                    })}
                                />
                                <label>
                                    PO No <span className="text-danger">*</span>
                                </label>
                                {errors.poNo && (
                                    <span className="error text-danger">{errors.poNo.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className={`form-control ${errors.amount ? "is-invalid" : ""}`}
                                    placeholder="Amount"
                                    {...register("amount", {
                                        required: "Amount is required",
                                    })}
                                />
                                <label>
                                    Amount <span className="text-danger">*</span>
                                </label>
                                {errors.amount && (
                                    <span className="error text-danger">{errors.amount.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    type="date"
                                    className={`form-control ${errors.date ? "is-invalid" : ""}`}
                                    placeholder="Date"
                                    {...register("date", {
                                        required: "Date is required",
                                    })}
                                />
                                <label>
                                    Date <span className="text-danger">*</span>
                                </label>
                                {errors.date && (
                                    <span className="error text-danger">{errors.date.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-select ${errors.status ? "is-invalid" : ""}`}
                                    {...register("status", {
                                        required: "Status is required",
                                    })}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                                <label>
                                    Status <span className="text-danger">*</span>
                                </label>
                                {errors.status && (
                                    <span className="error text-danger">{errors.status.message}</span>
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
                form="invoiceForm"
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