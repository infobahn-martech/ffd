import PropTypes from 'prop-types';
import { FiInbox, FiSend, FiFileText, FiEdit, FiExternalLink } from 'react-icons/fi';

const FOLDER_ICONS = {
  inbox: FiInbox,
  sentitems: FiSend,
  drafts: FiFileText,
};

const FOLDER_LABELS = {
  inbox: 'Inbox',
  sentitems: 'Sent',
  drafts: 'Drafts',
};

const OutlookFolderNav = ({ folders, activeFolder, onSelectFolder, onCompose }) => (
  <div className="outlook-folder-nav">
    <button type="button" className="outlook-compose-btn" onClick={onCompose}>
      <FiEdit size={16} aria-hidden />
      <span>Compose</span>
    </button>

    <div className="outlook-folder-list">
      {folders.map((folder) => {
        const Icon = FOLDER_ICONS[folder.key] || FiInbox;
        const isActive = folder.key === activeFolder;
        return (
          <button
            type="button"
            key={folder.key}
            className={`outlook-folder-item${isActive ? ' outlook-folder-item--active' : ''}`}
            onClick={() => onSelectFolder(folder.key)}
          >
            <Icon size={16} aria-hidden />
            <span className="outlook-folder-item-label">
              {FOLDER_LABELS[folder.key] || folder.displayName}
            </span>
            {folder.unreadItemCount > 0 && (
              <span className="outlook-folder-item-badge">{folder.unreadItemCount}</span>
            )}
          </button>
        );
      })}
    </div>

    <a
      className="outlook-open-in-outlook-link"
      href="https://outlook.office.com/mail/"
      target="_blank"
      rel="noopener noreferrer"
    >
      <FiExternalLink size={14} aria-hidden />
      <span>Open in Outlook</span>
    </a>
  </div>
);

OutlookFolderNav.propTypes = {
  folders: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      displayName: PropTypes.string,
      unreadItemCount: PropTypes.number,
    })
  ).isRequired,
  activeFolder: PropTypes.string.isRequired,
  onSelectFolder: PropTypes.func.isRequired,
  onCompose: PropTypes.func.isRequired,
};

export default OutlookFolderNav;
