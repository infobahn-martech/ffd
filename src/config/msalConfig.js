import { PublicClientApplication, LogLevel, InteractionRequiredAuthError } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
    postLogoutRedirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: () => {},
      logLevel: LogLevel.Warning,
    },
  },
};

// Requested at loginPopup time.
export const loginRequest = { scopes: ['User.Read', 'Mail.Read', 'Mail.Send'] };

// Requested for each Graph mail call via acquireTokenSilent.
// Mail.ReadWrite intentionally omitted — no current operation needs it
// (mark read/unread, drafts, delete). Add it here + re-consent if that changes.
export const graphMailScopes = ['Mail.Read', 'Mail.Send'];

export const msalInstance = new PublicClientApplication(msalConfig);

export { InteractionRequiredAuthError };
