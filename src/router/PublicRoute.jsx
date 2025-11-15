import { GoogleOAuthProvider } from '@react-oauth/google';
import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { siteConfig } from '../config';
import useAuthReducer from '../store/AuthReducer';

function PublicRoutes() {
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);
  return (
    <Suspense fallback={<div />}>
      <GoogleOAuthProvider
        clientId={siteConfig.google_auth_creds.GOOGLE_CLIENT_ID}
      >
        {isLoggedIn ? (
          <Navigate to="/dashboard" />
        ) : (
          <div className="outer">
            <Outlet />
          </div>
        )}
      </GoogleOAuthProvider>
    </Suspense>
  );
}

export default PublicRoutes;
