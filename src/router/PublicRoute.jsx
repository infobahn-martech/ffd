import { Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import useAuthReducer from '../store/AuthReducer';

function PublicRoutes() {
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);
  return (
    <Suspense fallback={<div />}>
      {isLoggedIn ? (
        <Navigate to="/dashboard" />
      ) : (
        <div className="outer">
          <Outlet />
        </div>
      )}
    </Suspense>
  );
}

export default PublicRoutes;
