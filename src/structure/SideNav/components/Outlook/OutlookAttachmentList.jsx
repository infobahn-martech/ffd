import PropTypes from 'prop-types';
import { FiPaperclip, FiDownload } from 'react-icons/fi';

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const OutlookAttachmentList = ({ attachments, isLoading }) => {
  if (isLoading) {
    return <div className="outlook-attachment-list-loading">Loading attachments…</div>;
  }
  if (!attachments.length) return null;

  return (
    <div className="outlook-attachment-list">
      {attachments.map((attachment) => {
        const href =
          attachment.contentBytes && !attachment.isInline
            ? `data:${attachment.contentType};base64,${attachment.contentBytes}`
            : null;
        return (
          <a
            key={attachment.id}
            className="outlook-attachment-chip"
            href={href || undefined}
            download={href ? attachment.name : undefined}
            role={href ? undefined : 'note'}
          >
            <FiPaperclip size={14} aria-hidden />
            <span className="outlook-attachment-chip-name">{attachment.name}</span>
            <span className="outlook-attachment-chip-size">{formatSize(attachment.size)}</span>
            {href && <FiDownload size={14} aria-hidden />}
          </a>
        );
      })}
    </div>
  );
};

OutlookAttachmentList.propTypes = {
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      contentType: PropTypes.string,
      size: PropTypes.number,
      isInline: PropTypes.bool,
      contentBytes: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default OutlookAttachmentList;
