import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import { useIsAuthenticated } from '@azure/msal-react';
import useOutlookReducer from '../../../store/OutlookReducer';
import OutlookSignInPrompt from './Outlook/OutlookSignInPrompt';
import OutlookFolderNav from './Outlook/OutlookFolderNav';
import OutlookMessageList from './Outlook/OutlookMessageList';
import OutlookMessagePreview from './Outlook/OutlookMessagePreview';
import NewOutlookMailModal from './Outlook/NewOutlookMailModal';
import '../../../design/scss/outlook-modal.scss';

const OutlookModal = ({ show, onClose }) => {
  const isAuthenticated = useIsAuthenticated();

  const isAuthenticating = useOutlookReducer((s) => s.isAuthenticating);
  const authError = useOutlookReducer((s) => s.authError);
  const signIn = useOutlookReducer((s) => s.signIn);

  const folders = useOutlookReducer((s) => s.folders);
  const activeFolder = useOutlookReducer((s) => s.activeFolder);
  const getFolders = useOutlookReducer((s) => s.getFolders);
  const setActiveFolder = useOutlookReducer((s) => s.setActiveFolder);

  const messagesByFolder = useOutlookReducer((s) => s.messagesByFolder);
  const nextLinkByFolder = useOutlookReducer((s) => s.nextLinkByFolder);
  const isLoadingMessages = useOutlookReducer((s) => s.isLoadingMessages);
  const isLoadingMore = useOutlookReducer((s) => s.isLoadingMore);
  const messagesError = useOutlookReducer((s) => s.messagesError);
  const searchQuery = useOutlookReducer((s) => s.searchQuery);
  const setSearchQuery = useOutlookReducer((s) => s.setSearchQuery);
  const loadMessages = useOutlookReducer((s) => s.loadMessages);
  const loadMoreMessages = useOutlookReducer((s) => s.loadMoreMessages);

  const selectedMessage = useOutlookReducer((s) => s.selectedMessage);
  const isLoadingSelectedMessage = useOutlookReducer((s) => s.isLoadingSelectedMessage);
  const selectedMessageError = useOutlookReducer((s) => s.selectedMessageError);
  const attachments = useOutlookReducer((s) => s.attachments);
  const isLoadingAttachments = useOutlookReducer((s) => s.isLoadingAttachments);
  const selectMessage = useOutlookReducer((s) => s.selectMessage);
  const clearSelectedMessage = useOutlookReducer((s) => s.clearSelectedMessage);
  const resetOutlookState = useOutlookReducer((s) => s.resetOutlookState);

  const [composeState, setComposeState] = useState(null); // { mode, sourceMessage }

  useEffect(() => {
    if (show && isAuthenticated) {
      getFolders();
      loadMessages('inbox');
    }
    if (!show) {
      resetOutlookState();
      clearSelectedMessage();
      setComposeState(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, isAuthenticated]);

  const handleSelectFolder = (folderKey) => {
    setActiveFolder(folderKey);
    loadMessages(folderKey, { search: searchQuery });
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    loadMessages(activeFolder, { search: query });
  };

  const handleRefresh = () => {
    loadMessages(activeFolder, { search: searchQuery });
  };

  const closeCompose = () => setComposeState(null);

  return (
    <Modal show={show} onHide={onClose} className="outlook-modal" centered size="xl">
      <Modal.Header className="outlook-modal-header">
        <Modal.Title className="outlook-modal-title">Outlook</Modal.Title>
        <button type="button" className="outlook-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={20} />
        </button>
      </Modal.Header>

      <Modal.Body className="outlook-modal-body">
        {!isAuthenticated ? (
          <OutlookSignInPrompt
            isAuthenticating={isAuthenticating}
            authError={authError}
            onSignIn={signIn}
          />
        ) : (
          <>
            <OutlookFolderNav
              folders={folders}
              activeFolder={activeFolder}
              onSelectFolder={handleSelectFolder}
              onCompose={() => setComposeState({ mode: 'new', sourceMessage: null })}
            />
            <OutlookMessageList
              messages={messagesByFolder[activeFolder] ?? []}
              isLoading={isLoadingMessages}
              isLoadingMore={isLoadingMore}
              hasMore={Boolean(nextLinkByFolder[activeFolder])}
              error={messagesError}
              selectedMessageId={selectedMessage?.id ?? null}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              onSelectMessage={selectMessage}
              onRefresh={handleRefresh}
              onLoadMore={() => loadMoreMessages(activeFolder)}
            />
            <OutlookMessagePreview
              message={selectedMessage}
              attachments={attachments}
              isLoading={isLoadingSelectedMessage}
              isLoadingAttachments={isLoadingAttachments}
              error={selectedMessageError}
              onReply={(message) => setComposeState({ mode: 'reply', sourceMessage: message })}
              onReplyAll={(message) => setComposeState({ mode: 'replyAll', sourceMessage: message })}
              onForward={(message) => setComposeState({ mode: 'forward', sourceMessage: message })}
            />
          </>
        )}
      </Modal.Body>

      {composeState && (
        <NewOutlookMailModal
          show={Boolean(composeState)}
          onClose={closeCompose}
          mode={composeState.mode}
          sourceMessage={composeState.sourceMessage}
        />
      )}
    </Modal>
  );
};

OutlookModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default OutlookModal;
