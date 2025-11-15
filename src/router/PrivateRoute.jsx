import { Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthReducer from '../store/AuthReducer';
import { getItem } from '../helpers/localStorage';

function PrivateRoutes() {
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);
  const getUserProfile = useAuthReducer((state) => state.getUserProfile);
  const isProfileFetchLoading = useAuthReducer(
    (state) => state.isProfileFetchLoading,
  );

  useEffect(() => {
    if (getItem('accessToken')) getUserProfile();
  }, []);

  if (isProfileFetchLoading)
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border " role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return isLoggedIn ? <Outlet /> : <Navigate to="/" />;
}

export default PrivateRoutes;
