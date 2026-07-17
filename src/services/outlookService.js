import axios from 'axios';
import {
  msalInstance,
  loginRequest,
  graphMailScopes,
  InteractionRequiredAuthError,
} from '../config/msalConfig';

const GraphClient = axios.create({ baseURL: 'https://graph.microsoft.com/v1.0' });

// Dedupe concurrent token acquisitions (e.g. getFolders fires 3 parallel
// requests) so they don't each trigger their own silent/popup flow.
let tokenPromise = null;

const acquireToken = async () => {
  const account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
  if (!account) throw new Error('NOT_AUTHENTICATED');

  try {
    const result = await msalInstance.acquireTokenSilent({ scopes: graphMailScopes, account });
    return result.accessToken;
  } catch (err) {
    if (err instanceof InteractionRequiredAuthError) {
      const result = await msalInstance.acquireTokenPopup({ scopes: graphMailScopes, account });
      return result.accessToken;
    }
    throw err;
  }
};

const getAccessToken = () => {
  if (!tokenPromise) {
    tokenPromise = acquireToken().finally(() => {
      tokenPromise = null;
    });
  }
  return tokenPromise;
};

GraphClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const login = async () => {
  const result = await msalInstance.loginPopup(loginRequest);
  msalInstance.setActiveAccount(result.account);
  return result.account;
};

const logout = async () => {
  const account = msalInstance.getActiveAccount();
  await msalInstance.logoutPopup({ account });
};

const WELL_KNOWN_FOLDERS = [
  { key: 'inbox', name: 'inbox' },
  { key: 'sentitems', name: 'sentitems' },
  { key: 'drafts', name: 'drafts' },
];

const getFolders = async () => {
  const results = await Promise.all(
    WELL_KNOWN_FOLDERS.map(({ name }) => GraphClient.get(`/me/mailFolders/${name}`))
  );
  return results.map(({ data }, index) => ({
    key: WELL_KNOWN_FOLDERS[index].key,
    id: data.id,
    displayName: data.displayName,
    unreadItemCount: data.unreadItemCount,
    totalItemCount: data.totalItemCount,
  }));
};

const MESSAGE_LIST_SELECT = 'id,subject,from,receivedDateTime,bodyPreview,isRead,hasAttachments';
const MESSAGE_DETAIL_SELECT =
  'id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,hasAttachments,isRead';

const getMessages = async (folderKey, { search, nextLink, top = 25 } = {}) => {
  const config = {};
  let url;

  if (nextLink) {
    url = nextLink;
  } else {
    url = `/me/mailFolders/${folderKey}/messages`;
    const params = { $top: top, $select: MESSAGE_LIST_SELECT };
    if (search) {
      params.$search = `"${search}"`;
      config.headers = { ConsistencyLevel: 'eventual' };
    } else {
      params.$orderby = 'receivedDateTime desc';
    }
    config.params = params;
  }

  const { data } = await GraphClient.get(url, config);
  return {
    messages: data.value ?? [],
    nextLink: data['@odata.nextLink'] ?? null,
  };
};

const getMessageById = (messageId) =>
  GraphClient.get(`/me/messages/${messageId}`, {
    params: { $select: MESSAGE_DETAIL_SELECT },
  }).then((res) => res.data);

const getAttachments = (messageId) =>
  GraphClient.get(`/me/messages/${messageId}/attachments`, {
    params: { $select: 'id,name,contentType,size,isInline,contentBytes' },
  }).then((res) => res.data.value ?? []);

const toRecipientList = (addresses = []) =>
  addresses.filter(Boolean).map((address) => ({ emailAddress: { address } }));

const sendMail = ({ subject, contentHtml, toRecipients, ccRecipients }) =>
  GraphClient.post('/me/sendMail', {
    message: {
      subject,
      body: { contentType: 'HTML', content: contentHtml },
      toRecipients: toRecipientList(toRecipients),
      ccRecipients: toRecipientList(ccRecipients),
    },
    saveToSentItems: true,
  });

const replyToMessage = (messageId, { comment, replyAll = false }) =>
  GraphClient.post(`/me/messages/${messageId}/${replyAll ? 'replyAll' : 'reply'}`, { comment });

const forwardMessage = (messageId, { comment, toRecipients }) =>
  GraphClient.post(`/me/messages/${messageId}/forward`, {
    comment,
    toRecipients: toRecipientList(toRecipients),
  });

export default {
  login,
  logout,
  getFolders,
  getMessages,
  getMessageById,
  getAttachments,
  sendMail,
  replyToMessage,
  forwardMessage,
};
