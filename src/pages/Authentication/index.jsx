import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useGoogleLogin } from '@react-oauth/google';
import '../../design/scss/login.scss';
import {
  SperiLogo,
  GoogleIcon,
  SperiLogoDark,
  EyeCloseIcon,
  EyeOpenIcon,
} from './svgIcons';
import useAlertReducer from '../../store/AlertReducer';
import useAuthReducer from '../../store/AuthReducer';
import userName from '../../assets/images/icon-mail.svg';
import passwd from '../../assets/images/icon-lock.svg';

// validation
const schema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email format',
    ),
  password: yup.string().trim().required('Password is required'),
});

const Login = () => {
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [togglePasswordVisibility, setTogglePasswordVisibility] =
    useState(false);
  const login = useAuthReducer((state) => state.login);
  const errorMessage = useAuthReducer((state) => state.errorMessage);

  const googleLogin = useAuthReducer((state) => state.googleLogin);
  const isLoginLoading = useAuthReducer((state) => state.isLoginLoading);
  const error = useAlertReducer((state) => state.error);

  // error handling
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleLogin = ({ email, password }) => {
    // if (!email || !password) {
    //   error('Please enter both email and password');
    //   return;
    // }
    login({ email, password });
  };

  // Google login functionality
  const signInWithGoogle = useGoogleLogin({
    onSuccess: ({ access_token, token_type }) => {
      googleLogin({
        token: { access_token },
        tokenType: token_type,
      });
    },
    onError: () => error('An error occurred during Google login'),
  });

  return (
    <div className="login-wrp">
      <div className="container login-container">
        <div className="row">
          <div className="col-lg-6">
            <div className="branding-wrp">
              <div className="logo">
                <SperiLogo />
              </div>

              <div className="txt">
                <h2 className="loginTitle">
                  <span>Create your</span>
                  Dream Home
                </h2>
                {/* <p className="loginDesc">
                  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                  diam nonumy eirmod tempor invidunt.
                </p> */}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="signup-wrp">
              <div className="logo">
                <SperiLogoDark />
              </div>

              <h3 className="form-title">Login Now</h3>
              {/* <p className="form-desc">
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt.
              </p> */}

              <div className="inp-wrp">
                <span className="inp_ico">
                  <img src={userName} alt="usr name" />
                </span>
                {/* <input
                  type="text"
                  className="form-control username"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                /> */}
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      className="form-control username"
                      placeholder="Email"
                    />
                  )}
                />

                {errors?.email && (
                  <span className="error-txt form-error">
                    {errors?.email?.message}
                  </span>
                )}
              </div>

              <div className="inp-wrp mb-3">
                <span className="inp_ico">
                  <img src={passwd} alt="pw" />
                </span>
                {/* <input
                  type={togglePasswordVisibility ? 'text' : 'password'}
                  className="form-control passw"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                /> */}
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      type={togglePasswordVisibility ? 'text' : 'password'}
                      onChange={(e) => field?.onChange(e?.target.value.trim())}
                      className="form-control passw"
                      placeholder="Password"
                      autoComplete="new-password"
                    />
                  )}
                />

                {errors?.password && (
                  <span className="error-txt form-error">
                    {errors?.password?.message}
                  </span>
                )}

                <button
                  onClick={() =>
                    setTogglePasswordVisibility(!togglePasswordVisibility)
                  }
                  type="button"
                  className={
                    togglePasswordVisibility ? 'eye-icon show' : 'eye-icon'
                  }
                >
                  {!togglePasswordVisibility ? (
                    <EyeCloseIcon />
                  ) : (
                    <EyeOpenIcon />
                  )}
                </button>
              </div>

              <a href="# " className="forgotpw mb-5">
                Forgot Password ?
              </a>

              <div className="inp-wrp">
                <button
                  type="button"
                  className="btn btn-primary btn-login"
                  onClick={handleSubmit(handleLogin)}
                >
                  {isLoginLoading ? (
                    <div
                      className="spinner-border spinner-border-sm"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    'LOGIN'
                  )}
                </button>
              </div>

              <div className="inp-wrp">
                <button
                  type="button"
                  className="btn btn-outline  btn-login"
                  onClick={signInWithGoogle}
                >
                  <span className="pe-2">
                    <GoogleIcon />
                  </span>
                  <span>LOGIN WITH GOOGLE</span>
                </button>

                {/* login error message  */}
              </div>
              {errorMessage && (
                <span className="error-txt  login-form-error">
                  {errorMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
