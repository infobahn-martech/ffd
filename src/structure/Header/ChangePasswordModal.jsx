import { useForm } from "react-hook-form";
import CustomModal from "../../components/CustomModal";
import "../../design/scss/prospect-modal.scss";
import "../../design/scss/modal-designs.scss";
import "../../design/scss/form-designs.scss";

export default function ChangePasswordModal({ show, onClose }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm({
        defaultValues: {
            currentPassword: "",
            confirmPassword: "",
            reConfirmPassword: ""
        }
    });

    const confirmPassword = watch("confirmPassword");

    const onSubmit = (data) => {
        console.log("CHANGE PASSWORD FORM SUBMITTED:", data);
        // Add your password change logic here
        onClose();
    };

    const renderHeader = () => (
        <>
            <h1 className="modal-title">Change Password</h1>
        </>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="lead-form">
                <form id="changePasswordForm" onSubmit={handleSubmit(onSubmit)}>

                    {/* CURRENT PASSWORD — FULL ROW */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                type="password"
                                className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
                                placeholder="Current Password"
                                {...register("currentPassword", {
                                    required: "Current password is required"
                                })}
                            />
                            <label>
                                Current Password <span className="text-danger">*</span>
                            </label>
                            {errors.currentPassword && (
                                <span className="error text-danger">
                                    {errors.currentPassword.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD — FULL ROW */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                type="password"
                                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                placeholder="Confirm Password"
                                {...register("confirmPassword", {
                                    required: "Confirm password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters"
                                    }
                                })}
                            />
                            <label>
                                Confirm Password <span className="text-danger">*</span>
                            </label>
                            {errors.confirmPassword && (
                                <span className="error text-danger">
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* RE-CONFIRM PASSWORD — FULL ROW */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp">
                            <input
                                type="password"
                                className={`form-control ${errors.reConfirmPassword ? "is-invalid" : ""}`}
                                placeholder="Re-Confirm Password"
                                {...register("reConfirmPassword", {
                                    required: "Re-confirm password is required",
                                    validate: (value) =>
                                        value === confirmPassword || "Passwords do not match"
                                })}
                            />
                            <label>
                                Re-Confirm Password <span className="text-danger">*</span>
                            </label>
                            {errors.reConfirmPassword && (
                                <span className="error text-danger">
                                    {errors.reConfirmPassword.message}
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
            <button type="button" className="btn btn-outline" onClick={onClose}>
                Close
            </button>
            <button type="submit" form="changePasswordForm" className="btn btn-primary">
                Save
            </button>
        </div>
    );

    return (
        <CustomModal
            className="role-modal-sm"
            dialgName="modal-dialog modal-dialog-centered"
            show={show}
            closeModal={() => onClose()}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}

