import Gateway from "../gateway/gateway";

const doLoginValidate = (email, password) =>
  Gateway.post("users/login", { email, password });

const googleLoginValidate = (idToken, tokenType) =>
  Gateway.post("auth/google-signin", { idToken, tokenType });

const getUserProfile = () => Gateway.get("user/profile");

// IMPORTANT: For FormData, do NOT manually set content-type
const editUserProfile = (formData) => Gateway.patch("user/profile", formData);

export default {
  doLoginValidate,
  googleLoginValidate,
  getUserProfile,
  editUserProfile,
};
