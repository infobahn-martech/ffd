import RouteGuard from './RouteGuard';

// Thin, named entry point for routes that want to declare permission
// metadata (module/submodule/action keys from the new permission system),
// e.g.:
//   <PermissionRoute moduleKey={PERMISSION_MODULES.USER_MANAGEMENT} actionKey={PERMISSION_ACTIONS.VIEW}>
//     <Users />
//   </PermissionRoute>
// Delegates to RouteGuard, which already ORs the existing role-based route
// table with this permission check — see RouteGuard.jsx.
function PermissionRoute(props) {
  return <RouteGuard {...props} />;
}

export default PermissionRoute;
