import { Navigate, useLocation } from 'react-router-dom';
import useAuthReducer from '../store/AuthReducer';
import { hasRouteAccess } from './rolePermissions';
import { ROUTE_PATHS } from './paths';

function RouteGuard({ children }) {
  const location = useLocation();
  const userProfile = useAuthReducer((state) => state.userProfile);
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  // If profile is not loaded yet, show loading
  if (!userProfile || !userProfile.role) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Get user role ID
  const userRoleId = userProfile.role?.role_id;
  const currentPath = location.pathname;
  
  // Check if user has access to this route
  if (!hasRouteAccess(userRoleId, currentPath)) {
    // User doesn't have permission, redirect to dashboard
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }
  
  // User has access, render the route
  return children;
}

export default RouteGuard;
