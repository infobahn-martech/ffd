import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiShield, FiClock } from "react-icons/fi";
import CustomModal from "../../components/CustomModal";
import useAuthReducer from "../../store/AuthReducer";
import { getItem } from "../../shared/helpers/localStorage";
import "../../design/scss/first-login-password-modal.scss";

export default function FirstLoginPasswordModal() {
    const { isFirstLogin, isLoginLoading, authData, resetPassword, clearFirstLogin } = useAuthReducer();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { new_password: "", confirmPassword: "" } });

    const newPassword = watch("new_password");

    const onSubmit = async (data) => {
        const token = getItem("accessToken");
        const userId = authData?.userid || getItem("userid");
        if (!token || !userId) return;

        const result = await resetPassword({
            token,
            user_id: userId,
            new_password: data.new_password,
        });

        if (result?.success) {
            reset();
            clearFirstLogin();
        }
    };

    const renderHeader = () => (
        <div className="first-login-modal-header">
            <div className="fl-icon-badge">
                <FiShield />
            </div>
            <h1 className="modal-title">Set Your New Password</h1>
            <p className="fl-subtitle">
                {authData?.name ? `Welcome, ${authData.name}. ` : "Welcome. "}
                For your security, please create a new password to continue.
            </p>
        </div>
    );

    const renderBody = () => (
        <div className="modal-body">
            <div className="fl-notice">
                <FiClock className="fl-notice-icon" />
                <span>Your temporary password expires in <strong>24 hours</strong>. Set a new one now to keep access to your account.</span>
            </div>

            <form id="firstLoginPasswordForm" onSubmit={handleSubmit(onSubmit)}>
                <div className="input-outer-wrap">
                    <label className="label">New Password</label>
                    <div className="input-wrap password-input-wrap">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            className="txt"
                            autoComplete="new-password"
                            {...register("new_password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters",
                                },
                            })}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowNewPassword((v) => !v)}
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                            {showNewPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                        {errors.new_password && (
                            <div className="error">{errors.new_password.message}</div>
                        )}
                    </div>
                </div>

                <div className="input-outer-wrap">
                    <label className="label">Confirm Password</label>
                    <div className="input-wrap password-input-wrap">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            className="txt"
                            autoComplete="new-password"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: (value) =>
                                    value === newPassword || "Passwords do not match",
                            })}
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                        {errors.confirmPassword && (
                            <div className="error">{errors.confirmPassword.message}</div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );

    const renderFooter = () => (
        <div className="modal-footer">
            <button
                type="submit"
                form="firstLoginPasswordForm"
                className="fl-submit-btn"
                disabled={isLoginLoading}
            >
                {isLoginLoading ? "Setting Password..." : "Set Password & Continue"}
            </button>
        </div>
    );

    return (
        <CustomModal
            className="first-login-modal"
            dialgName="modal-dialog modal-dialog-centered"
            show={!!isFirstLogin}
            closeModal={() => {}}
            body={renderBody()}
            footer={renderFooter()}
            header={renderHeader()}
        />
    );
}
