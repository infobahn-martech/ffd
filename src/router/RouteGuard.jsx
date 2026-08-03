import { Navigate, useLocation } from 'react-router-dom';
import useAuthReducer from '../store/AuthReducer';
import { hasRouteAccess } from './rolePermissions';
import { ROUTE_PATHS } from './paths';
import {
  isRestrictedBoardUser,
  isRestrictedUserAllowedPath,
  RESTRICTED_USER_FALLBACK_PATH,
} from '../shared/helpers/restrictedBoardUser';
import {
  isVendorRole,
  isVendorRoleAllowedPath,
  getVendorDashboardByRole,
  getRoleId,
} from '../shared/helpers/vendorDashboardRoles';
import { checkHasPermission } from '../shared/utils/permissions';
import { PERMISSION_MODULES, PERMISSION_ACTIONS } from '../shared/constants/permissions';

// `moduleKey`/`submoduleKey`/`actionKey` are optional permission metadata
// (new module/action permission system).
// - Default (permissionOnly=false): behaviour is unchanged from before this
//   system existed when no keys are passed; when keys ARE passed, access is
//   granted if EITHER the existing role-based route table (hasRouteAccess)
//   OR the new permission check passes.
//   Keep legacy role access until the role-based permission system is formally retired.
// - permissionOnly=true: for features that have been fully migrated to the
//   new permission system (e.g. User Management → Users), the legacy role
//   table is ignored entirely and the backend permission response is
//   authoritative. Use this only once a feature is confirmed migrated.
function RouteGuard({ children, moduleKey, submoduleKey, actionKey, permissionOnly = false }) {
  const location = useLocation();
  const userProfile = useAuthReducer((state) => state.userProfile);
  const isLoggedIn = useAuthReducer((state) => state.isLoggedIn);
  const permissionMap = useAuthReducer((state) => state.permissionMap);

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
      return <Navigate to={RESTRICTED_USER_FALLBACK_PATH} replace />;
    }
    // /workspaces is also this role class's fallback path (and Dashboard,
    // like every other path, is outside their allowed set), so unlike every
    // other allowed path here it still needs its own KANBAN_WORKSPACE check
    // — but denying it can't Navigate anywhere in this role's allowed set
    // without looping straight back into /workspaces, so render a terminal
    // "no access" state in place instead of redirecting.
    if (currentPath === '/workspaces' || currentPath.startsWith('/workspaces/')) {
      const allowedWorkspace = checkHasPermission(permissionMap, {
        moduleKey: PERMISSION_MODULES.KANBAN_WORKSPACE,
        actionKey: PERMISSION_ACTIONS.VIEW_WORKSPACE,
      });
      if (!allowedWorkspace) {
        return (
          <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <p className="text-muted mb-0">You don't have access to this page.</p>
          </div>
        );
      }
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

  // Check if user has access to this route (existing role table OR new
  // permission-key system — see the module-level comment above).
  const allowedByExistingRole = hasRouteAccess(userRoleId, currentPath);
  const allowedByPermission = moduleKey
    ? checkHasPermission(permissionMap, { moduleKey, submoduleKey, actionKey })
    : false;

  const allowed = permissionOnly ? allowedByPermission : (allowedByExistingRole || allowedByPermission);

  if (!allowed) {
    // User doesn't have permission, redirect to dashboard
    return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
  }

  // User has access, render the route
  return children;
}

export default RouteGuard;
