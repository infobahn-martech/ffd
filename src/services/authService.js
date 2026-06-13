import Gateway from "../gateway/gateway";

const doLoginValidate = (email, password, remember_me = false) =>
  Gateway.post("users/login", { email, password, remember_me });

const googleLoginValidate = (idToken, tokenType) =>
  Gateway.post("auth/google-signin", { idToken, tokenType });

const getUserProfile = () => Gateway.get("user/profile");

const getUserDetail = (userId) => Gateway.get(`users/getuserdetail/${userId}`);

// IMPORTANT: For FormData, do NOT manually set content-type
const editUserProfile = (formData) => Gateway.patch("user/profile", formData);

const getResetPasswordFormUrl = () => {
  const base = import.meta.env.BASE_URL || "/";
  return `${window.location.origin}${base}users/reset_password_form`;
};

const forgotPassword = (email) =>
  Gateway.post("users/forgotpassword", {
    email,
    reset_password_form_url: getResetPasswordFormUrl(),
  });

const resetPassword = ({ token, user_id, new_password }) =>
  Gateway.post("users/resetpassword", { token, user_id, new_password });

const changePassword = ({ current_password, new_password, confirm_password }) =>
  Gateway.post("users/change_password", { current_password, new_password, confirm_password });

const updateUserDetails = (formData) =>
  Gateway.post("users/update_user_details", formData);

export default {
  doLoginValidate,
  googleLoginValidate,
  getUserProfile,
  getUserDetail,
  editUserProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUserDetails,
};
