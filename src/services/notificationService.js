import Gateway from '../gateway/gateway';

// Endpoint paths are placeholders pending the backend notification-feed API;
// update these once the real routes are defined.
const notificationService = {
  getAll: ({ params } = {}) => Gateway.get('/notification/get_notification_list', { params }),
  markAllAsRead: () => Gateway.post('/notification/mark_all_as_read'),
  markAsRead: (notificationId) => Gateway.post(`/notification/mark_as_read/${notificationId}`),
};

export default notificationService;
