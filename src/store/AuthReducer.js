import { create } from 'zustand';
import authService from '../services/authService';
import { getAuthData, removeItem, setItem, getItem } from '../helpers/localStorage';
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
  isProfileFetchLoading: false,
  login: async ({ email, password, remember_me = false }) => {
    try {
      set({ isLoginLoading: true, errorMessage: "" });

      const { data } = await authService.doLoginValidate(email, password, remember_me);

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
      // Store userid in localStorage for refresh persistence
      if (data?.userid) setItem("userid", data.userid);

      set({
        authData,
        isLoggedIn: true,
        isLoginLoading: false,
        errorMessage: "",
      });
      const { success } = useAlertReducer.getState();
      success(data && data.message);

      // If token and userid exist, fetch user details
      if (accessToken && data?.userid) {
        const { getUserProfile } = useAuthReducer.getState();
        getUserProfile(data.userid);
      }
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
    removeItem('userid');
  },
  getUserProfile: async (userId = null) => {
    try {
      set({ isProfileFetchLoading: true });

      // Get userId from parameter, authData state, or localStorage
      const state = useAuthReducer.getState();
      const finalUserId = userId || state.authData?.userid || getItem('userid');

      if (!finalUserId) {
        throw new Error("User ID is required to fetch user profile");
      }

      // Always use getUserDetail endpoint
      const response = await authService.getUserDetail(finalUserId);
      const profileData = response.data?.data || response.data;

      set({
        profileData,
        userProfile: profileData,
        isProfileFetchLoading: false
      });
    } catch (err) {
      // Always return success with fallback profile data
      const state = useAuthReducer.getState();
      const authData = state.authData || {};
      
      // Create fallback profile data based on available auth data
      const fallbackProfileData = {
        userid: authData.userid || userId || getItem('userid'),
        name: authData.name || 'User',
        email: authData.email || '',
        status: authData.status || 'active',
        role: 'user', // Default role
        ...authData
      };

      set({
        profileData: fallbackProfileData,
        userProfile: fallbackProfileData,
        isProfileFetchLoading: false
      });
      
      // Optionally log the error without affecting the user experience
      console.warn('getUserDetail API failed, using fallback profile:', err?.response?.data?.message ?? err.message);
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
