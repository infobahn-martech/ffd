import { create } from 'zustand';
import authService from '../services/authService';
import { getAuthData, removeItem, setItem } from '../helpers/localStorage';
import useAlertReducer from './AlertReducer';

const { isLoggedIn } = getAuthData();

const useAuthReducer = create((set) => ({
  authData: null,
  userProfile: null,
  isLoginLoading: false,
  isLoggedIn,
  errorMessage: '',
  successMessage: '',
  profileData: null,
  profileEditLoader: null,
  login: async ({ email, password }) => {
    try {
      set({ isLoginLoading: true, errorMessage: "" });

      const { data } = await authService.doLoginValidate(email, password);

      // ✅ token location based on your response
      const accessToken = data?.token;

      // ✅ user data from response
      const authData = {
        userid: data?.userid,
        name: data?.name,
        email: data?.email,
        status: data?.status,
        message: data?.message,
      };

      if (accessToken) setItem("accessToken", accessToken);

      set({
        authData,
        isLoggedIn: true,
        isLoginLoading: false,
        errorMessage: "",
      });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Login failed. Please try again.",
        isLoginLoading: false,
      });
      error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again."
      );
    }
  },
  googleLogin: async ({ token, tokenType }) => {
    try {
      set({ isLoginLoading: true });
      const { data } = await authService.googleLoginValidate(
        token.access_token,
        tokenType,
      );
      const authData = data.data.userData;
      setItem('accessToken', data.data.token.accessToken);
      setItem('refreshToken', data.data.token.refreshToken);
      set({ authData, isLoggedIn: true, isLoginLoading: false });
    } catch (err) {
      set({
        errorMessage: err?.response?.data?.message ?? err?.message,
        isLoginLoading: false,
      });
    }
  },
  doLogout: () => {
    set({
      userProfile: null,
      authData: null,
      successMessage: '',
      isLoggedIn: false,
      errorMessage: null,
    });
    removeItem('accessToken');
    removeItem('refreshToken');
  },
  getUserProfile: async () => {
    try {
      set({ isProfileFetchLoading: true });
      const { data } = await authService.getUserProfile();
      const profileData = data.data;
      set({ profileData, isProfileFetchLoading: false });
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        isProfileFetchLoading: false,
        isLoggedIn: false,
      });
      error(err?.response?.data?.message ?? err.message);
      removeItem('accessToken');
      removeItem('refreshToken');
    }
  },

  patchUserProfile: async ({ value, cb }) => {
    try {
      set({ profileEditLoader: true });
      const { data } = await authService.editUserProfile(value);
      const profileData = data.data;
      set({ profileData, profileEditLoader: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      cb && cb();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong updating user profile',
        profileEditLoader: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
  forgotPassword: async ({ email }) => {
    try {
      set({ isLoginLoading: true, errorMessage: "" });
      const { data } = await authService.forgotPassword(email);
      set({ isLoginLoading: false, errorMessage: "" });
      const { success } = useAlertReducer.getState();
      success(data?.message || "Password reset link sent to your email");
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to send reset link. Please try again.",
        isLoginLoading: false,
      });
      error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to send reset link. Please try again."
      );
    }
  },
}));

export default useAuthReducer;
