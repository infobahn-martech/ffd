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
      set({ isLoginLoading: true });
      const { data } = await authService.doLoginValidate(email, password);
      const authData = data.data.userData;
      setItem('accessToken', data.data.token.accessToken);
      setItem('refreshToken', data.data.token.refreshToken);
      set({ authData, isLoggedIn: true, isLoginLoading: false });
    } catch (err) {
      // const { error } = useAlertReducer.getState();
      set({
        errorMessage: err?.response?.data?.message ?? err?.message,
        isLoginLoading: false,
      });
      // error(err?.response?.data?.message ?? err.message);
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
}));

export default useAuthReducer;
