import { useState } from "react";
import CustomModal from "../../../../components/CustomModal";
import "../../../../design/scss/prospect-modal.scss";
import "../../../../design/scss/modal-designs.scss";
import "../../../../design/scss/form-designs.scss";

export function AddVesselModal({ showModal, closeModal, onSave }) {
    const [vesselName, setVesselName] = useState("");
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        const newErrors = {};
        if (!vesselName.trim()) {
            newErrors.vesselName = "Vessel Name is required";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Call onSave callback with vessel data
        if (onSave) {
            onSave({ vesselName: vesselName.trim() });
        }

        // Reset form and close modal
        setVesselName("");
        setErrors({});
        closeModal();
    };

    const handleClose = () => {
        setVesselName("");
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
                                <input
                                    type="text"
                                    className={`form-control ${errors.vesselName ? "is-invalid" : ""}`}
                                    placeholder="Vessel Name"
                                    value={vesselName}
                                    onChange={(e) => {
                                        setVesselName(e.target.value);
                                        if (errors.vesselName) {
                                            setErrors({ ...errors, vesselName: "" });
                                        }
                                    }}
                                />
                                <label>
                                    Vessel Name <span className="text-danger">*</span>
                                </label>
                                {errors.vesselName && (
                                    <span className="error text-danger">{errors.vesselName}</span>
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

