import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../../design/scss/login.scss";
import useAuthReducer from "../../store/AuthReducer";
import { setItem } from "../../shared/helpers/localStorage";
import { isMockDataEnabled, mockUserProfile } from "../../mocks/ffd";
import { normalizePermissionSections } from "../../shared/utils/permissions";

function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, isLoginLoading, isLoggedIn } = useAuthReducer();

  // PrivateRoutes redirects unauthenticated visits to "/" with state.from set to the
  // originally-requested location. Only honor that for the CEO email approval deep
  // link — any other leftover "from" (e.g. a kanban board a previous user on this
  // same tab/browser was viewing, reached via back button after logout) must not
  // carry over to whichever different user logs in next; they always land on their
  // own /workspaces instead.
  const getPostLoginRedirect = () => {
    const from = location.state?.from;
    if (from?.pathname?.startsWith("/approval/ceo/")) {
      return `${from.pathname}${from.search || ""}`;
    }
    return "/workspaces";
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate(getPostLoginRedirect(), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, navigate]);

  const onSubmit = async (data) => {
    if (!isMockDataEnabled) {
      await login({ email: data.email, password: data.password, remember_me: data.rememberMe || false });
      return;
    }

    // TEMPORARY: dev-only mock login (VITE_USE_MOCK_DATA=true) — bypasses the
    // real login API so the app is reachable before a backend exists. See
    // src/mocks/ffd/index.js for the switch and mockUserProfile. Remove this
    // branch once the backend exists.
    setItem("accessToken", "ffd-mock-token");
    setItem("userid", mockUserProfile.userid);
    setItem("refreshToken", "ffd-mock-refresh-token");
    setItem("userProfile", JSON.stringify(mockUserProfile));
    useAuthReducer.setState({
      isLoggedIn: true,
      isProfileFetchLoading: false,
      authData: {
        userid: mockUserProfile.userid,
        name: mockUserProfile.name,
        email: mockUserProfile.email,
      },
      userProfile: mockUserProfile,
      profileData: mockUserProfile,
      permissionMap: normalizePermissionSections(mockUserProfile.permissions.sections),
    });
    navigate(getPostLoginRedirect(), { replace: true });
  };

  return (
    <div className="login-wrap">
      {/* LEFT SIDE */}
      <div className="left-wrap">
        <div className="content-wrap">
          <h1 className="title">
            Smarter Boards,
            <span>Stronger Workflows.</span>
          </h1>
          <p className="des">
            Plan, track and move work forward with a Kanban board that adapts
            to how your team actually works.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="form-wrap">
        <div className="content-wrap">
          <div className="logo-wrap">
            <span className="app-logo-text">FFD</span>
          </div>

          <div className="head-wrap">
            <h2 className="title">
              Login to your account
            </h2>
            <p className="des">Welcome back! Please enter your details.</p>
          </div>

          <div className="form-content-wrap">
            {/* FORM START */}
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* EMAIL / USERNAME */}
              <div className="input-outer-wrap">
                <label className="label">Email / Username</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    placeholder="Enter your email or username"
                    className="txt"
                    {...register("email", {
                      required: "Email or username is required",
                      minLength: {
                        value: 3,
                        message: "Enter at least 3 characters",
                      },
                    })}
                  />

                  {errors.email && (
                    <div className="error">{errors.email.message}</div>
                  )}
                </div>
              </div>

              {/* PASSWORD */}
              <div className="input-outer-wrap">
                <label className="label">Password</label>
                <div className="input-wrap password-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="txt"
                    {...register("password", {
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
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>

                  {errors.password && (
                    <div className="error">{errors.password.message}</div>
                  )}
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="checkbox-wrap" style={{ paddingBottom: "9px" }}>
                <label className="remember-label">
                  <input style={{ marginLeft: "4px" }} type="checkbox" {...register("rememberMe")} />
                  <span
                    style={{
                      marginLeft: "4px",
                      fontSize: "16px",
                      color: "#0c234c",
                      fontFamily: `"Manrope", sans-serif`,
                    }}
                  >
                    Remember Me
                  </span>

                </label>
              </div>

              {/* BUTTON */}
              <div className="btn-wrap">
                <button className="btn-red" type="submit" disabled={isLoginLoading}>
                  {isLoginLoading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>

          {/* FORGOT PASSWORD */}
          <div className="forgot-wrap">
            <Link to="/forget-password" className="link">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
