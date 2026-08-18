// Role-based route permissions configuration
// Roles: 1-Super Admin (legacy/mock), 2-Admin, 3-Port Admin, 4-Port Operator,
// 5-Port Manager, 6-Vendor, 7-Finance in lists below — API may assign Super Admin as role_id "7"
import { ROUTE_PATHS } from "./paths";

export const ROLE_IDS = {
  SUPER_ADMIN: "1",
  ADMIN: "2",
  PORT_ADMIN: "3",
  PORT_OPERATOR: "4",
  PORT_MANAGER: "5",
  VENDOR: "6",
  FINANCE: "7",
  CEO: "23",
};

/** Super Admin from API (role_name "Super Admin"); bypasses routePermissions like SUPER_ADMIN "1" */
export const SUPER_ADMIN_API_ROLE_ID = "7";

const hasUnrestrictedRouteAccess = (userRoleId) =>
  userRoleId === ROLE_IDS.SUPER_ADMIN ||
  userRoleId === SUPER_ADMIN_API_ROLE_ID ||
  userRoleId === ROLE_IDS.VENDOR;

// Define all routes with their allowed roles. Pruned to the routes the generic
// FFD foundation actually ships — see router/index.jsx. Most of these role
// combinations are inherited unchanged from Sedres; they should be revisited
// once FFD defines its own roles (see hasUnrestrictedRouteAccess above and the
// module/action permission system in shared/constants/permissions.js, which is
// the preferred path going forward — see RouteGuard.jsx).
export const routePermissions = {
  [ROUTE_PATHS.DASHBOARD]: [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR, ROLE_IDS.FINANCE],
  "/kanban-board": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/kanban-board/operator": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/workspaces": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/edit-workflow": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO, ROLE_IDS.VENDOR],
  "/roles": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN],
  "/permissions": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO],
  "/users": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO],
  "/activity-log": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO, ROLE_IDS.PORT_MANAGER],
  "/notification": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR, ROLE_IDS.FINANCE],
  "/settings": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.CEO],
};

// Helper function to check if a role has access to a route
export const hasRouteAccess = (userRoleId, routePath) => {
  if (hasUnrestrictedRouteAccess(userRoleId)) {
    return true;
  }

  // First, try exact match
  let allowedRoles = routePermissions[routePath];

  // If no exact match, check if routePath starts with any base route
  // This handles dynamic routes like /kanban-board/123 or /kanban-board/123/analytics
  if (!allowedRoles) {
    // Find matching base route by checking if routePath starts with any route in routePermissions
    const matchingRoute = Object.keys(routePermissions).find(baseRoute => {
      // Match exact route or route with trailing path segments
      // e.g., /kanban-board matches /kanban-board/123 or /kanban-board/123/analytics
      return routePath === baseRoute || routePath.startsWith(baseRoute + '/');
    });

    if (matchingRoute) {
      allowedRoles = routePermissions[matchingRoute];
    }
  }

  if (!allowedRoles) {
    return true; // Do not block valid app routes that are missing from config
  }

  return allowedRoles.includes(userRoleId);
};

// Get all allowed routes for a role
export const getAllowedRoutesForRole = (userRoleId) => {
  if (hasUnrestrictedRouteAccess(userRoleId)) {
    return Object.keys(routePermissions); // All routes
  }

  return Object.keys(routePermissions).filter(route =>
    routePermissions[route].includes(userRoleId)
  );
};
