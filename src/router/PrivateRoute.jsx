import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthReducer from '../store/AuthReducer';
import { getItem } from '../shared/helpers/localStorage';

function PrivateRoutes() {
  const location = useLocation();
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);
  const getUserProfile = useAuthReducer((state) => state.getUserProfile);
  const isProfileFetchLoading = useAuthReducer(
    (state) => state.isProfileFetchLoading
  );
  const userProfile = useAuthReducer((state) => state.userProfile);
  const authData = useAuthReducer((state) => state.authData);

  useEffect(() => {
    if (!getItem('accessToken')) return;
    const userId = authData?.userid || getItem('userid');
    if (!userId) return;
    // Always refresh profile from getuserdetail on app load so role_id stays authoritative
    getUserProfile(userId, false);
  }, [authData?.userid, getUserProfile]);

  if (isProfileFetchLoading)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border " role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (!isLoggedIn) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Ensure user profile is loaded
  if (!userProfile || !userProfile.role) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

export default PrivateRoutes;
