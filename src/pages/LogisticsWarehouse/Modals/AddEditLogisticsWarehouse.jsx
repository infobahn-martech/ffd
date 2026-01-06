import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function LogisticsWarehouseModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: showModal?._id
            ? {
                logisticsWarehouseName: showModal?.name
            }
            : {}
    });

    const onSubmit = (data) => {
        console.log("LOGISTICS WAREHOUSE FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Logistics Warehouse" : "Add Logistics Warehouse"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="logisticsWarehouseForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.logisticsWarehouseName ? "is-invalid" : ""
                                    }`}
                                placeholder="Logistics Warehouse Name"
                                {...register("logisticsWarehouseName", {
                                    required: "Logistics warehouse name is required"
                                })}
                            />
                            <label>
                                Logistics Warehouse <span className="text-danger">*</span>
                            </label>

                            {errors.logisticsWarehouseName && (
                                <span className="error text-danger">
                                    {errors.logisticsWarehouseName.message}
                                </span>
                            )}
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
            <button type="submit" form="logisticsWarehouseForm" className="btn btn-primary">
                Save
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
