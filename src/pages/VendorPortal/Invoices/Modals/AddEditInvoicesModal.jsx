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
            woNo: "",
            poNo: "",
            taxInvoiceFile: null,
        },
    });

    useEffect(() => {
        if (selectedData?._id) {
            reset({
                woNo: selectedData.woNo || "",
                poNo: selectedData.poNo || "",
                taxInvoiceFile: null,
            });
        } else {
            reset({
                woNo: "",
                poNo: "",
                taxInvoiceFile: null,
            });
        }
    }, [selectedData, reset]);

    const onSubmit = (data) => {
        const file = data.taxInvoiceFile?.[0] || null;

        onSuccess?.({
            woNo: data.woNo,
            poNo: data.poNo,
            taxInvoiceFile: file,
            taxInvoiceFileName: file?.name || selectedData?.taxInvoiceFileName || "",
        });
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
                                    className={`form-control ${errors.woNo ? "is-invalid" : ""}`}
                                    placeholder="WO No"
                                    {...register("woNo", {
                                        required: "Work Order number is required",
                                    })}
                                />
                                <label>
                                    Work Order (WO) Number <span className="text-danger">*</span>
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
                                        required: "Purchase Order number is required",
                                    })}
                                />
                                <label>
                                    Purchase Order (PO) Number <span className="text-danger">*</span>
                                </label>
                                {errors.poNo && (
                                    <span className="error text-danger">{errors.poNo.message}</span>
                                )}
                            </div>
                        </div>

                        <div className="col-md-12 mb-lg-3 mb-sm-0">
                            <div className="desig-inp">
                                <label className="form-label mb-2">
                                    Tax Invoice Attachment <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="file"
                                    className={`form-control ${errors.taxInvoiceFile ? "is-invalid" : ""}`}
                                    accept=".pdf,.jpg,.jpeg"
                                    {...register("taxInvoiceFile", {
                                        validate: {
                                            required: (files) => {
                                                if (selectedData?._id && selectedData?.taxInvoiceFileName) return true;
                                                return files?.length > 0 || "Tax Invoice attachment is required";
                                            },
                                            fileType: (files) => {
                                                if (!files || files.length === 0) return true;
                                                const file = files[0];
                                                const allowedTypes = [
                                                    "application/pdf",
                                                    "image/jpeg",
                                                    "image/jpg",
                                                ];
                                                return (
                                                    allowedTypes.includes(file.type) ||
                                                    "Only PDF or JPG files are allowed"
                                                );
                                            },
                                        },
                                    })}
                                />
                                {selectedData?.taxInvoiceFileName && (
                                    <small className="d-block mt-2 text-muted">
                                        Current file: {selectedData.taxInvoiceFileName}
                                    </small>
                                )}
                                {errors.taxInvoiceFile && (
                                    <span className="error text-danger">
                                        {errors.taxInvoiceFile.message}
                                    </span>
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