import { useState, useEffect } from 'react';
import CustomModal from '../../components/CustomModal';
import { FiAnchor, FiDollarSign, FiClock, FiCheck, FiX, FiAlertCircle, FiCheckCircle, FiTruck, FiUsers, FiFileText, FiMapPin } from 'react-icons/fi';
import useNotificationReducer from '../../store/NotificationReducer';
import '../../design/scss/common.scss';
import '../../design/scss/structure/header/NotificationsModal.scss';

// Maps a notification's `status` to an icon until the backend sends its own icon key.
const STATUS_ICON_MAP = {
  arrived: FiAnchor,
  departure: FiAlertCircle,
  appointment: FiClock,
  payment: FiDollarSign,
  invoice: FiDollarSign,
  cleared: FiCheckCircle,
  crew: FiUsers,
  inspection: FiFileText,
  transport: FiTruck,
  port: FiMapPin,
};

function NotificationsModal({ show, onClose }) {
  const [showAll, setShowAll] = useState(false);
  const notifications = useNotificationReducer((state) => state.notifications);
  const isLoading = useNotificationReducer((state) => state.isLoading);
  const getAll = useNotificationReducer((state) => state.getAll);
  const markAllAsRead = useNotificationReducer((state) => state.markAllAsRead);

  useEffect(() => {
    if (show) {
      getAll();
    } else {
      setShowAll(false);
    }
  }, [show, getAll]);

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 3);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const renderHeader = () => (
    <div className="notifications-modal-header">
      <h2 className="notifications-title">Notifications</h2>
      <div className="notifications-header-actions">
        <button
          className="mark-all-read-btn"
          onClick={handleMarkAllAsRead}
          type="button"
        >
          <FiCheck />
          Mark all as read
        </button>
        <button
          className="notifications-close-btn"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <FiX />
        </button>

      </div>
    </div >
  );

  const formatMessage = (message, highlightedText, highlightedColor) => {
    if (!message) return null;
    // First, replace the highlighted text with a special marker
    const parts = highlightedText ? message.split(`**${highlightedText}**`) : [message];
    const elements = [];
    let keyCounter = 0;

    parts.forEach((part, index) => {
      if (part) {
        // Process bolded text in the part
        const boldRegex = /\*\*(.*?)\*\*/g;
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(part)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            elements.push(
              <span key={`text-${keyCounter++}`}>
                {part.substring(lastIndex, match.index)}
              </span>
            );
          }
          // Add bolded text
          elements.push(
            <strong key={`bold-${keyCounter++}`}>{match[1]}</strong>
          );
          lastIndex = match.index + match[0].length;
        }
        // Add remaining text after last match
        if (lastIndex < part.length) {
          elements.push(
            <span key={`text-${keyCounter++}`}>
              {part.substring(lastIndex)}
            </span>
          );
        }
      }
      // Add highlighted text between parts
      if (index < parts.length - 1) {
        elements.push(
          <strong key={`highlight-${keyCounter++}`} style={{ color: highlightedColor }}>
            {highlightedText}
          </strong>
        );
      }
    });

    return elements.length > 0 ? elements : message;
  };

  const renderBody = () => (
    <div className="notifications-modal-body">
      <div className="notifications-divider"></div>

      {isLoading ? (
        <p className="notifications-empty-state">Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <p className="notifications-empty-state">No notifications yet.</p>
      ) : (
        <>
          <div className="notifications-group">
            <h3 className="notifications-group-title">Today</h3>

            <div className="notifications-list">
              {displayedNotifications.map((notification) => {
                const IconComponent = STATUS_ICON_MAP[notification.status] || FiAlertCircle;
                const isRead = notification.isRead ?? notification.is_read ?? false;
                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.hasSuccessBackground ? 'success-background' : ''} ${isRead ? 'read' : ''}`}
                  >
                    <div className="notification-icon-wrapper">
                      <IconComponent className="notification-icon" />
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        {!isRead && <span className="notification-dot"></span>}
                        <h4 className="notification-title">{notification.title}</h4>
                        <span className="notification-timestamp">{notification.timestamp}</span>
                      </div>
                      <p className="notification-message">
                        {formatMessage(
                          notification.message,
                          notification.highlightedText,
                          notification.highlightedColor
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="notifications-divider"></div>

          <div className="notifications-footer-link">
            <button
              className="view-all-notifications-btn"
              onClick={() => setShowAll(!showAll)}
              type="button"
            >
              {showAll ? 'Show less' : `View all notifications (${notifications.length})`}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <CustomModal
      className="modal fade show notifications-modal"
      dialgName="modal-dialog modal-dialog-centered"
      show={show}
      closeModal={onClose}
      header={renderHeader()}
      body={renderBody()}
    />
  );
}

export default NotificationsModal;

