import { useForm } from "react-hook-form";
import CustomModal from "../../../components/CustomModal";
import "../../../design/scss/prospect-modal.scss";
import "../../../design/scss/modal-designs.scss";
import "../../../design/scss/form-designs.scss";

export function FleetModal({ showModal, closeModal }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: showModal?._id
            ? {
                // assuming list row has these keys:
                fleetName: showModal?.name,
                fleetType: showModal?.type,
                fleetCode: showModal?.code,
                registrationNo: showModal?.registrationNo,
                ownership: showModal?.ownership,
                capacity: showModal?.capacity,
                baseLocation: showModal?.baseLocation,
                department: showModal?.department,
                assignedTo: showModal?.assignedTo,
                status: showModal?.status,
                description: showModal?.description,
            }
            : {},
    });

    const onSubmit = (data) => {
        console.log("FLEET FORM SUBMITTED:", data);
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">
                {showModal?._id ? "Edit Fleet" : "Add Fleet"}
            </h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="fleetForm" onSubmit={handleSubmit(onSubmit)}>
                    {/* ROW 0 – FLEET NAME (FULL) */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                className={`form-control ${errors.fleetName ? "is-invalid" : ""
                                    }`}
                                placeholder="Fleet Name"
                                {...register("fleetName", {
                                    required: "Fleet name is required",
                                })}
                            />
                            <label>
                                Fleet Name <span className="text-danger">*</span>
                            </label>
                            {errors.fleetName && (
                                <span className="error text-danger">
                                    {errors.fleetName.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ROW 1 – FLEET TYPE + FLEET CODE */}
                    <div className="row">
                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-select ${errors.fleetType ? "is-invalid" : ""
                                        }`}
                                    {...register("fleetType", {
                                        required: "Fleet type is required",
                                    })}
                                >
                                    <option value="">Select</option>
                                    <option value="Vehicle">Vehicle</option>
                                    <option value="Launch / Boat">Launch / Boat</option>
                                    <option value="Equipment">Equipment</option>
                                    <option value="Other">Other</option>
                                </select>
                                <label>
                                    Fleet Type <span className="text-danger">*</span>
                                </label>
                                {errors.fleetType && (
                                    <span className="error text-danger">
                                        {errors.fleetType.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className="form-control"
                                    placeholder="Fleet Code"
                                    {...register("fleetCode")}
                                />
                                <label>Fleet Code</label>
                            </div>
                        </div>
                    </div>

                    {/* ROW 2 – REGISTRATION NO + OWNERSHIP TYPE */}
                    <div className="row">
                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className="form-control"
                                    placeholder="Registration No"
                                    {...register("registrationNo")}
                                />
                                <label>Registration No</label>
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <select
                                    className="form-select"
                                    {...register("ownership")}
                                >
                                    <option value="">Select</option>
                                    <option value="Owned">Owned</option>
                                    <option value="Rented">Rented</option>
                                    <option value="Third Party">Third Party</option>
                                </select>
                                <label>Ownership Type</label>
                            </div>
                        </div>
                    </div>

                    {/* ROW 3 – CAPACITY + BASE LOCATION */}
                    <div className="row">
                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className="form-control"
                                    placeholder="Capacity (eg: 7 Seats / 30 Pax)"
                                    {...register("capacity")}
                                />
                                <label>Capacity</label>
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className="form-control"
                                    placeholder="Base Location / Port"
                                    {...register("baseLocation")}
                                />
                                <label>Base Location / Port</label>
                            </div>
                        </div>
                    </div>

                    {/* ROW 4 – DEPARTMENT + ASSIGNED TO */}
                    <div className="row">
                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className="form-control"
                                    placeholder="Assigned Department"
                                    {...register("department")}
                                />
                                <label>Assigned Department</label>
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <input
                                    className="form-control"
                                    placeholder="Assigned To (Driver / Captain)"
                                    {...register("assignedTo")}
                                />
                                <label>Assigned To (Driver / Captain)</label>
                            </div>
                        </div>
                    </div>

                    {/* ROW 5 – STATUS + DESCRIPTION (DESCRIPTION FULL HEIGHT) */}
                    <div className="row">
                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <select
                                    className="form-select"
                                    {...register("status")}
                                >
                                    <option value="">Select</option>
                                    <option value="Active">Active</option>
                                    <option value="In Service">In Service</option>
                                    <option value="Under Maintenance">Under Maintenance</option>
                                    <option value="Breakdown">Breakdown</option>
                                    <option value="Retired">Retired</option>
                                </select>
                                <label>Status</label>
                            </div>
                        </div>

                        <div className="col-md-6 mb-lg-3 mb-sm-0">
                            <div className="form-floating desig-inp">
                                <textarea
                                    className="form-control"
                                    placeholder="Description / Remarks"
                                    style={{ height: "120px" }}
                                    {...register("description")}
                                ></textarea>
                                <label>Description / Remarks</label>
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
            >
                Close
            </button>
            <button type="submit" form="fleetForm" className="btn btn-primary">
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
