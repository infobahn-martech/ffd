import { create } from 'zustand';
import notificationService from '../services/notificationService';
import useAlertReducer from './AlertReducer';

const useNotificationReducer = create((set, get) => ({
  isLoading: false,
  notifications: [],

  getAll: async () => {
    try {
      set({ isLoading: true });
      const { data } = await notificationService.getAll();
      set({ notifications: data?.data || [], isLoading: false });
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ isLoading: false });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to fetch notifications');
    }
  },

  markAllAsRead: async () => {
    const previous = get().notifications;
    set({ notifications: previous.map((notif) => ({ ...notif, isRead: true })) });
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      const { error } = useAlertReducer.getState();
      set({ notifications: previous });
      error(err?.response?.data?.message ?? err.message ?? 'Failed to mark notifications as read');
    }
  },
}));

export default useNotificationReducer;
