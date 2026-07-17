import PropTypes from 'prop-types';
import moment from 'moment';
import { FiPaperclip } from 'react-icons/fi';

const OutlookMessageListItem = ({ message, isActive, onSelect }) => {
  const fromName = message.from?.emailAddress?.name || message.from?.emailAddress?.address || 'Unknown sender';

  return (
    <button
      type="button"
      className={`outlook-message-list-item${isActive ? ' outlook-message-list-item--active' : ''}${
        message.isRead ? '' : ' outlook-message-list-item--unread'
      }`}
      onClick={() => onSelect(message.id)}
    >
      {!message.isRead && <span className="outlook-message-list-item-dot" aria-hidden />}
      <div className="outlook-message-list-item-main">
        <div className="outlook-message-list-item-row">
          <span className="outlook-message-list-item-from">{fromName}</span>
          <span className="outlook-message-list-item-time">
            {message.receivedDateTime ? moment(message.receivedDateTime).fromNow() : ''}
          </span>
        </div>
        <div className="outlook-message-list-item-subject">{message.subject || '(No subject)'}</div>
        <div className="outlook-message-list-item-preview">
          {message.hasAttachments && <FiPaperclip size={12} aria-hidden />}
          <span>{message.bodyPreview}</span>
        </div>
      </div>
    </button>
  );
};

OutlookMessageListItem.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    subject: PropTypes.string,
    bodyPreview: PropTypes.string,
    isRead: PropTypes.bool,
    hasAttachments: PropTypes.bool,
    receivedDateTime: PropTypes.string,
    from: PropTypes.shape({
      emailAddress: PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
      }),
    }),
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default OutlookMessageListItem;
