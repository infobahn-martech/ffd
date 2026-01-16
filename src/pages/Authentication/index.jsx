import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "../../design/scss/login.scss";
import SedresLogo from "../../assets/images/SedresLogo.png";
import useAuthReducer from "../../store/AuthReducer";

function Index() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingMode, setIsTestingMode] = useState(true); // Testing mode: true = normal flow, false = skip validation/API
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, isLoginLoading, isLoggedIn } = useAuthReducer();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/workspaces");
    }
  }, [isLoggedIn, navigate]);

  const onSubmit = async (data) => {
    if (isTestingMode) {
      // Normal flow: validation and API calls
      await login({ email: data.email, password: data.password });
    } else {
      // Testing mode: skip validation and API, directly navigate
      navigate("/workspaces");
    }
  };

  return (
    <div className="login-wrap">
      {/* LEFT SIDE */}
      <div className="left-wrap">
        <div className="content-wrap">
          <h1 className="title">
            Smarter Ports,
            <span>Stronger Operations.</span>
          </h1>
          <p className="des">
            Delivering smarter coordination, faster workflows, and seamless
            port-management solutions for global marine services.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="form-wrap">
        <div className="content-wrap">
          <div className="logo-wrap">
            <img src={SedresLogo} alt="Sedres Logo" />
          </div>

          <div className="head-wrap">
            <h2 className="title">
              Login to your account
            </h2>
            <p className="des">Welcome back! Please enter your details.</p>
          </div>

          <div className="form-content-wrap">
            {/* FORM START */}
            <form onSubmit={isTestingMode ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); navigate("/workspaces"); }}>
              {/* EMAIL */}
              <div className="input-outer-wrap">
                <label className="label">Email</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    placeholder="Enter your email"
                    className="txt"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                        message: "Enter a valid email",
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
                        value: 6,
                        message: "Password must be at least 6 characters",
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
                      fontFamily: `"Raleway", sans-serif`,
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
            <a href="#/forget-password" className="link">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
