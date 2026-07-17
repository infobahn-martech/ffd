import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { EventType } from '@azure/msal-browser';
import router from './router';
import { msalInstance } from './config/msalConfig';

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
    msalInstance.setActiveAccount(event.payload.account);
  }
});

async function bootstrap() {
  await msalInstance.initialize();
  await msalInstance.handleRedirectPromise().catch(() => {});

  const accounts = msalInstance.getAllAccounts();
  if (accounts.length && !msalInstance.getActiveAccount()) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <MsalProvider instance={msalInstance}>
      <RouterProvider router={router} />
    </MsalProvider>
  );
}

bootstrap();
