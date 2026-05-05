import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff } from "react-icons/fi";
import CustomModal from "../../components/CustomModal";
import { notify } from "../../components/Toaster";
import authService from "../../services/authService";
import "../../design/scss/prospect-modal.scss";
import "../../design/scss/modal-designs.scss";
import "../../design/scss/form-designs.scss";

export default function ChangePasswordModal({ show, onClose }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showReConfirmPassword, setShowReConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
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

    useEffect(() => {
        if (show) {
            reset({
                currentPassword: "",
                confirmPassword: "",
                reConfirmPassword: ""
            });
            setShowCurrentPassword(false);
            setShowConfirmPassword(false);
            setShowReConfirmPassword(false);
        }
    }, [show, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await authService.changePassword({
                current_password: data.currentPassword,
                new_password: data.confirmPassword,
                confirm_password: data.reConfirmPassword
            });
            notify("Password changed successfully.", "success");
            reset();
            onClose();
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to change password.";
            notify(typeof msg === "string" ? msg : "Failed to change password.", "error");
        } finally {
            setIsSubmitting(false);
        }
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
                        <div className="form-floating desig-inp desig-inp--password">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
                                placeholder="Current Password"
                                autoComplete="current-password"
                                {...register("currentPassword", {
                                    required: "Current password is required"
                                })}
                            />
                            <label>
                                Current Password <span className="text-danger">*</span>
                            </label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowCurrentPassword((v) => !v)}
                                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                            >
                                {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                            {errors.currentPassword && (
                                <span className="error text-danger">
                                    {errors.currentPassword.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD — FULL ROW */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp desig-inp--password">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                placeholder="Confirm Password"
                                autoComplete="new-password"
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
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                            {errors.confirmPassword && (
                                <span className="error text-danger">
                                    {errors.confirmPassword.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* RE-CONFIRM PASSWORD — FULL ROW */}
                    <div className="mb-lg-3 mb-sm-0">
                        <div className="form-floating desig-inp desig-inp--password">
                            <input
                                type={showReConfirmPassword ? "text" : "password"}
                                className={`form-control ${errors.reConfirmPassword ? "is-invalid" : ""}`}
                                placeholder="Re-Confirm Password"
                                autoComplete="new-password"
                                {...register("reConfirmPassword", {
                                    required: "Re-confirm password is required",
                                    validate: (value) =>
                                        value === confirmPassword || "Passwords do not match"
                                })}
                            />
                            <label>
                                Re-Confirm Password <span className="text-danger">*</span>
                            </label>
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowReConfirmPassword((v) => !v)}
                                aria-label={showReConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showReConfirmPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
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
            <button type="submit" form="changePasswordForm" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
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

