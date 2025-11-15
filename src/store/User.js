import { create } from 'zustand';
import userService from '../services/userService';
import useAlertReducer from './AlertReducer';
import useAuthReducer from './AuthReducer';

const useUserReducer = create((set) => ({
  isLoading: false,
  errorMessage: '',
  successMessage: '',
  changePassword: async ({ currentPassword, newPassword }) => {
    try {
      set({ isLoading: true });
      const { data } = await userService.changePasswordValidate(
        currentPassword,
        newPassword,
      );
      set({ isLoading: false });
      const { success } = useAlertReducer.getState();
      success(data && data.message);
      if (success) {
        const { doLogout } = useAuthReducer.getState();
        doLogout();
      }
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({
        errorMessage: 'Something went wrong fetching user',
        isLoginLoading: false,
      });
      error(err?.response?.data?.message ?? err.message);
    }
  },
}));

export default useUserReducer;
