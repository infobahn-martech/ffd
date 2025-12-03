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

const AttachmentItem = ({ attachment, onDownload, onDelete, cardColor }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';

    // PDF Icon
    if (extension === 'pdf') {
      return (
        <div className="file-icon-pdf">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#DC2626" />
            <text x="16" y="22" textAnchor="middle" fill="white" fontSize="10" fontWeight="600">PDF</text>
          </svg>
        </div>
      );
    }

    // Word/DOCX Icon
    if (['doc', 'docx'].includes(extension)) {
      return (
        <div className="file-icon-doc">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#2B579A" />
            <path d="M10 8H18L22 12V24C22 24.5523 21.5523 25 21 25H11C10.4477 25 10 24.5523 10 24V9C10 8.44772 10.4477 8 11 8Z" fill="white" opacity="0.9" />
            <path d="M18 8V12H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16H20M12 19H20M12 22H16" stroke="#2B579A" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    // Image Icon
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return (
        <div className="file-icon-image">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#10B981" />
            <rect x="6" y="8" width="20" height="14" rx="2" fill="white" opacity="0.9" />
            <circle cx="12" cy="13" r="2" fill="#10B981" />
            <path d="M6 20L10 16L14 20L20 14L26 20V22C26 22.5523 25.5523 23 25 23H7C6.44772 23 6 22.5523 6 22V20Z" fill="#10B981" />
          </svg>
        </div>
      );
    }

    // Excel Icon
    if (['xls', 'xlsx'].includes(extension)) {
      return (
        <div className="file-icon-excel">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#107C41" />
            <text x="16" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">XLS</text>
          </svg>
        </div>
      );
    }

    // Default Document Icon
    return (
      <div className="file-icon-default">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#6B7280" />
          <path d="M9 6H16L21 11V26C21 26.5523 20.5523 27 20 27H10C9.44772 27 9 26.5523 9 26V7C9 6.44772 9.44772 6 10 6Z" fill="white" opacity="0.9" />
          <path d="M16 6V11H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = Math.round(bytes / Math.pow(k, i) * 100) / 100;
    return size.toFixed(2) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${month} ${day}, ${year}, ${time}`;
  };

  return (
    <div className="attachment-item">
      <div className="attachment-icon-wrapper">
        {getFileIcon(attachment.fileName)}
      </div>
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
            style={{ "--card-color": cardColor }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12V3M9 12L6 9M9 12L12 9M3 15H15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            className="attachment-action-btn delete"
            onClick={() => onDelete(attachment)}
            type="button"
            title="Delete"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
  cardColor: PropTypes.string,
};

const AttachmentList = ({ attachments, onDownload, onDelete, cardColor }) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="cf-empty-row">
        <p>No attachments added.</p>
      </div>
    );
  }

  return (
    <div className="attachments-list">
      {/* <div className="attachments-count-header">
        <span className="attachments-count">{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
      </div> */}
      <div className="attachments-items">
        {attachments.map((attachment) => (
          <AttachmentItem
            key={attachment.id}
            attachment={attachment}
            onDownload={onDownload}
            onDelete={onDelete}
            cardColor={cardColor}
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
  cardColor: PropTypes.string,
};

function Attachments({ card, formValues, handleChange }) {
  const cardColor = card?.color || "#2A00FF";

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
        uploadedAt: '2024-01-15T14:30:00Z',
        uploadedBy: 'John Doe',
        fileUrl: '#',
      },
      {
        id: 2,
        fileName: 'Customs_Clearance_Form.docx',
        fileSize: 123456,
        uploadedAt: '2024-01-14T18:20:00Z',
        uploadedBy: 'Jane Smith',
        fileUrl: '#',
      },
      {
        id: 3,
        fileName: 'Port_Arrival_Photo.jpg',
        fileSize: 3456789,
        uploadedAt: '2024-01-13T13:15:00Z',
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
      <div className="cardform-left-full attachments-content-wrapper" style={{ "--card-color": cardColor }}>
        <div className="attachments-list-header">
          <h3 className="attachments-list-title">
            <span className="attachments-list-title-bar"></span>
            ATTACHMENT LIST
          </h3>
        </div>
        <AttachmentList
          attachments={attachments}
          onDownload={handleDownload}
          onDelete={handleDelete}
          cardColor={cardColor}
        />
      </div>
    </div>
  );
}

Attachments.propTypes = {
  card: PropTypes.object,
  formValues: PropTypes.object,
  handleChange: PropTypes.func,
};

export default Attachments;

