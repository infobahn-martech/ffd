import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function StatusModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: showModal?._id
            ? {
                statusName: showModal?.name,
                statusCode: showModal?.code,
                description: showModal?.description,
                module: showModal?.module,
                order: showModal?.order,
                color: showModal?.color || "#2f80ed",
            }
            : {},
    });

    const onSubmit = (data) => {
        console.log("STATUS FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Status" : "Add Status"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="statusForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* STATUS NAME */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.statusName ? "is-invalid" : ""
                                    }`}
                                placeholder="Status Name"
                                {...register("statusName", {
                                    required: "Status name is required",
                                })}
                            />
                            <label>
                                Status Name <span className="text-danger">*</span>
                            </label>
                            {errors.statusName && (
                                <span className="error text-danger">
                                    {errors.statusName.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* STATUS CODE */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className="form-control"
                                placeholder="Status Code"
                                {...register("statusCode")}
                            />
                            <label>Status Code</label>
                        </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <textarea
                                className="form-control"
                                placeholder="Description"
                                style={{ height: "120px" }}
                                {...register("description")}
                            ></textarea>
                            <label>Description</label>
                        </div>
                    </div>

                    {/* TYPE / MODULE */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <select
                                className="form-select"
                                {...register("module")}
                            >
                                <option value="">Select</option>
                                <option value="husbandry">Husbandry</option>
                                <option value="transport">Transport</option>
                                <option value="crew">Crew</option>
                                <option value="warehouse">Warehouse</option>
                            </select>
                            <label>Type / Module</label>
                        </div>
                    </div>

                    {/* DISPLAY ORDER */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Display Order"
                                {...register("order")}
                            />
                            <label>Display Order</label>
                        </div>
                    </div>

                    {/* STATUS COLOR */}
                    <div className="mb-lg-3 mb-sm-0">
                        <label className="mb-2 fw-semibold">Status Color</label>
                        <input
                            type="color"
                            className="form-control form-control-color"
                            {...register("color")}
                            style={{ height: "45px", width: "70px", padding: 0 }}
                        />
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
            <button type="submit" form="statusForm" className="btn btn-primary">
                Save
            </button>
        </div>
    );

    return (
        <CustomModal
            className="status-modal-sm"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!showModal}
            closeModal={() => closeModal(null)}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
