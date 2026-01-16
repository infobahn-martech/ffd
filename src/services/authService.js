import Gateway from "../gateway/gateway";

const doLoginValidate = (email, password) =>
  Gateway.post("users/login", { email, password });

const googleLoginValidate = (idToken, tokenType) =>
  Gateway.post("auth/google-signin", { idToken, tokenType });

const getUserProfile = () => Gateway.get("user/profile");

const getUserDetail = (userId) => Gateway.get(`users/getuserdetail/${userId}`);

// IMPORTANT: For FormData, do NOT manually set content-type
const editUserProfile = (formData) => Gateway.patch("user/profile", formData);

const forgotPassword = (email) => Gateway.post("users/forgotpassword", { email });

export default {
  doLoginValidate,
  googleLoginValidate,
  getUserProfile,
  getUserDetail,
  editUserProfile,
  forgotPassword,
};
