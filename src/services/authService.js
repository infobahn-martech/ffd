import Gateway from "../gateway/gateway";

const doLoginValidate = (email, password, remember_me = false) =>
  Gateway.post("users/login", { email, password, remember_me });

const googleLoginValidate = (idToken, tokenType) =>
  Gateway.post("auth/google-signin", { idToken, tokenType });

const getUserProfile = () => Gateway.get("user/profile");

const getUserDetail = (userId) => Gateway.get(`users/getuserdetail/${userId}`);

// IMPORTANT: For FormData, do NOT manually set content-type
const editUserProfile = (formData) => Gateway.patch("user/profile", formData);

const forgotPassword = (email) => Gateway.post("users/forgotpassword", { email });

const resetPassword = (token, userId, password, confirmPassword) => Gateway.post("users/resetpassword", { token, userId, password, confirmPassword });

const changePassword = ({ current_password, new_password, confirm_password }) =>
  Gateway.post("users/change_password", { current_password, new_password, confirm_password });

const updateUserDetails = ({ name, email, phone, avatar }) =>
  Gateway.post("users/update_user_details", { name, email, phone, avatar });

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
