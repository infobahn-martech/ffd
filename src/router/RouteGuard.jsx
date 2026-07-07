import { Navigate, useLocation } from 'react-router-dom';
import useAuthReducer from '../store/AuthReducer';
import { hasRouteAccess } from './rolePermissions';
import { ROUTE_PATHS } from './paths';
import {
  isRestrictedBoardUser,
  isRestrictedUserAllowedPath,
  RESTRICTED_BOARD_HOME_PATH,
} from '../shared/helpers/restrictedBoardUser';
import {
  isVendorRole,
  isVendorRoleAllowedPath,
  getVendorDashboardByRole,
  getRoleId,
} from '../shared/helpers/vendorDashboardRoles';

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

  if (isRestrictedBoardUser(userProfile)) {
    if (!isRestrictedUserAllowedPath(currentPath)) {
      return <Navigate to={RESTRICTED_BOARD_HOME_PATH} replace />;
    }
    return children;
  }

  const vendorRoleId = getRoleId();
  if (isVendorRole(vendorRoleId)) {
    if (!isVendorRoleAllowedPath(vendorRoleId, currentPath)) {
      return <Navigate to={getVendorDashboardByRole(vendorRoleId).dashboardPath} replace />;
    }
    return children;
  }

  // Check if user has access to this route
  if (!hasRouteAccess(userRoleId, currentPath)) {
    // User doesn't have permission, redirect to dashboard
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  // User has access, render the route
  return children;
}

export default RouteGuard;
