import PropTypes from "prop-types";
import { useMemo } from "react";
import "../../../design/scss/attachments.scss";
import CircleTickIcon from "../../../assets/images/CircleTick.svg";
import AttachmentIcon from "../../../assets/images/Attachment.svg";

const FormSection = ({ icon, title, children }) => {
  return (
    <div className="cf-section">
      <div className="cf-section-header">
        <span className="cf-section-icon">
          <img src={icon} alt={title} />
        </span>
        <span className="cf-section-title">{title}</span>
      </div>
      <div className="cf-section-body">{children}</div>
    </div>
  );
};

FormSection.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const EmptySection = ({ message, buttonText, onButtonClick }) => {
  return (
    <div className="cf-empty-row">
      <p>{message}</p>
      <button className="cf-link-btn" onClick={onButtonClick} type="button">
        {buttonText}
      </button>
    </div>
  );
};

EmptySection.propTypes = {
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func,
};

const AttachmentItem = ({ attachment, onDownload, onDelete }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦',
      txt: '📋',
    };
    return iconMap[extension] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="attachment-item">
      <div className="attachment-icon">{getFileIcon(attachment.fileName)}</div>
      <div className="attachment-details">
        <div className="attachment-name">{attachment.fileName || 'Untitled'}</div>
        <div className="attachment-meta">
          <span className="attachment-size">{formatFileSize(attachment.fileSize)}</span>
          <span className="attachment-separator">•</span>
          <span className="attachment-date">{formatDate(attachment.uploadedAt)}</span>
          {attachment.uploadedBy && (
            <>
              <span className="attachment-separator">•</span>
              <span className="attachment-uploader">by {attachment.uploadedBy}</span>
            </>
          )}
        </div>
      </div>
      <div className="attachment-actions">
        {onDownload && (
          <button
            className="attachment-action-btn download"
            onClick={() => onDownload(attachment)}
            type="button"
            title="Download"
          >
            ⬇️
          </button>
        )}
        {onDelete && (
          <button
            className="attachment-action-btn delete"
            onClick={() => onDelete(attachment)}
            type="button"
            title="Delete"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

AttachmentItem.propTypes = {
  attachment: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fileName: PropTypes.string,
    fileSize: PropTypes.number,
    uploadedAt: PropTypes.string,
    uploadedBy: PropTypes.string,
    fileUrl: PropTypes.string,
  }).isRequired,
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
};

const AttachmentList = ({ attachments, onDownload, onDelete }) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="cf-empty-row">
        <p>No attachments added.</p>
      </div>
    );
  }

  return (
    <div className="attachments-list">
      <div className="attachments-header">
        <span className="attachments-count">{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="attachments-items">
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

AttachmentList.propTypes = {
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      fileName: PropTypes.string,
      fileSize: PropTypes.number,
      uploadedAt: PropTypes.string,
      uploadedBy: PropTypes.string,
      fileUrl: PropTypes.string,
    })
  ),
  onDownload: PropTypes.func,
  onDelete: PropTypes.func,
};

function Attachments({ card, formValues, handleChange }) {
  // Get attachments from card data or use dummy data for demo
  const attachments = useMemo(() => {
    if (card?.attachments && card.attachments.length > 0) {
      return card.attachments;
    }
    // Dummy data for demonstration
    return [
      {
        id: 1,
        fileName: 'Vessel_Documentation.pdf',
        fileSize: 2456789,
        uploadedAt: '2024-01-15T10:30:00Z',
        uploadedBy: 'John Doe',
        fileUrl: '#',
      },
      {
        id: 2,
        fileName: 'Customs_Clearance_Form.docx',
        fileSize: 123456,
        uploadedAt: '2024-01-14T14:20:00Z',
        uploadedBy: 'Jane Smith',
        fileUrl: '#',
      },
      {
        id: 3,
        fileName: 'Port_Arrival_Photo.jpg',
        fileSize: 3456789,
        uploadedAt: '2024-01-13T09:15:00Z',
        uploadedBy: 'Mike Johnson',
        fileUrl: '#',
      },
    ];
  }, [card?.attachments]);

  const handleDownload = (attachment) => {
    console.log('Download attachment:', attachment);
    // TODO: Implement download functionality
    if (attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    }
  };

  const handleDelete = (attachment) => {
    console.log('Delete attachment:', attachment);
    // TODO: Implement delete functionality
    if (window.confirm(`Are you sure you want to delete "${attachment.fileName}"?`)) {
      // Delete logic here
    }
  };

  return (
    <div className="cardform-body">
      <FormSection icon={CircleTickIcon} title="Attachments">
        <AttachmentList
          attachments={attachments}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      </FormSection>
    </div>
  );
}

Attachments.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Attachments;

