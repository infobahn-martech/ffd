import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "../../design/scss/login.scss";
import SedresLogo from "../../assets/images/SedresLogo.png";

function Index() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("FORM DATA:", data);
    navigate("/kanban-board");
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
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* EMAIL */}
              <div className="input-outer-wrap">
                <label className="label">Email</label>
                <div className="input-wrap">
                  <input
                    type="text"
                    placeholder="Enter your email"
                    className="txt"
                  // {...register("email", {
                  //   required: "Email is required",
                  //   pattern: {
                  //     value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                  //     message: "Enter a valid email",
                  //   },
                  // })}
                  />

                  {errors.email && (
                    <div className="error">{errors.email.message}</div>
                  )}
                </div>
              </div>

              {/* PASSWORD */}
              <div className="input-outer-wrap">
                <label className="label">Password</label>
                <div className="input-wrap">
                  <input
                    type="password"
                    placeholder="************************"
                    className="txt"
                  // {...register("password", {
                  //   required: "Password is required",
                  //   minLength: {
                  //     value: 6,
                  //     message: "Password must be at least 6 characters",
                  //   },
                  // })}
                  />

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
                <button className="btn-red" type="submit">
                  Login
                </button>
              </div>
            </form>
          </div>

          {/* FORGOT PASSWORD */}
          <div className="forgot-wrap">
            <a href="/forget-password" className="link">
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
