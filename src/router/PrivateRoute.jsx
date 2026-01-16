import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthReducer from '../store/AuthReducer';
import { getItem } from '../helpers/localStorage';

function PrivateRoutes() {
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);
  const getUserProfile = useAuthReducer((state) => state.getUserProfile);
  const isProfileFetchLoading = useAuthReducer(
    (state) => state.isProfileFetchLoading
  );
  const userProfile = useAuthReducer((state) => state.userProfile);
  const authData = useAuthReducer((state) => state.authData);

  useEffect(() => {
    if (getItem('accessToken')) {
      // Only fetch if profile doesn't exist or doesn't have role
      if (!userProfile || !userProfile.role) {
        // Get userId from authData state or localStorage (for refresh scenario)
        const userId = authData?.userid || getItem('userid');
        getUserProfile(userId);
      }
    }
  }, []);

  if (isProfileFetchLoading)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border " role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (!isLoggedIn) {
    return <Navigate to="/" />;
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
