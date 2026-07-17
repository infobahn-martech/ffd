import { useMemo } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { FiAlertCircle, FiCornerUpLeft, FiCornerUpRight, FiMail } from 'react-icons/fi';
import OutlookAttachmentList from './OutlookAttachmentList';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const SANITIZE_CONFIG = {
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus'],
  ALLOW_DATA_ATTR: false,
};

const formatRecipients = (recipients) =>
  (recipients || [])
    .map((r) => r.emailAddress?.name || r.emailAddress?.address)
    .filter(Boolean)
    .join(', ');

const OutlookMessagePreview = ({
  message,
  attachments,
  isLoading,
  isLoadingAttachments,
  error,
  onReply,
  onReplyAll,
  onForward,
}) => {
  const sanitizedHtml = useMemo(() => {
    if (!message?.body?.content) return '';
    return DOMPurify.sanitize(message.body.content, SANITIZE_CONFIG);
  }, [message]);

  if (error) {
    return (
      <div className="outlook-message-preview outlook-message-preview-empty">
        <FiAlertCircle size={20} aria-hidden />
        <span>{error}</span>
      </div>
    );
  }

  if (isLoading) {
    return <div className="outlook-message-preview outlook-message-preview-empty">Loading message…</div>;
  }

  if (!message) {
    return (
      <div className="outlook-message-preview outlook-message-preview-empty">
        <FiMail size={28} aria-hidden />
        <span>Select a message to read</span>
      </div>
    );
  }

  const fromName = message.from?.emailAddress?.name || message.from?.emailAddress?.address || 'Unknown sender';

  return (
    <div className="outlook-message-preview">
      <div className="outlook-message-preview-header">
        <h4 className="outlook-message-preview-subject">{message.subject || '(No subject)'}</h4>
        <div className="outlook-message-preview-meta">
          <div>
            <strong>{fromName}</strong>
            {message.toRecipients?.length > 0 && (
              <span className="outlook-message-preview-to"> to {formatRecipients(message.toRecipients)}</span>
            )}
          </div>
          <span className="outlook-message-preview-date">
            {message.receivedDateTime ? new Date(message.receivedDateTime).toLocaleString() : ''}
          </span>
        </div>
        <div className="outlook-message-preview-actions">
          <button type="button" onClick={() => onReply(message)}>
            <FiCornerUpLeft size={14} aria-hidden /> Reply
          </button>
          <button type="button" onClick={() => onReplyAll(message)}>
            <FiCornerUpLeft size={14} aria-hidden /> Reply All
          </button>
          <button type="button" onClick={() => onForward(message)}>
            <FiCornerUpRight size={14} aria-hidden /> Forward
          </button>
        </div>
      </div>

      <OutlookAttachmentList attachments={attachments} isLoading={isLoadingAttachments} />

      <div className="outlook-message-body" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </div>
  );
};

OutlookMessagePreview.propTypes = {
  message: PropTypes.object,
  attachments: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isLoadingAttachments: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onReply: PropTypes.func.isRequired,
  onReplyAll: PropTypes.func.isRequired,
  onForward: PropTypes.func.isRequired,
};

OutlookMessagePreview.defaultProps = {
  message: null,
  error: null,
};

export default OutlookMessagePreview;
