import { create } from 'zustand';
import outlookService from '../services/outlookService';
import useAlertReducer from './AlertReducer';

const graphErrorMessage = (err, fallback) =>
  err?.response?.data?.error?.message ?? err?.message ?? fallback;

const useOutlookReducer = create((set, get) => ({
  // Folders
  isLoadingFolders: false,
  folders: [],
  activeFolder: 'inbox',
  foldersError: null,

  getFolders: async () => {
    try {
      set({ isLoadingFolders: true, foldersError: null });
      const folders = await outlookService.getFolders();
      set({ folders, isLoadingFolders: false });
    } catch (err) {
      set({ isLoadingFolders: false, foldersError: graphErrorMessage(err, 'Failed to load folders.') });
    }
  },

  setActiveFolder: (folderKey) =>
    set({ activeFolder: folderKey, selectedMessage: null, selectedMessageError: null }),

  // Messages (per-folder cache + pagination)
  isLoadingMessages: false,
  isLoadingMore: false,
  messagesByFolder: {},
  nextLinkByFolder: {},
  messagesError: null,
  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  loadMessages: async (folderKey, { search } = {}) => {
    try {
      set({ isLoadingMessages: true, messagesError: null });
      const { messages, nextLink } = await outlookService.getMessages(folderKey, { search });
      set((state) => ({
        messagesByFolder: { ...state.messagesByFolder, [folderKey]: messages },
        nextLinkByFolder: { ...state.nextLinkByFolder, [folderKey]: nextLink },
        isLoadingMessages: false,
      }));
    } catch (err) {
      set({ isLoadingMessages: false, messagesError: graphErrorMessage(err, 'Failed to load messages.') });
    }
  },

  loadMoreMessages: async (folderKey) => {
    const nextLink = get().nextLinkByFolder[folderKey];
    if (!nextLink) return;
    try {
      set({ isLoadingMore: true });
      const { messages, nextLink: newNextLink } = await outlookService.getMessages(folderKey, { nextLink });
      set((state) => ({
        messagesByFolder: {
          ...state.messagesByFolder,
          [folderKey]: [...(state.messagesByFolder[folderKey] ?? []), ...messages],
        },
        nextLinkByFolder: { ...state.nextLinkByFolder, [folderKey]: newNextLink },
        isLoadingMore: false,
      }));
    } catch (err) {
      set({ isLoadingMore: false });
      useAlertReducer.getState().error(graphErrorMessage(err, 'Failed to load more messages.'));
    }
  },

  // Selected message / preview
  selectedMessage: null,
  isLoadingSelectedMessage: false,
  selectedMessageError: null,
  attachments: [],
  isLoadingAttachments: false,

  selectMessage: async (messageId) => {
    try {
      set({
        isLoadingSelectedMessage: true,
        selectedMessageError: null,
        selectedMessage: null,
        attachments: [],
      });
      const message = await outlookService.getMessageById(messageId);
      set({ selectedMessage: message, isLoadingSelectedMessage: false });

      if (message.hasAttachments) {
        set({ isLoadingAttachments: true });
        const attachments = await outlookService.getAttachments(messageId);
        set({ attachments, isLoadingAttachments: false });
      }
    } catch (err) {
      set({
        isLoadingSelectedMessage: false,
        isLoadingAttachments: false,
        selectedMessageError: graphErrorMessage(err, 'Failed to load message.'),
      });
    }
  },

  clearSelectedMessage: () => set({ selectedMessage: null, attachments: [], selectedMessageError: null }),

  // Compose / reply / forward
  isSending: false,

  sendMail: async (payload, { cb, onSettled } = {}) => {
    try {
      set({ isSending: true });
      await outlookService.sendMail(payload);
      set({ isSending: false });
      useAlertReducer.getState().success('Message sent.');
      cb && cb();
    } catch (err) {
      set({ isSending: false });
      useAlertReducer.getState().error(graphErrorMessage(err, 'Failed to send message.'));
    } finally {
      onSettled && onSettled();
    }
  },

  replyToMessage: async (messageId, payload, { cb, onSettled } = {}) => {
    try {
      set({ isSending: true });
      await outlookService.replyToMessage(messageId, payload);
      set({ isSending: false });
      useAlertReducer.getState().success('Reply sent.');
      cb && cb();
    } catch (err) {
      set({ isSending: false });
      useAlertReducer.getState().error(graphErrorMessage(err, 'Failed to send reply.'));
    } finally {
      onSettled && onSettled();
    }
  },

  forwardMessage: async (messageId, payload, { cb, onSettled } = {}) => {
    try {
      set({ isSending: true });
      await outlookService.forwardMessage(messageId, payload);
      set({ isSending: false });
      useAlertReducer.getState().success('Message forwarded.');
      cb && cb();
    } catch (err) {
      set({ isSending: false });
      useAlertReducer.getState().error(graphErrorMessage(err, 'Failed to forward message.'));
    } finally {
      onSettled && onSettled();
    }
  },

  // Microsoft sign-in / sign-out — independent of the Sedres AuthReducer
  isAuthenticating: false,
  authError: null,

  signIn: async () => {
    try {
      set({ isAuthenticating: true, authError: null });
      await outlookService.login();
      set({ isAuthenticating: false });
    } catch (err) {
      set({ isAuthenticating: false, authError: graphErrorMessage(err, 'Sign-in failed.') });
    }
  },

  signOut: async () => {
    await outlookService.logout();
    get().resetOutlookState();
  },

  resetOutlookState: () =>
    set({
      folders: [],
      activeFolder: 'inbox',
      messagesByFolder: {},
      nextLinkByFolder: {},
      selectedMessage: null,
      attachments: [],
      messagesError: null,
      selectedMessageError: null,
      foldersError: null,
      searchQuery: '',
    }),
}));

export default useOutlookReducer;
