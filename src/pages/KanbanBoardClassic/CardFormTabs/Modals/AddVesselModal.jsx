import { useState } from "react";
import CustomModal from "../../../../components/CustomModal";
import "../../../../design/scss/prospect-modal.scss";
import "../../../../design/scss/modal-designs.scss";
import "../../../../design/scss/form-designs.scss";

export function AddVesselModal({ showModal, closeModal, onSave }) {
    const [vesselType, setVesselType] = useState("");
    const [errors, setErrors] = useState({});

    // Vessel Type options
    const vesselTypeOptions = [
        { value: "Vessel one", label: "Vessel one" },
        { value: "Vessel two", label: "Vessel two" },
        { value: "Vessel three", label: "Vessel three" },
        { value: "Vessel four", label: "Vessel four" },
        { value: "Vessel five", label: "Vessel five" },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!vesselType) {
            newErrors.vesselType = "Vessel Type is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Call onSave callback with vessel data
        if (onSave) {
            onSave({ vesselType });
        }

        // Reset form and close modal
        setVesselType("");
        setErrors({});
        closeModal();
    };

    const handleClose = () => {
        setVesselType("");
        setErrors({});
        closeModal();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">Add Vessel</h1>
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleClose}
            ></button>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="addVesselForm" onSubmit={handleSubmit}>
                    <div className="permInputs row mb-lg-3">
                        <div className="col-12 mb-3">
                            <div className="form-floating desig-inp">
                                <select
                                    className={`form-control ${errors.vesselType ? "is-invalid" : ""}`}
                                    value={vesselType}
                                    onChange={(e) => {
                                        setVesselType(e.target.value);
                                        if (errors.vesselType) {
                                            setErrors({ ...errors, vesselType: "" });
                                        }
                                    }}
                                >
                                    <option value="">Select Vessel Type</option>
                                    {vesselTypeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <label>
                                    Vessel Type <span className="text-danger">*</span>
                                </label>
                                {errors.vesselType && (
                                    <span className="error text-danger">{errors.vesselType}</span>
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
            <button type="button" className="btn btn-outline" onClick={handleClose}>
                Close
            </button>
            <button type="submit" form="addVesselForm" className="btn btn-primary">
                Save
            </button>
        </div>
    );

    return (
        <CustomModal
            dialgName="modal-dialog modal-dialog-centered modal-md"
            show={!!showModal}
            closeModal={handleClose}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}

