// Role-based route permissions configuration
// Roles: 1-Super Admin, 2-Admin, 3-Port Admin, 4-Port Operator, 5-Port Manager, 6-Vendor, 7-Finance

export const ROLE_IDS = {
  SUPER_ADMIN: "1",
  ADMIN: "2",
  PORT_ADMIN: "3",
  PORT_OPERATOR: "4",
  PORT_MANAGER: "5",
  VENDOR: "6",
  FINANCE: "7",
};

// Define all routes with their allowed roles
export const routePermissions = {
  "/dashboard": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR, ROLE_IDS.FINANCE],
  "/kanban-board": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/kanban-board/operator": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/compact": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/workspaces": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/edit-workflow": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.VENDOR],
  "/roles": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN],
  "/permissions": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN],
  "/users": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN],
  "/port-management": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN],
  "/vessel-types": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/barge-types": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/vessel-onboarding": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/billing-entity": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.FINANCE],
  "/customer-pricing": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.FINANCE],
  "/custom-inspection": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/crew-management": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/report-management": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_MANAGER, ROLE_IDS.FINANCE],
  "/activity-log": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_MANAGER],
  "/notification": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR, ROLE_IDS.FINANCE],
  "/appointment-acceptance": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/pre-arrival-information": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/driver-management": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/vehicle-management": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/driver-vehicle-mapping": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/check-list": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/hotel-management": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/material-type": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/packing-type": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/logistics-warehouse": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/status-management": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/custom-fields": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.VENDOR],
  "/job-status": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/group-email": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/billing-instruction": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.FINANCE],
  "/captains": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/fleet": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.PORT_MANAGER, ROLE_IDS.VENDOR],
  "/location": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/service-providers": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/transport-parties": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/waste-types": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN, ROLE_IDS.PORT_OPERATOR, ROLE_IDS.VENDOR],
  "/settings": [ROLE_IDS.SUPER_ADMIN, ROLE_IDS.ADMIN, ROLE_IDS.PORT_ADMIN],
};

// Helper function to check if a role has access to a route
export const hasRouteAccess = (userRoleId, routePath) => {
  // Super Admin and Vendor have access to all routes
  if (userRoleId === ROLE_IDS.SUPER_ADMIN || userRoleId === ROLE_IDS.VENDOR) {
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
    return false; // Route not in permissions list
  }

  return allowedRoles.includes(userRoleId);
};

// Get all allowed routes for a role
export const getAllowedRoutesForRole = (userRoleId) => {
  if (userRoleId === ROLE_IDS.SUPER_ADMIN || userRoleId === ROLE_IDS.VENDOR) {
    return Object.keys(routePermissions); // All routes
  }

  return Object.keys(routePermissions).filter(route =>
    routePermissions[route].includes(userRoleId)
  );
};
